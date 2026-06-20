import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as supportersApi from '@api/endpoints/supporters.api';
import { SUPPORTERS_QUERY_KEY } from './useSupporters';
import type { InviteSupporterRequest } from '@api/types';

/**
 * Hook to invite a supporter to a commitment
 */
export function useInviteSupporter(commitmentId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: InviteSupporterRequest) => {
      if (!commitmentId) {
        throw new Error('Commitment ID is required');
      }
      return supportersApi.invite(commitmentId, request);
    },
    onSuccess: () => {
      // Invalidate supporter list
      queryClient.invalidateQueries({
        queryKey: [...SUPPORTERS_QUERY_KEY, commitmentId],
      });
    },
  });

  return {
    inviteSupporter: mutation.mutateAsync,
    isInviting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (E.164)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}
