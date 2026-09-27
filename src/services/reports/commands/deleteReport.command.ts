import { prisma } from '../../../configs/database.config.js';
import { ReportRepository } from '../../../repositories/report.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

export interface DeleteReportActor {
  userId: string;
  role: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export class DeleteReportCommand {
  constructor(
    private readonly reportRepository: ReportRepository = new ReportRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  async execute(id: string, actor: DeleteReportActor): Promise<void> {
    const report = await this.reportRepository.findById(id);
    const isAdmin = actor.role === 'ADMIN';
    // Non-owners get a 404 rather than a 403 so report IDs can't be probed.
    if (!report || (!isAdmin && report.userId !== actor.userId)) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.outageReport.deleteMany({ where: { reportId: id } });
      await tx.report.delete({ where: { id } });
    });

    await this.auditRepository.create({
      userId: actor.userId,
      action: isAdmin && report.userId !== actor.userId ? 'ADMIN_ACTION' : 'REPORT_DELETE',
      entityType: 'Report',
      entityId: id,
      metadata: { operation: 'DELETE_REPORT', reportOwnerId: report.userId },
      ipAddress: actor.ipAddress ?? null,
      userAgent: actor.userAgent ?? null,
    });
  }
}
