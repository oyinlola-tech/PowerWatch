import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { env } from './env.config.js';

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'PowerWatch API',
      description: 'Power outage tracking and reporting API documentation',
      version: '1.0.0',
      contact: {
        name: 'PowerWatch Team',
        email: 'oyinlola.tech@icloud.com',
      },
    },
    servers: [
      {
        url: process.env.API_SERVER_URL ?? `http://localhost:${env.port}`,
        description: process.env.API_SERVER_URL ? 'Production Server' : 'Local Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  staticCSP: true,
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
};
