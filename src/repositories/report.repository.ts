import { prisma } from '../configs/database.config.js';
import type { Prisma } from '@prisma/client';

/**
 * What other users may see of a report: no reporter identity and no GPS point.
 * Reports appear to the community anonymously ("Neighbor reported OFF").
 */
export const PUBLIC_REPORT_SELECT = {
  id: true,
  neighborhoodId: true,
  reportType: true,
  timestamp: true,
  createdAt: true,
} as const;

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

  /** Community view of reports (see PUBLIC_REPORT_SELECT) */
  async findManyPublic(params: {
    where?: Prisma.ReportWhereInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.report.findMany({
      where: { ...params.where, deletedAt: null },
      orderBy: { timestamp: 'desc' },
      select: PUBLIC_REPORT_SELECT,
      ...(params.skip ? { skip: params.skip } : {}),
      ...(params.take ? { take: params.take } : {}),
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
