export const REPORT_TYPES = {
  ON: 'ON' as const,
  OFF: 'OFF' as const,
} as const;

export type PowerStatus = 'ON' | 'OFF' | 'UNKNOWN';

/** Confidence is the share of recent reporters who agree with the current status. */
export const CONFIDENCE_WINDOW_MINUTES = 120;
/** "Confirmed by" counts people who reported the current status within this lookback. */
export const CONFIRMATION_LOOKBACK_HOURS = 24;
export const ACTIVITY_LOOKBACK_HOURS = 24;
export const MAX_SAVED_NEIGHBORHOODS = 10;

export const POWER_MESSAGES = {
  REPORT_CREATED: 'Power report submitted successfully.',
  REPORT_DELETED: 'Power report deleted successfully.',
  REPORT_NOT_FOUND: 'Power report not found.',
  REPORTS_FETCHED: 'Reports fetched successfully.',
  REPORT_FETCHED: 'Report fetched successfully.',
  LIVE_STATUS_FETCHED: 'Live status fetched successfully.',
  OUTAGE_STARTED: 'Power outage started.',
  OUTAGE_ENDED: 'Power outage ended.',
  OUTAGE_NOT_FOUND: 'Outage not found.',
  OUTAGES_FETCHED: 'Outages fetched successfully.',
  ACTIVITY_FETCHED: 'Neighborhood activity fetched successfully.',
  REPORT_COOLDOWN: 'You reported for this neighborhood recently. Please wait a few minutes before reporting again.',
  NO_NEIGHBORHOOD: 'No neighborhood selected. Pass neighborhoodId or set a primary location first.',
} as const;
