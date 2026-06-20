import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { validateInvitation, claimAccount } from '@api/endpoints/auth.api';
import { accept as acceptInvite, decline as declineInvite } from '@api/endpoints/supporters.api';
import { setTokens, parseJWT } from '../services/token.service';
import { useAuthStore } from '../stores/auth.store';
import type { ClaimAccountRequest, AuthenticatedUser, InvitationValidation } from '@api/types';

/**
 * Hook to validate an invitation token
 */
export function useValidateInvitation(token: string | null) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => validateInvitation(token!),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface UseClaimAccountResult {
  claimAccount: (data: Omit<ClaimAccountRequest, 'token'>) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Hook to claim an account using an invitation token
 */
export function useClaimAccount(token: string): UseClaimAccountResult {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: (data: Omit<ClaimAccountRequest, 'token'>) =>
      claimAccount({ ...data, token }),
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
    },
  });

  return {
    claimAccount: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

interface UseRespondToInvitationResult {
  accept: () => void;
  decline: () => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to accept or decline a supporter invitation after claiming account
 */
export function useRespondToInvitation(supporterId: string): UseRespondToInvitationResult {
  const router = useRouter();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => acceptInvite(supporterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporters'] });
      // Navigate to main app
      router.replace('/(main)');
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => declineInvite(supporterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporters'] });
      // Navigate to main app
      router.replace('/(main)');
    },
  });

  return {
    accept: acceptMutation.mutate,
    decline: declineMutation.mutate,
    isPending: acceptMutation.isPending || declineMutation.isPending,
    isError: acceptMutation.isError || declineMutation.isError,
    error: acceptMutation.error || declineMutation.error,
  };
}
