/**
 * Timezone helpers built on Intl, so day boundaries follow the configured
 * zone (e.g. Africa/Lagos) instead of the server's clock or UTC.
 */

const MINUTE_MS = 60_000;

function partsFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function zonedParts(date: Date, timeZone: string) {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Throws a RangeError if the zone name is not recognised. */
export function assertValidTimeZone(timeZone: string): void {
  partsFormatter(timeZone);
}

/** Minutes the zone is ahead of UTC at the given instant. */
export function timeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / MINUTE_MS);
}

/** Local calendar date as YYYY-MM-DD. */
export function localDateString(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Local wall-clock time as HH:mm. */
export function localTimeString(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/** The instant local midnight began on the local day containing `date`. */
export function startOfLocalDay(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const midnightAsUtc = Date.UTC(p.year, p.month - 1, p.day);
  const offset = timeZoneOffsetMinutes(new Date(midnightAsUtc), timeZone);
  return new Date(midnightAsUtc - offset * MINUTE_MS);
}

/** Local midnight `days` days before the local day containing `date`. */
export function startOfLocalDayOffset(date: Date, days: number, timeZone: string): Date {
  // Step from local noon so DST shifts can never skip or repeat a day.
  const noon = new Date(startOfLocalDay(date, timeZone).getTime() + 12 * 60 * MINUTE_MS);
  return startOfLocalDay(new Date(noon.getTime() - days * 24 * 60 * MINUTE_MS), timeZone);
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / MINUTE_MS));
}
