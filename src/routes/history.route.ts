import type { FastifyPluginAsync } from 'fastify';
import { historyController } from '../controllers/history.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const historyRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authMiddleware);

  const periodSchema = {
    type: 'object',
    properties: {
      start: { type: 'string', format: 'date-time' },
      end: { type: 'string', format: 'date-time' },
      startTime: { type: 'string', description: 'Local HH:mm' },
      endTime: { type: 'string', description: 'Local HH:mm (23:59 if it runs past midnight)' },
      minutes: { type: 'integer' },
      ongoing: { type: 'boolean' },
    },
  } as const;

  app.get('/summary', {
    schema: {
      description:
        'Day-by-day outage summary for the History screen (defaults to the user\'s primary neighborhood). ' +
        'Days follow APP_TIMEZONE and are newest first; days[0] is today.',
      tags: ['History'],
      summary: 'History summary (7 or 30 days)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer' },
          days: { type: 'integer', minimum: 1, maximum: 30, default: 7 },
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
                neighborhood: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
                timeZone: { type: 'string' },
                from: { type: 'string', format: 'date-time' },
                to: { type: 'string', format: 'date-time' },
                totalOutageMinutes: { type: 'integer' },
                uptimePercent: { type: 'number' },
                outageCount: { type: 'integer' },
                hasData: { type: 'boolean' },
                longestOutage: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    minutes: { type: 'integer' },
                    date: { type: 'string', description: 'Local YYYY-MM-DD' },
                    start: { type: 'string', format: 'date-time' },
                    end: { type: 'string', format: 'date-time' },
                    ongoing: { type: 'boolean' },
                  },
                },
                days: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', description: 'Local YYYY-MM-DD' },
                      offMinutes: { type: 'integer' },
                      outages: { type: 'array', items: periodSchema },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, historyController.getSummary);

  app.get('/weekly', {
    schema: {
      description: 'Get weekly power report history for a month.',
      tags: ['History'],
      summary: 'Weekly history',
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer' },
          year: { type: 'integer' },
          month: { type: 'integer' },
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
  }, historyController.getWeeklyHistory);

  app.get('/monthly', {
    schema: {
      description: 'Get monthly power report history for a year.',
      tags: ['History'],
      summary: 'Monthly history',
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer' },
          year: { type: 'integer' },
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
  }, historyController.getMonthlyHistory);

  app.get('/outage-hours', {
    schema: {
      description: 'Get total outage hours breakdown by neighborhood.',
      tags: ['History'],
      summary: 'Outage hours',
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
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
  }, historyController.getOutageHours);

  app.get('/power-timeline', {
    schema: {
      description: 'Get power timeline (ON/OFF counts by hour or day) for a date range.',
      tags: ['History'],
      summary: 'Power timeline',
      querystring: {
        type: 'object',
        required: ['neighborhoodId', 'startDate', 'endDate'],
        properties: {
          neighborhoodId: { type: 'integer' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          interval: { type: 'string', enum: ['hour', 'day'], default: 'day' },
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
  }, historyController.getPowerTimeline);
};
