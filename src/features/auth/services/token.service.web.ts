import { TOKEN } from '@config/constants';
import type { TokenPair } from '@api/types';

/**
 * Web token service using localStorage
 * Note: localStorage is not secure, this is for development only
 */

// Mutex to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<TokenPair | null> | null = null;

// Web storage using localStorage
const storage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

/**
 * Get the access token from storage
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await storage.getItemAsync(TOKEN.ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Get the refresh token from storage
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await storage.getItemAsync(TOKEN.REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Store tokens in storage
 */
export async function setTokens(tokens: TokenPair): Promise<void> {
  try {
    await Promise.all([
      storage.setItemAsync(TOKEN.ACCESS_TOKEN_KEY, tokens.accessToken),
      storage.setItemAsync(TOKEN.REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw error;
  }
}

/**
 * Clear all tokens from storage
 */
export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      storage.deleteItemAsync(TOKEN.ACCESS_TOKEN_KEY),
      storage.deleteItemAsync(TOKEN.REFRESH_TOKEN_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw error;
  }
}

/**
 * Check if user has valid tokens stored
 */
export async function hasValidTokens(): Promise<boolean> {
  const accessToken = await getAccessToken();
  return accessToken !== null;
}

/**
 * Refresh tokens using the refresh token
 * Uses a mutex to prevent concurrent refresh attempts
 */
export async function refreshTokens(
  refreshFn: (refreshToken: string) => Promise<TokenPair>
): Promise<TokenPair | null> {
  // If already refreshing, wait for the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const newTokens = await refreshFn(refreshToken);
      await setTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      await clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Parse JWT token to extract payload
 * Note: This does NOT verify the signature
 */
export function parseJWT<T>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = parseJWT<{ exp: number }>(token);
  if (!payload?.exp) {
    return true;
  }
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now() + bufferSeconds * 1000;
  return currentTime >= expirationTime;
}
