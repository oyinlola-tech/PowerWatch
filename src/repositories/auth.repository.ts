import { prisma } from '../configs/database.config.js';

export class AuthRepository {
  async createRefreshToken(data: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async findRefreshTokenById(id: string) {
    return prisma.refreshToken.findUnique({ where: { id } });
  }

  async findRefreshTokenByIdWithUser(id: string) {
    return prisma.refreshToken.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  }

  async deleteRefreshTokenById(id: string) {
    return prisma.refreshToken.delete({ where: { id } });
  }

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Replaces a refresh token and re-points its session at the new one in a single
   * transaction, so sessions never end up orphaned mid-rotation.
   */
  async rotateRefreshToken(
    oldTokenId: string,
    newToken: { id: string; token: string; userId: string; expiresAt: Date },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.refreshToken.create({ data: newToken });
      await tx.session.updateMany({
        where: { refreshTokenId: oldTokenId },
        data: {
          refreshTokenId: newToken.id,
          expiresAt: newToken.expiresAt,
          lastActivityAt: new Date(),
        },
      });
      await tx.refreshToken.delete({ where: { id: oldTokenId } });
    });
  }

  async findAllByUserId(userId: string) {
    return prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  }
}
