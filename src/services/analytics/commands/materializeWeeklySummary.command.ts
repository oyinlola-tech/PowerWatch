import { prisma } from '../../../configs/database.config.js';

export class MaterializeWeeklySummaryCommand {
  async execute(weekStart?: Date): Promise<{ neighborhoodsProcessed: number }> {
    const refDate = weekStart ?? new Date();
    const dayOfWeek = refDate.getDay();
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday.getTime() + 7 * 86_400_000);

    const neighborhoods = await prisma.neighborhood.findMany({
      select: { id: true },
    });

    let count = 0;
    for (const neighborhood of neighborhoods) {
      const outages = await prisma.outage.findMany({
        where: {
          neighborhoodId: neighborhood.id,
          startTime: { gte: monday, lt: nextMonday },
        },
      });

      if (outages.length === 0) continue;

      const totalDurationMin = outages.reduce((sum, o) => sum + (o.duration ?? 0), 0);
      const durations = outages.map((o) => o.duration ?? 0).filter((d) => d > 0);
      const avgDurationMin = durations.length > 0
        ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 100) / 100
        : 0;
      const maxDurationMin = durations.length > 0 ? Math.max(...durations) : 0;

      const outageReportIds = outages.map((o) => o.id);
      const linkedReports = await prisma.outageReport.count({
        where: { outageId: { in: outageReportIds } },
      });

      const uniqueUserIds = await prisma.outageReport.findMany({
        where: { outageId: { in: outageReportIds } },
        select: { report: { select: { userId: true } } },
        distinct: ['reportId'],
      });
      const uniqueUsers = new Set(uniqueUserIds.map((r) => r.report.userId)).size;

      await prisma.weeklyOutageSummary.upsert({
        where: {
          weekStart_neighborhoodId: { weekStart: monday, neighborhoodId: neighborhood.id },
        },
        create: {
          weekStart: monday,
          neighborhoodId: neighborhood.id,
          totalOutages: outages.length,
          totalDurationMin,
          avgDurationMin,
          maxDurationMin,
          totalReports: linkedReports,
          uniqueUsers,
        },
        update: {
          totalOutages: outages.length,
          totalDurationMin,
          avgDurationMin,
          maxDurationMin,
          totalReports: linkedReports,
          uniqueUsers,
        },
      });
      count++;
    }

    return { neighborhoodsProcessed: count };
  }
}
