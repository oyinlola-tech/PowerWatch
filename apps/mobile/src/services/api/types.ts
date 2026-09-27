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
  createdAt: string;
}

export interface AuthResult {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "role" | "emailVerified">;
  accessToken: string;
  refreshToken: string;
  verificationEmailSent?: boolean;
}

export interface NotificationPreferences {
  notificationEnabled: boolean;
  outageAlerts: boolean;
  restorationAlerts: boolean;
  communityUpdates: boolean;
}

export interface LiveStatus {
  neighborhood: { id: number; name: string; town: string };
  status: ApiPowerStatus;
  since: string | null;
  confirmedBy: number;
  confidence: number;
  recentReporters: number;
  lastReportAt: string | null;
}

export interface ActivityItem {
  neighborhoodId: number;
  neighborhood: string;
  town: string;
  status: "ON" | "OFF";
  at: string;
  isCurrentNeighborhood: boolean;
}

export interface ReportResult {
  id: string;
  neighborhoodId: number;
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
