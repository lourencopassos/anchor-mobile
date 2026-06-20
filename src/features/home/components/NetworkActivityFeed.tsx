/**
 * =============================================================================
 * NETWORK ACTIVITY FEED
 * =============================================================================
 *
 * Compact activity timeline showing recent check-ins and milestones
 * from the user's support network.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '@shared/components/ui/Icon';
import { Avatar } from '@shared/components/ui/Avatar';
import { haptics } from '@/shared/utils/haptics.utils';
import i18n from '@i18n/index';
import type { CommunityActivity } from '../hooks/useCommunityData';

// Design tokens
const COLORS = {
  primary: '#2D5A4A',
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    muted: '#78716C',
  },
  activity: {
    checkIn: '#2D5A4A',
    missed: '#B54548',
    streak: '#F59E0B',
    completed: '#4D8670',
  },
};

interface NetworkActivityFeedProps {
  activities: CommunityActivity[];
  maxItems?: number;
  onSeeAll?: () => void;
}

export function NetworkActivityFeed({
  activities,
  maxItems = 5,
  onSeeAll,
}: NetworkActivityFeedProps) {
  const router = useRouter();
  const { t } = useTranslation('home');

  const displayActivities = activities.slice(0, maxItems);

  const handleActivityPress = (activity: CommunityActivity) => {
    haptics.light();
    router.push(`/(main)/supporting/${activity.commitmentId}` as const);
  };

  const handleSeeAll = () => {
    haptics.light();
    if (onSeeAll) {
      onSeeAll();
    } else {
      router.push('/(main)/supporting');
    }
  };

  // Empty state
  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('community.recentActivity')}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('community.noActivity')}</Text>
          <Text style={styles.emptySubtext}>{t('community.noActivitySubtitle')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('community.recentActivity')}</Text>
        {activities.length > maxItems && (
          <Pressable onPress={handleSeeAll} hitSlop={8} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>{t('community.viewAll')}</Text>
            <Icon name="chevron-forward" size="xs" color={COLORS.primary} />
          </Pressable>
        )}
      </View>

      {/* Activity List */}
      <View style={styles.activityList}>
        {displayActivities.map((activity, index) => (
          <Animated.View
            key={activity.id}
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <ActivityItem
              activity={activity}
              onPress={() => handleActivityPress(activity)}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

interface ActivityItemProps {
  activity: CommunityActivity;
  onPress: () => void;
}

function ActivityItem({ activity, onPress }: ActivityItemProps) {
  const { t } = useTranslation('home');

  // Get activity icon and color based on type
  const getActivityDisplay = () => {
    switch (activity.type) {
      case 'CHECK_IN':
        if (activity.checkInStatus === 'MISSED') {
          return {
            icon: 'close-circle',
            color: COLORS.activity.missed,
            text: t('activity.checkinMissed'),
          };
        }
        return {
          icon: 'checkmark-circle',
          color: COLORS.activity.checkIn,
          text: t('activity.checkinCompleted'),
        };
      case 'STREAK_MILESTONE':
        return {
          icon: 'flame',
          color: COLORS.activity.streak,
          text: t('activity.streakMilestone', { count: activity.streakDays || 0 }),
        };
      case 'COMMITMENT_COMPLETED':
        return {
          icon: 'trophy',
          color: COLORS.activity.completed,
          text: t('activity.completed'),
        };
      default:
        return {
          icon: 'ellipse',
          color: COLORS.text.muted,
          text: '',
        };
    }
  };

  const display = getActivityDisplay();
  const relativeTime = getRelativeTime(activity.timestamp);

  return (
    <Pressable onPress={onPress} style={styles.activityItem}>
      {/* Avatar */}
      <View style={styles.activityAvatar}>
        <Avatar
          name={activity.ownerDisplayName}
          source={activity.ownerAvatarUrl}
          size="xs"
        />
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <Text style={styles.activityText} numberOfLines={1}>
          <Text style={styles.activityName}>{activity.ownerDisplayName.split(' ')[0]}</Text>
          {' '}
          <Text style={styles.activityAction}>{display.text}</Text>
        </Text>
      </View>

      {/* Icon and time */}
      <View style={styles.activityMeta}>
        <Icon name={display.icon} size="xs" color={display.color} />
        <Text style={styles.activityTime}>{relativeTime}</Text>
      </View>
    </Pressable>
  );
}

/**
 * Format timestamp to relative time string (e.g., "2h", "1d", "3d")
 */
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return i18n.t('common:timeAbbrev.minutes', { count: Math.max(1, diffMins) });
  }
  if (diffHours < 24) {
    return i18n.t('common:timeAbbrev.hours', { count: diffHours });
  }
  if (diffDays < 7) {
    return i18n.t('common:timeAbbrev.days', { count: diffDays });
  }
  return i18n.t('common:timeAbbrev.weeks', { count: Math.floor(diffDays / 7) });
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.primary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.primary,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  activityAvatar: {
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.text.secondary,
  },
  activityName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.primary,
  },
  activityAction: {
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.text.secondary,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.text.muted,
  },
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.text.muted,
    textAlign: 'center',
  },
});
