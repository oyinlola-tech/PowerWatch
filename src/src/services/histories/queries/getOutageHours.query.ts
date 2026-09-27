import { prisma } from '../../../configs/database.config.js';

export class GetOutageHoursQuery {
  async execute(params: { neighborhoodId?: number; startDate?: string; endDate?: string }) {
    const where: Record<string, unknown> = {
      endTime: { not: null },
      duration: { not: null },
    };
    if (params.neighborhoodId !== undefined) where.neighborhoodId = params.neighborhoodId;
    if (params.startDate !== undefined || params.endDate !== undefined) {
      const startFilter: Record<string, Date> = {};
      if (params.startDate !== undefined) startFilter.gte = new Date(params.startDate);
      if (params.endDate !== undefined) startFilter.lte = new Date(params.endDate);
      where.startTime = startFilter;
    }

    const outages = await prisma.outage.findMany({
      where: where as any,
      select: {
        id: true,
        neighborhoodId: true,
        startTime: true,
        endTime: true,
        duration: true,
      },
      orderBy: { startTime: 'desc' },
    });

    const totalMinutes = outages.reduce((sum, o) => sum + (o.duration ?? 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const byNeighborhoodMap = new Map<number, { count: number; totalMinutes: number }>();
    for (const o of outages) {
      const current = byNeighborhoodMap.get(o.neighborhoodId) ?? { count: 0, totalMinutes: 0 };
      current.count++;
      current.totalMinutes += o.duration ?? 0;
      byNeighborhoodMap.set(o.neighborhoodId, current);
    }

    const neighborhoodIds = [...byNeighborhoodMap.keys()];
    const neighborhoods = await prisma.neighborhood.findMany({
      where: { id: { in: neighborhoodIds } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(neighborhoods.map((n) => [n.id, n.name]));

    return {
      totalOutages: outages.length,
      totalMinutes,
      totalHours,
      averageMinutes: outages.length > 0 ? Math.round(totalMinutes / outages.length) : 0,
      byNeighborhood: [...byNeighborhoodMap.entries()].map(([id, data]) => ({
        neighborhoodId: id,
        neighborhoodName: nameMap.get(id) ?? 'Unknown',
        outageCount: data.count,
        totalMinutes: data.totalMinutes,
        totalHours: Math.round((data.totalMinutes / 60) * 100) / 100,
      })),
    };
  }
}
