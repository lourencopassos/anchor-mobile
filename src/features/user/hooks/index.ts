import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '@/api/endpoints/user.api';
import type { UpdateUserProfileRequest, UserProfile } from '@/api/types';

const USER_PROFILE_KEY = ['user', 'profile'];

/**
 * Hook to fetch the current user's profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: USER_PROFILE_KEY,
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });
}

/**
 * Hook to update the user's profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateUserProfileRequest) =>
      userApi.updateProfile(request),
    onSuccess: (updatedProfile) => {
      // Update the cache with the new profile
      queryClient.setQueryData<UserProfile>(USER_PROFILE_KEY, updatedProfile);
    },
  });
}
