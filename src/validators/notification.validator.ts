import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z
    .string({ message: 'Title is required.' })
    .trim()
    .min(1, 'Title is required.')
    .max(200, 'Title must not exceed 200 characters.'),
  body: z
    .string({ message: 'Body is required.' })
    .trim()
    .min(1, 'Body is required.')
    .max(1000, 'Body must not exceed 1000 characters.'),
});

export const getNotificationsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((v) => Math.max(1, Number(v) || 1)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((v) => Math.min(100, Math.max(1, Number(v) || 20))),
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const notificationIdSchema = z.object({
  id: z.string({ message: 'Notification ID is required.' }).uuid('Invalid notification ID.'),
});

export const updateNotificationSchema = z.object({
  opened: z.boolean().optional(),
  clicked: z.boolean().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type GetNotificationsQueryInput = z.infer<typeof getNotificationsQuerySchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
