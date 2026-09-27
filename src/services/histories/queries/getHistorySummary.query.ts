import { prisma } from '../../../configs/database.config.js';
import { env } from '../../../configs/env.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import {
  localDateString,
  localTimeString,
  minutesBetween,
  startOfLocalDay,
  startOfLocalDayOffset,
} from '../../../utils/time.js';

interface OutagePeriod {
  start: Date;
  end: Date;
  /** Local HH:mm, for placing the period on the day's 00:00–23:59 bar. */
  startTime: string;
  endTime: string;
  minutes: number;
  ongoing: boolean;
}

interface DaySummary {
  date: string;
  offMinutes: number;
  outages: OutagePeriod[];
}

/**
 * Per-day outage summary for the History screen: totals, uptime, the longest
 * outage and each day's off periods, with days split at local midnight.
 */
export class GetHistorySummaryQuery {
  async execute(neighborhoodId: number, days: number) {
    const tz = env.timeZone;
    const now = new Date();

    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: neighborhoodId },
      select: { id: true, name: true },
    });
    if (!neighborhood) {
      throw new AppError(404, MESSAGES.NEIGHBORHOOD_UNKNOWN);
    }

    // Newest first: index 0 is today.
    const dayStarts = Array.from({ length: days }, (_, i) =>
      i === 0 ? startOfLocalDay(now, tz) : startOfLocalDayOffset(now, i, tz),
    );
    const rangeStart = dayStarts[days - 1]!;

    const [outages, reportsInRange] = await Promise.all([
      prisma.outage.findMany({
        where: {
          neighborhoodId,
          startTime: { lt: now },
          OR: [{ endTime: null }, { endTime: { gt: rangeStart } }],
        },
        orderBy: { startTime: 'asc' },
        select: { startTime: true, endTime: true },
      }),
      prisma.report.count({ where: { neighborhoodId, deletedAt: null, timestamp: { gte: rangeStart } } }),
    ]);

    const summaries: DaySummary[] = dayStarts.map((dayStart, i) => {
      const dayEnd = i === 0 ? now : dayStarts[i - 1]!;
      const periods: OutagePeriod[] = [];
      for (const outage of outages) {
        const outageEnd = outage.endTime ?? now;
        const start = outage.startTime > dayStart ? outage.startTime : dayStart;
        const end = outageEnd < dayEnd ? outageEnd : dayEnd;
        const minutes = minutesBetween(start, end);
        if (end <= start || minutes === 0) continue;
        periods.push({
          start,
          end,
          startTime: localTimeString(start, tz),
          // A period that runs into the next day ends at the bar's right edge.
          endTime: i !== 0 && end.getTime() === dayEnd.getTime() ? '23:59' : localTimeString(end, tz),
          minutes,
          ongoing: outage.endTime === null && end.getTime() === now.getTime(),
        });
      }
      return {
        date: localDateString(dayStart, tz),
        offMinutes: periods.reduce((sum, p) => sum + p.minutes, 0),
        outages: periods,
      };
    });

    const totalOutageMinutes = summaries.reduce((sum, d) => sum + d.offMinutes, 0);
    const elapsedMinutes = Math.max(1, minutesBetween(rangeStart, now));

    let longest: { minutes: number; date: string; start: Date; end: Date; ongoing: boolean } | null = null;
    for (const outage of outages) {
      const start = outage.startTime > rangeStart ? outage.startTime : rangeStart;
      const end = outage.endTime ?? now;
      const minutes = minutesBetween(start, end);
      if (!longest || minutes > longest.minutes) {
        longest = { minutes, date: localDateString(start, tz), start, end, ongoing: outage.endTime === null };
      }
    }

    return {
      neighborhood,
      timeZone: tz,
      from: rangeStart,
      to: now,
      days: summaries,
      totalOutageMinutes,
      uptimePercent: Math.round((1 - Math.min(totalOutageMinutes, elapsedMinutes) / elapsedMinutes) * 1000) / 10,
      outageCount: outages.length,
      longestOutage: longest,
      // False when nobody reported in this period, so the app can show its empty state.
      hasData: reportsInRange > 0 || outages.length > 0,
    };
  }
}
