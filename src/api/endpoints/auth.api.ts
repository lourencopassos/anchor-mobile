import apiClient from '../client';
import type {
  LoginRequest,
  RegisterRequest,
  TokenPair,
  InvitationValidation,
  ClaimAccountRequest,
} from '../types';

/**
 * Login with email and password
 */
export async function login(request: LoginRequest): Promise<TokenPair> {
  const response = await apiClient.post<TokenPair>('/auth/login', request);
  return response.data;
}

/**
 * Register a new account
 */
export async function register(request: RegisterRequest): Promise<TokenPair> {
  const response = await apiClient.post<TokenPair>('/auth/register', request);
  return response.data;
}

/**
 * Refresh tokens
 */
export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const response = await apiClient.post<TokenPair>('/auth/refresh', {
    refreshToken,
  });
  return response.data;
}

/**
 * Logout (revoke tokens)
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Validate an invitation token
 */
export async function validateInvitation(
  token: string,
): Promise<InvitationValidation> {
  const response = await apiClient.get<InvitationValidation>(
    `/auth/invitation/${token}`,
  );
  return response.data;
}

/**
 * Claim an account using an invitation token
 */
export async function claimAccount(
  request: ClaimAccountRequest,
): Promise<TokenPair> {
  const response = await apiClient.post<TokenPair>('/auth/claim', request);
  return response.data;
}
