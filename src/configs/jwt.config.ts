import jwt from 'jsonwebtoken';
import { env } from './env.config.js';

interface AccessTokenPayload {
  userId: string;
  role: string;
  /** The sign-in session this token belongs to (lets the API mark "this device") */
  sessionId?: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresInSeconds,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresInSeconds,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.jwt.accessSecret, { algorithms: ['HS256'] }) as Record<string, unknown>;
  if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') {
    throw new jwt.JsonWebTokenError('Invalid access token payload.');
  }
  return payload as unknown as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.jwt.refreshSecret, { algorithms: ['HS256'] }) as Record<string, unknown>;
  if (typeof payload.userId !== 'string' || typeof payload.tokenId !== 'string') {
    throw new jwt.JsonWebTokenError('Invalid refresh token payload.');
  }
  return payload as unknown as RefreshTokenPayload;
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + env.jwt.refreshExpiresInSeconds * 1000);
}
