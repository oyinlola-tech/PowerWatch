import { prisma } from '../../../configs/database.config.js';

export class GetOutageStatisticsQuery {
  async execute(params: { startDate?: string; endDate?: string }) {
    const start = params.startDate ? new Date(params.startDate) : undefined;
    const end = params.endDate ? new Date(params.endDate) : undefined;

    if (start && end) {
      const weeklySummaries = await prisma.weeklyOutageSummary.findMany({
        where: {
          weekStart: { gte: start, lte: end },
        },
      });

      if (weeklySummaries.length > 0) {
        const totalOutages = weeklySummaries.reduce((s, r) => s + r.totalOutages, 0);
        const totalDuration = weeklySummaries.reduce((s, r) => s + r.totalDurationMin, 0);
        const avgDuration = weeklySummaries.length > 0
          ? Math.round(weeklySummaries.reduce((s, r) => s + r.avgDurationMin, 0) / weeklySummaries.length)
          : 0;

        const topWeekly = await prisma.weeklyOutageSummary.groupBy({
          by: ['neighborhoodId'],
          _sum: { totalOutages: true },
          _avg: { avgDurationMin: true },
          where: { weekStart: { gte: start, lte: end } },
          orderBy: { _sum: { totalOutages: 'desc' } },
          take: 10,
        });

        const neighborhoodIds = topWeekly.map((r) => r.neighborhoodId);
        const neighborhoods = await prisma.neighborhood.findMany({
          where: { id: { in: neighborhoodIds } },
          select: { id: true, name: true },
        });
        const neighborhoodMap = new Map(neighborhoods.map((n) => [n.id, n.name]));

        return {
          totalOutages,
          activeOutages: await prisma.outage.count({ where: { endTime: null } }),
          completedOutages: totalOutages,
          averageDurationMinutes: avgDuration,
          fromCache: true,
          topNeighborhoods: topWeekly.map((r) => ({
            neighborhoodId: r.neighborhoodId,
            neighborhoodName: neighborhoodMap.get(r.neighborhoodId) ?? 'Unknown',
            outageCount: r._sum.totalOutages ?? 0,
            averageDurationMinutes: Math.round(r._avg.avgDurationMin ?? 0),
          })),
        };
      }
    }

    const dateFilter: Record<string, unknown> = {};
    if (start) dateFilter.gte = start;
    if (end) dateFilter.lte = end;
    const where = Object.keys(dateFilter).length > 0
      ? { startTime: dateFilter }
      : {};

    const [totalOutages, activeOutages, completedOutages] = await Promise.all([
      prisma.outage.count({ where }),
      prisma.outage.count({ where: { ...where, endTime: null } }),
      prisma.outage.count({ where: { ...where, endTime: { not: null } } }),
    ]);

    const avgDuration = await prisma.outage.aggregate({
      _avg: { duration: true },
      where: { ...where, duration: { not: null } },
    });

    const topOutageNeighborhoods = await prisma.outage.groupBy({
      by: ['neighborhoodId'],
      _count: { id: true },
      _avg: { duration: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const neighborhoodIds = topOutageNeighborhoods.map((r) => r.neighborhoodId);
    const neighborhoods = await prisma.neighborhood.findMany({
      where: { id: { in: neighborhoodIds } },
      select: { id: true, name: true },
    });

    const neighborhoodMap = new Map(neighborhoods.map((n) => [n.id, n.name]));

    return {
      totalOutages,
      activeOutages,
      completedOutages,
      averageDurationMinutes: Math.round(avgDuration._avg.duration ?? 0),
      fromCache: false,
      topNeighborhoods: topOutageNeighborhoods.map((r) => ({
        neighborhoodId: r.neighborhoodId,
        neighborhoodName: neighborhoodMap.get(r.neighborhoodId) ?? 'Unknown',
        outageCount: r._count.id,
        averageDurationMinutes: Math.round(r._avg.duration ?? 0),
      })),
    };
  }
}
