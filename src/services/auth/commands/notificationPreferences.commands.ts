import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

const PREFERENCE_FIELDS = {
  notificationEnabled: true,
  outageAlerts: true,
  restorationAlerts: true,
  communityUpdates: true,
} as const;

export interface NotificationPreferences {
  /** Master switch: when false, no push notifications are sent. */
  notificationEnabled: boolean;
  outageAlerts: boolean;
  restorationAlerts: boolean;
  communityUpdates: boolean;
}

export class GetNotificationPreferencesQuery {
  async execute(userId: string): Promise<NotificationPreferences> {
    const prefs = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: PREFERENCE_FIELDS,
    });
    if (!prefs) throw new AppError(404, MESSAGES.NOT_FOUND);
    return prefs;
  }
}

export class UpdateNotificationPreferencesCommand {
  async execute(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: updates,
      select: PREFERENCE_FIELDS,
    });
  }
}
