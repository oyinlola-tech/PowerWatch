import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';
import { PUBLIC_REPORT_SELECT } from '../../../repositories/report.repository.js';

export class GetReportQuery {
  /** The reporter and admins see the full report; everyone else sees the anonymous view. */
  async execute(id: string, viewer: { userId: string; role: string }) {
    const report = await prisma.report.findFirst({
      where: { id, deletedAt: null },
      select: { ...PUBLIC_REPORT_SELECT, userId: true },
    });
    if (!report) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (report.userId === viewer.userId || viewer.role === 'ADMIN') {
      return prisma.report.findUnique({
        where: { id },
        select: {
          ...PUBLIC_REPORT_SELECT,
          userId: true,
          latitude: true,
          longitude: true,
          locationAccuracy: true,
          deviceType: true,
        },
      });
    }

    const { userId: _reporter, ...anonymous } = report;
    return anonymous;
  }
}
