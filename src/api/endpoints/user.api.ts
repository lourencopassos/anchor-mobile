import apiClient from '../client';
import type { UserProfile, UpdateUserProfileRequest } from '../types';

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/user/profile');
  return response.data;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  request: UpdateUserProfileRequest,
): Promise<UserProfile> {
  const response = await apiClient.patch<UserProfile>(
    '/user/profile',
    request,
  );
  return response.data;
}
