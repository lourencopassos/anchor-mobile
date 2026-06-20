import { useQuery } from '@tanstack/react-query';
import * as supportersApi from '@api/endpoints/supporters.api';

export const SUPPORTERS_QUERY_KEY = ['supporters'] as const;

/**
 * Hook to fetch supporters for a commitment
 */
export function useSupporters(commitmentId: string | undefined) {
  return useQuery({
    queryKey: [...SUPPORTERS_QUERY_KEY, commitmentId],
    queryFn: () => supportersApi.list(commitmentId!),
    enabled: !!commitmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
