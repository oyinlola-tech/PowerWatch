import { prisma } from '../../../configs/database.config.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';

export class RegisterPushTokenCommand {
  constructor(private readonly auditRepository: AuditRepository = new AuditRepository()) {}

  async execute(
    userId: string,
    data: {
      expoPushToken: string;
      deviceName?: string | undefined;
      deviceType?: 'ANDROID' | 'IOS' | 'WEB' | undefined;
      platform?: string | undefined;
    },
  ) {
    const details = {
      deviceName: data.deviceName ?? null,
      deviceType: data.deviceType ?? null,
      platform: data.platform ?? null,
      lastActive: new Date(),
    };

    // A token identifies a physical install; if someone else signed in on this phone before,
    // move the token to the current user so the previous account stops getting its alerts.
    const existing = await prisma.device.findFirst({ where: { expoPushToken: data.expoPushToken } });
    const device = existing
      ? await prisma.device.update({ where: { id: existing.id }, data: { ...details, userId } })
      : await prisma.device.create({ data: { ...details, userId, expoPushToken: data.expoPushToken } });

    if (!existing || existing.userId !== userId) {
      await this.auditRepository.create({
        userId,
        action: 'DEVICE_REGISTER',
        entityType: 'Device',
        entityId: device.id,
      });
    }

    return { deviceId: device.id, registered: true };
  }
}

export class UnregisterPushTokenCommand {
  async execute(userId: string, expoPushToken: string) {
    const result = await prisma.device.updateMany({
      where: { userId, expoPushToken },
      data: { expoPushToken: null },
    });
    return { removed: result.count > 0 };
  }
}
