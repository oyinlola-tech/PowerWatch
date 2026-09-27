import { AuthRepository } from '../../../repositories/auth.repository.js';
import { SessionRepository } from '../../../repositories/session.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { verifyRefreshToken } from '../../../configs/jwt.config.js';

export class LogoutCommand {
  constructor(
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      // Logging out with an already-invalid token is a no-op.
      return;
    }

    const stored = await this.authRepository.findRefreshTokenById(payload.tokenId);
    if (!stored || stored.userId !== payload.userId) {
      return;
    }

    const session = await this.sessionRepository.findByRefreshTokenId(stored.id);
    if (session) {
      await this.sessionRepository.revoke(session.id);
    }
    await this.authRepository.deleteRefreshTokenById(stored.id);

    await this.auditRepository.create({
      userId: stored.userId,
      action: 'LOGOUT',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }
}
