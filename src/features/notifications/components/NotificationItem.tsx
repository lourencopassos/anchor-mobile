import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationInboxItem, NotificationType } from '@api/types';
import { useMarkAsRead } from '../hooks';

interface NotificationItemProps {
  notification: NotificationInboxItem;
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  COMMITMENT_ACTIVATED: '🎯',
  COMMITMENT_RESTARTED: '🔄',
  CHECKIN_MISSED: '⚠️',
  EVALUATION_SUMMARY: '📊',
  SUPPORTER_INVITED: '👥',
  VOTE_RECEIVED: '🗳️',
  FAILURE_THRESHOLD: '❌',
  // Supporter engagement notifications (Phase 14)
  REACTION_RECEIVED: '👍',
  COMMENT_RECEIVED: '💬',
  PEER_REACTION: '🤝',
  PEER_COMMENT: '💭',
};

/**
 * Individual notification item component
 */
export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const { mutate: markAsRead } = useMarkAsRead();

  const handlePress = () => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const icon = NOTIFICATION_ICONS[notification.type as NotificationType] || '📬';

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row p-4 border-b border-neutral-200 ${
        notification.isRead ? 'bg-white' : 'bg-primary-50'
      }`}
      accessibilityLabel={notification.title}
      accessibilityHint={notification.body}
      accessibilityRole="button"
    >
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-3">
        <Text className="text-xl">{icon}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={`text-base ${
              notification.isRead ? 'font-normal' : 'font-semibold'
            } text-neutral-900`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {!notification.isRead && (
            <View className="w-2 h-2 rounded-full bg-primary-500 ml-2" />
          )}
        </View>
        <Text className="text-sm text-neutral-600 mb-1" numberOfLines={2}>
          {notification.body}
        </Text>
        <Text className="text-xs text-neutral-400">{timeAgo}</Text>
      </View>
    </Pressable>
  );
}
