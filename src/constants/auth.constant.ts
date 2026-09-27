export const BCRYPT_SALT_ROUNDS = 12;

export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '30d';

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const DEVICE_TYPES = {
  ANDROID: 'ANDROID',
  IOS: 'IOS',
  WEB: 'WEB',
} as const;
