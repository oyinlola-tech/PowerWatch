import { prisma } from '../../../configs/database.config.js';
import { env } from '../../../configs/env.config.js';
import { LocationRepository } from '../../../repositories/location.repository.js';
import { AppError } from '../../../errors/index.js';
import { POWER_MESSAGES } from '../../../constants/power.constant.js';
import type { CreateReportDto, ReportResponse } from '../../../interfaces/index.js';
import { consensusStatus, tallyRecentReports } from '../consensus.js';
import { NotifyStatusChangeCommand } from '../../notifications/commands/notifyStatusChange.command.js';
import { ReverseGeocodeQuery } from '../../locations/queries/reverseGeocode.query.js';
import { distanceKm } from '../../../utils/geo.js';
import { describeError, recordSystemEvent } from '../../systemEvents/recordSystemEvent.js';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
// GPS drift between two fixes can look like fast travel over short distances; ignore it.
const TRAVEL_CHECK_MIN_KM = 5;

export class CreateReportCommand {
  constructor(
    private readonly locationRepository: LocationRepository = new LocationRepository(),
    private readonly notifyStatusChange: NotifyStatusChangeCommand = new NotifyStatusChangeCommand(),
    private readonly reverseGeocodeQuery: ReverseGeocodeQuery = new ReverseGeocodeQuery(),
  ) {}

  /** Refuses positions that are faked, too vague, or impossibly far from the person's last report. */
  private async assertTrustworthyLocation(dto: CreateReportDto) {
    if (dto.mocked) {
      throw new AppError(422, POWER_MESSAGES.LOCATION_MOCKED, [{ field: 'mocked', message: POWER_MESSAGES.LOCATION_MOCKED }]);
    }
    if (dto.locationAccuracy > env.reports.maxAccuracyMeters) {
      throw new AppError(422, POWER_MESSAGES.LOCATION_IMPRECISE, [{ field: 'accuracy', message: POWER_MESSAGES.LOCATION_IMPRECISE }]);
    }

    const previous = await prisma.report.findFirst({
      where: { userId: dto.userId, deletedAt: null, latitude: { not: null }, longitude: { not: null } },
      orderBy: { timestamp: 'desc' },
      select: { latitude: true, longitude: true, timestamp: true },
    });
    if (previous?.latitude != null && previous.longitude != null) {
      const km = distanceKm({ latitude: previous.latitude, longitude: previous.longitude }, dto);
      const hours = Math.max(Date.now() - previous.timestamp.getTime(), MINUTE_MS) / HOUR_MS;
      if (km > TRAVEL_CHECK_MIN_KM && km / hours > env.reports.maxTravelKmh) {
        throw new AppError(422, POWER_MESSAGES.LOCATION_IMPOSSIBLE_TRAVEL);
      }
    }
  }

  async execute(dto: CreateReportDto): Promise<ReportResponse> {
    const reporter = await prisma.user.findUnique({
      where: { id: dto.userId },
      select: { emailVerified: true, deletedAt: true, suspendedAt: true },
    });
    if (!reporter || reporter.deletedAt || reporter.suspendedAt) {
      throw new AppError(401, 'Your session has ended. Please sign in again.');
    }
    if (!reporter.emailVerified) {
      throw new AppError(403, POWER_MESSAGES.EMAIL_NOT_VERIFIED);
    }

    await this.assertTrustworthyLocation(dto);

    // The report counts for the place the person is standing, never a chosen one.
    const place = await this.reverseGeocodeQuery.execute(dto.latitude, dto.longitude);
    const neighborhoodId = place.neighborhoodId;
    const street = await this.locationRepository.findOrCreateStreet(neighborhoodId, place.road);

    const { report, status, changedTo } = await prisma.$transaction(async (tx) => {
      // Serialize reports per neighborhood so concurrent reports can't open two outages.
      await tx.$queryRaw`SELECT id FROM neighborhoods WHERE id = ${neighborhoodId} FOR UPDATE`;

      // Server time only: clients can't backdate or future-date reports.
      const now = new Date();

      const lastOwn = await tx.report.findFirst({
        where: { userId: dto.userId, neighborhoodId, deletedAt: null },
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
          neighborhoodId,
          streetId: street?.id ?? null,
          reportType: dto.reportType,
          timestamp: now,
          latitude: dto.latitude,
          longitude: dto.longitude,
          locationAccuracy: dto.locationAccuracy,
          deviceType: dto.deviceType ?? null,
        },
      });

      const activeOutage = await tx.outage.findFirst({
        where: { neighborhoodId, endTime: null },
        orderBy: { startTime: 'desc' },
      });
      const current = activeOutage ? 'OFF' : 'ON';

      const since = new Date(now.getTime() - env.reports.consensusWindowMinutes * MINUTE_MS);
      const tally = await tallyRecentReports(tx, neighborhoodId, since);
      const next = consensusStatus(tally, current);

      let outageId = activeOutage?.id ?? null;
      let changedTo: 'ON' | 'OFF' | null = null;

      if (next === 'OFF' && !activeOutage) {
        const outage = await tx.outage.create({
          data: {
            neighborhoodId,
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
        .execute({ neighborhoodId, status: changedTo, triggeredByUserId: dto.userId })
        .catch((error) =>
          recordSystemEvent({
            level: 'ERROR',
            source: 'push',
            message: 'Power status alerts could not be sent after a status change.',
            details: { neighborhoodId, status: changedTo, ...describeError(error) },
          }),
        );
    }

    return {
      id: report.id,
      userId: report.userId,
      neighborhoodId: report.neighborhoodId,
      place: {
        neighborhood: place.neighborhood,
        street: street?.name ?? null,
        town: place.town,
        lga: place.lga,
        state: place.state,
      },
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
