import { prisma } from '../configs/database.config.js';
import type { Prisma } from '@prisma/client';

export class NotificationRepository {
  async create(data: Prisma.NotificationLogUncheckedCreateInput) {
    return prisma.notificationLog.create({ data });
  }

  async createMany(data: Prisma.NotificationLogCreateManyInput[]) {
    return prisma.notificationLog.createMany({ data });
  }

  async findById(id: string) {
    return prisma.notificationLog.findUnique({ where: { id } });
  }

  async findByIdForUser(id: string, userId: string) {
    return prisma.notificationLog.findFirst({ where: { id, userId } });
  }

  async findMany(params: {
    where?: Prisma.NotificationLogWhereInput;
    orderBy?: Prisma.NotificationLogOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const { orderBy, skip, take } = params;
    return prisma.notificationLog.findMany({
      ...(params.where ? { where: params.where } : {}),
      orderBy: orderBy ?? { createdAt: 'desc' },
      ...(skip ? { skip } : {}),
      ...(take ? { take } : {}),
    });
  }

  async count(where?: Prisma.NotificationLogWhereInput) {
    return prisma.notificationLog.count({
      ...(where ? { where } : {}),
    });
  }

  async update(id: string, data: Prisma.NotificationLogUncheckedUpdateInput) {
    return prisma.notificationLog.update({ where: { id }, data });
  }

  async markAllOpened(userId: string) {
    return prisma.notificationLog.updateMany({
      where: { userId, opened: false },
      data: { opened: true, openedAt: new Date() },
    });
  }

  async delete(id: string) {
    return prisma.notificationLog.delete({ where: { id } });
  }
}
