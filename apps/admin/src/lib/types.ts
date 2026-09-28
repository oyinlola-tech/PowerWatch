// Response shapes of the endpoints the dashboard uses, taken from src/services and src/routes in the API.

export type Role = "USER" | "ADMIN";
export type ReportType = "ON" | "OFF";
export type PowerStatus = "ON" | "OFF" | "UNKNOWN";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paged<T> {
  data: T[];
  pagination: Pagination;
}

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

export interface LoginResult {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface Profile extends SessionUser {
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  isCurrent: boolean;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  platform: string | null;
  ipAddress: string | null;
  isActive: boolean;
  lastActivityAt: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface Dashboard {
  totalUsers: number;
  newUsersToday: number;
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  activeOutages: number;
  totalOutages: number;
  totalNeighborhoods: number;
  openSystemErrors: number;
}

export interface AdminAnalytics {
  onReports: number;
  offReports: number;
  totalReports: number;
  totalUsers: number;
  totalOutages: number;
  onOffRatio: string;
}

export interface PowerStatistics {
  totalReports: number;
  onReports: number;
  offReports: number;
  onPercentage: string;
  offPercentage: string;
  fromCache: boolean;
  topNeighborhoods: { neighborhoodId: number; neighborhoodName: string; reportCount: number }[];
}

export interface OutageStatistics {
  totalOutages: number;
  activeOutages: number;
  completedOutages: number;
  averageDurationMinutes: number;
  fromCache: boolean;
  topNeighborhoods: {
    neighborhoodId: number;
    neighborhoodName: string;
    outageCount: number;
    averageDurationMinutes: number;
  }[];
}

export interface UserStatistics {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  verificationRate: string;
  usersByState: { stateId: number | null; stateName: string; userCount: number }[];
  topReporters: { userId: string; name: string; email: string; reportCount: number }[];
}

export interface NeighborhoodStat {
  id: number;
  name: string;
  town: string;
  city: string;
  lga: string;
  state: string;
  reportCount: number;
  outageCount: number;
  userCount: number;
}

export interface LocationStatistics {
  totalNeighborhoods: number;
  neighborhoods: NeighborhoodStat[];
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationTree {
  countries: { id: number; name: string }[];
  states: { id: number; name: string; countryId: number }[];
  lgas: { id: number; name: string; stateId: number }[];
  cities: { id: number; name: string; lgaId: number }[];
  towns: { id: number; name: string; cityId: number }[];
  neighborhoods: { id: number; name: string; townId: number }[];
}

export type LocationLevel = "state" | "lga" | "city" | "town" | "neighborhood";

export interface LocationSearchResult {
  type: LocationLevel;
  id: number;
  name: string;
  state: string;
  lga: string;
  city: string;
  town: string;
  neighborhoodId: number | null;
  neighborhood: string | null;
}

export interface PublicReport {
  id: string;
  neighborhoodId: number;
  reportType: ReportType;
  timestamp: string;
  createdAt: string;
}

export interface ReportDetail extends PublicReport {
  userId: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  deviceType: "ANDROID" | "IOS" | "WEB" | null;
}

export interface Outage {
  id: string;
  neighborhoodId: number;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  neighborhood: { id: number; name: string };
}

export interface OutageDetail extends Outage {
  outageReports: {
    id: string;
    reportId: string;
    report: { id: string; reportType: ReportType; timestamp: string };
  }[];
}

export interface StatusMapByState {
  state: { id: number; name: string };
  lgas: {
    id: number;
    name: string;
    neighborhoods: number;
    neighborhoodsOff: number;
    neighborhoodsOn: number;
    outagePercent: number | null;
  }[];
}

export interface StatusMapByLga {
  lga: { id: number; name: string };
  neighborhoods: {
    id: number;
    name: string;
    town: string;
    status: PowerStatus;
    outageSince: string | null;
  }[];
}

export interface LiveStatus {
  neighborhood: { id: number; name: string; town: string };
  status: PowerStatus;
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

export type BroadcastAudience =
  | { type: "all" }
  | { type: "users"; userIds: string[] }
  | { type: "neighborhood"; neighborhoodId: number }
  | { type: "lga"; lgaId: number }
  | { type: "state"; stateId: number };

export interface BroadcastRequest {
  title: string;
  body: string;
  audience: BroadcastAudience;
  dryRun?: boolean;
}

export interface BroadcastResult {
  recipients: number;
  pushEnabledRecipients: number;
  devices: number;
  dryRun?: true;
  pushSent?: number;
  pushFailed?: number;
}

export type SystemEventLevel = "ERROR" | "WARNING";
export type SystemEventSource = "email" | "push" | "job" | "geocoding" | "api" | "startup";
export type SystemEventStatus = "open" | "resolved" | "all";

export interface SystemEvent {
  id: string;
  level: SystemEventLevel;
  source: SystemEventSource;
  message: string;
  details: Record<string, unknown>;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface SystemEventsResponse {
  data: SystemEvent[];
  pagination: Pagination;
  open: { errors: number; warnings: number };
}

export interface HealthPart {
  status: "healthy" | "unhealthy";
  timestamp: string;
  latencyMs?: number;
  uptime?: number;
  projectId?: string;
  message?: string;
  error?: string;
}

export interface HealthReport {
  server: HealthPart;
  database: HealthPart;
  firebase: HealthPart;
}
