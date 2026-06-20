import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import type { SupporterActivity, SupporterActivityType } from '@api/types';
import { useSupporterActivity, flattenSupporterActivity } from '../hooks';
import { ActivityItem } from './ActivityItem';
import { Icon } from '@shared/components/ui/Icon';

interface SupporterActivityFeedProps {
  commitmentId: string;
  typeFilter?: SupporterActivityType;
  onActivityPress?: (activity: SupporterActivity) => void;
}

interface GroupedActivity {
  type: 'header' | 'item';
  data: string | SupporterActivity;
  key: string;
}

/**
 * Groups activities by time period (Today, Yesterday, This Week, Earlier)
 */
function groupActivitiesByDate(
  activities: SupporterActivity[]
): GroupedActivity[] {
  const result: GroupedActivity[] = [];
  let currentGroup: string | null = null;

  for (const activity of activities) {
    const date = parseISO(activity.createdAt);
    let group: string;

    if (isToday(date)) {
      group = 'today';
    } else if (isYesterday(date)) {
      group = 'yesterday';
    } else if (isThisWeek(date)) {
      group = 'thisWeek';
    } else {
      group = 'earlier';
    }

    if (group !== currentGroup) {
      result.push({
        type: 'header',
        data: group,
        key: `header-${group}`,
      });
      currentGroup = group;
    }

    result.push({
      type: 'item',
      data: activity,
      key: activity.id,
    });
  }

  return result;
}

/**
 * Empty state component for when there's no activity.
 */
function EmptyState() {
  const { t } = useTranslation('supporters');

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="heart-outline" size="xl" color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle} className="text-neutral-600">
        {t('activity.emptyTitle')}
      </Text>
      <Text style={styles.emptySubtitle} className="text-neutral-400">
        {t('activity.emptySubtitle')}
      </Text>
    </View>
  );
}

/**
 * Section header component for time groups.
 */
function SectionHeader({ group }: { group: string }) {
  const { t } = useTranslation('supporters');

  const icons: Record<string, string> = {
    today: '🔥',
    yesterday: '📅',
    thisWeek: '📆',
    earlier: '📁',
  };

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icons[group] || '📌'}</Text>
      <Text style={styles.sectionTitle} className="text-neutral-700">
        {t(`activity.groups.${group}`)}
      </Text>
    </View>
  );
}

/**
 * Supporter activity feed component for commitment owners.
 * Shows reactions, comments, and votes from supporters in a warm, friendly UI.
 */
export function SupporterActivityFeed({
  commitmentId,
  typeFilter,
  onActivityPress,
}: SupporterActivityFeedProps) {
  const { t } = useTranslation('supporters');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSupporterActivity(commitmentId, { type: typeFilter });

  const activities = useMemo(
    () => flattenSupporterActivity(data),
    [data]
  );

  const groupedActivities = useMemo(
    () => groupActivitiesByDate(activities),
    [activities]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: GroupedActivity; index: number }) => {
      if (item.type === 'header') {
        return <SectionHeader group={item.data as string} />;
      }

      const activity = item.data as SupporterActivity;
      // Adjust index for animation (exclude headers from count)
      const itemIndex = groupedActivities
        .slice(0, index)
        .filter((i) => i.type === 'item').length;

      return (
        <ActivityItem
          activity={activity}
          index={itemIndex}
          onPress={onActivityPress}
        />
      );
    },
    [groupedActivities, onActivityPress]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }, [isFetchingNextPage]);

  const keyExtractor = useCallback(
    (item: GroupedActivity) => item.key,
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
        <Text style={styles.loadingText} className="text-neutral-500">
          {t('activity.loading')}
        </Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Icon name="alert-circle-outline" size="xl" color="#EF4444" />
        </View>
        <Text style={styles.errorTitle} className="text-neutral-700">
          {t('activity.errorTitle')}
        </Text>
        <Text style={styles.errorMessage} className="text-neutral-500">
          {error?.message || t('activity.errorDefault')}
        </Text>
      </View>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={groupedActivities}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor="#6B7280"
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
