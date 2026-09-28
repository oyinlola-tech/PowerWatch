import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './configs/env.config.js';
import { buildCorsOptions } from './configs/cors.config.js';
import { loggerOptions, genReqId, REQUEST_ID_HEADER } from './configs/logger.config.js';
import { swaggerOptions, swaggerUiOptions } from './configs/swagger.config.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestIdHeaderHook } from './middlewares/logger.middleware.js';
import { MESSAGES } from './constants/message.constant.js';
import { authRoutes } from './routes/auth.route.js';
import { locationRoutes } from './routes/location.route.js';
import { reportRoutes } from './routes/report.route.js';
import { notificationRoutes } from './routes/notification.route.js';
import { adminRoutes } from './routes/admin.route.js';
import { analyticsRoutes } from './routes/analytics.route.js';
import { historyRoutes } from './routes/history.route.js';
import { healthRoutes } from './routes/health.route.js';

export async function buildApp() {
  const docsEnabled = env.nodeEnv !== 'production';

  const app = Fastify({
    logger: loggerOptions,
    trustProxy: env.trustProxy,
    genReqId,
    requestIdHeader: REQUEST_ID_HEADER,
    bodyLimit: env.bodyLimit,
    ajv: {
      customOptions: {
        // Documentation-only keywords used in route schemas for Swagger.
        keywords: ['example'],
      },
    },
  });

  app.addHook('onSend', requestIdHeaderHook);

  // Responses are per user and change by the minute. Some hosts add a long default
  // cache lifetime to any response without one, which makes apps show stale data.
  app.addHook('onRequest', async (_request, reply) => {
    reply.header('cache-control', 'no-store');
  });

  // The API only serves JSON, so helmet's strict default CSP applies in production.
  // Swagger UI (non-production only) sets its own CSP for its pages via staticCSP.
  await app.register(helmet, docsEnabled ? { contentSecurityPolicy: false } : {});

  await app.register(cors, buildCorsOptions());

  await app.register(rateLimit, {
    max: env.rateLimit.max,
    timeWindow: env.rateLimit.windowMs,
    allowList: (request) => docsEnabled && request.url.startsWith('/docs'),
    errorResponseBuilder: (_request, context) => ({
      statusCode: context.statusCode,
      success: false,
      message: MESSAGES.RATE_LIMIT_EXCEEDED,
    }),
  });

  if (docsEnabled) {
    await app.register(swagger, swaggerOptions);
    await app.register(swaggerUi, swaggerUiOptions);
  }

  app.setErrorHandler(errorHandler);

  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(locationRoutes, { prefix: '/api/v1/locations' });
  await app.register(reportRoutes, { prefix: '/api/v1/reports' });
  await app.register(notificationRoutes, { prefix: '/api/v1/notifications' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });
  await app.register(analyticsRoutes, { prefix: '/api/v1/analytics' });
  await app.register(historyRoutes, { prefix: '/api/v1/history' });
  await app.register(healthRoutes, { prefix: '/api/v1/health' });

  app.get('/health', async () => ({
    success: true,
    message: 'Server is healthy.',
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
  }));

  return app;
}
