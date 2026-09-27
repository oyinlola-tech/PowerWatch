import { ReportRepository } from '../../../repositories/report.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class GetReportQuery {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
  ) {}

  async execute(id: string) {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }
    return report;
  }
}
