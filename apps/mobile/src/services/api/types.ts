// Shapes returned by the PowerWatch API (see the backend's Swagger at /docs).

export type ApiPowerStatus = "ON" | "OFF" | "UNKNOWN";
export type DeviceType = "ANDROID" | "IOS" | "WEB";

interface Named {
  id: number;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  notificationEnabled: boolean;
  outageAlerts: boolean;
  restorationAlerts: boolean;
  communityUpdates: boolean;
  neighborhoodId: number | null;
  latitude: number | null;
  longitude: number | null;
  state: Named | null;
  lga: Named | null;
  city: Named | null;
  town: Named | null;
  neighborhood: Named | null;
  street: Named | null;
  /** False for accounts created via Google that never set a PowerWatch password. */
  passwordSet: boolean;
  signInMethods: { google: boolean; apple: boolean };
  createdAt: string;
}

export interface AuthResult {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "role" | "emailVerified">;
  accessToken: string;
  refreshToken: string;
  verificationEmailSent?: boolean;
}

export interface GoogleAuthResult extends AuthResult {
  /** True when this Google sign-in created a new PowerWatch account (HTTP 201). */
  isNewUser: boolean;
}

export interface NotificationPreferences {
  notificationEnabled: boolean;
  outageAlerts: boolean;
  restorationAlerts: boolean;
  communityUpdates: boolean;
}

export interface RecentStreetReport {
  street: string;
  reportType: "ON" | "OFF";
  reports: number;
  lastReportAt: string | null;
}

export interface LiveStatus {
  neighborhood: { id: number; name: string; town: string };
  status: ApiPowerStatus;
  since: string | null;
  confirmedBy: number;
  confidence: number;
  recentReporters: number;
  lastReportAt: string | null;
  /** Streets reported from in the last 2 hours, per street and ON/OFF, most recent first. */
  recentStreets: RecentStreetReport[];
}

export interface ActivityItem {
  neighborhoodId: number;
  neighborhood: string;
  town: string;
  status: "ON" | "OFF";
  at: string;
  isCurrentNeighborhood: boolean;
}

/** Where a report was filed, worked out on the server from the GPS point that was sent. */
export interface ReportedPlace {
  neighborhood: string;
  street: string | null;
  town: string;
  lga: string;
  state: string;
}

export interface ReportResult {
  id: string;
  neighborhoodId: number;
  place: ReportedPlace;
  reportType: "ON" | "OFF";
  timestamp: string;
  neighborhoodStatus: "ON" | "OFF";
  statusChanged: boolean;
}

export interface MyReport {
  id: string;
  reportType: "ON" | "OFF";
  timestamp: string;
  neighborhoodId: number;
  neighborhood: string;
  town: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface OutagePeriod {
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  minutes: number;
  ongoing: boolean;
}

export interface HistorySummary {
  neighborhood: { id: number; name: string };
  timeZone: string;
  days: { date: string; offMinutes: number; outages: OutagePeriod[] }[];
  totalOutageMinutes: number;
  uptimePercent: number;
  outageCount: number;
  hasData: boolean;
  longestOutage: { minutes: number; date: string; ongoing: boolean } | null;
}

export interface LocationSearchItem {
  type: "state" | "lga" | "city" | "town" | "neighborhood";
  id: number;
  name: string;
  state: string;
  lga: string;
  town: string | null;
  neighborhoodId: number | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ReverseGeocodeResult {
  neighborhoodId: number;
  neighborhood: string;
  town: string;
  city: string;
  lga: string;
  state: string;
  /** Street name at the point, when OpenStreetMap has one. */
  road: string | null;
}

export type CoordinatePrecision = "neighborhood" | "town" | "city" | "lga" | "none";

export interface StatusMapByLga {
  lga: Named;
  neighborhoods: {
    id: number;
    name: string;
    town: string;
    status: ApiPowerStatus;
    outageSince: string | null;
    latitude: number | null;
    longitude: number | null;
    precision: CoordinatePrecision;
  }[];
}

export interface StatusMapByState {
  state: Named;
  lgas: {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    neighborhoods: number;
    neighborhoodsOff: number;
    neighborhoodsOn: number;
    outagePercent: number | null;
  }[];
}

export interface SavedNeighborhood {
  neighborhoodId: number;
  name: string;
  town: string;
  label: string | null;
  status: ApiPowerStatus;
  outageSince: string | null;
  savedAt: string;
}

export interface InboxNotification {
  id: string;
  title: string;
  body: string;
  type: string | null;
  opened: boolean;
  createdAt: string;
}

/** The newest Android build published on GitHub Releases (GET /app/latest). */
export interface LatestRelease {
  platform: "android";
  version: string;
  downloadUrl: string;
  fileName: string;
  sizeBytes: number;
  publishedAt: string;
  notes: string;
  releasePage: string;
  /** Versions older than this must update before using the app (null when not enforced) */
  minimumVersion: string | null;
}

export interface SignInSession {
  id: string;
  isCurrent: boolean;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  platform: string | null;
  ipAddress: string | null;
  lastActivityAt: string;
  createdAt: string;
}
