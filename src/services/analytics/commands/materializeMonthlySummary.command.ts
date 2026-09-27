import { prisma } from '../../../configs/database.config.js';

export class MaterializeMonthlySummaryCommand {
  async execute(monthStart?: Date): Promise<{ neighborhoodsProcessed: number }> {
    const refDate = monthStart ?? new Date();
    const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1, 0, 0, 0, 0);

    const neighborhoods = await prisma.neighborhood.findMany({
      select: { id: true, town: { select: { city: { select: { lga: { select: { stateId: true } } } } } } },
    });

    let count = 0;
    for (const neighborhood of neighborhoods) {
      const dailyRows = await prisma.dailyReportSummary.findMany({
        where: {
          neighborhoodId: neighborhood.id,
          date: { gte: start, lt: end },
        },
      });

      const totalReports = dailyRows.reduce((s, r) => s + r.totalReports, 0);
      const onReports = dailyRows.reduce((s, r) => s + r.onReports, 0);
      const offReports = dailyRows.reduce((s, r) => s + r.offReports, 0);
      const uniqueUsers = dailyRows.reduce((s, r) => s + r.uniqueUsers, 0);

      const outageData = await prisma.weeklyOutageSummary.aggregate({
        _sum: { totalOutages: true, totalDurationMin: true },
        _avg: { avgDurationMin: true },
        where: {
          neighborhoodId: neighborhood.id,
          weekStart: { gte: start, lt: end },
        },
      });

      const stateId = neighborhood.town.city.lga.stateId;

      if (totalReports > 0 || (outageData._sum.totalOutages ?? 0) > 0) {
        await prisma.monthlyStatistic.upsert({
          where: {
            monthStart_neighborhoodId_stateId: {
              monthStart: start,
              neighborhoodId: neighborhood.id,
              stateId,
            },
          },
          create: {
            monthStart: start,
            neighborhoodId: neighborhood.id,
            stateId,
            totalReports,
            onReports,
            offReports,
            totalOutages: outageData._sum.totalOutages ?? 0,
            totalOutageMin: outageData._sum.totalDurationMin ?? 0,
            avgOutageMin: outageData._avg.avgDurationMin ?? 0,
            uniqueReporters: uniqueUsers,
          },
          update: {
            totalReports,
            onReports,
            offReports,
            totalOutages: outageData._sum.totalOutages ?? 0,
            totalOutageMin: outageData._sum.totalDurationMin ?? 0,
            avgOutageMin: outageData._avg.avgDurationMin ?? 0,
            uniqueReporters: uniqueUsers,
          },
        });
        count++;
      }
    }

    return { neighborhoodsProcessed: count };
  }
}
