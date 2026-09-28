// Every time in the dashboard is shown in Nigerian time, the zone the API works in.
export const TIME_ZONE = "Africa/Lagos";
export const TIME_ZONE_LABEL = "WAT (Africa/Lagos, UTC+1)";
/** Lagos has no daylight saving, so the offset is fixed. */
const LAGOS_OFFSET = "+01:00";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const isoDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const number = new Intl.NumberFormat("en-NG");

const valid = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  const date = valid(value);
  return date ? dateTime.format(date) : "—";
};

export const formatDate = (value: string | Date | null | undefined) => {
  const date = valid(value);
  return date ? dateOnly.format(date) : "—";
};

export const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : number.format(value);

/** Minutes as "2 h 15 min". */
export const formatMinutes = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined) return "—";
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours < 48) return rest ? `${hours} h ${rest} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  const hoursLeft = hours % 24;
  return hoursLeft ? `${days} d ${hoursLeft} h` : `${days} d`;
};

export const formatSeconds = (seconds: number | undefined) =>
  seconds === undefined ? "—" : formatMinutes(seconds / 60);

/** Today's date in Lagos as YYYY-MM-DD (for date inputs). */
export const lagosToday = () => isoDate.format(new Date());

/** A Lagos calendar date (YYYY-MM-DD) shifted by whole days. */
export const shiftDate = (ymd: string, days: number) => {
  const date = new Date(`${ymd}T12:00:00${LAGOS_OFFSET}`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate.format(date);
};

/** Start of a Lagos calendar day as an ISO timestamp for API date filters. */
export const startOfLagosDay = (ymd: string) => new Date(`${ymd}T00:00:00.000${LAGOS_OFFSET}`).toISOString();

/** End of a Lagos calendar day as an ISO timestamp for API date filters. */
export const endOfLagosDay = (ymd: string) => new Date(`${ymd}T23:59:59.999${LAGOS_OFFSET}`).toISOString();

export const isValidYmd = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && valid(`${value}T00:00:00${LAGOS_OFFSET}`) !== null;

export const fullName = (user: { firstName: string; lastName: string }) =>
  `${user.firstName} ${user.lastName}`.trim() || "(no name)";

/** Accounts erased by the delete action keep this address pattern (see UserRepository.anonymizeAndDelete). */
export const isDeletedAccount = (email: string) => email.endsWith("@deleted.invalid");

export const shortId = (id: string) => id.slice(0, 8);
