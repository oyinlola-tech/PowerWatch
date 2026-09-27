import { prisma } from '../../../configs/database.config.js';

export class GetDashboardQuery {
  async execute() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);

    const [
      totalUsers,
      newUsersToday,
      totalReports,
      reportsToday,
      activeOutages,
      totalOutages,
      totalNeighborhoods,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.report.count(),
      prisma.report.count({ where: { timestamp: { gte: todayStart } } }),
      prisma.outage.count({ where: { endTime: null } }),
      prisma.outage.count(),
      prisma.neighborhood.count(),
    ]);

    const reportsThisWeek = await prisma.report.count({
      where: { timestamp: { gte: thisWeekStart } },
    });

    return {
      totalUsers,
      newUsersToday,
      totalReports,
      reportsToday,
      reportsThisWeek,
      activeOutages,
      totalOutages,
      totalNeighborhoods,
    };
  }
}
