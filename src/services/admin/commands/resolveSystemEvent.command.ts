import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';

export class ResolveSystemEventCommand {
  /** Marks one event as dealt with. If it happens again it opens a new row. */
  async execute(id: string, adminId: string) {
    const event = await prisma.systemEvent.findUnique({ where: { id }, select: { id: true, resolvedAt: true } });
    if (!event) throw new AppError(404, 'System event not found.');
    if (event.resolvedAt) return prisma.systemEvent.findUnique({ where: { id } });
    return prisma.systemEvent.update({ where: { id }, data: { resolvedAt: new Date(), resolvedBy: adminId } });
  }

  async resolveAll(adminId: string, filter: { source?: string } = {}) {
    const result = await prisma.systemEvent.updateMany({
      where: { resolvedAt: null, ...(filter.source ? { source: filter.source } : {}) },
      data: { resolvedAt: new Date(), resolvedBy: adminId },
    });
    return { resolved: result.count };
  }
}
