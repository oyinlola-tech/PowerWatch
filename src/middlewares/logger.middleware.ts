import type { FastifyReply, FastifyRequest } from 'fastify';
import { REQUEST_ID_HEADER } from '../configs/logger.config.js';

/** onSend hook: echo the request ID so clients and upstream logs can be correlated. */
export async function requestIdHeaderHook(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown,
) {
  reply.header(REQUEST_ID_HEADER, request.id);
  return payload;
}
