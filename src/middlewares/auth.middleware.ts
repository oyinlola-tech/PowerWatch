import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../configs/jwt.config.js';
import { AppError } from '../errors/index.js';
import { MESSAGES } from '../constants/message.constant.js';

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
  userRole: string;
}

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, MESSAGES.UNAUTHORIZED);
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    (request as AuthenticatedRequest).userId = payload.userId;
    (request as AuthenticatedRequest).userRole = payload.role;
  } catch {
    throw new AppError(401, MESSAGES.UNAUTHORIZED);
  }
}

export async function adminMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  await authMiddleware(request, _reply);
  const authRequest = request as AuthenticatedRequest;
  if (authRequest.userRole !== 'ADMIN') {
    throw new AppError(403, MESSAGES.FORBIDDEN);
  }
}
