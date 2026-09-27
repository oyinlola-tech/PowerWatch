import { SessionRepository } from '../../../repositories/session.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

interface SessionWithDevice {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  expiresAt: Date;
  device: {
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    platform: string | null;
  } | null;
}

export class ListSessionsQuery {
  constructor(
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
  ) {}

  async execute(userId: string) {
    const sessions = await this.sessionRepository.findActiveByUserId(userId);
    return (sessions as unknown as SessionWithDevice[]).map((s) => ({
      id: s.id,
      deviceName: s.device?.deviceName ?? null,
      deviceType: s.device?.deviceType ?? null,
      browser: s.device?.browser ?? s.userAgent ?? null,
      platform: s.device?.platform ?? null,
      ipAddress: s.ipAddress,
      isActive: s.isActive,
      lastActivityAt: s.lastActivityAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  }
}

export class RevokeSessionCommand {
  constructor(
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(
    sessionId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const session = await this.sessionRepository.findByIdAndUserId(sessionId, userId);
    if (!session) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    await this.sessionRepository.revoke(sessionId);

    await this.auditRepository.create({
      userId,
      action: 'SESSION_REVOKE',
      entityType: 'Session',
      entityId: sessionId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return { message: 'Session revoked successfully.' };
  }
}
