import type { Prisma } from '@prisma/client';
import { prisma } from '../../../configs/database.config.js';
import { SendFirebaseNotificationCommand } from '../../firebase/commands/sendNotification.command.js';
import { NotificationRepository } from '../../../repositories/notification.repository.js';
import { AuditRepository } from '../../../repositories/audit.repository.js';
import { sendExpoPush } from '../../notifications/push/expoPush.js';
import type { AdminActor } from './adminActor.js';

const LOG_BATCH_SIZE = 1000;

/** Who an admin message goes to. A place matches people living there or who saved it. */
export type BroadcastAudience =
  | { type: 'all' }
  | { type: 'users'; userIds: string[] }
  | { type: 'neighborhood'; neighborhoodId: number }
  | { type: 'lga'; lgaId: number }
  | { type: 'state'; stateId: number };

function audienceFilter(audience: BroadcastAudience): Prisma.UserWhereInput {
  const active: Prisma.UserWhereInput = { deletedAt: null, suspendedAt: null };
  switch (audience.type) {
    case 'all':
      return active;
    case 'users':
      return { ...active, id: { in: audience.userIds } };
    case 'neighborhood':
      return {
        ...active,
        OR: [
          { neighborhoodId: audience.neighborhoodId },
          { savedNeighborhoods: { some: { neighborhoodId: audience.neighborhoodId } } },
        ],
      };
    case 'lga':
      return {
        ...active,
        OR: [
          { lgaId: audience.lgaId },
          { savedNeighborhoods: { some: { neighborhood: { town: { city: { lgaId: audience.lgaId } } } } } },
        ],
      };
    case 'state':
      return {
        ...active,
        OR: [
          { stateId: audience.stateId },
          { savedNeighborhoods: { some: { neighborhood: { town: { city: { lga: { stateId: audience.stateId } } } } } } },
        ],
      };
  }
}

export class SendBroadcastCommand {
  constructor(
    private readonly firebaseSender: SendFirebaseNotificationCommand = new SendFirebaseNotificationCommand(),
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
    private readonly auditRepository: AuditRepository = new AuditRepository(),
  ) {}

  /**
   * Every recipient gets the message in their in-app inbox. Those with notifications switched
   * on (and, for messages to a place, community updates on) also get a push on each device. With `dryRun` nothing is sent; the counts
   * show who would receive it.
   */
  async execute(
    params: { title: string; body: string; audience: BroadcastAudience; dryRun?: boolean },
    actor: AdminActor,
  ) {
    const users = await prisma.user.findMany({
      where: audienceFilter(params.audience),
      select: {
        id: true,
        notificationEnabled: true,
        communityUpdates: true,
        devices: { select: { expoPushToken: true, fcmToken: true } },
      },
    });

    // A message to a place is a community update, so it also respects that setting.
    // Messages to everyone or to chosen people are announcements and only need notifications on.
    const isCommunityUpdate = params.audience.type === 'neighborhood' || params.audience.type === 'lga' || params.audience.type === 'state';
    const pushUsers = users.filter((u) => u.notificationEnabled && (!isCommunityUpdate || u.communityUpdates));
    const expoTokens = [...new Set(pushUsers.flatMap((u) => u.devices.map((d) => d.expoPushToken)).filter((t): t is string => !!t))];
    const fcmTokens = [...new Set(pushUsers.flatMap((u) => u.devices.map((d) => d.fcmToken)).filter((t): t is string => !!t))];

    const counts = {
      recipients: users.length,
      pushEnabledRecipients: pushUsers.length,
      devices: expoTokens.length + fcmTokens.length,
    };
    if (params.dryRun) return { ...counts, dryRun: true };

    const data = { type: 'BROADCAST' };
    const [expoResult, fcmResult] = await Promise.all([
      expoTokens.length > 0
        ? sendExpoPush(expoTokens.map((to) => ({ to, title: params.title, body: params.body, data })))
        : Promise.resolve({ sent: 0, failed: 0 }),
      fcmTokens.length > 0
        ? this.firebaseSender.sendMulticast({ tokens: fcmTokens, title: params.title, body: params.body, data })
        : Promise.resolve({ successCount: 0, failureCount: 0 }),
    ]);

    const sentAt = new Date();
    for (let i = 0; i < users.length; i += LOG_BATCH_SIZE) {
      await this.notificationRepository.createMany(
        users.slice(i, i + LOG_BATCH_SIZE).map((u) => ({
          userId: u.id,
          title: params.title,
          body: params.body,
          type: 'BROADCAST',
          sent: true,
          sentAt,
        })),
      );
    }

    const result = {
      ...counts,
      pushSent: expoResult.sent + fcmResult.successCount,
      pushFailed: expoResult.failed + fcmResult.failureCount,
    };

    await this.auditRepository.create({
      userId: actor.userId,
      action: 'ADMIN_ACTION',
      entityType: 'Broadcast',
      entityId: null,
      metadata: { operation: 'SEND_BROADCAST', title: params.title, audience: params.audience, ...result },
      ipAddress: actor.ipAddress ?? null,
      userAgent: actor.userAgent ?? null,
    });

    return result;
  }
}
