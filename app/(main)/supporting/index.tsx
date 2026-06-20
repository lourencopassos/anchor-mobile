/**
 * =============================================================================
 * SUPPORTING TAB - MAIN SCREEN
 * =============================================================================
 *
 * List of commitments the user is supporting.
 * Shows filter chips (All | Active | Completed) and commitment cards.
 * Pull-to-refresh enabled.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { useSupportedCommitments, useAcceptInvite, useDeclineInvite } from '@/features/supporting/hooks';
import { SupportedCommitmentCard } from '@/features/supporting/components';
import { PendingVerificationsSection } from '@/features/verification';
import { Icon } from '@shared/components/ui/Icon';
import type { SupportedCommitment, SupportedCommitmentFilter } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

type FilterOption = 'all' | 'active' | 'completed';

const FILTER_OPTIONS: FilterOption[] = ['all', 'active', 'completed'];

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
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState() {
  const { t } = useTranslation('supporting');

  return (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="people-outline" size="xl" color="#4A7C8C" />
      </View>
      <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
      <Text style={styles.emptySubtitle}>{t('empty.subtitle')}</Text>
    </Animated.View>
  );
}

export default function SupportingScreen() {
  useHideTabBar();
  const { t } = useTranslation('supporting');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useSupportedCommitments(
    filter as SupportedCommitmentFilter
  );

  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAcceptInvite = useCallback((supporterId: string) => {
    acceptInvite.mutate(supporterId);
  }, [acceptInvite]);

  const handleDeclineInvite = useCallback((supporterId: string) => {
    declineInvite.mutate(supporterId);
  }, [declineInvite]);

  const renderItem = useCallback(
    ({ item }: { item: SupportedCommitment }) => (
      <SupportedCommitmentCard
        commitment={item}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
      />
    ),
    [handleAcceptInvite, handleDeclineInvite]
  );

  const keyExtractor = useCallback((item: SupportedCommitment) => item.id, []);

  if (isLoading && !data) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7C8C" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header title={t('title')} showBack />

      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => (
          <FilterTab
            key={option}
            label={t(`filters.${option}`)}
            isActive={filter === option}
            onPress={() => setFilter(option)}
          />
        ))}
      </View>

      <FlatList
        data={data?.commitments ?? []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4A7C8C"
          />
        }
        ListHeaderComponent={<PendingVerificationsSection maxItems={3} />}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F4',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    textAlign: 'center' as const,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#78716C',
  },
  filterTextActive: {
    color: '#2D5A4A',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  listContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A7C8C15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
  },
});
