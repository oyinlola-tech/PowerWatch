import crypto from 'node:crypto';
import { AuthRepository } from '../../repositories/auth.repository.js';
import { SessionRepository } from '../../repositories/session.repository.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { AuditRepository } from '../../repositories/audit.repository.js';
import { signAccessToken, signRefreshToken, getRefreshTokenExpiryDate } from '../../configs/jwt.config.js';

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

/** Starts a signed-in session for a user who has just proved who they are. */
export async function issueSession(
  user: SessionUser,
  context: { ipAddress?: string | undefined; userAgent?: string | undefined; method?: string },
) {
  const authRepository = new AuthRepository();
  const sessionRepository = new SessionRepository();

  const tokenId = crypto.randomUUID();
  const refreshTokenExpiry = getRefreshTokenExpiryDate();
  await authRepository.createRefreshToken({
    id: tokenId,
    token: crypto.randomUUID(),
    userId: user.id,
    expiresAt: refreshTokenExpiry,
  });

  const sessionId = crypto.randomUUID();
  await sessionRepository.create({
    id: sessionId,
    userId: user.id,
    refreshTokenId: tokenId,
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
    expiresAt: refreshTokenExpiry,
  });

  await new UserRepository().updateLastLogin(user.id);
  await new AuditRepository().create({
    userId: user.id,
    action: 'LOGIN',
    ...(context.method ? { metadata: { method: context.method } } : {}),
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
  });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    accessToken: signAccessToken({ userId: user.id, role: user.role, sessionId }),
    refreshToken: signRefreshToken({ userId: user.id, tokenId }),
  };
}
