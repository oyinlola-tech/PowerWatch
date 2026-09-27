import { NotificationRepository } from '../../../repositories/notification.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class DeleteNotificationCommand {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findByIdForUser(id, userId);
    if (!notification) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    await this.notificationRepository.delete(id);
  }
}
