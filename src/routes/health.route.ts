import type { FastifyPluginAsync } from 'fastify';
import { healthController } from '../controllers/health.controller.js';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

// Detailed health reveals internals (DB latency, Firebase status), so it is admin-only.
// Load balancers / uptime checks should use the public GET /health liveness endpoint.
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', adminMiddleware);

  app.get('/', {
    schema: {
      description: '[ADMIN] Full health check (server, database, Firebase).',
      tags: ['Health'],
      security: [{ bearerAuth: [] }],
      summary: 'Health check',
      response: {
        200: {
          description: 'All systems healthy',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                server: { type: 'object', additionalProperties: true },
                database: { type: 'object', additionalProperties: true },
                firebase: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
  }, healthController.healthCheck);

  app.get('/database', {
    schema: {
      description: '[ADMIN] Database health check (connection latency).',
      tags: ['Health'],
      security: [{ bearerAuth: [] }],
      summary: 'Database health',
      response: {
        200: {
          description: 'Database health status',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, healthController.databaseHealth);

  app.get('/firebase', {
    schema: {
      description: '[ADMIN] Firebase health check (initialization status).',
      tags: ['Health'],
      security: [{ bearerAuth: [] }],
      summary: 'Firebase health',
      response: {
        200: {
          description: 'Database health status',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, healthController.firebaseHealth);
};
