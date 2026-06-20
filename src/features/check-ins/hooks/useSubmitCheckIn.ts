import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { usePendingCheckInsStore } from '../stores/pending-checkins.store';
import * as checkInsApi from '@api/endpoints/check-ins.api';
import { CHECKINS_QUERY_KEY } from './useCheckIns';
import { COMMITMENTS_QUERY_KEY } from '@/features/commitments/hooks/useCommitments';
import type { CheckIn, SubmitCheckInRequest } from '@api/types';

/**
 * Hook to submit a check-in with offline support
 *
 * If offline, the check-in is queued locally and will be synced
 * when the network becomes available.
 */
export function useSubmitCheckIn() {
  const queryClient = useQueryClient();
  const { isConnected } = useNetworkStatus();
  const addPending = usePendingCheckInsStore((state) => state.addPending);

  const mutation = useMutation({
    mutationFn: async (request: SubmitCheckInRequest): Promise<CheckIn> => {
      if (!isConnected) {
        // Queue locally when offline
        const localId = addPending(request);

        // Return an optimistic result
        return {
          id: localId,
          commitmentId: request.commitmentId,
          cycleId: '', // Unknown until synced
          userId: '', // Unknown until synced
          checkInDate: new Date().toISOString().split('T')[0],
          status: request.status,
          evidenceType: request.evidenceType,
          notes: request.notes || null,
          createdAt: new Date().toISOString(),
          wasCached: true,
        };
      }

      // Online: submit to API
      return checkInsApi.submit(request);
    },
    onSuccess: (data, variables) => {
      // Invalidate check-in history
      queryClient.invalidateQueries({
        queryKey: [...CHECKINS_QUERY_KEY, variables.commitmentId],
      });

      // Invalidate commitment (updates cycle stats)
      queryClient.invalidateQueries({
        queryKey: [...COMMITMENTS_QUERY_KEY, variables.commitmentId],
      });

      // Also invalidate the commitments list
      queryClient.invalidateQueries({
        queryKey: COMMITMENTS_QUERY_KEY,
      });
    },
  });

  return {
    submitCheckIn: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
    isOffline: !isConnected,
  };
}
