import { Prisma } from '@prisma/client';
import { prisma } from '../configs/database.config.js';
import type { AuditAction } from '@prisma/client';

export class AuditRepository {
  async create(data: {
    userId?: string | null;
    action: AuditAction;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        metadata: (data.metadata ?? Prisma.DbNull) as unknown as Prisma.InputJsonValue,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }

  async findByUserId(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async findByAction(action: AuditAction, limit = 50) {
    return prisma.auditLog.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
