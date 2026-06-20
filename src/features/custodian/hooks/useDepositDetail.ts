import { useQuery } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import { CUSTODIAN_QUERY_KEY } from './useCustodianSummary';

/**
 * Hook to fetch a specific deposit detail for custodian.
 */
export function useDepositDetail(depositId: string | undefined) {
  return useQuery({
    queryKey: [...CUSTODIAN_QUERY_KEY, 'deposits', depositId],
    queryFn: () => custodianApi.getDepositDetail(depositId!),
    enabled: !!depositId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}
