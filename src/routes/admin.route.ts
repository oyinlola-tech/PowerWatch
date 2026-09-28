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
                openSystemErrors: { type: 'integer', description: 'Unresolved system errors (see GET /admin/system-events)' },
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
      description:
        '[ADMIN] Send a message to users: every recipient gets it in their in-app inbox, and those with ' +
        'notifications on also get a push on each device. Audience: everyone, chosen users, or people who live in ' +
        'or saved a neighborhood or state. With dryRun, nothing is sent and the counts show who would receive it.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Send broadcast',
      body: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
          title: { type: 'string', maxLength: 100 },
          body: { type: 'string', maxLength: 500 },
          audience: {
            type: 'object',
            description: '{ type: "all" } (default), { type: "users", userIds: [...] }, { type: "neighborhood", neighborhoodId }, { type: "lga", lgaId }, { type: "state", stateId }',
            required: ['type'],
            properties: {
              type: { type: 'string', enum: ['all', 'users', 'neighborhood', 'lga', 'state'] },
              userIds: { type: 'array', items: { type: 'string', format: 'uuid' }, maxItems: 500 },
              neighborhoodId: { type: 'integer' },
              lgaId: { type: 'integer' },
              stateId: { type: 'integer' },
            },
          },
          dryRun: { type: 'boolean', description: 'Only count recipients; send nothing.' },
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

  const SYSTEM_EVENT_SOURCES = ['email', 'push', 'job', 'geocoding', 'api', 'startup'];
  const OK_OBJECT = {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
      },
    },
  };

  app.get('/system-events', {
    preHandler: [adminMiddleware],
    schema: {
      description:
        '[ADMIN] Background problems: emails that failed to send, failed jobs, push errors, geocoding ' +
        'fallbacks and server errors. Repeats of an open problem are counted on one row. Codes and ' +
        'email addresses are masked.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'System events',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          status: { type: 'string', enum: ['open', 'resolved', 'all'], default: 'open' },
          level: { type: 'string', enum: ['ERROR', 'WARNING'] },
          source: { type: 'string', enum: SYSTEM_EVENT_SOURCES },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { type: 'object', additionalProperties: true } },
                pagination: { type: 'object', additionalProperties: true },
                open: {
                  type: 'object',
                  properties: { errors: { type: 'integer' }, warnings: { type: 'integer' } },
                },
              },
            },
          },
        },
      },
    },
  }, adminController.getSystemEvents);

  app.post('/system-events/:id/resolve', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Mark a system event as dealt with. If it happens again, a new event is opened.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Resolve system event',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: OK_OBJECT,
    },
  }, adminController.resolveSystemEvent);

  app.post('/system-events/resolve-all', {
    preHandler: [adminMiddleware],
    schema: {
      description: '[ADMIN] Mark every open system event (optionally only one source) as dealt with.',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      summary: 'Resolve all system events',
      body: { type: 'object', properties: { source: { type: 'string', enum: SYSTEM_EVENT_SOURCES } } },
      response: OK_OBJECT,
    },
  }, adminController.resolveAllSystemEvents);
};
