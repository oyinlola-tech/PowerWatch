import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { DeviceRepository } from '../../../repositories/device.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class DeleteAccountCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly deviceRepository: DeviceRepository = new DeviceRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    userId: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user || user.deletedAt) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(400, 'Password is incorrect.');
    }

    await this.authRepository.revokeAllUserRefreshTokens(userId);
    await this.sessionRepository.revokeAllByUserId(userId);
    await this.deviceRepository.deleteByUserId(userId);
    await this.userRepository.softDelete(userId);

    await this.auditRepository.create({
      userId,
      action: 'ACCOUNT_DELETE',
      entityType: 'User',
      entityId: userId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return { message: 'Account deleted successfully.' };
  }
}
