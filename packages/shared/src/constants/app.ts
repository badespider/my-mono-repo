/**
 * Application constants
 */

export const APP_NAME = 'My Mono Repo App';
export const APP_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  USERS: '/users',
  AUTH: '/auth',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
} as const;

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 255,
} as const;
