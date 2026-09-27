import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { ACTIVITY_LOOKBACK_HOURS } from '../../../constants/power.constant.js';

export interface ActivityItem {
  neighborhoodId: number;
  neighborhood: string;
  town: string;
  status: 'ON' | 'OFF';
  at: Date;
  isCurrentNeighborhood: boolean;
}

/** Recent power changes (outage starts and ends) across the neighborhood's LGA. */
export class GetNeighborhoodActivityQuery {
  async execute(neighborhoodId: number, limit: number): Promise<ActivityItem[]> {
    const origin = await prisma.neighborhood.findUnique({
      where: { id: neighborhoodId },
      select: { town: { select: { city: { select: { lgaId: true } } } } },
    });
    if (!origin) {
      throw new AppError(404, MESSAGES.NEIGHBORHOOD_UNKNOWN);
    }

    const nearby = await prisma.neighborhood.findMany({
      where: { town: { city: { lgaId: origin.town.city.lgaId } } },
      select: { id: true, name: true, town: { select: { name: true } } },
    });
    const byId = new Map(nearby.map((n) => [n.id, n]));

    const since = new Date(Date.now() - ACTIVITY_LOOKBACK_HOURS * 60 * 60_000);
    const outages = await prisma.outage.findMany({
      where: {
        neighborhoodId: { in: [...byId.keys()] },
        OR: [{ startTime: { gte: since } }, { endTime: { gte: since } }],
      },
      orderBy: { startTime: 'desc' },
      take: limit * 2,
      select: { neighborhoodId: true, startTime: true, endTime: true },
    });

    const events: ActivityItem[] = [];
    for (const outage of outages) {
      const place = byId.get(outage.neighborhoodId);
      if (!place) continue;
      const base = {
        neighborhoodId: place.id,
        neighborhood: place.name,
        town: place.town.name,
        isCurrentNeighborhood: place.id === neighborhoodId,
      };
      if (outage.startTime >= since) events.push({ ...base, status: 'OFF', at: outage.startTime });
      if (outage.endTime && outage.endTime >= since) events.push({ ...base, status: 'ON', at: outage.endTime });
    }

    return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
  }
}
