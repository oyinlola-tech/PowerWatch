import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';

export class LogoutAllCommand {
  constructor(
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(userId: string, ipAddress?: string, userAgent?: string) {
    await this.authRepository.revokeAllUserRefreshTokens(userId);
    await this.sessionRepository.revokeAllByUserId(userId);

    await this.auditRepository.create({
      userId,
      action: 'LOGOUT_ALL',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return { message: 'Logged out of all devices successfully.' };
  }
}
