import { prisma } from '../../../configs/database.config.js';

export class GetPowerStatisticsQuery {
  async execute(params: { startDate?: string; endDate?: string }) {
    const start = params.startDate ? new Date(params.startDate) : undefined;
    const end = params.endDate ? new Date(params.endDate) : undefined;

    const isHistorical = start && end && (end.getTime() - start.getTime() < 7 * 86_400_000);

    if (isHistorical) {
      const summaries = await prisma.dailyReportSummary.findMany({
        where: {
          date: { gte: start, lte: end },
        },
      });

      if (summaries.length > 0) {
        const totalReports = summaries.reduce((s, r) => s + r.totalReports, 0);
        const onReports = summaries.reduce((s, r) => s + r.onReports, 0);
        const offReports = summaries.reduce((s, r) => s + r.offReports, 0);

        const topSummaries = await prisma.dailyReportSummary.groupBy({
          by: ['neighborhoodId'],
          _sum: { totalReports: true },
          where: { date: { gte: start, lte: end } },
          orderBy: { _sum: { totalReports: 'desc' } },
          take: 10,
        });

        const neighborhoodIds = topSummaries.map((r) => r.neighborhoodId);
        const neighborhoods = await prisma.neighborhood.findMany({
          where: { id: { in: neighborhoodIds } },
          select: { id: true, name: true },
        });
        const neighborhoodMap = new Map(neighborhoods.map((n) => [n.id, n.name]));

        return {
          totalReports,
          onReports,
          offReports,
          onPercentage: totalReports > 0 ? ((onReports / totalReports) * 100).toFixed(1) : '0.0',
          offPercentage: totalReports > 0 ? ((offReports / totalReports) * 100).toFixed(1) : '0.0',
          fromCache: true,
          topNeighborhoods: topSummaries.map((r) => ({
            neighborhoodId: r.neighborhoodId,
            neighborhoodName: neighborhoodMap.get(r.neighborhoodId) ?? 'Unknown',
            reportCount: r._sum.totalReports ?? 0,
          })),
        };
      }
    }

    const dateFilter: Record<string, unknown> = {};
    if (start) dateFilter.gte = start;
    if (end) dateFilter.lte = end;
    const where = Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {};

    const [totalReports, onReports, offReports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.count({ where: { ...where, reportType: 'ON' } }),
      prisma.report.count({ where: { ...where, reportType: 'OFF' } }),
    ]);

    const topReportedNeighborhoods = await prisma.report.groupBy({
      by: ['neighborhoodId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const neighborhoodIds = topReportedNeighborhoods.map((r) => r.neighborhoodId);
    const neighborhoods = await prisma.neighborhood.findMany({
      where: { id: { in: neighborhoodIds } },
      select: { id: true, name: true },
    });

    const neighborhoodMap = new Map(neighborhoods.map((n) => [n.id, n.name]));

    return {
      totalReports,
      onReports,
      offReports,
      onPercentage: totalReports > 0 ? ((onReports / totalReports) * 100).toFixed(1) : '0.0',
      offPercentage: totalReports > 0 ? ((offReports / totalReports) * 100).toFixed(1) : '0.0',
      fromCache: false,
      topNeighborhoods: topReportedNeighborhoods.map((r) => ({
        neighborhoodId: r.neighborhoodId,
        neighborhoodName: neighborhoodMap.get(r.neighborhoodId) ?? 'Unknown',
        reportCount: r._count.id,
      })),
    };
  }
}
