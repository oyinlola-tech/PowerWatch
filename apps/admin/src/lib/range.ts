import { endOfLagosDay, isValidYmd, lagosToday, shiftDate, startOfLagosDay } from "./format";

export interface Range {
  from: string;
  to: string;
}

export const presetRange = (days: number | null): Range =>
  days === null ? { from: "", to: "" } : { from: shiftDate(lagosToday(), -(days - 1)), to: lagosToday() };

/** API query params for a Lagos calendar range; empty ends are left open. */
export const rangeQuery = (range: Range) => ({
  startDate: range.from && isValidYmd(range.from) ? startOfLagosDay(range.from) : undefined,
  endDate: range.to && isValidYmd(range.to) ? endOfLagosDay(range.to) : undefined,
});

export const rangeError = (range: Range) =>
  range.from && range.to && range.from > range.to ? "The start date is after the end date." : undefined;
