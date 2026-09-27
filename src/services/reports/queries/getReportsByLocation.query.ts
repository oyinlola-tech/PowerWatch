import { ReportRepository } from '../../../repositories/report.repository.js';

export class GetReportsByLocationQuery {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
  ) {}

  async execute(neighborhoodId: number, page: number = 1, limit: number = 20) {
    const where = { neighborhoodId };
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.reportRepository.findManyPublic({ where, skip, take: limit }),
      this.reportRepository.count({ ...where, deletedAt: null }),
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
