import { prisma } from '../../../configs/database.config.js';

export class GetPowerTimelineQuery {
  async execute(params: {
    neighborhoodId: number;
    startDate: string;
    endDate: string;
    interval?: 'hour' | 'day';
  }) {
    const reports = await prisma.report.findMany({
      where: {
        neighborhoodId: params.neighborhoodId,
        timestamp: {
          gte: new Date(params.startDate),
          lte: new Date(params.endDate),
        },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        reportType: true,
        timestamp: true,
      },
    });

    const interval = params.interval ?? 'day';

    const timeline: Record<string, { on: number; off: number; entries: typeof reports }> = {};
    for (const report of reports) {
      let key: string;
      if (interval === 'hour') {
        key = report.timestamp.toISOString().slice(0, 13);
      } else {
        key = report.timestamp.toISOString().slice(0, 10);
      }

      if (!timeline[key]) {
        timeline[key] = { on: 0, off: 0, entries: [] };
      }
      const entry = timeline[key];
      if (entry) {
        entry.entries.push(report);
        if (report.reportType === 'ON') entry.on++;
        else entry.off++;
      }
    }

    return {
      neighborhoodId: params.neighborhoodId,
      interval,
      startDate: params.startDate,
      endDate: params.endDate,
      timeline: Object.entries(timeline)
        .map(([period, data]) => ({
          period,
          onCount: data.on,
          offCount: data.off,
          totalCount: data.entries.length,
        }))
        .sort((a, b) => a.period.localeCompare(b.period)),
    };
  }
}
