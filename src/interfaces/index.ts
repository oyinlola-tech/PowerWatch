import type { RegisterInput } from '../validators/auth.validator.js';

export type RegisterDto = RegisterInput;

export interface RegisterResult {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  /** False if the verification email could not be sent; the app should offer "resend". */
  verificationEmailSent: boolean;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReverseGeocodeResult {
  countryId: number;
  country: string;
  stateId: number;
  state: string;
  lgaId: number;
  lga: string;
  cityId: number;
  city: string;
  townId: number;
  town: string;
  neighborhoodId: number;
  neighborhood: string;
  distanceKm: number;
  suburb: string | null;
  village: string | null;
  road: string | null;
}

export interface CreateReportDto {
  userId: string;
  neighborhoodId: number;
  reportType: 'ON' | 'OFF';
  latitude?: number | undefined;
  longitude?: number | undefined;
  deviceType?: 'ANDROID' | 'IOS' | 'WEB' | undefined;
}

export interface ReportResponse {
  id: string;
  userId: string;
  neighborhoodId: number;
  reportType: string;
  timestamp: Date;
  latitude: number | null;
  longitude: number | null;
  deviceType: string | null;
  createdAt: Date;
  /** The neighborhood's status after this report was counted. */
  neighborhoodStatus: 'ON' | 'OFF';
  statusChanged: boolean;
}

export interface LiveStatusResponse {
  neighborhood: { id: number; name: string; town: string };
  status: 'ON' | 'OFF' | 'UNKNOWN';
  /** When the current status began, if known. */
  since: Date | null;
  /** Distinct people who reported the current status (within the lookback). */
  confirmedBy: number;
  /** 0-100: share of recent reporters agreeing with the status. */
  confidence: number;
  /** Distinct people who reported in the confidence window. */
  recentReporters: number;
  lastReportAt: Date | null;
}

export interface OutageResponse {
  id: string;
  neighborhoodId: number;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  reportCount: number;
  createdAt: Date;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  body: string;
}

export interface NotificationLogResponse {
  id: string;
  userId: string;
  title: string;
  body: string;
  sent: boolean;
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  createdAt: Date;
}
