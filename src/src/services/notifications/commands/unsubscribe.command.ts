import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class UnsubscribeCommand {
  async execute(userId: string, fcmToken?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (fcmToken) {
      await prisma.device.deleteMany({ where: { userId, fcmToken } });
    } else {
      await prisma.device.deleteMany({ where: { userId } });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { notificationEnabled: false },
    });
  }
}
