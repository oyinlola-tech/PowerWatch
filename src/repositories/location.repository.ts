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
}
