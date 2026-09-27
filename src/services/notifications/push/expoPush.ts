import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../../../configs/database.config.js';
import { env } from '../../../configs/env.config.js';

const expo = new Expo(env.expo.accessToken ? { accessToken: env.expo.accessToken } : {});

export function isExpoPushToken(token: unknown): token is string {
  return Expo.isExpoPushToken(token);
}

/**
 * Sends through Expo's push service (FCM on Android, APNs on iOS) and clears
 * tokens Expo reports as no longer registered.
 */
export async function sendExpoPush(
  messages: Array<{ to: string; title: string; body: string; data?: Record<string, unknown> }>,
): Promise<{ sent: number; failed: number }> {
  const valid: ExpoPushMessage[] = messages
    .filter((m) => Expo.isExpoPushToken(m.to))
    .map((m) => ({ ...m, sound: 'default', priority: 'high', channelId: 'default' }));

  let sent = 0;
  let failed = messages.length - valid.length;
  const deadTokens: string[] = [];

  for (const chunk of expo.chunkPushNotifications(valid)) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === 'ok') {
          sent++;
          return;
        }
        failed++;
        if (ticket.details?.error === 'DeviceNotRegistered') {
          const token = chunk[i]?.to;
          if (typeof token === 'string') deadTokens.push(token);
        }
      });
    } catch (error) {
      failed += chunk.length;
      console.error('Expo push send failed:', error);
    }
  }

  if (deadTokens.length > 0) {
    await prisma.device.updateMany({
      where: { expoPushToken: { in: deadTokens } },
      data: { expoPushToken: null },
    });
  }

  return { sent, failed };
}
