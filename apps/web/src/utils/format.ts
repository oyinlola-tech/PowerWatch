// Formats a byte count as a one-decimal megabyte string, e.g. "24.3 MB".
export const formatMegabytes = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// Formats an ISO date string as e.g. "September 28, 2026".
export const formatReleaseDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
