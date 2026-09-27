import type { Prisma } from '@prisma/client';
import { NotificationRepository } from '../../../repositories/notification.repository.js';

export class GetNotificationsQuery {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
  ) {}

  async execute(params: {
    userId: string;
    unreadOnly?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Prisma.NotificationLogWhereInput = { userId: params.userId };

    if (params.unreadOnly) {
      where.opened = false;
    }

    const skip = (params.page - 1) * params.limit;

    const [notifications, total] = await Promise.all([
      this.notificationRepository.findMany({ where, skip, take: params.limit }),
      this.notificationRepository.count(where),
    ]);

    return {
      data: notifications,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
