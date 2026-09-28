import { Prisma } from '@prisma/client';
import { prisma } from '../../configs/database.config.js';

export type SystemEventLevel = 'ERROR' | 'WARNING';

/** Where the problem happened; the admin dashboard filters by these. */
export type SystemEventSource = 'email' | 'push' | 'job' | 'geocoding' | 'api' | 'startup';

const MAX_MESSAGE = 500;

/**
 * Hides values that must not sit in an admin-visible log: one-time codes (4+ digits in a row)
 * and all but the first letter of email addresses.
 */
export function redact(value: string): string {
  return value
    .replace(/\b\d{4,}\b/g, '••••')
    .replace(/([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '$1•••@$2');
}

function redactDetails(details: Record<string, unknown>): Prisma.InputJsonObject {
  return JSON.parse(
    JSON.stringify(details, (_key, value) => (typeof value === 'string' ? redact(value).slice(0, 1000) : value)),
  ) as Prisma.InputJsonObject;
}

/**
 * Records a background failure for the admin dashboard. Never throws: logging a problem must
 * not cause another one. An open event with the same source and message is counted again
 * instead of adding a row, so a failure that repeats every minute stays one line.
 */
export async function recordSystemEvent(event: {
  level: SystemEventLevel;
  source: SystemEventSource;
  message: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const message = redact(event.message).slice(0, MAX_MESSAGE);
  const details = event.details ? redactDetails(event.details) : undefined;
  console.error(`[${event.level}] ${event.source}: ${message}`);

  try {
    const open = await prisma.systemEvent.findFirst({
      where: { source: event.source, message, resolvedAt: null },
      select: { id: true },
    });
    if (open) {
      await prisma.systemEvent.update({
        where: { id: open.id },
        data: { count: { increment: 1 }, lastSeenAt: new Date(), level: event.level, ...(details ? { details } : {}) },
      });
    } else {
      await prisma.systemEvent.create({
        data: { level: event.level, source: event.source, message, ...(details ? { details } : {}) },
      });
    }
  } catch (error) {
    console.error('Could not record system event:', error);
  }
}

/** Short, safe description of a caught error for the event details. */
export function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return { error: `${error.name}: ${error.message}`.slice(0, 500), ...(code !== undefined ? { code: String(code) } : {}) };
  }
  return { error: String(error).slice(0, 500) };
}
