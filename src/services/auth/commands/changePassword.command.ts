import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { env } from '../../../configs/env.config.js';

export class ChangePasswordCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user || user.deletedAt) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError(400, 'Current password is incorrect.');
    }

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new AppError(400, 'New password must be different from current password.');
    }

    const newHash = await bcrypt.hash(newPassword, env.bcrypt.saltRounds);
    await this.userRepository.updatePasswordById(userId, newHash);

    await this.authRepository.revokeAllUserRefreshTokens(userId);

    await this.auditRepository.create({
      userId,
      action: 'PASSWORD_CHANGE',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return { message: 'Password changed successfully.' };
  }
}
