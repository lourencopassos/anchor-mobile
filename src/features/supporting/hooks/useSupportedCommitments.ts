/**
 * =============================================================================
 * SUPPORTED COMMITMENTS HOOKS
 * =============================================================================
 *
 * React Query hooks for fetching commitments the user is supporting.
 * Provides data for the Supporting tab with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as supportingApi from '@api/endpoints/supporting.api';
import * as supportersApi from '@api/endpoints/supporters.api';
import type { SupportedCommitmentFilter } from '@api/types';

export const SUPPORTED_COMMITMENTS_KEY = ['supported-commitments'] as const;

/**
 * Hook to fetch all commitments the user is supporting.
 *
 * @param filter - Optional filter by commitment state ('all', 'active', 'completed')
 */
export function useSupportedCommitments(filter?: SupportedCommitmentFilter) {
  return useQuery({
    queryKey: [...SUPPORTED_COMMITMENTS_KEY, filter ?? 'all'],
    queryFn: () => supportingApi.getSupportedCommitments(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single supported commitment with full details.
 * Includes recent check-ins and the user's vote.
 *
 * @param commitmentId - The commitment ID
 */
export function useSupportedCommitment(commitmentId: string | undefined) {
  return useQuery({
    queryKey: [...SUPPORTED_COMMITMENTS_KEY, 'detail', commitmentId],
    queryFn: () => supportingApi.getSupportedCommitment(commitmentId!),
    enabled: !!commitmentId,
    staleTime: 60 * 1000, // 1 minute (more frequent updates for detail view)
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch paginated check-ins for a supported commitment.
 *
 * @param commitmentId - The commitment ID
 * @param options - Pagination options (limit, offset)
 */
export function useSupportedCommitmentCheckIns(
  commitmentId: string | undefined,
  options?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: [
      ...SUPPORTED_COMMITMENTS_KEY,
      'check-ins',
      commitmentId,
      options?.limit ?? 10,
      options?.offset ?? 0,
    ],
    queryFn: () =>
      supportingApi.getSupportedCommitmentCheckIns(commitmentId!, options),
    enabled: !!commitmentId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to invalidate all supported commitments queries.
 * Useful after voting or when receiving push notifications.
 */
export function useInvalidateSupportedCommitments() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: SUPPORTED_COMMITMENTS_KEY });
  };
}

/**
 * Hook to accept a supporter invite.
 * Automatically refreshes the supported commitments list on success.
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supporterId: string) => supportersApi.accept(supporterId),
    onSuccess: () => {
      // Refresh the list to show the now-active supporter relationship
      queryClient.invalidateQueries({ queryKey: SUPPORTED_COMMITMENTS_KEY });
    },
  });
}

/**
 * Hook to decline a supporter invite.
 * Automatically refreshes the supported commitments list on success.
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supporterId: string) => supportersApi.decline(supporterId),
    onSuccess: () => {
      // Refresh the list to remove the declined invite
      queryClient.invalidateQueries({ queryKey: SUPPORTED_COMMITMENTS_KEY });
    },
  });
}
