import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import {
  CONFIDENCE_WINDOW_MINUTES,
  CONFIRMATION_LOOKBACK_HOURS,
  type PowerStatus,
} from '../../../constants/power.constant.js';
import type { LiveStatusResponse } from '../../../interfaces/index.js';
import { tallyRecentReports } from '../consensus.js';

const MINUTE_MS = 60_000;

export class GetLatestStatusQuery {
  async execute(neighborhoodId: number): Promise<LiveStatusResponse> {
    const now = new Date();

    const [neighborhood, activeOutage, lastClosedOutage, lastReport] = await Promise.all([
      prisma.neighborhood.findUnique({
        where: { id: neighborhoodId },
        select: { id: true, name: true, town: { select: { name: true } } },
      }),
      prisma.outage.findFirst({
        where: { neighborhoodId, endTime: null },
        orderBy: { startTime: 'desc' },
        select: { startTime: true },
      }),
      prisma.outage.findFirst({
        where: { neighborhoodId, endTime: { not: null } },
        orderBy: { endTime: 'desc' },
        select: { endTime: true },
      }),
      prisma.report.findFirst({
        where: { neighborhoodId, deletedAt: null },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      }),
    ]);

    if (!neighborhood) {
      throw new AppError(404, MESSAGES.NEIGHBORHOOD_UNKNOWN);
    }

    const status: PowerStatus = activeOutage ? 'OFF' : lastReport || lastClosedOutage ? 'ON' : 'UNKNOWN';
    const since = activeOutage?.startTime ?? lastClosedOutage?.endTime ?? null;

    let confirmedBy = 0;
    let confidence = 0;
    let recentReporters = 0;

    if (status !== 'UNKNOWN') {
      const lookback = new Date(now.getTime() - CONFIRMATION_LOOKBACK_HOURS * 60 * MINUTE_MS);
      const confirmFrom = since && since > lookback ? since : lookback;
      const confirmers = await prisma.report.groupBy({
        by: ['userId'],
        where: {
          neighborhoodId,
          deletedAt: null,
          reportType: status,
          timestamp: { gte: confirmFrom },
          user: { emailVerified: true, deletedAt: null, suspendedAt: null },
        },
      });
      confirmedBy = confirmers.length;

      const tally = await tallyRecentReports(
        prisma,
        neighborhoodId,
        new Date(now.getTime() - CONFIDENCE_WINDOW_MINUTES * MINUTE_MS),
      );
      recentReporters = tally.on + tally.off;
      const agreeing = status === 'OFF' ? tally.off : tally.on;
      confidence = recentReporters > 0 ? Math.round((agreeing / recentReporters) * 100) : 0;
    }

    // Which streets recent reports came from, most recent first, so people can see how local it is.
    const streetReports = await prisma.report.groupBy({
      by: ['streetId', 'reportType'],
      where: {
        neighborhoodId,
        deletedAt: null,
        streetId: { not: null },
        timestamp: { gte: new Date(now.getTime() - CONFIDENCE_WINDOW_MINUTES * MINUTE_MS) },
      },
      _count: { _all: true },
      _max: { timestamp: true },
    });
    const streetNames = new Map(
      (
        await prisma.street.findMany({
          where: { id: { in: streetReports.map((r) => r.streetId!) } },
          select: { id: true, name: true },
        })
      ).map((street) => [street.id, street.name]),
    );
    const recentStreets = streetReports
      .sort((a, b) => (b._max.timestamp?.getTime() ?? 0) - (a._max.timestamp?.getTime() ?? 0))
      .map((r) => ({
        street: streetNames.get(r.streetId!) ?? '',
        reportType: r.reportType,
        reports: r._count._all,
        lastReportAt: r._max.timestamp,
      }))
      .filter((r) => r.street);

    return {
      neighborhood: { id: neighborhood.id, name: neighborhood.name, town: neighborhood.town.name },
      status,
      since,
      confirmedBy,
      confidence,
      recentReporters,
      lastReportAt: lastReport?.timestamp ?? null,
      recentStreets,
    };
  }
}
