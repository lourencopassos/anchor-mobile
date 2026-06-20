import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as supportersApi from '@api/endpoints/supporters.api';
import { SUPPORTERS_QUERY_KEY } from './useSupporters';

/**
 * Hook to accept a supporter invitation
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (supporterId: string) => supportersApi.accept(supporterId),
    onSuccess: (data) => {
      // Invalidate supporter list for the commitment
      queryClient.invalidateQueries({
        queryKey: [...SUPPORTERS_QUERY_KEY, data.commitmentId],
      });
    },
  });

  return {
    acceptInvite: mutation.mutateAsync,
    isAccepting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook to decline a supporter invitation
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      supporterId,
      commitmentId,
    }: {
      supporterId: string;
      commitmentId: string;
    }) => supportersApi.decline(supporterId).then(() => ({ commitmentId })),
    onSuccess: (data) => {
      // Invalidate supporter list for the commitment
      queryClient.invalidateQueries({
        queryKey: [...SUPPORTERS_QUERY_KEY, data.commitmentId],
      });
    },
  });

  return {
    declineInvite: mutation.mutateAsync,
    isDeclining: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook to remove a supporter
 */
export function useRemoveSupporter() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      supporterId,
      commitmentId,
    }: {
      supporterId: string;
      commitmentId: string;
    }) => supportersApi.remove(supporterId).then(() => ({ commitmentId })),
    onSuccess: (data) => {
      // Invalidate supporter list for the commitment
      queryClient.invalidateQueries({
        queryKey: [...SUPPORTERS_QUERY_KEY, data.commitmentId],
      });
    },
  });

  return {
    removeSupporter: mutation.mutateAsync,
    isRemoving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook to resend an invitation to a supporter
 */
export function useResendInvite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (supporterId: string) => supportersApi.resend(supporterId),
    onSuccess: (data) => {
      // Invalidate supporter list for the commitment
      queryClient.invalidateQueries({
        queryKey: [...SUPPORTERS_QUERY_KEY, data.commitmentId],
      });
    },
  });

  return {
    resendInvite: mutation.mutateAsync,
    isResending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
