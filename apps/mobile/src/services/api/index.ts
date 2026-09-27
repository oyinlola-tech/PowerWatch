import { request } from "./client";
import type {
  ActivityItem,
  AuthResult,
  DeviceType,
  HistorySummary,
  LiveStatus,
  LocationSearchItem,
  MyReport,
  NotificationPreferences,
  Paginated,
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
  register: (body: { fullName: string; email: string; password: string; deviceType?: DeviceType }) =>
    request<AuthResult>("/auth/register", { method: "POST", body, auth: false }),
  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", { method: "POST", body: { email, password }, auth: false }),
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
  deleteAccount: (password: string) =>
    request<unknown>("/auth/delete-account", { method: "DELETE", body: { password } }),
  getNotificationPreferences: () => request<NotificationPreferences>("/auth/notification-preferences"),
  updateNotificationPreferences: (body: Partial<NotificationPreferences>) =>
    request<NotificationPreferences>("/auth/notification-preferences", { method: "PATCH", body }),
  registerPushToken: (body: { expoPushToken: string; deviceType?: DeviceType; deviceName?: string }) =>
    request<unknown>("/auth/push-token", { method: "PUT", body }),
  unregisterPushToken: (expoPushToken: string) =>
    request<unknown>("/auth/push-token", { method: "DELETE", body: { expoPushToken } }),
};

export const reportsApi = {
  status: (neighborhoodId?: number) => request<LiveStatus>("/reports/status", { query: { neighborhoodId } }),
  activity: (limit = 10, neighborhoodId?: number) =>
    request<ActivityItem[]>("/reports/activity", { query: { limit, neighborhoodId } }),
  report: (status: "ON" | "OFF", neighborhoodId: number, deviceType?: DeviceType) =>
    request<ReportResult>(status === "ON" ? "/reports/power-on" : "/reports/power-off", {
      method: "POST",
      body: { neighborhoodId, ...(deviceType ? { deviceType } : {}) },
    }),
  mine: (page = 1, limit = 20) => request<Paginated<MyReport>>("/reports/my", { query: { page, limit } }),
  remove: (id: string) => request<unknown>(`/reports/${id}`, { method: "DELETE" }),
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
  unsave: (neighborhoodId: number) => request<unknown>(`/locations/saved/${neighborhoodId}`, { method: "DELETE" }),
};
