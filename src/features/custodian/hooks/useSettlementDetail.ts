import { useQuery } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import { CUSTODIAN_QUERY_KEY } from './useCustodianSummary';

/**
 * Hook to fetch a specific settlement detail for custodian.
 */
export function useSettlementDetail(taskId: string | undefined) {
  return useQuery({
    queryKey: [...CUSTODIAN_QUERY_KEY, 'settlements', taskId],
    queryFn: () => custodianApi.getSettlementDetail(taskId!),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}
