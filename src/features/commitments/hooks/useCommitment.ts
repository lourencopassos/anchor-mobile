import { useQuery } from '@tanstack/react-query';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

export function useCommitment(id: string | undefined) {
  return useQuery({
    queryKey: [...COMMITMENTS_QUERY_KEY, id],
    queryFn: () => commitmentsApi.get(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Always refetch on mount so the detail screen decides redirects (e.g.
    // PENDING_DEPOSIT → deposit) off fresh state, never a stale cached value.
    refetchOnMount: 'always',
  });
}

export function useCommitmentCycles(id: string | undefined) {
  return useQuery({
    queryKey: [...COMMITMENTS_QUERY_KEY, id, 'cycles'],
    queryFn: () => commitmentsApi.getCycles(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRestartEligibility(id: string | undefined) {
  return useQuery({
    queryKey: [...COMMITMENTS_QUERY_KEY, id, 'restart-eligibility'],
    queryFn: () => commitmentsApi.checkRestartEligibility(id!),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}
