import { prisma } from '../../../configs/database.config.js';

export class GetMonthlyHistoryQuery {
  async execute(params: { neighborhoodId?: number; year?: number }) {
    const year = params.year ?? new Date().getFullYear();
    const isCurrentYear = year === new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const summaries = await prisma.monthlyStatistic.findMany({
      where: {
        monthStart: { gte: startOfYear, lte: endOfYear },
        ...(params.neighborhoodId ? { neighborhoodId: params.neighborhoodId } : {}),
      },
      orderBy: { monthStart: 'asc' },
    });

    if (summaries.length > 0 && !isCurrentYear) {
      return {
        year,
        fromCache: true,
        months: summaries.map((s) => ({
          month: s.monthStart.toISOString().slice(0, 7),
          total: s.totalReports,
          on: s.onReports,
          off: s.offReports,
        })),
      };
    }

    const where: Record<string, unknown> = {
      timestamp: { gte: startOfYear, lte: endOfYear },
    };
    if (params.neighborhoodId) where.neighborhoodId = params.neighborhoodId;

    const reports = await prisma.report.findMany({
      where: where as any,
      orderBy: { timestamp: 'asc' },
    });

    const monthlyData: Record<string, { on: number; off: number; total: number }> = {};
    for (const report of reports) {
      const monthKey = report.timestamp.toISOString().slice(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { on: 0, off: 0, total: 0 };
      }
      monthlyData[monthKey].total++;
      if (report.reportType === 'ON') monthlyData[monthKey].on++;
      else monthlyData[monthKey].off++;
    }

    return {
      year,
      fromCache: false,
      months: Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }
}
