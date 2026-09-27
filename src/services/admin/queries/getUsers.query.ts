import { prisma } from '../../../configs/database.config.js';

export class GetUsersQuery {
  async execute(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }
    if (params.role) {
      where.role = params.role;
    }

    const skip = (params.page - 1) * params.limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          emailVerified: true,
          notificationEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: where as any }),
    ]);

    return {
      data: users,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
