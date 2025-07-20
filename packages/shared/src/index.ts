export * from './types';

export const APP_CONFIG = {
  PROXIMITY_THRESHOLD_METERS: 10,
  ENCOUNTER_COOLDOWN_MINUTES: 5,
  MAX_DAILY_LIKES: 20,
  BLUETOOTH_SCAN_INTERVAL_MS: 5000,
  LOCATION_UPDATE_INTERVAL_MS: 30000,
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  ENCOUNTERS: '/api/encounters',
  MATCHES: '/api/matches',
  NOTIFICATIONS: '/api/notifications',
} as const;