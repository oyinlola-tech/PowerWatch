import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class SubscribeCommand {
  async execute(userId: string, fcmToken: string, deviceName?: string, deviceType?: 'ANDROID' | 'IOS' | 'WEB') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { notificationEnabled: true },
    });

    const existingDevice = await prisma.device.findFirst({
      where: { userId, fcmToken },
    });

    if (existingDevice) {
      return existingDevice;
    }

    const device = await prisma.device.create({
      data: {
        userId,
        fcmToken,
        deviceName: deviceName ?? null,
        deviceType: deviceType ?? null,
      },
    });

    return device;
  }
}
