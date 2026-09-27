import { ReportRepository } from '../../../repositories/report.repository.js';

export class GetReportsByLocationQuery {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
  ) {}

  async execute(neighborhoodId: number, page: number = 1, limit: number = 20) {
    const where = { neighborhoodId };
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.reportRepository.findMany({ where, skip, take: limit }),
      this.reportRepository.count(where),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
