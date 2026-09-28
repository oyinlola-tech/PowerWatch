import type { FastifyPluginAsync } from 'fastify';
import { reportController } from '../controllers/report.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

// The report is filed in the neighborhood (and street) the GPS point is in. neighborhoodId
// is accepted from older app versions and ignored.
const REPORT_LOCATION_FIELDS = {
  latitude: { type: 'number', description: 'GPS latitude', example: 6.524379 },
  longitude: { type: 'number', description: 'GPS longitude', example: 3.379206 },
  accuracy: { type: 'number', description: 'GPS accuracy radius in metres (at most 200)', example: 12 },
  mocked: { type: 'boolean', description: 'Android: true if a mock-location app supplied the position (refused)' },
  deviceType: { type: 'string', enum: ['ANDROID', 'IOS', 'WEB'], description: 'Device platform' },
  neighborhoodId: { type: 'integer', description: 'Ignored. The GPS point decides the neighborhood.' },
} as const;
const REPORT_REQUIRED = ['latitude', 'longitude', 'accuracy'];

const REPORT_CREATED_RESPONSE = {
  description: 'Report accepted',
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Power report submitted successfully.' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        neighborhoodId: { type: 'integer' },
        place: {
          type: 'object',
          description: 'Where the report was filed, worked out from the GPS point',
          properties: {
            neighborhood: { type: 'string' },
            street: { type: 'string', nullable: true },
            town: { type: 'string' },
            lga: { type: 'string' },
            state: { type: 'string' },
          },
        },
        reportType: { type: 'string', enum: ['ON', 'OFF'] },
        timestamp: { type: 'string', format: 'date-time' },
        latitude: { type: 'number', nullable: true },
        longitude: { type: 'number', nullable: true },
        deviceType: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        neighborhoodStatus: {
          type: 'string',
          enum: ['ON', 'OFF'],
          description: 'The neighborhood status after this report was counted.',
        },
        statusChanged: { type: 'boolean', description: 'True if this report flipped the neighborhood status.' },
      },
    },
  },
} as const;

// Backstop against scripted spam on top of the per-neighborhood cooldown.
const REPORT_RATE_LIMIT = { max: 20, timeWindow: 60_000 };

