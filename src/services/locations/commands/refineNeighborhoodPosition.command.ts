import { prisma } from '../../../configs/database.config.js';

// A neighborhood first appears on the map at a point rounded to about 1 km, because that
// point is the first reporter's own position. Once several different people have reported
// from it, the average of their positions is a much better, still anonymous, centre.
const MIN_DISTINCT_REPORTERS = 3;
const MAX_ACCURACY_METERS = 100;
const LOOKBACK_DAYS = 180;
const MAX_REPORTS = 2000;

// Three decimals is about 110 m: accurate enough for the map, not precise enough to point
// at anyone's house when it is an average of several people.
const round3 = (value: number) => Math.round(value * 1000) / 1000;

export class RefineNeighborhoodPositionCommand {
  async execute(neighborhoodId: number): Promise<void> {
    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const reports = await prisma.report.findMany({
      where: {
        neighborhoodId,
        deletedAt: null,
        timestamp: { gte: since },
        latitude: { not: null },
        longitude: { not: null },
        locationAccuracy: { lte: MAX_ACCURACY_METERS },
        user: { emailVerified: true, deletedAt: null, suspendedAt: null },
      },
      orderBy: { timestamp: 'desc' },
      take: MAX_REPORTS,
      select: { userId: true, latitude: true, longitude: true },
    });

    // One point per person (their latest), so a frequent reporter doesn't pull the centre
    const perPerson = new Map<string, { latitude: number; longitude: number }>();
    for (const report of reports) {
      if (!perPerson.has(report.userId)) {
        perPerson.set(report.userId, { latitude: report.latitude!, longitude: report.longitude! });
      }
    }
    if (perPerson.size < MIN_DISTINCT_REPORTERS) return;

    const points = [...perPerson.values()];
    const latitude = round3(points.reduce((sum, p) => sum + p.latitude, 0) / points.length);
    const longitude = round3(points.reduce((sum, p) => sum + p.longitude, 0) / points.length);

    await prisma.neighborhood.updateMany({
      where: { id: neighborhoodId, NOT: { latitude, longitude } },
      data: { latitude, longitude },
    });
  }
}
