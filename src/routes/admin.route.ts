import type { FastifyPluginAsync } from 'fastify';
import { adminController } from '../controllers/admin.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

// Materialization runs heavy aggregations; keep it from being hammered.
const MATERIALIZE_RATE_LIMIT = { max: 5, timeWindow: 60_000 };

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/dashboard', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Get dashboard summary (users, reports, outages counts).',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Dashboard',
      response: {
        200: {
          description: 'Dashboard data',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                totalUsers: { type: 'integer' },
                newUsersToday: { type: 'integer' },
                totalReports: { type: 'integer' },
                reportsToday: { type: 'integer' },
                reportsThisWeek: { type: 'integer' },
                activeOutages: { type: 'integer' },
                totalOutages: { type: 'integer' },
                totalNeighborhoods: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  }, adminController.getDashboard);

  app.get('/analytics', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Get analytics with optional date range.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Analytics',
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          description: 'Analytics data',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.getAnalytics);

  app.get('/users', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] List users with search and pagination.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'List users',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          search: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
      },
      response: {
        200: {
          description: 'List with pagination',
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
  }, adminController.getUsers);

  app.get('/locations', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Get all location hierarchy data.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'List locations',
      response: {
        200: {
          description: 'Location hierarchy data',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.getLocations);

  app.patch('/locations', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Update a location name.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Update location',
      body: {
        type: 'object',
        required: ['type', 'id', 'name'],
        properties: {
          type: { type: 'string', enum: ['state', 'lga', 'city', 'town', 'neighborhood'] },
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Location hierarchy data',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.updateLocation);

  app.post('/broadcast', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Send a push notification broadcast to all users.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Send broadcast',
      body: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
          title: { type: 'string', maxLength: 200 },
          body: { type: 'string', maxLength: 1000 },
          topic: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.sendBroadcast);

  app.post('/users/:userId/suspend', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Suspend a user (blocks login/refresh, revokes sessions and devices). Cannot target yourself or another admin.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Suspend user',
      params: {
        type: 'object', required: ['userId'],
        properties: { userId: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.suspendUser);

  app.post('/users/:userId/unsuspend', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Lift a user suspension.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Unsuspend user',
      params: {
        type: 'object', required: ['userId'],
        properties: { userId: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.unsuspendUser);

  app.delete('/users/:userId', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Delete (soft-delete) a user. Cannot target yourself or another admin.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Delete user',
      params: {
        type: 'object', required: ['userId'],
        properties: { userId: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.deleteUser);

  app.delete('/reports/:id', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Delete any report by ID.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Delete report',
      params: {
        type: 'object', required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.deleteReport);

  // --- Materialization endpoints ---
  app.post('/materialize/daily', {
    preHandler: [adminMiddleware],
    config: { rateLimit: MATERIALIZE_RATE_LIMIT },
    schema: {
      description: '[ADMIN] Materialize daily report summaries for a given date (defaults to today).',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Materialize daily',
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date', description: 'Date (YYYY-MM-DD). Defaults to today.' },
        },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.materializeDaily);

  app.post('/materialize/weekly', {
    preHandler: [adminMiddleware],
    config: { rateLimit: MATERIALIZE_RATE_LIMIT },
    schema: {
      description: '[ADMIN] Materialize weekly outage summaries for a given week (defaults to current week).',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Materialize weekly',
      querystring: {
        type: 'object',
        properties: {
          weekStart: { type: 'string', format: 'date', description: 'Monday of the week (YYYY-MM-DD).' },
        },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.materializeWeekly);

  app.post('/materialize/monthly', {
    preHandler: [adminMiddleware],
    config: { rateLimit: MATERIALIZE_RATE_LIMIT },
    schema: {
      description: '[ADMIN] Materialize monthly statistics for a given month (defaults to current month).',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Materialize monthly',
      querystring: {
        type: 'object',
        properties: {
          monthStart: { type: 'string', format: 'date', description: 'First of the month (YYYY-MM-DD).' },
        },
      },
      response: {
        200: {
          description: 'Success description',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, adminController.materializeMonthly);
};
