import { prisma } from '../configs/database.config.js';
import type { Prisma } from '@prisma/client';

export class ReportRepository {
  async create(data: Prisma.ReportUncheckedCreateInput) {
    return prisma.report.create({ data });
  }

  async findById(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findMany(params: {
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const { orderBy, skip, take } = params;
    return prisma.report.findMany({
      ...(params.where ? { where: params.where } : {}),
      orderBy: orderBy ?? { timestamp: 'desc' },
      ...(skip ? { skip } : {}),
      ...(take ? { take } : {}),
    });
  }

  async count(where?: Prisma.ReportWhereInput) {
    return prisma.report.count({
      ...(where ? { where } : {}),
    });
  }

  async delete(id: string) {
    return prisma.report.delete({ where: { id } });
  }

  async findLatestByNeighborhood(neighborhoodId: number) {
    return prisma.report.findFirst({
      where: { neighborhoodId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async countByNeighborhood(neighborhoodId: number) {
    return prisma.report.count({ where: { neighborhoodId } });
  }

  async countByNeighborhoodSince(neighborhoodId: number, since: Date) {
    return prisma.report.count({
      where: { neighborhoodId, timestamp: { gte: since } },
    });
  }
}
