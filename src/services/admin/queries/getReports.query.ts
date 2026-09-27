import { prisma } from '../../../configs/database.config.js';

export class GetReportsQuery {
  async execute(params: {
    page: number;
    limit: number;
    neighborhoodId?: number;
    reportType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (params.neighborhoodId) where.neighborhoodId = params.neighborhoodId;
    if (params.reportType) where.reportType = params.reportType;
    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) (where.timestamp as Record<string, unknown>).gte = new Date(params.startDate);
      if (params.endDate) (where.timestamp as Record<string, unknown>).lte = new Date(params.endDate);
    }

    const skip = (params.page - 1) * params.limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: where as any,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          neighborhood: { select: { id: true, name: true } },
        },
        skip,
        take: params.limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.report.count({ where: where as any }),
    ]);

    return {
      data: reports,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
