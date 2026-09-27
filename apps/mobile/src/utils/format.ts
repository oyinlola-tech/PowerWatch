const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Just now", "5m ago", "3h ago", "2d ago" */
export const timeAgo = (iso: string | null | undefined, now = Date.now()): string => {
  if (!iso) return "—";
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/** 765 -> "12h 45m" */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

/** Parse a local calendar date (YYYY-MM-DD) without timezone shifts. */
const parseDay = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
};

export const weekdayName = (date: string) => WEEKDAYS[parseDay(date).getUTCDay()]!;

/** Index 0 is today: "Today, June 14", "Yesterday, June 13", "Tuesday, June 12" */
export const dayLabel = (date: string, index: number): string => {
  const day = parseDay(date);
  const prefix = index === 0 ? "Today" : index === 1 ? "Yesterday" : WEEKDAYS[day.getUTCDay()];
  return `${prefix}, ${MONTHS[day.getUTCMonth()]} ${day.getUTCDate()}`;
};

/** "Sep 27, 2026, 14:05" in the device's locale-agnostic format */
export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${MONTHS[d.getMonth()]!.slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}, ${time}`;
};

/** "HH:mm" -> share of the day (0-1) */
export const dayFraction = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return Math.min(1, ((h ?? 0) * 60 + (m ?? 0)) / 1440);
};

export const fullName = (user: { firstName: string; lastName: string }) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ");

export const initials = (user: { firstName: string; lastName: string }) =>
  ((user.firstName[0] ?? "") + (user.lastName[0] ?? "")).toUpperCase() || "?";
