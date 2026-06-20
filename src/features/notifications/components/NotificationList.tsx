import React from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNotifications, useMarkAllAsRead } from '../hooks';
import { NotificationItem } from './NotificationItem';
import type { NotificationInboxItem } from '@api/types';

/**
 * List of notifications with pull-to-refresh and mark all as read
 */
export function NotificationList() {
  const { t } = useTranslation('notifications');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isRefetching, refetch } = useNotifications();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const renderItem = ({ item }: { item: NotificationInboxItem }) => (
    <NotificationItem notification={item} />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-5xl mb-4">📭</Text>
      <Text className="text-lg font-medium text-neutral-700">
        {t('empty')}
      </Text>
      <Text className="text-sm text-neutral-500 mt-1">
        {t('emptyDescription')}
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (unreadCount === 0) {
      return null;
    }

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <Text className="text-sm text-neutral-600">
          {t('unreadCount', { count: unreadCount })}
        </Text>
        <Pressable
          onPress={() => markAllAsRead()}
          disabled={isMarkingAll}
          className="py-1 px-3"
        >
          <Text
            className={`text-sm font-medium ${
              isMarkingAll ? 'text-neutral-400' : 'text-primary-500'
            }`}
          >
            {t('markAllRead')}
          </Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-500">{tCommon('loading')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#6366f1"
        />
      }
      contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
    />
  );
}
