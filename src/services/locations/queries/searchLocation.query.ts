import { prisma } from '../../../configs/database.config.js';

export interface LocationSearchItem {
  type: 'state' | 'lga' | 'city' | 'town' | 'neighborhood';
  id: number;
  name: string;
  stateId: number;
  state: string;
  lgaId: number;
  lga: string;
  cityId: number | null;
  city: string | null;
  townId: number | null;
  town: string | null;
  neighborhoodId: number | null;
  neighborhood: string | null;
}

export class SearchLocationQuery {
  async execute(query: string, limit: number = 20): Promise<LocationSearchItem[]> {
    const term = query.trim();
    if (!term) return [];

    const results: LocationSearchItem[] = [];

    // Independent lookups; run them concurrently rather than one after another.
    const [neighborhoods, towns, cities, lgas] = await Promise.all([
      prisma.neighborhood.findMany({
        where: { name: { contains: term } },
        take: limit,
        include: {
          town: {
            include: {
              city: {
                include: {
                  lga: { include: { state: true } },
                },
              },
            },
          },
        },
      }),
      prisma.town.findMany({
        where: { name: { contains: term } },
        take: limit,
        include: {
          city: {
            include: {
              lga: { include: { state: true } },
            },
          },
        },
      }),
      prisma.city.findMany({
        where: { name: { contains: term } },
        take: limit,
        include: {
          lga: { include: { state: true } },
        },
      }),
      prisma.lGA.findMany({
        where: { name: { contains: term } },
        take: limit,
        include: { state: true },
      }),
    ]);

    for (const n of neighborhoods) {
      results.push({
        type: 'neighborhood',
        id: n.id,
        name: n.name,
        stateId: n.town.city.lga.state.id,
        state: n.town.city.lga.state.name,
        lgaId: n.town.city.lga.id,
        lga: n.town.city.lga.name,
        cityId: n.town.city.id,
        city: n.town.city.name,
        townId: n.town.id,
        town: n.town.name,
        neighborhoodId: n.id,
        neighborhood: n.name,
      });
    }

    if (results.length >= limit) return results.slice(0, limit);

    for (const t of towns) {
      if (results.some((r) => r.type === 'neighborhood' && r.townId === t.id)) continue;
      results.push({
        type: 'town',
        id: t.id,
        name: t.name,
        stateId: t.city.lga.state.id,
        state: t.city.lga.state.name,
        lgaId: t.city.lga.id,
        lga: t.city.lga.name,
        cityId: t.city.id,
        city: t.city.name,
        townId: t.id,
        town: t.name,
        neighborhoodId: null,
        neighborhood: null,
      });
    }

    if (results.length >= limit) return results.slice(0, limit);

    for (const c of cities) {
      if (results.some((r) => r.cityId === c.id)) continue;
      results.push({
        type: 'city',
        id: c.id,
        name: c.name,
        stateId: c.lga.state.id,
        state: c.lga.state.name,
        lgaId: c.lga.id,
        lga: c.lga.name,
        cityId: c.id,
        city: c.name,
        townId: null,
        town: null,
        neighborhoodId: null,
        neighborhood: null,
      });
    }

    if (results.length >= limit) return results.slice(0, limit);

    for (const l of lgas) {
      if (results.some((r) => r.lgaId === l.id)) continue;
      results.push({
        type: 'lga',
        id: l.id,
        name: l.name,
        stateId: l.state.id,
        state: l.state.name,
        lgaId: l.id,
        lga: l.name,
        cityId: null,
        city: null,
        townId: null,
        town: null,
        neighborhoodId: null,
        neighborhood: null,
      });
    }

    return results.slice(0, limit);
  }
}
