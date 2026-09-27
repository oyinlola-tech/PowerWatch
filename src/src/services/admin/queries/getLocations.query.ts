import { prisma } from '../../../configs/database.config.js';

export class GetLocationsQuery {
  async execute() {
    const [countries, states, lgas, cities, towns, neighborhoods] = await Promise.all([
      prisma.country.findMany({ orderBy: { name: 'asc' } }),
      prisma.state.findMany({ orderBy: { name: 'asc' } }),
      prisma.lGA.findMany({ orderBy: { name: 'asc' } }),
      prisma.city.findMany({ orderBy: { name: 'asc' } }),
      prisma.town.findMany({ orderBy: { name: 'asc' } }),
      prisma.neighborhood.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return {
      countries: countries.map((c) => ({ id: c.id, name: c.name })),
      states: states.map((s) => ({ id: s.id, name: s.name, countryId: s.countryId })),
      lgas: lgas.map((l) => ({ id: l.id, name: l.name, stateId: l.stateId })),
      cities: cities.map((c) => ({ id: c.id, name: c.name, lgaId: c.lgaId })),
      towns: towns.map((t) => ({ id: t.id, name: t.name, cityId: t.cityId })),
      neighborhoods: neighborhoods.map((n) => ({ id: n.id, name: n.name, townId: n.townId })),
    };
  }
}
