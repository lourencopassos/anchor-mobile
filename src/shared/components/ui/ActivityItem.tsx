import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { formatDistanceToNow } from 'date-fns';

export type ActivityType = 'check-in' | 'supporter' | 'milestone' | 'vote' | 'message';

const ACTIVITY_ICONS = {
  'check-in': { icon: 'checkbox-outline', color: '#10B981' },
  supporter: { icon: 'person-add-outline', color: '#3B82F6' },
  milestone: { icon: 'trophy-outline', color: '#F59E0B' },
  vote: { icon: 'hand-left-outline', color: '#8B5CF6' },
  message: { icon: 'chatbubble-outline', color: '#EC4899' },
} as const;

export interface ActivityItemProps {
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: Date;
  onPress?: () => void;
  className?: string;
}

export function ActivityItem({
  type,
  title,
  subtitle,
  timestamp,
  onPress,
  className = '',
}: ActivityItemProps) {
  const activityStyle = ACTIVITY_ICONS[type];
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  const content = (
    <View style={styles.container} className={className}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${activityStyle.color}15` },
        ]}
      >
        <Icon name={activityStyle.icon} size="sm" color={activityStyle.color} />
      </View>

      <View style={styles.content}>
        <Text
          style={styles.title}
          className="text-neutral-900 dark:text-white"
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={styles.subtitle}
            className="text-neutral-500 dark:text-neutral-400"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <Text style={styles.timestamp} className="text-neutral-400">
        {timeAgo}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

// Activity feed component
export function ActivityFeed({
  activities,
  maxItems = 5,
  className = '',
  onViewAll,
}: {
  activities: Array<Omit<ActivityItemProps, 'className'>>;
  maxItems?: number;
  className?: string;
  onViewAll?: () => void;
}) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <View className={className}>
      {displayedActivities.map((activity, index) => (
        <ActivityItem
          key={index}
          {...activity}
          className={index < displayedActivities.length - 1 ? 'mb-2' : ''}
        />
      ))}

      {activities.length > maxItems && onViewAll && (
        <Pressable onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText} className="text-primary">
            View all activity
          </Text>
          <Icon name="chevron-forward" size="sm" color="#4CAF50" />
        </Pressable>
      )}

      {activities.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="time-outline" size="lg" color="#9CA3AF" />
          <Text style={styles.emptyText} className="text-neutral-400">
            No recent activity
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
});
