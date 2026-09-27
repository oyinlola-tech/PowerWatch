import { prisma } from '../../../configs/database.config.js';
import type { Prisma } from '@prisma/client';

export class GetOutagesQuery {
  async execute(params: {
    neighborhoodId?: number;
    activeOnly?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Prisma.OutageWhereInput = {};

    if (params.neighborhoodId) {
      where.neighborhoodId = params.neighborhoodId;
    }
    if (params.activeOnly) {
      where.endTime = null;
    }

    const skip = (params.page - 1) * params.limit;

    const [outages, total] = await Promise.all([
      prisma.outage.findMany({
        where,
        include: {
          neighborhood: { select: { id: true, name: true } },
        },
        skip,
        take: params.limit,
        orderBy: { startTime: 'desc' },
      }),
      prisma.outage.count({ where }),
    ]);

    return {
      data: outages,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
