import { prisma } from '../../../configs/database.config.js';

export class MaterializeDailySummaryCommand {
  async execute(date?: Date): Promise<{ neighborhoodsProcessed: number }> {
    const targetDate = date ?? new Date();
    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const end = new Date(start.getTime() + 86_400_000);

    const neighborhoods = await prisma.neighborhood.findMany({
      select: { id: true },
    });

    let count = 0;
    for (const neighborhood of neighborhoods) {
      const [totalReports, onReports, offReports, uniqueUsers] = await Promise.all([
        prisma.report.count({
          where: {
            neighborhoodId: neighborhood.id,
            timestamp: { gte: start, lt: end },
            deletedAt: null,
          },
        }),
        prisma.report.count({
          where: {
            neighborhoodId: neighborhood.id,
            timestamp: { gte: start, lt: end },
            reportType: 'ON',
            deletedAt: null,
          },
        }),
        prisma.report.count({
          where: {
            neighborhoodId: neighborhood.id,
            timestamp: { gte: start, lt: end },
            reportType: 'OFF',
            deletedAt: null,
          },
        }),
        prisma.report.groupBy({
          by: ['userId'],
          where: {
            neighborhoodId: neighborhood.id,
            timestamp: { gte: start, lt: end },
            deletedAt: null,
          },
          _count: { id: true },
        }).then((groups) => groups.length),
      ]);

      if (totalReports > 0) {
        await prisma.dailyReportSummary.upsert({
          where: {
            date_neighborhoodId: { date: start, neighborhoodId: neighborhood.id },
          },
          create: {
            date: start,
            neighborhoodId: neighborhood.id,
            totalReports,
            onReports,
            offReports,
            uniqueUsers,
          },
          update: {
            totalReports,
            onReports,
            offReports,
            uniqueUsers,
          },
        });
        count++;
      }
    }

    return { neighborhoodsProcessed: count };
  }
}
