import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  createNotificationSchema,
  getNotificationsQuerySchema,
  updateNotificationSchema,
  notificationIdSchema,
} from '../validators/notification.validator.js';
import { SendInAppNotificationCommand } from '../services/notifications/commands/sendInAppNotification.command.js';
import { MarkAsReadCommand } from '../services/notifications/commands/markAsRead.command.js';
import { DeleteNotificationCommand } from '../services/notifications/commands/deleteNotification.command.js';
import { GetNotificationQuery } from '../services/notifications/queries/getNotification.query.js';
import { GetNotificationsQuery } from '../services/notifications/queries/getNotifications.query.js';
import { GetUnreadNotificationsQuery } from '../services/notifications/queries/getUnreadNotifications.query.js';
import { successResponse } from '../utils/response.js';
import { NOTIFICATION_MESSAGES } from '../constants/notification.constant.js';

const sendInAppNotificationCommand = new SendInAppNotificationCommand();
const markAsReadCommand = new MarkAsReadCommand();
const deleteNotificationCommand = new DeleteNotificationCommand();
const getNotificationQuery = new GetNotificationQuery();
const getNotificationsQuery = new GetNotificationsQuery();
const getUnreadNotificationsQuery = new GetUnreadNotificationsQuery();

export const notificationController = {
  async sendNotification(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const dto = createNotificationSchema.parse(request.body);
    const result = await sendInAppNotificationCommand.execute({
      userId: authRequest.userId,
      title: dto.title,
      body: dto.body,
    });
    return reply.status(201).send(successResponse(result, NOTIFICATION_MESSAGES.NOTIFICATION_SENT));
  },

  async getNotification(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const { id } = notificationIdSchema.parse(request.params);
    const result = await getNotificationQuery.execute(id, authRequest.userId);
    return reply.status(200).send(successResponse(result, NOTIFICATION_MESSAGES.NOTIFICATION_FETCHED));
  },

  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const params = getNotificationsQuerySchema.parse(request.query);
    const result = await getNotificationsQuery.execute({
      userId: authRequest.userId,
      unreadOnly: params.unreadOnly,
      page: params.page,
      limit: params.limit,
    });
    return reply.status(200).send(successResponse(result, NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED));
  },

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const result = await getUnreadNotificationsQuery.execute(authRequest.userId);
    return reply.status(200).send(successResponse(result, 'Unread count fetched.'));
  },

  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const { id } = notificationIdSchema.parse(request.params);
    const body = updateNotificationSchema.parse(request.body);
    const updates: { opened?: boolean; clicked?: boolean } = {};
    if (body.opened !== undefined) updates.opened = body.opened;
    if (body.clicked !== undefined) updates.clicked = body.clicked;
    const result = await markAsReadCommand.execute(id, authRequest.userId, updates);
    return reply.status(200).send(successResponse(result, NOTIFICATION_MESSAGES.NOTIFICATION_MARKED_READ));
  },

  async deleteNotification(request: FastifyRequest, reply: FastifyReply) {
    const authRequest = request as AuthenticatedRequest;
    const { id } = notificationIdSchema.parse(request.params);
    await deleteNotificationCommand.execute(id, authRequest.userId);
    return reply.status(200).send(successResponse({}, NOTIFICATION_MESSAGES.NOTIFICATION_DELETED));
  },
};
