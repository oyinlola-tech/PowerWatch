import crypto from 'node:crypto';
import { env } from '../configs/env.config.js';

/**
 * What is stored for a one-time code. Keyed with a server secret because a
 * 6-digit code has too few possibilities for a plain hash to protect it.
 */
export function hashOtpCode(email: string, code: string): string {
  return crypto
    .createHmac('sha256', env.jwt.accessSecret)
    .update(`${email.toLowerCase().trim()}:${code}`)
    .digest('hex');
}
