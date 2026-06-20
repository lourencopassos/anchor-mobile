import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { Icon } from '@/shared/components/ui/Icon';
import { Avatar } from '@/shared/components/ui/Avatar';
import { CommitmentCard } from '@/features/commitments/components/CommitmentCard';
import {
  useCommitments,
  filterCommitments,
} from '@/features/commitments/hooks/useCommitments';
import { useSupportedCommitments, useAcceptInvite, useDeclineInvite } from '@/features/supporting/hooks';
import { SupportedCommitmentCard } from '@/features/supporting/components';
import { PendingVerificationsSection } from '@/features/verification';
import {
  usePendingDeposits,
  usePendingSettlements,
  usePendingCount,
} from '@/features/custodian/hooks';
import { DepositCard, SettlementCard } from '@/features/custodian/components';
import { useAuthStore, selectUser } from '@/features/auth/stores/auth.store';
import { haptics } from '@/shared/utils/haptics.utils';
import type { SupportedCommitment, SupportedCommitmentFilter, PendingDeposit, PendingSettlement } from '@api/types';

// ── Types ──────────────────────────────────────────────────────────────────
type SegmentType = 'mine' | 'supporting' | 'custodian';
type CommitmentFilter = 'all' | 'active' | 'completed' | 'broken';
type SupportingFilter = 'all' | 'active' | 'completed';

interface SegmentConfig {
  key: SegmentType;
  label: string;
  icon: string;
  iconOutline: string;
  badge?: number;
}

interface FilterOption {
  key: CommitmentFilter;
  labelKey: 'filter.all' | 'filter.active' | 'filter.completed' | 'filter.broken';
}

const COMMITMENT_FILTERS: FilterOption[] = [
  { key: 'all', labelKey: 'filter.all' },
  { key: 'active', labelKey: 'filter.active' },
  { key: 'completed', labelKey: 'filter.completed' },
  { key: 'broken', labelKey: 'filter.broken' },
];

const SUPPORTING_FILTER_OPTIONS: SupportingFilter[] = ['all', 'active', 'completed'];

// ── Design tokens ──────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2D5A4A',
  primaryLight: 'rgba(45, 90, 74, 0.12)',
  teal: '#4A7C8C',
  tealLight: 'rgba(74, 124, 140, 0.12)',
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.15)',
  neutral900: '#1C1917',
  neutral500: '#78716C',
  neutral200: '#E7E5E4',
  neutral100: '#F5F5F4',
  white: '#FFFFFF',
};

const SPRING_CONFIG = { damping: 15, stiffness: 200 };

