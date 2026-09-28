import crypto from 'node:crypto';
import { AppError } from '../../../errors/index.js';
import { OtpRepository } from '../../../repositories/otp.repository.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { hashOtpCode } from '../../../utils/otp.js';

export type OtpType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

function codesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Checks a submitted code against the active OTP. Every check (right or wrong)
 * uses one of the OTP's attempts, so a code can't be brute-forced.
 */
export async function assertValidOtp(
  otpRepository: OtpRepository,
  email: string,
  code: string,
  type: OtpType,
) {
  const otp = await otpRepository.findActiveOtp(email, type);
  if (!otp) {
    throw new AppError(400, MESSAGES.INVALID_OTP);
  }

  const attemptAllowed = await otpRepository.consumeAttempt(otp.id, otp.maxAttempts);
  if (!attemptAllowed) {
    throw new AppError(429, MESSAGES.OTP_ATTEMPTS_EXCEEDED);
  }

  if (!codesMatch(otp.code, hashOtpCode(email, code))) {
    throw new AppError(400, MESSAGES.INVALID_OTP);
  }

  return otp;
}

export class VerifyOtpCommand {
  constructor(
    private readonly otpRepository: OtpRepository = new OtpRepository(),
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    email: string,
    code: string,
    type: OtpType = 'EMAIL_VERIFICATION',
    ipAddress?: string,
    userAgent?: string,
  ) {
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await assertValidOtp(this.otpRepository, normalizedEmail, code, type);

    // A password-reset code is only checked here; it is consumed by reset-password.
    if (type === 'EMAIL_VERIFICATION') {
      await this.otpRepository.markUsed(otp.id);

      const user = await this.userRepository.findByEmail(normalizedEmail);
      if (user) {
        await this.userRepository.markEmailVerified(normalizedEmail);
        await this.auditRepository.create({
          userId: user.id,
          action: 'EMAIL_VERIFY',
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
        });
      }
    }

    return {
      verified: true,
      type,
    };
  }
}
