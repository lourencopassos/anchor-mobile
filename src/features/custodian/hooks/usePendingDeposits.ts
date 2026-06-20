import { useQuery } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import { CUSTODIAN_QUERY_KEY } from './useCustodianSummary';

/**
 * Hook to fetch pending deposits for custodian.
 */
export function usePendingDeposits() {
  return useQuery({
    queryKey: [...CUSTODIAN_QUERY_KEY, 'deposits'],
    queryFn: custodianApi.getPendingDeposits,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for alpha
  });
}