export const reportRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authMiddleware);

  app.post('/', {
    config: { rateLimit: REPORT_RATE_LIMIT },
    schema: {
      description:
        'Submit a power report (ON or OFF) for where the reporter is. The GPS point decides the neighborhood and street; ' +
        'mock, imprecise (over 200 m) or impossibly distant positions are refused (422). The report time is set by the server. ' +
        'The neighborhood status follows the majority of recent reporters, so one report may not change it. ' +
        'Each user can report once per neighborhood every few minutes (429 otherwise).',
      tags: ['Reports'],
      summary: 'Create a power report',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['reportType', ...REPORT_REQUIRED],
        properties: {
          reportType: { type: 'string', enum: ['ON', 'OFF'], description: 'Power status' },
          ...REPORT_LOCATION_FIELDS,
        },
      },
      response: { 201: REPORT_CREATED_RESPONSE },
    },
  }, reportController.createReport);

  app.post('/power-off', {
    config: { rateLimit: REPORT_RATE_LIMIT },
    schema: {
      description: 'Report that the power is OFF in a neighborhood. Same rules as POST /reports.',
      tags: ['Reports'],
      summary: 'Report power off',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: REPORT_REQUIRED,
        properties: REPORT_LOCATION_FIELDS,
      },
      response: { 201: REPORT_CREATED_RESPONSE },
    },
  }, reportController.reportPowerOff);

  app.post('/power-on', {
    config: { rateLimit: REPORT_RATE_LIMIT },
    schema: {
      description: 'Report that the power is ON in a neighborhood. Same rules as POST /reports.',
      tags: ['Reports'],
      summary: 'Report power on',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: REPORT_REQUIRED,
        properties: REPORT_LOCATION_FIELDS,
      },
      response: { 201: REPORT_CREATED_RESPONSE },
    },
  }, reportController.reportPowerOn);

  app.get('/activity', {
    schema: {
      description:
        'Recent power changes (outage started / power restored) in neighborhoods across the same LGA, newest first. ' +
        'Defaults to the user\'s primary neighborhood.',
      tags: ['Reports'],
      summary: 'Neighborhood activity feed',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  neighborhoodId: { type: 'integer' },
                  neighborhood: { type: 'string' },
                  town: { type: 'string' },
                  status: { type: 'string', enum: ['ON', 'OFF'] },
                  at: { type: 'string', format: 'date-time' },
                  isCurrentNeighborhood: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  }, reportController.getActivity);

  app.get('/', {
    schema: {
      description: 'List power reports with optional filters and pagination.',
      tags: ['Reports'],
      summary: 'List reports',
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer', description: 'Filter by neighborhood' },
          userId: { type: 'string', format: 'uuid', description: 'Filter by user' },
          reportType: { type: 'string', enum: ['ON', 'OFF'] },
          startDate: { type: 'string', format: 'date-time', description: 'Filter from date' },
          endDate: { type: 'string', format: 'date-time', description: 'Filter to date' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
      response: {
        200: {
          description: 'Reports list with pagination',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { type: 'object', additionalProperties: true } },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, reportController.getReports);

  app.get('/my', {
    schema: {
      description: 'Get the authenticated user\'s reports.',
      tags: ['Reports'],
      summary: 'My reports',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
      response: {
        200: {
          description: 'User reports list with pagination',
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
  }, reportController.getUserReports);

  app.get('/location', {
    schema: {
      description: 'Get reports by neighborhood ID.',
      tags: ['Reports'],
      summary: 'Reports by location',
      querystring: {
        type: 'object',
        required: ['neighborhoodId'],
        properties: {
          neighborhoodId: { type: 'integer' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
      response: {
        200: {
          description: 'User reports list with pagination',
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
  }, reportController.getReportsByLocation);

  app.get('/status', {
    schema: {
      description:
        'Live power status for a neighborhood (defaults to the user\'s primary neighborhood). ' +
        'confirmedBy = people who reported the current status; confidence = % of recent reporters who agree.',
      tags: ['Reports'],
      summary: 'Live status',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer', example: 9012 },
        },
      },
      response: {
        200: {
          description: 'Live power status',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                neighborhood: {
                  type: 'object',
                  properties: { id: { type: 'integer' }, name: { type: 'string' }, town: { type: 'string' } },
                },
                status: { type: 'string', enum: ['ON', 'OFF', 'UNKNOWN'] },
                since: { type: 'string', format: 'date-time', nullable: true },
                confirmedBy: { type: 'integer' },
                confidence: { type: 'integer', minimum: 0, maximum: 100 },
                recentReporters: { type: 'integer' },
                lastReportAt: { type: 'string', format: 'date-time', nullable: true },
                recentStreets: {
                  type: 'array',
                  description: 'Streets reported from in the last 2 hours, per street and ON/OFF, most recent first.',
                  items: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      reportType: { type: 'string', enum: ['ON', 'OFF'] },
                      reports: { type: 'integer' },
                      lastReportAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, reportController.getLatestStatus);

  app.get('/outages', {
    schema: {
      description: 'List outages with optional filters.',
      tags: ['Reports'],
      summary: 'List outages',
      querystring: {
        type: 'object',
        properties: {
          neighborhoodId: { type: 'integer' },
          activeOnly: { type: 'boolean', default: false },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
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
  }, reportController.getOutages);

  app.get('/outages/:id', {
    schema: {
      description: 'Get a single outage by ID with associated reports.',
      tags: ['Reports'],
      summary: 'Get outage',
      params: {
        type: 'object', required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          description: 'Outage details',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, reportController.getOutage);

  app.get('/:id', {
    schema: {
      description: 'Get a single power report by ID.',
      tags: ['Reports'],
      summary: 'Get report by ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          description: 'Outage details',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, reportController.getReport);

  app.delete('/:id', {
    schema: {
      description: 'Delete one of your own power reports by ID (admins may delete any report).',
      tags: ['Reports'],
      summary: 'Delete report',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          description: 'Report deleted',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Power report deleted successfully.' },
          },
        },
      },
    },
  }, reportController.deleteReport);
};
