import type { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env.config.js';

function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function buildCorsOptions(): FastifyCorsOptions {
  const origins = parseOrigins(env.cors.origin);

  // Browsers reject `Access-Control-Allow-Origin: *` on credentialed requests, and
  // reflecting any origin with credentials would let every site act as the user.
  if (origins.length === 0 || origins.includes('*')) {
    throw new Error(
      'CORS_ORIGIN must list explicit origins (comma-separated) because credentials are enabled; "*" is not allowed.',
    );
  }

  return {
    origin: origins.length === 1 ? origins[0]! : origins,
    credentials: true,
    // @fastify/cors only allows GET, HEAD and POST by default; the API also uses these.
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    exposedHeaders: ['x-request-id'],
  };
}
