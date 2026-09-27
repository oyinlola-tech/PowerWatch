import { prisma } from '../../../configs/database.config.js';
import { ReportRepository } from '../../../repositories/report.repository.js';
import { LocationRepository } from '../../../repositories/location.repository.js';
import { AppError } from '../../../errors/index.js';
import type { CreateReportDto, ReportResponse } from '../../../interfaces/index.js';

export class CreateReportCommand {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
    private readonly locationRepository: LocationRepository = new LocationRepository(),
  ) {}

  async execute(dto: CreateReportDto): Promise<ReportResponse> {
    const neighborhood = await this.locationRepository.findNeighborhoodById(dto.neighborhoodId);
    if (!neighborhood) {
      throw new AppError(422, 'Neighborhood not found.', [
        { field: 'neighborhoodId', message: `Neighborhood with ID ${dto.neighborhoodId} not found.` },
      ]);
    }

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.report.create({
        data: {
          userId: dto.userId,
          neighborhoodId: dto.neighborhoodId,
          reportType: dto.reportType,
          timestamp: dto.timestamp ?? new Date(),
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          deviceType: dto.deviceType ?? null,
        },
      });

      if (dto.reportType === 'OFF') {
        const activeOutage = await tx.outage.findFirst({
          where: { neighborhoodId: dto.neighborhoodId, endTime: null },
        });

        if (!activeOutage) {
          const outage = await tx.outage.create({
            data: {
              neighborhoodId: dto.neighborhoodId,
              startTime: created.timestamp,
              reportCount: 1,
            },
          });

          await tx.outageReport.create({
            data: { outageId: outage.id, reportId: created.id },
          });
        } else {
          await tx.outage.update({
            where: { id: activeOutage.id },
            data: { reportCount: { increment: 1 } },
          });

          await tx.outageReport.create({
            data: { outageId: activeOutage.id, reportId: created.id },
          });
        }
      } else {
        const activeOutage = await tx.outage.findFirst({
          where: { neighborhoodId: dto.neighborhoodId, endTime: null },
        });

        if (activeOutage) {
          const endTime = dto.timestamp ?? new Date();
          const durationMinutes = Math.round(
            (endTime.getTime() - activeOutage.startTime.getTime()) / 60000,
          );

          await tx.outage.update({
            where: { id: activeOutage.id },
            data: {
              endTime,
              duration: durationMinutes,
              reportCount: { increment: 1 },
            },
          });

          await tx.outageReport.create({
            data: { outageId: activeOutage.id, reportId: created.id },
          });
        }
      }

      return created;
    });

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
    };
  }
}
