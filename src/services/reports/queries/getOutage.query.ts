import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export class GetOutageQuery {
  async execute(id: string) {
    const outage = await prisma.outage.findUnique({
      where: { id },
      include: {
        neighborhood: { select: { id: true, name: true } },
        outageReports: {
          include: {
            report: {
              select: { id: true, reportType: true, timestamp: true, userId: true },
            },
          },
          orderBy: { report: { timestamp: 'desc' } },
        },
      },
    });

    if (!outage) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    return outage;
  }
}
