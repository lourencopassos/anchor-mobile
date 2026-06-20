import { useQuery } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

/**
 * Hook to fetch deposit status for a commitment (creator view).
 */
export function useDepositStatus(commitmentId: string | undefined) {
  return useQuery({
    queryKey: [...COMMITMENTS_QUERY_KEY, commitmentId, 'deposit'],
    queryFn: () => custodianApi.getDepositStatus(commitmentId!),
    enabled: !!commitmentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000, // Poll every 15 seconds - creator wants quick updates
  });
}
