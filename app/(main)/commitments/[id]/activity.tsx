import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { SupporterActivityFeed } from '@/features/supporters/components';
import { SupporterActivityType } from '@api/types';
import type { SupporterActivity } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

type FilterType = 'all' | SupporterActivityType;

interface FilterTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function FilterTab({ label, isActive, onPress }: FilterTabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterTab, isActive && styles.filterTabActive]}
    >
      <Text
        style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
        className={isActive ? 'text-primary-700' : 'text-neutral-600'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Supporter activity screen for commitment owners.
 * Shows reactions, comments, and verifications from supporters.
 */
export default function ActivityScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('supporters');

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/(main)/commitments/${id}`);
    }
  }, [router, id]);

  const handleActivityPress = (activity: SupporterActivity) => {
    // Navigate to check-in detail if the activity is tied to a check-in
    if (activity.checkInId) {
      // For now, we don't have a dedicated check-in detail screen for owners
      // Could be enhanced later to show the check-in with all reactions/comments
    }
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('activity.filters.all') },
    { key: SupporterActivityType.REACTION, label: t('activity.filters.reactions') },
    { key: SupporterActivityType.COMMENT, label: t('activity.filters.comments') },
    { key: SupporterActivityType.VERIFICATION, label: t('activity.filters.verifications') },
  ];

  return (
    <SafeScreen>
      <Header title={t('activity.title')} showBack onBackPress={handleBack} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <FilterTab
            key={option.key}
            label={option.label}
            isActive={activeFilter === option.key}
            onPress={() => setActiveFilter(option.key)}
          />
        ))}
      </View>

      {/* Activity Feed */}
      <View style={styles.feedContainer}>
        <SupporterActivityFeed
          commitmentId={id!}
          typeFilter={activeFilter === 'all' ? undefined : activeFilter}
          onActivityPress={handleActivityPress}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#DBEAFE',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterTabTextActive: {
    fontWeight: '600',
  },
  feedContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});
