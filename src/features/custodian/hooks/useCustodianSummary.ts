import { useQuery } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';

export const CUSTODIAN_QUERY_KEY = ['custodian'] as const;

/**
 * Hook to fetch custodian summary (badge counts).
 */
export function useCustodianSummary() {
  return useQuery({
    queryKey: [...CUSTODIAN_QUERY_KEY, 'summary'],
    queryFn: custodianApi.getSummary,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for alpha
  });
}

/**
 * Hook to get total pending custodian tasks count.
 */
export function usePendingCount() {
  const { data } = useCustodianSummary();
  return data?.totalPending ?? 0;
}
