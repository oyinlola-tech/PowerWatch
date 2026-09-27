import type { FastifyPluginAsync } from 'fastify';
import { notificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authMiddleware);

  app.post('/', {
    schema: {
      description: 'Send an in-app notification to the authenticated user.',
      tags: ['Notifications'],
      summary: 'Send notification',
      body: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
          title: { type: 'string', maxLength: 200, example: 'Power Restored' },
          body: { type: 'string', maxLength: 1000, example: 'Power has been restored in your area.' },
        },
      },
      response: {
        201: {
          description: 'Notification sent',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Notification sent successfully.' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, notificationController.sendNotification);

  app.get('/', {
    schema: {
      description: 'List notifications for the authenticated user.',
      tags: ['Notifications'],
      summary: 'List notifications',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          unreadOnly: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          description: 'Notifications list with pagination',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { type: 'object', additionalProperties: true } },
                pagination: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
  }, notificationController.getNotifications);

  app.get('/unread-count', {
    schema: {
      description: 'Get the count of unread notifications for the authenticated user.',
      tags: ['Notifications'],
      summary: 'Unread count',
      response: {
        200: {
          description: 'Unread count',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                unreadCount: { type: 'integer', example: 5 },
              },
            },
          },
        },
      },
    },
  }, notificationController.getUnreadCount);

  app.get('/:id', {
    schema: {
      description: 'Get a single notification by ID.',
      tags: ['Notifications'],
      summary: 'Get notification',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          description: 'Notification details',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, notificationController.getNotification);

  app.patch('/:id/read', {
    schema: {
      description: 'Mark a notification as opened and/or clicked.',
      tags: ['Notifications'],
      summary: 'Mark as read',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          opened: { type: 'boolean', example: true },
          clicked: { type: 'boolean', example: false },
        },
      },
      response: {
        200: {
          description: 'Notification marked as read',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Notification marked as read.' },
          },
        },
      },
    },
  }, notificationController.markAsRead);

  app.delete('/:id', {
    schema: {
      description: 'Delete a notification by ID.',
      tags: ['Notifications'],
      summary: 'Delete notification',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          description: 'Notification deleted',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Notification deleted successfully.' },
          },
        },
      },
    },
  }, notificationController.deleteNotification);
};
