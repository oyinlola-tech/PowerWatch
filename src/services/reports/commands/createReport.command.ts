import { prisma } from '../../../configs/database.config.js';
import { env } from '../../../configs/env.config.js';
import { LocationRepository } from '../../../repositories/location.repository.js';
import { AppError } from '../../../errors/index.js';
import { POWER_MESSAGES } from '../../../constants/power.constant.js';
import type { CreateReportDto, ReportResponse } from '../../../interfaces/index.js';
import { consensusStatus, tallyRecentReports } from '../consensus.js';
import { NotifyStatusChangeCommand } from '../../notifications/commands/notifyStatusChange.command.js';

const MINUTE_MS = 60_000;

export class CreateReportCommand {
  constructor(
    private readonly locationRepository: LocationRepository = new LocationRepository(),
    private readonly notifyStatusChange: NotifyStatusChangeCommand = new NotifyStatusChangeCommand(),
  ) {}

  async execute(dto: CreateReportDto): Promise<ReportResponse> {
    const neighborhood = await this.locationRepository.findNeighborhoodById(dto.neighborhoodId);
    if (!neighborhood) {
      throw new AppError(422, 'Neighborhood not found.', [
        { field: 'neighborhoodId', message: `Neighborhood with ID ${dto.neighborhoodId} not found.` },
      ]);
    }

    const { report, status, changedTo } = await prisma.$transaction(async (tx) => {
      // Serialize reports per neighborhood so concurrent reports can't open two outages.
      await tx.$queryRaw`SELECT id FROM neighborhoods WHERE id = ${dto.neighborhoodId} FOR UPDATE`;

      // Server time only: clients can't backdate or future-date reports.
      const now = new Date();

      const lastOwn = await tx.report.findFirst({
        where: { userId: dto.userId, neighborhoodId: dto.neighborhoodId, deletedAt: null },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });
      const cooldownMs = env.reports.cooldownMinutes * MINUTE_MS;
      if (lastOwn && now.getTime() - lastOwn.timestamp.getTime() < cooldownMs) {
        throw new AppError(429, POWER_MESSAGES.REPORT_COOLDOWN);
      }

      const created = await tx.report.create({
        data: {
          userId: dto.userId,
          neighborhoodId: dto.neighborhoodId,
          reportType: dto.reportType,
          timestamp: now,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          deviceType: dto.deviceType ?? null,
        },
      });

      const activeOutage = await tx.outage.findFirst({
        where: { neighborhoodId: dto.neighborhoodId, endTime: null },
        orderBy: { startTime: 'desc' },
      });
      const current = activeOutage ? 'OFF' : 'ON';

      const since = new Date(now.getTime() - env.reports.consensusWindowMinutes * MINUTE_MS);
      const tally = await tallyRecentReports(tx, dto.neighborhoodId, since);
      const next = consensusStatus(tally, current);

      let outageId = activeOutage?.id ?? null;
      let changedTo: 'ON' | 'OFF' | null = null;

      if (next === 'OFF' && !activeOutage) {
        const outage = await tx.outage.create({
          data: {
            neighborhoodId: dto.neighborhoodId,
            startTime: tally.earliestOff ?? now,
          },
        });
        outageId = outage.id;
        changedTo = 'OFF';
      } else if (next === 'ON' && activeOutage) {
        await tx.outage.update({
          where: { id: activeOutage.id },
          data: {
            endTime: now,
            duration: Math.round((now.getTime() - activeOutage.startTime.getTime()) / MINUTE_MS),
          },
        });
        changedTo = 'ON';
      }

      // Link the report to the outage it is about (the one it opened, joined, disputed or closed).
      if (outageId) {
        await tx.outage.update({ where: { id: outageId }, data: { reportCount: { increment: 1 } } });
        await tx.outageReport.create({ data: { outageId, reportId: created.id } });
      }

      return { report: created, status: next, changedTo };
    });

    if (changedTo) {
      // Push delivery must never fail or slow down the report itself.
      this.notifyStatusChange
        .execute({ neighborhoodId: dto.neighborhoodId, status: changedTo, triggeredByUserId: dto.userId })
        .catch((error) => console.error('Status-change notification failed:', error));
    }

    return {
      id: report.id,
      userId: report.userId,
      neighborhoodId: report.neighborhoodId,
      reportType: report.reportType,
      timestamp: report.timestamp,
      latitude: report.latitude,
      longitude: report.longitude,
      deviceType: report.deviceType,
      createdAt: report.createdAt,
      neighborhoodStatus: status,
      statusChanged: changedTo !== null,
    };
  }
}
