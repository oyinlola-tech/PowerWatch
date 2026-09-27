import { NotificationRepository } from '../../../repositories/notification.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class GetNotificationQuery {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
  ) {}

  async execute(id: string, userId: string) {
    const notification = await this.notificationRepository.findByIdForUser(id, userId);
    if (!notification) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }
    return notification;
  }
}
