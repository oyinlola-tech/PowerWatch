import { prisma } from '../configs/database.config.js';
import { AppError } from '../errors/index.js';
import { POWER_MESSAGES } from '../constants/power.constant.js';

/** Uses the explicit neighborhood if given, otherwise the user's primary one. */
export async function resolveNeighborhoodId(userId: string, explicit?: number): Promise<number> {
  if (explicit !== undefined) return explicit;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { neighborhoodId: true } });
  if (!user?.neighborhoodId) {
    throw new AppError(400, POWER_MESSAGES.NO_NEIGHBORHOOD);
  }
  return user.neighborhoodId;
}
