import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../configs/jwt.config.js';
import { prisma } from '../configs/database.config.js';
import { AppError } from '../errors/index.js';
import { MESSAGES } from '../constants/message.constant.js';

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
  userRole: string;
  /** Session of the calling device, when the token carries one */
  sessionId?: string;
}

// Access tokens live up to 15 minutes. So that logging out, revoking a session, suspension and
// account deletion take effect straight away, each request also checks the session and user,
// remembering the answer briefly to keep this to at most one small query per session.
const STATE_CACHE_MS = 30_000;
const STATE_CACHE_MAX = 10_000;
const stateCache = new Map<string, { ok: boolean; expiresAt: number }>();

async function isSessionUsable(userId: string, sessionId: string | undefined): Promise<boolean> {
  const key = `${userId}:${sessionId ?? ''}`;
  const cached = stateCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.ok;

  let ok: boolean;
  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        userId: true,
        isActive: true,
        deletedAt: true,
        expiresAt: true,
        user: { select: { deletedAt: true, suspendedAt: true } },
      },
    });
    ok = Boolean(
      session &&
        session.userId === userId &&
        session.isActive &&
        !session.deletedAt &&
        session.expiresAt > new Date() &&
        !session.user.deletedAt &&
        !session.user.suspendedAt,
    );
  } else {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { deletedAt: true, suspendedAt: true } });
    ok = Boolean(user && !user.deletedAt && !user.suspendedAt);
  }

  if (stateCache.size >= STATE_CACHE_MAX) stateCache.clear();
  stateCache.set(key, { ok, expiresAt: Date.now() + STATE_CACHE_MS });
  return ok;
}

/** Forgets cached session state for a user, e.g. right after they log out or are suspended. */
export function forgetSessionState(userId: string) {
  for (const key of stateCache.keys()) if (key.startsWith(`${userId}:`)) stateCache.delete(key);
}

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, MESSAGES.UNAUTHORIZED);
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError(401, MESSAGES.UNAUTHORIZED);
  }

  const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : undefined;
  if (!(await isSessionUsable(payload.userId, sessionId))) {
    throw new AppError(401, MESSAGES.UNAUTHORIZED);
  }

  (request as AuthenticatedRequest).userId = payload.userId;
  (request as AuthenticatedRequest).userRole = payload.role;
  if (sessionId) (request as AuthenticatedRequest).sessionId = sessionId;
}

export async function adminMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  await authMiddleware(request, _reply);
  const authRequest = request as AuthenticatedRequest;
  if (authRequest.userRole !== 'ADMIN') {
    throw new AppError(403, MESSAGES.FORBIDDEN);
  }
}
