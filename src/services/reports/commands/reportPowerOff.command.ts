import type { CreateReportDto, ReportResponse } from '../../../interfaces/index.js';
import { CreateReportCommand } from './createReport.command.js';

export class ReportPowerOffCommand {
  constructor(
    private readonly createReportCommand: CreateReportCommand = new CreateReportCommand(),
  ) {}

  async execute(dto: CreateReportDto): Promise<ReportResponse> {
    dto.reportType = 'OFF';
    return this.createReportCommand.execute(dto);
  }
}
