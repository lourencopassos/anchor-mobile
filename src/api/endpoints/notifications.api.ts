import apiClient from '../client';
import type {
  NotificationInboxResponse,
  MarkAsReadResponse,
  MarkAllReadResponse,
} from '../types';

interface GetInboxParams {
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
}

/**
 * Get notification inbox
 */
export async function getInbox(
  params?: GetInboxParams
): Promise<NotificationInboxResponse> {
  const response = await apiClient.get<NotificationInboxResponse>(
    '/notifications/inbox',
    { params }
  );
  return response.data;
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string): Promise<MarkAsReadResponse> {
  const response = await apiClient.patch<MarkAsReadResponse>(
    `/notifications/${id}/read`
  );
  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<MarkAllReadResponse> {
  const response = await apiClient.patch<MarkAllReadResponse>(
    '/notifications/mark-all-read'
  );
  return response.data;
}
