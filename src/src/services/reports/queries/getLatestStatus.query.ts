import { ReportRepository } from '../../../repositories/report.repository.js';
import type { LiveStatusResponse } from '../../../interfaces/index.js';

export class GetLatestStatusQuery {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
  ) {}

  async execute(neighborhoodId: number): Promise<LiveStatusResponse> {
    const [latestReport, totalReports] = await Promise.all([
      this.reportRepository.findLatestByNeighborhood(neighborhoodId),
      this.reportRepository.countByNeighborhood(neighborhoodId),
    ]);

    let confidenceScore = 0;
    if (totalReports > 0 && latestReport) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCount = await this.reportRepository.countByNeighborhoodSince(
        neighborhoodId,
        oneHourAgo,
      );
      confidenceScore = Math.min(100, Math.round((recentCount / Math.max(totalReports, 1)) * 100));
    }

    return {
      neighborhoodId,
      latestReport: latestReport
        ? {
            reportType: latestReport.reportType,
            timestamp: latestReport.timestamp,
          }
        : null,
      reportCount: totalReports,
      confidenceScore,
      lastUpdatedTime: latestReport?.timestamp ?? null,
    };
  }
}
