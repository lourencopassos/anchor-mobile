import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '@api/endpoints/notifications.api';
import type { NotificationInboxItem } from '@api/types';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
}

/**
 * Hook to fetch notifications inbox
 */
export function useNotifications(options?: UseNotificationsOptions) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, options],
    queryFn: () =>
      notificationsApi.getInbox({
        unreadOnly: options?.unreadOnly,
        limit: options?.limit,
      }),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Poll every 60 seconds
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  const { data } = useNotifications({ unreadOnly: true });
  return data?.unreadCount ?? 0;
}

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item: NotificationInboxItem) =>
              item.id === id
                ? { ...item, isRead: true, readAt: new Date().toISOString() }
                : item
            ),
            unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      // Optimistically mark all as read
      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item: NotificationInboxItem) => ({
              ...item,
              isRead: true,
              readAt: item.readAt || new Date().toISOString(),
            })),
            unreadCount: 0,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
