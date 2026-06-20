// Stake configuration
export const STAKE = {
  MIN_CENTS: 500, // $5
  MAX_CENTS: 100000, // $1000
  DEFAULT_CURRENCY: 'USD',
} as const;

// App configuration
export const APP = {
  SUPPORTED_LANGUAGES: ['en', 'pt-BR'] as const,
  DEFAULT_LANGUAGE: 'en' as const,
  LANGUAGE_STORAGE_KEY: '@anchor/language',
} as const;

// API configuration
export const API = {
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Token configuration
export const TOKEN = {
  ACCESS_TOKEN_KEY: 'anchor_access_token',
  REFRESH_TOKEN_KEY: 'anchor_refresh_token',
  USER_KEY: 'anchor_user',
} as const;

// Check-in configuration
export const CHECKIN = {
  NOTES_MAX_LENGTH: 1000,
} as const;

// Supporter configuration
export const SUPPORTER = {
  VOTE_REASON_MAX_LENGTH: 500,
} as const;

// Template types
export const TEMPLATE_TYPES = [
  'QUIT_SMOKING',
  'EXERCISE',
  'MEDITATION',
  'DIET',
  'SLEEP',
  'CUSTOM',
] as const;
