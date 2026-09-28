import type { Prisma } from '@prisma/client';
import { prisma } from '../../configs/database.config.js';

type Db = Prisma.TransactionClient | typeof prisma;

export interface ReportTally {
  on: number;
  off: number;
  /** Earliest OFF among the counted reports; used as the outage start time. */
  earliestOff: Date | null;
}

/**
 * Counts each person once, by their most recent report in the window, so one
 * user can't outvote the neighborhood by reporting repeatedly.
 */
export async function tallyRecentReports(
  db: Db,
  neighborhoodId: number,
  since: Date,
): Promise<ReportTally> {
  const reports = await db.report.findMany({
    // Only people who confirmed their email and are still active decide the status, so
    // throwaway accounts can't outvote a neighborhood
    where: {
      neighborhoodId,
      deletedAt: null,
      timestamp: { gte: since },
      user: { emailVerified: true, deletedAt: null, suspendedAt: null },
    },
    orderBy: { timestamp: 'desc' },
    select: { userId: true, reportType: true, timestamp: true },
  });

  const seen = new Set<string>();
  const tally: ReportTally = { on: 0, off: 0, earliestOff: null };
  for (const report of reports) {
    if (seen.has(report.userId)) continue;
    seen.add(report.userId);
    if (report.reportType === 'ON') {
      tally.on++;
    } else {
      tally.off++;
      if (!tally.earliestOff || report.timestamp < tally.earliestOff) tally.earliestOff = report.timestamp;
    }
  }
  return tally;
}

/** Majority of recent reporters decides; a tie keeps the current status. */
export function consensusStatus(tally: ReportTally, current: 'ON' | 'OFF'): 'ON' | 'OFF' {
  if (tally.off > tally.on) return 'OFF';
  if (tally.on > tally.off) return 'ON';
  return current;
}
