import { prisma } from '../../../configs/database.config.js';
import { NotificationRepository } from '../../../repositories/notification.repository.js';
import { SendFirebaseNotificationCommand } from '../../firebase/commands/sendNotification.command.js';
import { sendExpoPush } from '../push/expoPush.js';

/**
 * Tells residents (primary or saved neighborhood) that power went off or came
 * back, honoring their master switch and the matching alert preference.
 */
export class NotifyStatusChangeCommand {
  constructor(
    private readonly notificationRepository: NotificationRepository = new NotificationRepository(),
    private readonly firebaseSender: SendFirebaseNotificationCommand = new SendFirebaseNotificationCommand(),
  ) {}

  async execute(params: { neighborhoodId: number; status: 'ON' | 'OFF'; triggeredByUserId?: string }) {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: params.neighborhoodId },
      select: { name: true },
    });
    if (!neighborhood) return { recipients: 0 };

    const preference = params.status === 'OFF' ? { outageAlerts: true } : { restorationAlerts: true };
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        suspendedAt: null,
        notificationEnabled: true,
        ...preference,
        ...(params.triggeredByUserId ? { id: { not: params.triggeredByUserId } } : {}),
        OR: [
          { neighborhoodId: params.neighborhoodId },
          { savedNeighborhoods: { some: { neighborhoodId: params.neighborhoodId } } },
        ],
      },
      select: { id: true, devices: { select: { expoPushToken: true, fcmToken: true } } },
    });
    if (users.length === 0) return { recipients: 0 };

    const title =
      params.status === 'OFF' ? `Power outage in ${neighborhood.name}` : `Power restored in ${neighborhood.name}`;
    const body =
      params.status === 'OFF'
        ? 'Neighbors report the power just went out.'
        : 'Neighbors report the power is back on.';
    const data = { type: 'POWER_STATUS', neighborhoodId: params.neighborhoodId, status: params.status };

    const expoTokens = users.flatMap((u) => u.devices.map((d) => d.expoPushToken)).filter((t): t is string => !!t);
    const fcmTokens = users.flatMap((u) => u.devices.map((d) => d.fcmToken)).filter((t): t is string => !!t);

    const [expoResult, fcmResult] = await Promise.all([
      expoTokens.length > 0
        ? sendExpoPush(expoTokens.map((to) => ({ to, title, body, data })))
        : Promise.resolve({ sent: 0, failed: 0 }),
      fcmTokens.length > 0
        ? this.firebaseSender.sendMulticast({
            tokens: fcmTokens,
            title,
            body,
            data: { type: data.type, neighborhoodId: String(data.neighborhoodId), status: data.status },
          })
        : Promise.resolve({ successCount: 0, failureCount: 0 }),
    ]);

    const sentAt = new Date();
    await this.notificationRepository.createMany(
      users.map((u) => ({ userId: u.id, title, body, type: 'PUSH', sent: true, sentAt })),
    );

    return {
      recipients: users.length,
      pushSent: expoResult.sent + fcmResult.successCount,
      pushFailed: expoResult.failed + fcmResult.failureCount,
    };
  }
}
