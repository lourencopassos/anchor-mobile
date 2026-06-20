import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { register } from '@api/endpoints/auth.api';
import { setTokens, parseJWT } from '../services/token.service';
import { useAuthStore } from '../stores/auth.store';
import type { RegisterRequest, AuthenticatedUser } from '@api/types';

interface UseRegisterResult {
  register: (data: RegisterRequest) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for user registration with TanStack Query mutation
 * Handles token storage and auth state management
 */
export function useRegister(): UseRegisterResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async (tokenPair) => {
      // Store tokens securely
      await setTokens(tokenPair);

      // Parse user info from access token
      const payload = parseJWT<{
        sub: string;
        email: string;
        roles: string[];
        firstName: string;
        lastName: string;
      }>(tokenPair.accessToken);

      if (payload) {
        const user: AuthenticatedUser = {
          userId: payload.sub,
          email: payload.email,
          roles: payload.roles as AuthenticatedUser['roles'],
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
        };
        setUser(user);
      }

      // Clear any cached queries to get fresh data
      queryClient.clear();

      // Navigate to main app
      router.replace('/(main)');
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
