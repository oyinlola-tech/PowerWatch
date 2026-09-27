import { NotificationRepository } from '../../../repositories/notification.repository.js';
import type { CreateNotificationDto } from '../../../interfaces/index.js';

export class SendInAppNotificationCommand {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
  ) {}

  async execute(dto: CreateNotificationDto) {
    const notification = await this.notificationRepository.create({
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      sent: true,
      delivered: true,
      opened: false,
      clicked: false,
      sentAt: new Date(),
      deliveredAt: new Date(),
    });

    return notification;
  }
}
