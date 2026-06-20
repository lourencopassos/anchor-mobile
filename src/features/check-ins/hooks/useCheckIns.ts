import { useQuery } from '@tanstack/react-query';
import * as checkInsApi from '@api/endpoints/check-ins.api';

export const CHECKINS_QUERY_KEY = ['check-ins'] as const;

/**
 * Hook to fetch check-in history for a commitment
 */
export function useCheckIns(commitmentId: string | undefined) {
  return useQuery({
    queryKey: [...CHECKINS_QUERY_KEY, commitmentId],
    queryFn: () => checkInsApi.getForCommitment(commitmentId!),
    enabled: !!commitmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single check-in
 */
export function useCheckIn(checkInId: string | undefined) {
  return useQuery({
    queryKey: [...CHECKINS_QUERY_KEY, 'detail', checkInId],
    queryFn: () => checkInsApi.get(checkInId!),
    enabled: !!checkInId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
