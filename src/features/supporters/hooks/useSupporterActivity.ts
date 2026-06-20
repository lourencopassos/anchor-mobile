import { useInfiniteQuery } from '@tanstack/react-query';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import type { SupporterActivityQueryOptions, SupporterActivityType } from '@api/types';

export const SUPPORTER_ACTIVITY_QUERY_KEY = ['supporter-activity'] as const;

interface UseSupporterActivityOptions {
  enabled?: boolean;
  type?: SupporterActivityType;
}

/**
 * Hook to fetch supporter activity for a commitment (owner only)
 * Returns reactions, comments, and votes with infinite scroll pagination.
 */
export function useSupporterActivity(
  commitmentId: string | undefined,
  options?: UseSupporterActivityOptions
) {
  return useInfiniteQuery({
    queryKey: [...SUPPORTER_ACTIVITY_QUERY_KEY, commitmentId, options?.type],
    queryFn: async ({ pageParam }) => {
      const queryOptions: SupporterActivityQueryOptions = {
        limit: 20,
        cursor: pageParam as string | undefined,
        type: options?.type,
      };
      return commitmentsApi.getSupporterActivity(commitmentId!, queryOptions);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!commitmentId && (options?.enabled ?? true),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Flatten all pages of supporter activity into a single array.
 */
export function flattenSupporterActivity(
  data: ReturnType<typeof useSupporterActivity>['data']
) {
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
}
