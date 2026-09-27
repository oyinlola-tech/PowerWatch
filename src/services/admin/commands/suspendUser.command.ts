import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { DeviceRepository } from '../../../repositories/device.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { type AdminActor, assertCanModifyUser } from './adminActor.js';

export class SuspendUserCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly deviceRepository: DeviceRepository = new DeviceRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(userId: string, actor: AdminActor) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }
    assertCanModifyUser(actor, user);

    // Suspension blocks login and refresh; existing access tokens expire on their own shortly.
    await this.userRepository.setSuspended(userId, true);
    await this.authRepository.deleteAllUserRefreshTokens(userId);
    await this.sessionRepository.revokeAllByUserId(userId);
    await this.deviceRepository.deleteByUserId(userId);

    await this.auditRepository.create({
      userId: actor.userId,
      action: 'ADMIN_ACTION',
      entityType: 'User',
      entityId: userId,
      metadata: { operation: 'SUSPEND_USER', targetEmail: user.email },
      ipAddress: actor.ipAddress ?? null,
      userAgent: actor.userAgent ?? null,
    });
  }
}

export class UnsuspendUserCommand {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(userId: string, actor: AdminActor) {
    const user = await this.userRepository.findByIdWithFull(userId);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }
    assertCanModifyUser(actor, user);

    await this.userRepository.setSuspended(userId, false);

    await this.auditRepository.create({
      userId: actor.userId,
      action: 'ADMIN_ACTION',
      entityType: 'User',
      entityId: userId,
      metadata: { operation: 'UNSUSPEND_USER', targetEmail: user.email },
      ipAddress: actor.ipAddress ?? null,
      userAgent: actor.userAgent ?? null,
    });
  }
}
