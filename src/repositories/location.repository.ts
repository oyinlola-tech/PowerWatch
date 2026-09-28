import { prisma } from '../configs/database.config.js';

export class LocationRepository {
  async findCountryById(id: number) {
    return prisma.country.findUnique({ where: { id } });
  }

  async findStateById(id: number) {
    return prisma.state.findUnique({ where: { id } });
  }

  async findLgaById(id: number) {
    return prisma.lGA.findUnique({
      where: { id },
      include: { state: true },
    });
  }

  async findCityById(id: number) {
    return prisma.city.findUnique({
      where: { id },
      include: { lga: true },
    });
  }

  async findTownById(id: number) {
    return prisma.town.findUnique({
      where: { id },
      include: { city: true },
    });
  }

  async findNeighborhoodById(id: number) {
    return prisma.neighborhood.findUnique({
      where: { id },
      include: { town: true },
    });
  }

  /** The street a GPS point is on, created the first time anyone reports from it. */
  async findOrCreateStreet(neighborhoodId: number, road: string | null | undefined) {
    const name = road?.trim().slice(0, 150);
    if (!name) return null;
    return prisma.street.upsert({
      where: { neighborhoodId_name: { neighborhoodId, name } },
      update: {},
      create: { neighborhoodId, name },
    });
  }
}
