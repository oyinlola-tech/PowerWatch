import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import type { PowerStatus } from '../../../constants/power.constant.js';

type Precision = 'neighborhood' | 'town' | 'city' | 'lga' | 'none';

interface Point {
  latitude: number | null;
  longitude: number | null;
  precision: Precision;
}

function firstPoint(candidates: Array<[Precision, number | null, number | null]>): Point {
  for (const [precision, latitude, longitude] of candidates) {
    if (latitude !== null && longitude !== null) return { latitude, longitude, precision };
  }
  return { latitude: null, longitude: null, precision: 'none' };
}

/**
 * Current power status for plotting on a map. With an lgaId, one point per
 * neighborhood; with a stateId, one point per LGA with outage counts (for a
 * heatmap). Neighborhoods without their own coordinates fall back to the
 * nearest level that has them; `precision` says which.
 */
export class GetStatusMapQuery {
  async byLga(lgaId: number) {
    const lga = await prisma.lGA.findUnique({ where: { id: lgaId }, select: { id: true, name: true } });
    if (!lga) throw new AppError(404, MESSAGES.LGA_NOT_FOUND);

    const neighborhoods = await prisma.neighborhood.findMany({
      where: { town: { city: { lgaId } } },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        town: {
          select: {
            name: true,
            latitude: true,
            longitude: true,
            city: {
              select: {
                latitude: true,
                longitude: true,
                lga: { select: { latitude: true, longitude: true } },
              },
            },
          },
        },
      },
    });
    const ids = neighborhoods.map((n) => n.id);
    const { active, reported } = await this.statusSets(ids);

    return {
      lga,
      neighborhoods: neighborhoods.map((n) => ({
        id: n.id,
        name: n.name,
        town: n.town.name,
        status: this.statusOf(n.id, active, reported),
        outageSince: active.get(n.id) ?? null,
        ...firstPoint([
          ['neighborhood', n.latitude, n.longitude],
          ['town', n.town.latitude, n.town.longitude],
          ['city', n.town.city.latitude, n.town.city.longitude],
          ['lga', n.town.city.lga.latitude, n.town.city.lga.longitude],
        ]),
      })),
    };
  }

  async byState(stateId: number) {
    const state = await prisma.state.findUnique({ where: { id: stateId }, select: { id: true, name: true } });
    if (!state) throw new AppError(404, MESSAGES.STATE_NOT_FOUND);

    const [lgas, neighborhoods] = await Promise.all([
      prisma.lGA.findMany({
        where: { stateId },
        select: { id: true, name: true, latitude: true, longitude: true },
        orderBy: { name: 'asc' },
      }),
      prisma.neighborhood.findMany({
        where: { town: { city: { lga: { stateId } } } },
        select: { id: true, town: { select: { city: { select: { lgaId: true } } } } },
      }),
    ]);
    const { active, reported } = await this.statusSets(neighborhoods.map((n) => n.id));

    const counts = new Map<number, { total: number; off: number; on: number }>();
    for (const n of neighborhoods) {
      const lgaId = n.town.city.lgaId;
      const entry = counts.get(lgaId) ?? { total: 0, off: 0, on: 0 };
      entry.total++;
      const status = this.statusOf(n.id, active, reported);
      if (status === 'OFF') entry.off++;
      else if (status === 'ON') entry.on++;
      counts.set(lgaId, entry);
    }

    return {
      state,
      lgas: lgas.map((lga) => {
        const c = counts.get(lga.id) ?? { total: 0, off: 0, on: 0 };
        const known = c.on + c.off;
        return {
          id: lga.id,
          name: lga.name,
          latitude: lga.latitude,
          longitude: lga.longitude,
          neighborhoods: c.total,
          neighborhoodsOff: c.off,
          neighborhoodsOn: c.on,
          /** Share of neighborhoods with a known status that are currently OFF (0-100), for heatmap intensity. */
          outagePercent: known > 0 ? Math.round((c.off / known) * 100) : null,
        };
      }),
    };
  }

  private async statusSets(neighborhoodIds: number[]) {
    if (neighborhoodIds.length === 0) {
      return { active: new Map<number, Date>(), reported: new Set<number>() };
    }
    const [outages, reportedGroups] = await Promise.all([
      prisma.outage.findMany({
        where: { neighborhoodId: { in: neighborhoodIds }, endTime: null },
        select: { neighborhoodId: true, startTime: true },
      }),
      prisma.report.groupBy({
        by: ['neighborhoodId'],
        where: { neighborhoodId: { in: neighborhoodIds }, deletedAt: null },
      }),
    ]);
    return {
      active: new Map(outages.map((o) => [o.neighborhoodId, o.startTime])),
      reported: new Set(reportedGroups.map((g) => g.neighborhoodId)),
    };
  }

  private statusOf(id: number, active: Map<number, Date>, reported: Set<number>): PowerStatus {
    if (active.has(id)) return 'OFF';
    return reported.has(id) ? 'ON' : 'UNKNOWN';
  }
}
