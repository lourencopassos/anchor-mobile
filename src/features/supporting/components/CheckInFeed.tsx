/**
 * =============================================================================
 * CHECK-IN FEED
 * =============================================================================
 *
 * Activity feed showing check-ins for a supported commitment.
 * Displays date, status, and quick reaction summary.
 * Tap to expand for full detail view.
 */

import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { SupportedCheckIn } from '@api/types';
import { haptics } from '@/shared/utils/haptics.utils';
import { Icon } from '@shared/components/ui/Icon';
import i18n from '@i18n/index';

interface CheckInFeedProps {
  commitmentId: string;
  checkIns: SupportedCheckIn[];
  onSeeAll?: () => void;
  maxItems?: number;
}

const STATUS_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  COMPLETED: {
    icon: 'checkmark-circle',
    color: '#2D5A4A',
    bg: '#D1FAE5',
  },
  SKIPPED: {
    icon: 'close-circle',
    color: '#78716C',
    bg: '#F3F4F6',
  },
  MISSED: {
    icon: 'alert-circle',
    color: '#B54548',
    bg: '#FEE2E2',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return i18n.t('common:today');
  if (diffDays === 1) return i18n.t('common:yesterday');
  if (diffDays < 7) return i18n.t('common:daysAgo', { count: diffDays });

  return date.toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface CheckInItemProps {
  checkIn: SupportedCheckIn;
  commitmentId: string;
  index: number;
}

function CheckInItem({ checkIn, commitmentId, index }: CheckInItemProps) {
  const router = useRouter();
  const { t } = useTranslation('supporting');

  const statusStyle = STATUS_STYLES[checkIn.status] || STATUS_STYLES.MISSED;

  const handlePress = () => {
    haptics.light();
    router.push(
      `/(main)/supporting/${commitmentId}/check-ins/${checkIn.id}` as const
    );
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <Pressable onPress={handlePress} style={styles.checkInItem}>
        <View
          style={[
            styles.statusIconContainer,
            { backgroundColor: statusStyle.bg },
          ]}
        >
          <Icon name={statusStyle.icon} size="sm" color={statusStyle.color} />
        </View>

        <View style={styles.checkInContent}>
          <View style={styles.checkInHeader}>
            <Text style={styles.checkInDate}>
              {formatDate(checkIn.checkInDate)}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {t(`checkIn.status_${checkIn.status.toLowerCase() as 'completed' | 'skipped' | 'missed'}`)}
              </Text>
            </View>
          </View>

          {checkIn.notes && (
            <Text style={styles.notesPreview} numberOfLines={1}>
              {checkIn.notes}
            </Text>
          )}
        </View>

        <Icon name="chevron-forward" size="sm" color="#A8A29E" />
      </Pressable>
    </Animated.View>
  );
}

export function CheckInFeed({
  commitmentId,
  checkIns,
  onSeeAll,
  maxItems = 7,
}: CheckInFeedProps) {
  const { t } = useTranslation('supporting');

  const displayCheckIns = checkIns.slice(0, maxItems);
  const hasMore = checkIns.length > maxItems;

  if (checkIns.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Icon name="calendar-outline" size="xl" color="#A8A29E" />
        </View>
        <Text style={styles.emptyTitle}>{t('checkIn.noCheckIns')}</Text>
        <Text style={styles.emptySubtitle}>{t('checkIn.noCheckInsSubtitle')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('checkIn.recentActivity')}</Text>
        {hasMore && onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>{t('checkIn.seeAll')}</Text>
            <Icon name="chevron-forward" size="xs" color="#4A7C8C" />
          </Pressable>
        )}
      </View>

      {displayCheckIns.map((checkIn, index) => (
        <CheckInItem
          key={checkIn.id}
          checkIn={checkIn}
          commitmentId={commitmentId}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: '#1C1917',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#4A7C8C',
  },
  checkInItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkInContent: {
    flex: 1,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  checkInDate: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  notesPreview: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#57534E',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
    textAlign: 'center',
  },
});