// ── Main Screen ────────────────────────────────────────────────────────────
export default function CommitmentsListScreen() {
  const router = useRouter();
  const { t } = useTranslation('commitments');
  const { t: tSupporting } = useTranslation('supporting');
  const user = useAuthStore(selectUser);

  const [segment, setSegment] = useState<SegmentType>('mine');
  const [commitmentFilter, setCommitmentFilter] = useState<CommitmentFilter>('all');
  const [supportingFilter, setSupportingFilter] = useState<SupportingFilter>('all');

  const pendingCount = usePendingCount();

  const handleCreateNew = () => {
    haptics.medium();
    router.push('/(main)/commitments/create' as const);
  };

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'User';

  const segments: SegmentConfig[] = [
    {
      key: 'mine',
      label: t('tabs.mine'),
      icon: 'flag',
      iconOutline: 'flag-outline',
    },
    {
      key: 'supporting',
      label: t('tabs.supporting'),
      icon: 'people',
      iconOutline: 'people-outline',
    },
    {
      key: 'custodian',
      label: t('tabs.custodian'),
      icon: 'shield-checkmark',
      iconOutline: 'shield-checkmark-outline',
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  return (
    <SafeScreen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/(main)/profile')} hitSlop={8}>
          <Avatar name={fullName} size="sm" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <Pressable
          onPress={handleCreateNew}
          style={styles.createButton}
          hitSlop={8}
        >
          <Icon name="add" size="md" color={COLORS.white} />
        </Pressable>
      </View>

      {/* Segmented Control */}
      <SegmentedControl
        segments={segments}
        activeSegment={segment}
        onSegmentChange={setSegment}
      />

      {/* Content */}
      {segment === 'mine' ? (
        <MineTab
          activeFilter={commitmentFilter}
          onFilterChange={setCommitmentFilter}
          onCreateNew={handleCreateNew}
        />
      ) : segment === 'supporting' ? (
        <SupportingTab
          activeFilter={supportingFilter}
          onFilterChange={setSupportingFilter}
        />
      ) : (
        <CustodianTab />
      )}
    </SafeScreen>
  );
}

// ── Segmented Control ──────────────────────────────────────────────────────
function SegmentedControl({
  segments,
  activeSegment,
  onSegmentChange,
}: {
  segments: SegmentConfig[];
  activeSegment: SegmentType;
  onSegmentChange: (segment: SegmentType) => void;
}) {
  const activeIndex = segments.findIndex((s) => s.key === activeSegment);
  const indicatorPosition = useSharedValue(activeIndex);
  const segmentCount = segments.length;

  const handleSegmentPress = (segment: SegmentConfig, index: number) => {
    haptics.light();
    indicatorPosition.value = withSpring(index, SPRING_CONFIG);
    onSegmentChange(segment.key);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: `${100 / segmentCount}%` as any,
    left: `${(indicatorPosition.value * 100) / segmentCount}%` as any,
  }));

  return (
    <View style={styles.segmentContainer}>
      <View style={styles.segmentTrack}>
        {/* Animated indicator */}
        <Animated.View style={[styles.segmentIndicator, indicatorStyle]} />

        {segments.map((seg, index) => (
          <Pressable
            key={seg.key}
            onPress={() => handleSegmentPress(seg, index)}
            style={styles.segmentButton}
          >
            <Icon
              name={activeSegment === seg.key ? seg.icon : seg.iconOutline}
              size="sm"
              color={activeSegment === seg.key ? COLORS.primary : COLORS.neutral500}
            />
            <Text
              style={[
                styles.segmentLabel,
                activeSegment === seg.key && styles.segmentLabelActive,
              ]}
              numberOfLines={1}
            >
              {seg.label}
            </Text>
            {seg.badge != null && seg.badge > 0 && (
              <View style={styles.segmentBadge}>
                <Text style={styles.segmentBadgeText}>{seg.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Mine Tab ───────────────────────────────────────────────────────────────
function MineTab({
  activeFilter,
  onFilterChange,
  onCreateNew,
}: {
  activeFilter: CommitmentFilter;
  onFilterChange: (filter: CommitmentFilter) => void;
  onCreateNew: () => void;
}) {
  const { t } = useTranslation('commitments');
  const router = useRouter();

  const { data: commitments, isLoading, refetch, isRefetching } = useCommitments();
  const filteredCommitments = filterCommitments(commitments, activeFilter);

  const handleCheckIn = (commitmentId: string) => {
    router.push({
      pathname: '/(main)/commitments/[id]/check-in',
      params: { id: commitmentId },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {COMMITMENT_FILTERS.map(({ key, labelKey }) => (
          <Pressable
            key={key}
            onPress={() => onFilterChange(key)}
            style={[
              styles.filterTab,
              activeFilter === key && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === key && styles.filterTextActive,
              ]}
            >
              {t(labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Commitment List */}
      {filteredCommitments.length === 0 ? (
        <EmptyState
          icon="📋"
          title={t('noCommitments')}
          description={t('startJourney')}
          action={
            <Button
              title={t('createNew')}
              onPress={onCreateNew}
              variant="primary"
            />
          }
        />
      ) : (
        <FlatList
          data={filteredCommitments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommitmentCard
              commitment={item}
              onCheckIn={
                item.state === 'ACTIVE'
                  ? () => handleCheckIn(item.id)
                  : undefined
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </>
  );
}

// ── Supporting Tab ─────────────────────────────────────────────────────────
function SupportingTab({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: SupportingFilter;
  onFilterChange: (filter: SupportingFilter) => void;
}) {
  const { t } = useTranslation('supporting');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useSupportedCommitments(
    activeFilter as SupportedCommitmentFilter
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

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }

  return (
    <>
      {/* Filter Tabs — matches My Commitments filter style */}
      <View style={styles.filterContainer}>
        {SUPPORTING_FILTER_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => onFilterChange(option)}
            style={[
              styles.filterTab,
              activeFilter === option && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === option && styles.filterTextActive,
              ]}
            >
              {t(`filters.${option}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Supporting List */}
      <FlatList
        data={data?.commitments ?? []}
        renderItem={({ item }: { item: SupportedCommitment }) => (
          <SupportedCommitmentCard
            commitment={item}
            onAcceptInvite={handleAcceptInvite}
            onDeclineInvite={handleDeclineInvite}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.teal}
          />
        }
        ListHeaderComponent={<PendingVerificationsSection maxItems={3} />}
        ListEmptyComponent={
          <Animated.View entering={FadeIn} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="people-outline" size="xl" color={COLORS.teal} />
            </View>
            <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
            <Text style={styles.emptySubtitle}>{t('empty.subtitle')}</Text>
          </Animated.View>
        }
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

// ── Custodian Tab ─────────────────────────────────────────────────────────
function CustodianTab() {
  const { t } = useTranslation('custodian');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: deposits,
    isLoading: depositsLoading,
    refetch: refetchDeposits,
  } = usePendingDeposits();
  const {
    data: settlements,
    isLoading: settlementsLoading,
    refetch: refetchSettlements,
  } = usePendingSettlements();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDeposits(), refetchSettlements()]);
    setRefreshing(false);
  }, [refetchDeposits, refetchSettlements]);

  const handleDepositPress = (deposit: PendingDeposit) => {
    router.push(`/(main)/custodian/deposits/${deposit.id}` as any);
  };

  const handleSettlementPress = (settlement: PendingSettlement) => {
    router.push(`/(main)/custodian/settlements/${settlement.id}` as any);
  };

  const isLoading = depositsLoading && settlementsLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  const hasDeposits = deposits && deposits.length > 0;
  const hasSettlements = settlements && settlements.length > 0;

  if (!hasDeposits && !hasSettlements) {
    return (
      <Animated.View entering={FadeIn} style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: COLORS.copperLight }]}>
          <Icon name="shield-checkmark-outline" size="xl" color={COLORS.copper} />
        </View>
        <Text style={styles.emptyTitle}>{t('deposits.empty')}</Text>
        <Text style={styles.emptySubtitle}>{t('deposits.emptyDescription')}</Text>
      </Animated.View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.copper}
        />
      }
    >
      {hasDeposits && (
        <>
          <Text style={styles.sectionTitle}>{t('tabs.deposits')}</Text>
          <View style={{ gap: 12 }}>
            {deposits!.map((deposit, index) => (
              <Animated.View key={deposit.id} entering={FadeInDown.delay(index * 50).duration(300)}>
                <DepositCard deposit={deposit} onPress={() => handleDepositPress(deposit)} />
              </Animated.View>
            ))}
          </View>
        </>
      )}
      {hasSettlements && (
        <>
          <Text style={[styles.sectionTitle, hasDeposits && { marginTop: 24 }]}>
            {t('tabs.settlements')}
          </Text>
          <View style={{ gap: 12 }}>
            {settlements!.map((settlement, index) => (
              <Animated.View key={settlement.id} entering={FadeInDown.delay(index * 50).duration(300)}>
                <SettlementCard settlement={settlement} onPress={() => handleSettlementPress(settlement)} />
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Fraunces_600SemiBold',
    color: COLORS.neutral900,
    letterSpacing: -0.5,
    marginHorizontal: 14,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Segmented Control
  segmentContainer: {
    marginBottom: 16,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral100,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  segmentIndicator: {
    position: 'absolute',
    top: 4,
    // width and left set dynamically via animated style
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.neutral500,
  },
  segmentLabelActive: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.primary,
  },
  segmentBadge: {
    backgroundColor: COLORS.copperLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center' as const,
  },
  segmentBadgeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.copper,
  },

  // Filters (Mine tab)
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.neutral100,
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.neutral500,
  },
  filterTextActive: {
    color: COLORS.primary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  // Shared
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 100, // Extra space for floating tab bar
    flexGrow: 1,
  },

  // Empty state (Supporting)
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
    backgroundColor: 'rgba(74, 124, 140, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.neutral900,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.neutral500,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Custodian tab
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.neutral900,
    marginBottom: 12,
  },
});
