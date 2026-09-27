import type { Prisma } from '@prisma/client';
import { ReportRepository } from '../../../repositories/report.repository.js';

export class GetReportsQuery {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
  ) {}

  async execute(params: {
    neighborhoodId?: number;
    reportType?: 'ON' | 'OFF';
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ReportWhereInput = {};

    if (params.neighborhoodId !== undefined) {
      where.neighborhoodId = params.neighborhoodId;
    }
    if (params.reportType) {
      where.reportType = params.reportType;
    }
    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) where.timestamp.gte = new Date(params.startDate);
      if (params.endDate) where.timestamp.lte = new Date(params.endDate);
    }

    const skip = (params.page - 1) * params.limit;
    const [reports, total] = await Promise.all([
      this.reportRepository.findMany({ where, skip, take: params.limit }),
      this.reportRepository.count(where),
    ]);

    return {
      data: reports,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
