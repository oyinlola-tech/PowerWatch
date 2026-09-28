import { OAuth2Client } from 'google-auth-library';
import { env } from '../../configs/env.config.js';
import { AppError } from '../../errors/index.js';

const client = new OAuth2Client();

export interface GoogleIdentity {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Checks a Google ID token (signature, expiry, issuer and that it was issued to one of our
 * client IDs) and returns who it belongs to. Only verified Google email addresses are accepted.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  if (env.google.clientIds.length === 0) {
    throw new AppError(503, 'Google sign-in is not available right now.');
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: env.google.clientIds });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(401, 'Google sign-in failed. Please try again.');
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new AppError(401, 'Your Google account has no verified email address.');
  }

  const fullName = payload.name?.trim() ?? '';
  const [first = '', ...rest] = fullName.split(/\s+/);
  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    firstName: (payload.given_name ?? first).slice(0, 100) || 'PowerWatch',
    lastName: (payload.family_name ?? rest.join(' ')).slice(0, 100) || 'User',
  };
}
