import { prisma } from '../configs/database.config.js';

export class OtpRepository {
  async create(data: {
    email: string;
    code: string;
    type: string;
    expiresAt: Date;
  }) {
    return prisma.otp.create({
      data: {
        email: data.email,
        code: data.code,
        type: data.type as 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
        expiresAt: data.expiresAt,
      },
    });
  }

  /** The most recent unused, unexpired OTP. Older ones are invalidated whenever a new one is issued. */
  async findActiveOtp(email: string, type: string) {
    return prisma.otp.findFirst({
      where: {
        email,
        type: type as 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Atomically records one verification attempt. Returns false once the OTP has
   * used up its attempts, so concurrent guesses can't slip past the limit.
   */
  async consumeAttempt(id: string, maxAttempts: number) {
    const result = await prisma.otp.updateMany({
      where: { id, usedAt: null, attempts: { lt: maxAttempts } },
      data: { attempts: { increment: 1 } },
    });
    return result.count === 1;
  }

  async markUsed(id: string) {
    return prisma.otp.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async countIssuedSince(email: string, since: Date) {
    return prisma.otp.count({ where: { email, createdAt: { gte: since } } });
  }

  async invalidatePreviousOtps(email: string, type: string) {
    return prisma.otp.updateMany({
      where: {
        email,
        type: type as 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  }
}
