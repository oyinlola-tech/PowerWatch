import { prisma } from '../configs/database.config.js';

export class DeviceRepository {
  async findByUserId(userId: string) {
    return prisma.device.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.device.findUnique({ where: { id } });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.device.findFirst({
      where: { id, userId },
    });
  }

  async upsertFcmToken(
    userId: string,
    data: {
      fcmToken?: string | null | undefined;
      deviceName?: string | null | undefined;
      deviceType?: 'ANDROID' | 'IOS' | 'WEB' | null | undefined;
      browser?: string | null | undefined;
      platform?: string | null | undefined;
    },
  ) {
    const fcmToken = data.fcmToken ?? undefined;
    const existing = fcmToken
      ? await prisma.device.findFirst({
          where: { userId, fcmToken },
        })
      : null;

    if (existing) {
      return prisma.device.update({
        where: { id: existing.id },
        data: {
          deviceName: data.deviceName ?? null,
          deviceType: data.deviceType ?? null,
          browser: data.browser ?? null,
          platform: data.platform ?? null,
          lastActive: new Date(),
        },
      });
    }

    if (!fcmToken) {
      const first = await prisma.device.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (first) {
        return prisma.device.update({
          where: { id: first.id },
          data: {
            deviceName: data.deviceName ?? null,
            deviceType: data.deviceType ?? null,
            browser: data.browser ?? null,
            platform: data.platform ?? null,
            lastActive: new Date(),
          },
        });
      }
    }

    return prisma.device.create({
      data: {
        userId,
        fcmToken: fcmToken ?? null,
        deviceName: data.deviceName ?? null,
        deviceType: data.deviceType ?? null,
        browser: data.browser ?? null,
        platform: data.platform ?? null,
        lastActive: new Date(),
      },
    });
  }

  async delete(id: string) {
    return prisma.device.delete({ where: { id } });
  }

  async deleteByUserId(userId: string) {
    return prisma.device.deleteMany({ where: { userId } });
  }
}
