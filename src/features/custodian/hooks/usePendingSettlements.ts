import { useQuery } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import { CUSTODIAN_QUERY_KEY } from './useCustodianSummary';

/**
 * Hook to fetch pending settlements for custodian.
 */
export function usePendingSettlements() {
  return useQuery({
    queryKey: [...CUSTODIAN_QUERY_KEY, 'settlements'],
    queryFn: custodianApi.getPendingSettlements,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for alpha
  });
}
