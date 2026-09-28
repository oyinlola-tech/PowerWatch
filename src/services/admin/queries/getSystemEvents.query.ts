import type { Prisma } from '@prisma/client';
import { prisma } from '../../../configs/database.config.js';

export class GetSystemEventsQuery {
  async execute(params: {
    page: number;
    limit: number;
    status: 'open' | 'resolved' | 'all';
    level?: 'ERROR' | 'WARNING';
    source?: string;
  }) {
    const where: Prisma.SystemEventWhereInput = {};
    if (params.status === 'open') where.resolvedAt = null;
    if (params.status === 'resolved') where.resolvedAt = { not: null };
    if (params.level) where.level = params.level;
    if (params.source) where.source = params.source;

    const [events, total, openByLevel] = await Promise.all([
      prisma.systemEvent.findMany({
        where,
        orderBy: { lastSeenAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.systemEvent.count({ where }),
      prisma.systemEvent.groupBy({ by: ['level'], where: { resolvedAt: null }, _count: { _all: true } }),
    ]);

    const open = Object.fromEntries(openByLevel.map((row) => [row.level, row._count._all]));

    return {
      data: events,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
      open: { errors: open.ERROR ?? 0, warnings: open.WARNING ?? 0 },
    };
  }
}
