import { prisma } from '../configs/database.config.js';
import { env } from '../configs/env.config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes personal data that has passed the period the Privacy Policy promises:
 * ended sessions (IP address and device), spent sign-in tokens, old one-time
 * codes and old security log entries.
 */
export async function purgeExpiredData(now = new Date()) {
  const sessions = await prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lte: now } }, { deletedAt: { not: null } }] },
  });

  // A token still referenced by a session is removed after that session goes
  const refreshTokens = await prisma.refreshToken.deleteMany({
    where: {
      session: null,
      OR: [{ expiresAt: { lte: now } }, { revokedAt: { not: null } }],
    },
  });

  // Codes are counted for the hourly sending limit, so they are kept a little past expiry
  const otps = await prisma.otp.deleteMany({
    where: { createdAt: { lte: new Date(now.getTime() - env.retention.otpHours * 60 * 60 * 1000) } },
  });

  const auditLogs = await prisma.auditLog.deleteMany({
    where: { timestamp: { lte: new Date(now.getTime() - env.retention.auditLogDays * DAY_MS) } },
  });

  return {
    sessions: sessions.count,
    refreshTokens: refreshTokens.count,
    otps: otps.count,
    auditLogs: auditLogs.count,
  };
}

/** Runs the clean-up at start-up and then once a day. Returns a function that stops it. */
export function startRetentionJob(log: (message: string, error?: unknown) => void = console.log) {
  const run = () =>
    purgeExpiredData()
      .then((removed) => log(`Retention clean-up removed ${JSON.stringify(removed)}`))
      .catch((error) => log('Retention clean-up failed', error));

  void run();
  const timer = setInterval(run, DAY_MS);
  // Must not keep the process alive during shutdown
  timer.unref();
  return () => clearInterval(timer);
}
