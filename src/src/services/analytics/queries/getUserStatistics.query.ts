import { prisma } from '../../../configs/database.config.js';

export class GetUserStatisticsQuery {
  async execute() {
    const [totalUsers, verifiedUsers, unverifiedUsers, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { emailVerified: false } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    const usersByLocation = await prisma.user.groupBy({
      by: ['stateId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const stateIds = usersByLocation.map((r) => r.stateId).filter((id): id is number => id !== null);
    const states = await prisma.state.findMany({
      where: { id: { in: stateIds } },
      select: { id: true, name: true },
    });
    const stateMap = new Map(states.map((s) => [s.id, s.name]));

    const topReporters = await prisma.report.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const reporterIds = topReporters.map((r) => r.userId);
    const reporters = await prisma.user.findMany({
      where: { id: { in: reporterIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const reporterMap = new Map(reporters.map((r) => [r.id, r]));

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
      verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : '0.0',
      usersByState: usersByLocation.map((r) => ({
        stateId: r.stateId,
        stateName: stateMap.get(r.stateId!) ?? 'Unknown',
        userCount: r._count.id,
      })),
      topReporters: topReporters.map((r) => {
        const user = reporterMap.get(r.userId);
        return {
          userId: r.userId,
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          email: user?.email ?? 'Unknown',
          reportCount: r._count.id,
        };
      }),
    };
  }
}
