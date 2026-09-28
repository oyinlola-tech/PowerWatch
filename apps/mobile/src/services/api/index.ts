import { request } from "./client";
import type {
  ActivityItem,
  AuthResult,
  DeviceType,
  GoogleAuthResult,
  HistorySummary,
  InboxNotification,
  SignInSession,
  LatestRelease,
  LiveStatus,
  LocationSearchItem,
  MyReport,
  NotificationPreferences,
  Outage,
  OutageDetail,
  OutageStatistics,
  Paginated,
  PowerStatistics,
  ReportResult,
  ReverseGeocodeResult,
  SavedNeighborhood,
  StatusMapByLga,
  StatusMapByState,
  User,
} from "./types";

export { ApiError, setSessionExpiredHandler } from "./client";
export { API_URL } from "./config";
export type * from "./types";

export const authApi = {
  register: (body: {
    fullName: string;
    email: string;
    password: string;
    deviceType?: DeviceType;
    /** The person ticked "I agree to the Terms & Conditions and Privacy Policy" */
    acceptedTerms: true;
    termsVersion: string;
    /** Sets the person's home neighborhood (and street) on the server. Omit if they declined. */
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }) =>
    request<AuthResult>("/auth/register", { method: "POST", body, auth: false }),
  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  /**
   * When the Google account has no PowerWatch account yet and `acceptedTerms` wasn't
   * sent, this rejects with a 409 ApiError whose message is "TERMS_REQUIRED" — show the
   * agreement and retry with `acceptedTerms: true`. Location fields are only meaningful
   * on that create-account retry, same as `register`.
   */
  googleSignIn: (body: {
    idToken: string;
    acceptedTerms?: true;
    termsVersion?: string;
    deviceType?: DeviceType;
    deviceName?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    mocked?: boolean;
  }) => request<GoogleAuthResult>("/auth/google", { method: "POST", body, auth: false }),
  logout: (refreshToken: string) =>
    request<unknown>("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }),
  me: () => request<User>("/auth/me"),
  sendOtp: (email: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET" = "EMAIL_VERIFICATION") =>
    request<unknown>("/auth/resend-otp", { method: "POST", body: { email, type }, auth: false }),
  verifyEmail: (email: string, code: string) =>
    request<{ verified: boolean }>("/auth/verify-otp", {
      method: "POST",
      body: { email, code, type: "EMAIL_VERIFICATION" },
      auth: false,
    }),
  forgotPassword: (email: string) =>
    request<unknown>("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (email: string, code: string, password: string) =>
    request<unknown>("/auth/reset-password", {
      method: "POST",
      body: { email, code, password, confirmPassword: password },
      auth: false,
    }),
  updateProfile: (body: { fullName?: string; neighborhoodId?: number | null; latitude?: number; longitude?: number }) =>
    request<User>("/auth/profile", { method: "PATCH", body }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<unknown>("/auth/change-password", {
      method: "PATCH",
      body: { currentPassword, newPassword, confirmNewPassword: newPassword },
    }),
  /** Accounts with `passwordSet: false` confirm deletion with a fresh Google ID token instead. */
  deleteAccount: (body: { password: string } | { googleIdToken: string }) =>
    request<unknown>("/auth/delete-account", { method: "DELETE", body }),
  getNotificationPreferences: () => request<NotificationPreferences>("/auth/notification-preferences"),
  updateNotificationPreferences: (body: Partial<NotificationPreferences>) =>
    request<NotificationPreferences>("/auth/notification-preferences", { method: "PATCH", body }),
  registerPushToken: (body: { expoPushToken: string; deviceType?: DeviceType; deviceName?: string }) =>
    request<unknown>("/auth/push-token", { method: "PUT", body }),
  unregisterPushToken: (expoPushToken: string) =>
    request<unknown>("/auth/push-token", { method: "DELETE", body: { expoPushToken } }),
  sessions: () => request<SignInSession[]>("/auth/sessions"),
  revokeSession: (sessionId: string) => request<unknown>(`/auth/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" }),
  logoutAll: () => request<unknown>("/auth/logout-all", { method: "POST" }),
};

export const notificationsApi = {
  list: (page = 1, limit = 30) =>
    request<Paginated<InboxNotification>>("/notifications", { query: { page, limit } }),
  unreadCount: () => request<{ unreadCount: number }>("/notifications/unread-count"),
  markRead: (id: string) =>
    request<unknown>(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH", body: { opened: true } }),
  markAllRead: () => request<{ updated: number }>("/notifications/read-all", { method: "PATCH" }),
  remove: (id: string) => request<unknown>(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const reportsApi = {
  status: (neighborhoodId?: number) => request<LiveStatus>("/reports/status", { query: { neighborhoodId } }),
  activity: (limit = 10, neighborhoodId?: number) =>
    request<ActivityItem[]>("/reports/activity", { query: { limit, neighborhoodId } }),
  // The neighborhood is no longer chosen by the app: the server works it out from the
  // GPS point, so a fresh, precise, non-mocked fix is required on every report.
  report: (
    status: "ON" | "OFF",
    location: { latitude: number; longitude: number; accuracy: number; mocked?: boolean },
    options: { deviceType?: DeviceType } = {},
  ) =>
    request<ReportResult>(status === "ON" ? "/reports/power-on" : "/reports/power-off", {
      method: "POST",
      body: {
        ...location,
        ...(options.deviceType ? { deviceType: options.deviceType } : {}),
      },
    }),
  mine: (page = 1, limit = 20) => request<Paginated<MyReport>>("/reports/my", { query: { page, limit } }),
  remove: (id: string) => request<unknown>(`/reports/${encodeURIComponent(id)}`, { method: "DELETE" }),
  outages: (params: {
    neighborhoodId?: number;
    activeOnly?: boolean;
    /** ISO date-time. Returns outages under way at any point in [from, to). */
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) =>
    request<Paginated<Outage>>("/reports/outages", {
      query: {
        neighborhoodId: params.neighborhoodId,
        activeOnly: params.activeOnly,
        from: params.from,
        to: params.to,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    }),
  outage: (id: string) => request<OutageDetail>(`/reports/outages/${encodeURIComponent(id)}`),
};

export const analyticsApi = {
  power: (params: { startDate?: string; endDate?: string } = {}) =>
    request<PowerStatistics>("/analytics/power", { query: params }),
  outages: (params: { startDate?: string; endDate?: string } = {}) =>
    request<OutageStatistics>("/analytics/outages", { query: params }),
};

export const historyApi = {
  summary: (days: 7 | 30, neighborhoodId?: number) =>
    request<HistorySummary>("/history/summary", { query: { days, neighborhoodId } }),
};

export const locationsApi = {
  search: (q: string, limit = 20) =>
    request<LocationSearchItem[]>("/locations/search", { query: { q, limit }, auth: false }),
  reverseGeocode: (latitude: number, longitude: number) =>
    request<ReverseGeocodeResult>("/locations/reverse-geocode", { method: "POST", body: { latitude, longitude } }),
  statusMapByLga: (lgaId?: number) => request<StatusMapByLga>("/locations/status-map", { query: { lgaId } }),
  statusMapByState: (stateId: number) =>
    request<StatusMapByState>("/locations/status-map", { query: { stateId } }),
  saved: () => request<SavedNeighborhood[]>("/locations/saved"),
  save: (neighborhoodId: number, label?: string) =>
    request<unknown>("/locations/saved", { method: "POST", body: { neighborhoodId, ...(label ? { label } : {}) } }),
  unsave: (neighborhoodId: number) => request<unknown>(`/locations/saved/${encodeURIComponent(neighborhoodId)}`, { method: "DELETE" }),
};

export const appApi = {
  /** 404s until the first Android release is published; callers should treat that as "no update". */
  latestRelease: () => request<LatestRelease>("/app/latest", { auth: false }),
};
