import { forgetSessionState } from '../middlewares/auth.middleware.js';
import { prisma } from '../configs/database.config.js';

export class SessionRepository {
  async create(data: {
    id: string;
    userId: string;
    refreshTokenId?: string | null;
    deviceId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    expiresAt: Date;
  }) {
    return prisma.session.create({
      data: {
        id: data.id,
        userId: data.userId,
        refreshTokenId: data.refreshTokenId ?? null,
        deviceId: data.deviceId ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findActiveByUserId(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        device: {
          select: {
            deviceName: true,
            deviceType: true,
            browser: true,
            platform: true,
          },
        },
      },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.session.findUnique({ where: { id } });
  }

  async findByRefreshTokenId(refreshTokenId: string) {
    return prisma.session.findUnique({ where: { refreshTokenId } });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.session.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  /** Deactivates the session and revokes its refresh token so it can no longer be refreshed. */
  async revoke(id: string) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.session.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
      if (session.refreshTokenId) {
        await tx.refreshToken.updateMany({
          where: { id: session.refreshTokenId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return session;
    }).then((session) => {
      forgetSessionState(session.userId);
      return session;
    });
  }

  async revokeAllByUserId(userId: string) {
    const result = await prisma.session.updateMany({
      where: { userId, isActive: true, deletedAt: null },
      data: { isActive: false, deletedAt: new Date() },
    });
    forgetSessionState(userId);
    return result;
  }

  async updateActivity(id: string) {
    return prisma.session.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });
  }

  async deleteExpired() {
    return prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: new Date() } },
          { deletedAt: { not: null } },
        ],
      },
    });
  }
}
