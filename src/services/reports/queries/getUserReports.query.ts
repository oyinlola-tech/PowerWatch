import { prisma } from '../../../configs/database.config.js';

export class GetUserReportsQuery {
  async execute(userId: string, page: number = 1, limit: number = 20) {
    const where = { userId, deletedAt: null };
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          reportType: true,
          timestamp: true,
          neighborhoodId: true,
          neighborhood: { select: { name: true, town: { select: { name: true } } } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      data: reports.map(({ neighborhood, ...report }) => ({
        ...report,
        neighborhood: neighborhood.name,
        town: neighborhood.town.name,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
