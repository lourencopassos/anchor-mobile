const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const ENV = {
  API_URL: `${BASE_URL}/api/v1`,
  IS_DEV: __DEV__,
  ANALYTICS_ENABLED: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === "true",
} as const;
