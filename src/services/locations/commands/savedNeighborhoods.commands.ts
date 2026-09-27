import { Prisma } from '@prisma/client';
import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { MAX_SAVED_NEIGHBORHOODS, type PowerStatus } from '../../../constants/power.constant.js';

export class ListSavedNeighborhoodsQuery {
  async execute(userId: string) {
    const saved = await prisma.savedNeighborhood.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        label: true,
        createdAt: true,
        neighborhood: { select: { id: true, name: true, town: { select: { name: true } } } },
      },
    });
    const ids = saved.map((s) => s.neighborhood.id);

    const [active, reported] = ids.length
      ? await Promise.all([
          prisma.outage.findMany({
            where: { neighborhoodId: { in: ids }, endTime: null },
            select: { neighborhoodId: true, startTime: true },
          }),
          prisma.report.groupBy({ by: ['neighborhoodId'], where: { neighborhoodId: { in: ids }, deletedAt: null } }),
        ])
      : [[], []];
    const activeById = new Map(active.map((o) => [o.neighborhoodId, o.startTime]));
    const reportedIds = new Set(reported.map((r) => r.neighborhoodId));

    return saved.map((s) => {
      const id = s.neighborhood.id;
      const status: PowerStatus = activeById.has(id) ? 'OFF' : reportedIds.has(id) ? 'ON' : 'UNKNOWN';
      return {
        neighborhoodId: id,
        name: s.neighborhood.name,
        town: s.neighborhood.town.name,
        label: s.label,
        status,
        outageSince: activeById.get(id) ?? null,
        savedAt: s.createdAt,
      };
    });
  }
}

export class SaveNeighborhoodCommand {
  async execute(userId: string, neighborhoodId: number, label?: string) {
    const neighborhood = await prisma.neighborhood.findUnique({ where: { id: neighborhoodId }, select: { id: true } });
    if (!neighborhood) throw new AppError(404, MESSAGES.NEIGHBORHOOD_UNKNOWN);

    const count = await prisma.savedNeighborhood.count({ where: { userId } });
    if (count >= MAX_SAVED_NEIGHBORHOODS) {
      throw new AppError(422, `You can save up to ${MAX_SAVED_NEIGHBORHOODS} neighborhoods.`);
    }

    try {
      const saved = await prisma.savedNeighborhood.create({
        data: { userId, neighborhoodId, label: label ?? null },
      });
      return { neighborhoodId: saved.neighborhoodId, label: saved.label, savedAt: saved.createdAt };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'This neighborhood is already saved.');
      }
      throw error;
    }
  }
}

export class RemoveSavedNeighborhoodCommand {
  async execute(userId: string, neighborhoodId: number) {
    const result = await prisma.savedNeighborhood.deleteMany({ where: { userId, neighborhoodId } });
    if (result.count === 0) throw new AppError(404, MESSAGES.NOT_FOUND);
  }
}
