import { NotificationRepository } from '../../../repositories/notification.repository.js';

export class GetUnreadNotificationsQuery {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
  ) {}

  async execute(userId: string) {
    const count = await this.notificationRepository.count({
      userId,
      opened: false,
    });

    return { unreadCount: count };
  }
}
