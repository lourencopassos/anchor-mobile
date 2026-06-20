import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as checkInsApi from '@api/endpoints/check-ins.api';
import type { CommentsListResponse, Comment } from '@api/types';

export const COMMENTS_QUERY_KEY = ['check-in-comments'] as const;

/**
 * Hook to fetch comments for a check-in
 */
export function useComments(checkInId: string | undefined) {
  return useQuery({
    queryKey: [...COMMENTS_QUERY_KEY, checkInId],
    queryFn: () => checkInsApi.getComments(checkInId!),
    enabled: !!checkInId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to add a comment to a check-in
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkInId,
      content,
    }: {
      checkInId: string;
      content: string;
    }) => checkInsApi.addComment(checkInId, { content }),
    onSuccess: (newComment, { checkInId }) => {
      // Update the cache with the new comment
      queryClient.setQueryData<CommentsListResponse>(
        [...COMMENTS_QUERY_KEY, checkInId],
        (oldData) => {
          if (!oldData) {
            return {
              comments: [newComment],
              totalCount: 1,
            };
          }
          return {
            comments: [...oldData.comments, newComment],
            totalCount: oldData.totalCount + 1,
          };
        }
      );
    },
    onSettled: (_data, _error, { checkInId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: [...COMMENTS_QUERY_KEY, checkInId],
      });
    },
  });
}

/**
 * Hook to delete a comment from a check-in
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkInId,
      commentId,
    }: {
      checkInId: string;
      commentId: string;
    }) => checkInsApi.deleteComment(checkInId, commentId),
    onMutate: async ({ checkInId, commentId }) => {
      await queryClient.cancelQueries({
        queryKey: [...COMMENTS_QUERY_KEY, checkInId],
      });

      const previousData = queryClient.getQueryData<CommentsListResponse>([
        ...COMMENTS_QUERY_KEY,
        checkInId,
      ]);

      if (previousData) {
        queryClient.setQueryData<CommentsListResponse>(
          [...COMMENTS_QUERY_KEY, checkInId],
          {
            comments: previousData.comments.filter((c) => c.id !== commentId),
            totalCount: previousData.totalCount - 1,
          }
        );
      }

      return { previousData };
    },
    onError: (_err, { checkInId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [...COMMENTS_QUERY_KEY, checkInId],
          context.previousData
        );
      }
    },
    onSettled: (_data, _error, { checkInId }) => {
      queryClient.invalidateQueries({
        queryKey: [...COMMENTS_QUERY_KEY, checkInId],
      });
    },
  });
}
