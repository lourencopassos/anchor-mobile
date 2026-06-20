import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { SupporterActivity } from '@api/types';
import { Avatar } from '@shared/components/ui/Avatar';
import { Card } from '@shared/components/ui/Card';

interface ActivityItemProps {
  activity: SupporterActivity;
  index: number;
  onPress?: (activity: SupporterActivity) => void;
}

/**
 * Activity type styles with warm accent colors.
 */
const ACTIVITY_STYLES: Record<string, { borderColor: string; backgroundColor: string; iconBg: string }> = {
  REACTION: {
    borderColor: '#F59E0B', // amber
    backgroundColor: '#FFFBEB',
    iconBg: '#FEF3C7',
  },
  COMMENT: {
    borderColor: '#3B82F6', // blue
    backgroundColor: '#EFF6FF',
    iconBg: '#DBEAFE',
  },
  VERIFICATION: {
    borderColor: '#10B981', // green for verification
    backgroundColor: '#ECFDF5',
    iconBg: '#D1FAE5',
  },
};

/**
 * Default style for unknown activity types.
 */
const DEFAULT_STYLE = {
  borderColor: '#9CA3AF', // gray
  backgroundColor: '#F9FAFB',
  iconBg: '#F3F4F6',
};

/**
 * Individual activity item component for the supporter activity feed.
 * Shows reactions, comments, and verifications from supporters.
 */
export function ActivityItem({ activity, index, onPress }: ActivityItemProps) {
  const { t } = useTranslation('supporters');
  // Use string key lookup with fallback for unknown activity types
  const activityType = String(activity.type).toUpperCase();
  const style = ACTIVITY_STYLES[activityType] || DEFAULT_STYLE;

  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const renderContent = () => {
    // Use string comparison for reliability with API responses
    switch (activityType) {
      case 'REACTION':
        return (
          <View style={styles.contentRow}>
            <Text style={styles.emoji}>{activity.emoji}</Text>
            <Text style={styles.actionText} className="text-neutral-700">
              {t('activity.reactedTo')}
              {activity.checkInDate && (
                <Text style={styles.highlight}> {activity.checkInDate}</Text>
              )}
            </Text>
          </View>
        );

      case 'COMMENT':
        return (
          <View>
            <Text style={styles.actionText} className="text-neutral-700">
              {t('activity.commentedOn')}
              {activity.checkInDate && (
                <Text style={styles.highlight}> {activity.checkInDate}</Text>
              )}
            </Text>
            {activity.content && (
              <Text
                style={styles.commentPreview}
                className="text-neutral-600"
                numberOfLines={2}
              >
                "{activity.content}"
              </Text>
            )}
          </View>
        );

      case 'VERIFICATION':
        return (
          <View>
            <View style={styles.verificationRow}>
              <Text style={styles.actionText} className="text-neutral-700">
                {activity.verificationType === 'DISPUTE'
                  ? t('activity.disputed')
                  : t('activity.verified')}
              </Text>
              <View
                style={[
                  styles.verificationBadge,
                  {
                    backgroundColor:
                      activity.verificationType === 'DISPUTE' ? '#FEE2E2' : '#D1FAE5',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verificationBadgeText,
                    {
                      color:
                        activity.verificationType === 'DISPUTE' ? '#B91C1C' : '#047857',
                    },
                  ]}
                >
                  {activity.verificationType}
                </Text>
              </View>
            </View>
            {activity.verificationReason && (
              <Text
                style={styles.verificationReason}
                className="text-neutral-500"
                numberOfLines={2}
              >
                "{activity.verificationReason}"
              </Text>
            )}
          </View>
        );

      default:
        // Fallback for unknown activity types
        return (
          <Text style={styles.actionText} className="text-neutral-500">
            {activity.type}
          </Text>
        );
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(activity);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(300)}
      style={styles.container}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
        disabled={!onPress}
      >
        <Card
          variant="outlined"
          className="mb-3"
          style={[
            styles.card,
            {
              borderLeftColor: style.borderColor,
              backgroundColor: style.backgroundColor,
            },
          ]}
        >
          <View style={styles.header}>
            <Avatar
              name={activity.supporterName}
              source={activity.supporterAvatarUrl || undefined}
              size="sm"
            />
            <View style={styles.headerText}>
              <Text style={styles.supporterName} className="text-neutral-900">
                {activity.supporterName}
              </Text>
              <Text style={styles.timestamp} className="text-neutral-400">
                {timeAgo}
              </Text>
            </View>
          </View>

          <View style={styles.content}>{renderContent()}</View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  pressable: {
    transform: [{ scale: 1 }],
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  card: {
    borderLeftWidth: 4,
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  supporterName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 1,
  },
  content: {
    marginLeft: 42, // Avatar width + margin
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
  },
  highlight: {
    fontWeight: '600',
  },
  commentPreview: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  verificationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  verificationReason: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
});
