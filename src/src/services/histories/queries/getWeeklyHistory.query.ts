import { prisma } from '../../../configs/database.config.js';

export class GetWeeklyHistoryQuery {
  async execute(params: { neighborhoodId?: number; year?: number; month?: number }) {
    const now = new Date();
    const year = params.year ?? now.getFullYear();
    const month = params.month ?? (now.getMonth() + 1);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

    const whereBase: Record<string, unknown> = {};
    if (params.neighborhoodId) whereBase.neighborhoodId = params.neighborhoodId;

    const summaries = await prisma.dailyReportSummary.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        ...(params.neighborhoodId ? { neighborhoodId: params.neighborhoodId } : {}),
      },
      orderBy: { date: 'asc' },
    });

    if (summaries.length > 0 && !isCurrentMonth) {
      const weeklyData: Record<string, { on: number; off: number; total: number }> = {};
      for (const s of summaries) {
        const d = new Date(s.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().slice(0, 10);

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { on: 0, off: 0, total: 0 };
        }
        weeklyData[weekKey].total += s.totalReports;
        weeklyData[weekKey].on += s.onReports;
        weeklyData[weekKey].off += s.offReports;
      }

      return {
        year,
        month,
        fromCache: true,
        weeks: Object.entries(weeklyData)
          .map(([weekStart, data]) => ({
            weekStart,
            ...data,
          }))
          .sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
      };
    }

    const where: Record<string, unknown> = {
      timestamp: { gte: startOfMonth, lte: endOfMonth },
    };
    if (params.neighborhoodId) where.neighborhoodId = params.neighborhoodId;

    const reports = await prisma.report.findMany({
      where: where as any,
      orderBy: { timestamp: 'asc' },
    });

    const weeklyData: Record<string, { on: number; off: number; total: number }> = {};
    for (const report of reports) {
      const d = new Date(report.timestamp);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { on: 0, off: 0, total: 0 };
      }
      weeklyData[weekKey].total++;
      if (report.reportType === 'ON') weeklyData[weekKey].on++;
      else weeklyData[weekKey].off++;
    }

    return {
      year,
      month,
      fromCache: false,
      weeks: Object.entries(weeklyData)
        .map(([weekStart, data]) => ({
          weekStart,
          ...data,
        }))
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    };
  }
}
