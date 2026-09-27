import { NotificationRepository } from '../../../repositories/notification.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class MarkAsReadCommand {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
  ) {}

  async execute(id: string, userId: string, updates: { opened?: boolean; clicked?: boolean }) {
    const notification = await this.notificationRepository.findByIdForUser(id, userId);
    if (!notification) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const data: Record<string, unknown> = {};
    if (updates.opened !== undefined) {
      data.opened = updates.opened;
      if (updates.opened) data.openedAt = new Date();
    }
    if (updates.clicked !== undefined) {
      data.clicked = updates.clicked;
      if (updates.clicked) data.clickedAt = new Date();
    }

    return this.notificationRepository.update(id, data);
  }
}
