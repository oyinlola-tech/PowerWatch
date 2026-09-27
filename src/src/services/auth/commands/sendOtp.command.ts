import crypto from 'node:crypto';
import { UserRepository } from '../../../repositories/user.repository.js';
import { OtpRepository } from '../../../repositories/otp.repository.js';
import { AppError } from '../../../errors/index.js';
import { env } from '../../../configs/env.config.js';
import { MailService } from '../../mail/index.js';

export type OtpType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

export class SendOtpCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly otpRepository: OtpRepository = new OtpRepository(),
  ) {}

  async execute(email: string, type: OtpType = 'EMAIL_VERIFICATION'): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      return;
    }

    if (type === 'EMAIL_VERIFICATION' && user.emailVerified) {
      throw new AppError(400, 'Email already verified.');
    }

    // Shared cap across send-otp, resend-otp and forgot-password, stored in the DB so it
    // holds across restarts and instances. Throttled requests are dropped silently so the
    // response never reveals whether the email is registered.
    const windowStart = new Date(Date.now() - env.rateLimit.otpWindowMs);
    const recent = await this.otpRepository.countIssuedSince(normalizedEmail, windowStart);
    if (recent >= env.rateLimit.otpMax) {
      return;
    }

    const code = crypto.randomInt(100000, 1000000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000);

    await this.otpRepository.invalidatePreviousOtps(normalizedEmail, type);
    await this.otpRepository.create({
      email: normalizedEmail,
      code,
      type,
      expiresAt,
    });

    const subject =
      type === 'PASSWORD_RESET'
        ? 'PowerWatch Password Reset Code'
        : 'PowerWatch Email Verification Code';

    const text = `Your PowerWatch OTP is ${code}. It expires in ${env.otp.expiryMinutes} minutes.`;
    const html = `
      <p>Your PowerWatch OTP is <strong>${code}</strong>.</p>
      <p>This code expires in ${env.otp.expiryMinutes} minutes.</p>
    `;

    await new MailService().sendMail({
      to: normalizedEmail,
      subject,
      text,
      html,
    });
  }
}
