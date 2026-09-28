import dotenv from 'dotenv';
import { assertValidTimeZone } from '../utils/time.js';

dotenv.config({ quiet: true });

function parseTrustProxy(
  value: string | undefined,
): boolean | string[] | ((address: string, hop: number) => boolean) {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  if (/^\d+$/.test(value)) {
    const hops = Number(value);
    return (_address, hop) => hop < hops;
  }
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

const DURATION_UNITS_SECONDS: Record<string, number> = {
  s: 1,
  sec: 1,
  second: 1,
  m: 60,
  min: 60,
  minute: 60,
  h: 60 * 60,
  hour: 60 * 60,
  d: 24 * 60 * 60,
  day: 24 * 60 * 60,
};

/**
 * Parses durations like "900", "15m", "30d" or "7 days" into seconds.
 * Throws on anything else so a typo fails at startup instead of silently
 * producing a wrong token lifetime.
 */
export function parseDurationSeconds(name: string, value: string): number {
  const match = value.trim().match(/^(\d+)\s*([a-z]*?)s?$/i);
  const amount = match ? Number(match[1]) : NaN;
  const unit = match?.[2]?.toLowerCase() || 's';
  const multiplier = DURATION_UNITS_SECONDS[unit];
  if (!match || !multiplier || !Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      `${name}="${value}" is not a valid duration. Use seconds ("900") or a unit suffix ("15m", "12h", "30d").`,
    );
  }
  return amount * multiplier;
}

const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER ?? 'root';
const dbPassword = process.env.DB_PASSWORD ?? '';
const dbName = process.env.DB_NAME ?? 'powerwatch';

const databaseUrl = `mysql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`;

process.env.DATABASE_URL = databaseUrl;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST ?? '0.0.0.0',
  // Set when running behind a reverse proxy/load balancer so request.ip is the real client
  // IP (from X-Forwarded-For). Accepts "true", a hop count ("1"), or a comma-separated IP/CIDR list.
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),

  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    name: dbName,
  },

  databaseUrl,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresInSeconds: parseDurationSeconds(
      'JWT_ACCESS_EXPIRES_IN',
      process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    ),
    refreshExpiresInSeconds: parseDurationSeconds(
      'JWT_REFRESH_EXPIRES_IN',
      process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    ),
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  bodyLimit: Number(process.env.BODY_LIMIT_BYTES) || 100 * 1024,

  // Zone used for "today", day-by-day history and local times in responses.
  timeZone: process.env.APP_TIMEZONE || 'Africa/Lagos',

  reports: {
    // Minimum gap between one user's reports for the same neighborhood.
    cooldownMinutes: Number(process.env.REPORT_COOLDOWN_MINUTES) || 5,
    // Reports newer than this decide the neighborhood's status by majority.
    consensusWindowMinutes: Number(process.env.REPORT_CONSENSUS_WINDOW_MINUTES) || 30,
    // GPS fixes vaguer than this cannot place a report in the right neighborhood.
    maxAccuracyMeters: Number(process.env.REPORT_MAX_ACCURACY_METERS) || 200,
    // Two reports from one person implying faster travel than this are refused.
    maxTravelKmh: Number(process.env.REPORT_MAX_TRAVEL_KMH) || 300,
  },

  expo: {
    // Optional: only needed if "Enhanced push security" is enabled for the Expo project.
    accessToken: process.env.EXPO_ACCESS_TOKEN ?? '',
  },

  rateLimit: {
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    authWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60000,
    otpMax: Number(process.env.OTP_RATE_LIMIT_MAX) || 3,
    otpWindowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS) || 10 * 60000,
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },

  nominatim: {
    contactEmail: process.env.NOMINATIM_CONTACT_EMAIL ?? process.env.SMTP_FROM_EMAIL ?? '',
  },

  admin: {
    firstName: process.env.ADMIN_FIRST_NAME ?? '',
    lastName: process.env.ADMIN_LAST_NAME ?? '',
    email: process.env.ADMIN_EMAIL ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
  },

  otp: {
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
  },

  // How long personal data is kept. The Privacy Policy states these periods:
  // change them together.
  retention: {
    // Security and activity records (sign-ins, password changes...) with IP address and device
    auditLogDays: Number(process.env.AUDIT_LOG_RETENTION_DAYS) || 365,
    // Used or expired verification and reset codes
    otpHours: Number(process.env.OTP_RETENTION_HOURS) || 24,
  },

  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    fromEmail: process.env.SMTP_FROM_EMAIL ?? '',
    fromName: process.env.SMTP_FROM_NAME ?? 'PowerWatch',
  },

  // Shown in emails: the logo and links point at the website, replies go to support
  mailBranding: {
    webUrl: (process.env.APP_WEB_URL || 'https://powerwatch.oyinlola.site').replace(/\/+$/, ''),
    supportEmail: process.env.SUPPORT_EMAIL ?? '',
  },
};

try {
  assertValidTimeZone(env.timeZone);
} catch {
  throw new Error(`APP_TIMEZONE="${env.timeZone}" is not a valid IANA time zone (e.g. "Africa/Lagos").`);
}

if (!env.jwt.accessSecret || !env.jwt.refreshSecret) {
  throw new Error(
    'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables.',
  );
}
