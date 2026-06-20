import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as checkInsApi from '@api/endpoints/check-ins.api';
import type { ReactionsListResponse } from '@api/types';

export const REACTIONS_QUERY_KEY = ['check-in-reactions'] as const;

/**
 * Hook to fetch reactions for a check-in
 */
export function useReactions(checkInId: string | undefined) {
  return useQuery({
    queryKey: [...REACTIONS_QUERY_KEY, checkInId],
    queryFn: () => checkInsApi.getReactions(checkInId!),
    enabled: !!checkInId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to add a reaction to a check-in
 */
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checkInId, emoji }: { checkInId: string; emoji: string }) =>
      checkInsApi.addReaction(checkInId, { emoji }),
    onMutate: async ({ checkInId, emoji }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [...REACTIONS_QUERY_KEY, checkInId],
      });

      // Snapshot current state
      const previousData = queryClient.getQueryData<ReactionsListResponse>([
        ...REACTIONS_QUERY_KEY,
        checkInId,
      ]);

      // Optimistically update
      if (previousData) {
        const existingReaction = previousData.reactions.find(
          (r) => r.emoji === emoji
        );

        const updatedReactions = existingReaction
          ? previousData.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, currentUserReacted: true }
                : r
            )
          : [
              ...previousData.reactions,
              {
                emoji,
                count: 1,
                userIds: [],
                currentUserReacted: true,
              },
            ];

        queryClient.setQueryData<ReactionsListResponse>(
          [...REACTIONS_QUERY_KEY, checkInId],
          {
            reactions: updatedReactions,
            totalCount: previousData.totalCount + 1,
          }
        );
      }

      return { previousData };
    },
    onError: (_err, { checkInId }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [...REACTIONS_QUERY_KEY, checkInId],
          context.previousData
        );
      }
    },
    onSettled: (_data, _error, { checkInId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: [...REACTIONS_QUERY_KEY, checkInId],
      });
    },
  });
}

/**
 * Hook to remove a reaction from a check-in
 */
export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checkInId, emoji }: { checkInId: string; emoji: string }) =>
      checkInsApi.removeReaction(checkInId, emoji),
    onMutate: async ({ checkInId, emoji }) => {
      await queryClient.cancelQueries({
        queryKey: [...REACTIONS_QUERY_KEY, checkInId],
      });

      const previousData = queryClient.getQueryData<ReactionsListResponse>([
        ...REACTIONS_QUERY_KEY,
        checkInId,
      ]);

      if (previousData) {
        const updatedReactions = previousData.reactions
          .map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count - 1, currentUserReacted: false }
              : r
          )
          .filter((r) => r.count > 0);

        queryClient.setQueryData<ReactionsListResponse>(
          [...REACTIONS_QUERY_KEY, checkInId],
          {
            reactions: updatedReactions,
            totalCount: previousData.totalCount - 1,
          }
        );
      }

      return { previousData };
    },
    onError: (_err, { checkInId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [...REACTIONS_QUERY_KEY, checkInId],
          context.previousData
        );
      }
    },
    onSettled: (_data, _error, { checkInId }) => {
      queryClient.invalidateQueries({
        queryKey: [...REACTIONS_QUERY_KEY, checkInId],
      });
    },
  });
}
