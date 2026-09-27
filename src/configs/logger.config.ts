import crypto from 'node:crypto';
import type { FastifyServerOptions } from 'fastify';
import { env } from './env.config.js';

export const REQUEST_ID_HEADER = 'x-request-id';

const isProduction = env.nodeEnv === 'production';

export const loggerOptions: NonNullable<FastifyServerOptions['logger']> = {
  level: isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss Z' },
    },
  }),
};

const INCOMING_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

/** Reuse a well-formed upstream request ID (e.g. from a load balancer); otherwise mint a UUID. */
export function genReqId(request: { headers: Record<string, string | string[] | undefined> }): string {
  const incoming = request.headers[REQUEST_ID_HEADER];
  if (typeof incoming === 'string' && INCOMING_REQUEST_ID.test(incoming)) {
    return incoming;
  }
  return crypto.randomUUID();
}
