import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@config/env';
import { API } from '@config/constants';
import {
  getAccessToken,
  refreshTokens,
  clearTokens,
  isTokenExpired,
} from '@features/auth/services/token.service';
import { useAuthStore } from '@features/auth/stores/auth.store';
import type { TokenPair } from './types';

// Endpoints that don't require authentication
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: API.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate correlation ID for tracing.
// Must be a UUID: the backend persists it into UUID columns (ledger, audit),
// so a non-UUID value is rejected and breaks writes (e.g. commitment creation).
function generateCorrelationId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Request interceptor - add auth token and correlation ID
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add correlation ID for tracing
    config.headers['X-Correlation-ID'] = generateCorrelationId();

    // Skip token handling for public endpoints
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    // Get access token
    const token = await getAccessToken();
    if (token) {
      // Check if token is expired and needs refresh
      if (isTokenExpired(token)) {
        try {
          const newTokens = await refreshTokens(refreshTokensApi);
          if (newTokens) {
            config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }
        } catch {
          // Token refresh failed, continue without token
          // The 401 response interceptor will handle logout
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newTokens = await refreshTokens(refreshTokensApi);
        if (newTokens) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, logout user
        await handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

// Refresh tokens API call
async function refreshTokensApi(refreshToken: string): Promise<TokenPair> {
  const response = await axios.post<TokenPair>(
    `${ENV.API_URL}/auth/refresh`,
    { refreshToken },
    { timeout: API.TIMEOUT_MS }
  );
  return response.data;
}

// Handle logout
async function handleLogout(): Promise<void> {
  await clearTokens();
  useAuthStore.getState().logout();
}

export default apiClient;
