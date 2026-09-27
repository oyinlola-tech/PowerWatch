import type { CreateReportDto, ReportResponse } from '../../../interfaces/index.js';
import { CreateReportCommand } from './createReport.command.js';

export class ReportsPowerOnCommand {
  constructor(
    private readonly createReportCommand: CreateReportCommand = new CreateReportCommand(),
  ) {}

  async execute(dto: CreateReportDto): Promise<ReportResponse> {
    dto.reportType = 'ON';
    return this.createReportCommand.execute(dto);
  }
}
