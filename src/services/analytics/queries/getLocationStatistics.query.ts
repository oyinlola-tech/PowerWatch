import { prisma } from '../../../configs/database.config.js';

export class GetLocationStatisticsQuery {
  async execute() {
    const neighborhoods = await prisma.neighborhood.findMany({
      select: {
        id: true,
        name: true,
        town: {
          select: {
            name: true,
            city: {
              select: {
                name: true,
                lga: {
                  select: {
                    name: true,
                    state: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            reports: true,
            outages: true,
            users: true,
          },
        },
      },
    });

    return {
      totalNeighborhoods: neighborhoods.length,
      neighborhoods: neighborhoods.map((n) => ({
        id: n.id,
        name: n.name,
        town: n.town.name,
        city: n.town.city.name,
        lga: n.town.city.lga.name,
        state: n.town.city.lga.state.name,
        reportCount: n._count.reports,
        outageCount: n._count.outages,
        userCount: n._count.users,
      })),
    };
  }
}
