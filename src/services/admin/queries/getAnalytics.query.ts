import { prisma } from '../../../configs/database.config.js';

export class GetAnalyticsQuery {
  async execute(params: { startDate?: string; endDate?: string }) {
    const where: Record<string, unknown> = {};
    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) (where.timestamp as Record<string, unknown>).gte = new Date(params.startDate);
      if (params.endDate) (where.timestamp as Record<string, unknown>).lte = new Date(params.endDate);
    }

    const [onReports, offReports, totalReports, totalUsers, totalOutages] = await Promise.all([
      prisma.report.count({ where: { ...where, reportType: 'ON' } }),
      prisma.report.count({ where: { ...where, reportType: 'OFF' } }),
      prisma.report.count({ where }),
      prisma.user.count(),
      prisma.outage.count(),
    ]);

    return {
      onReports,
      offReports,
      totalReports,
      totalUsers,
      totalOutages,
      onOffRatio: offReports > 0 ? (onReports / offReports).toFixed(2) : 'N/A',
    };
  }
}
