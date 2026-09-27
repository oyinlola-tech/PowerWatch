import bcrypt from 'bcryptjs';
import { AppError } from '../../../errors/index.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { OtpRepository } from '../../../repositories/otp.repository.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { env } from '../../../configs/env.config.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { assertValidOtp } from './verifyOtp.command.js';

export class ResetPasswordCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly otpRepository: OtpRepository = new OtpRepository(),
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    email: string,
    code: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await assertValidOtp(this.otpRepository, normalizedEmail, code, 'PASSWORD_RESET');

    // findByEmail excludes soft-deleted accounts, so a reset can't revive one.
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError(400, MESSAGES.INVALID_OTP);
    }

    await this.otpRepository.markUsed(otp.id);

    const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);
    await this.userRepository.updatePassword(normalizedEmail, passwordHash);

    // Anyone holding the old credentials must sign in again.
    await this.authRepository.revokeAllUserRefreshTokens(user.id);
    await this.sessionRepository.revokeAllByUserId(user.id);

    await this.auditRepository.create({
      userId: user.id,
      action: 'PASSWORD_RESET',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }
}
