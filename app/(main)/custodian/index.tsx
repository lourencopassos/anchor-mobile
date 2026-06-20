import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
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
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import {
  useCustodianSummary,
  usePendingDeposits,
  usePendingSettlements,
} from '@/features/custodian/hooks';
import { DepositCard } from '@/features/custodian/components/DepositCard';
import { SettlementCard } from '@/features/custodian/components/SettlementCard';
import type { PendingDeposit, PendingSettlement } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

// Design tokens following "Trusted Guardian" aesthetic
const COLORS = {
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.12)',
  forest: '#2D5A4A',
  forestLight: 'rgba(45, 90, 74, 0.12)',
  warmGold: '#D4A574',
  cream: '#F5F0EB',
  neutral900: '#1C1917',
  neutral700: '#44403C',
  neutral600: '#57534E',
  neutral500: '#78716C',
  neutral400: '#A8A29E',
  neutral300: '#D6D3D1',
  neutral200: '#E7E5E4',
  neutral100: '#F5F5F4',
  white: '#FFFFFF',
};

type TabType = 'deposits' | 'settlements';

export default function CustodianInboxScreen() {
  useHideTabBar();
  const router = useRouter();
  const { t } = useTranslation('custodian');
  const [activeTab, setActiveTab] = useState<TabType>('deposits');

  const { data: summary } = useCustodianSummary();
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

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDeposits(), refetchSettlements()]);
    setRefreshing(false);
  }, [refetchDeposits, refetchSettlements]);

  const handleDepositPress = (deposit: PendingDeposit) => {
    router.push(`/(main)/custodian/deposits/${deposit.id}`);
  };

  const handleSettlementPress = (settlement: PendingSettlement) => {
    router.push(`/(main)/custodian/settlements/${settlement.id}`);
  };

  const renderDepositsTab = () => {
    if (!deposits || deposits.length === 0) {
      return (
        <EmptyState
          icon="💰"
          title={t('deposits.empty')}
          description={t('deposits.emptyDescription')}
        />
      );
    }

    return (
      <FlatList
        data={deposits}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <DepositCard deposit={item} onPress={() => handleDepositPress(item)} />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.copper}
          />
        }
      />
    );
  };

  const renderSettlementsTab = () => {
    if (!settlements || settlements.length === 0) {
      return (
        <EmptyState
          icon="📤"
          title={t('settlements.empty')}
          description={t('settlements.emptyDescription')}
        />
      );
    }

    return (
      <FlatList
        data={settlements}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <SettlementCard settlement={item} onPress={() => handleSettlementPress(item)} />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.copper}
          />
        }
      />
    );
  };

  return (
    <SafeScreen>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        {(summary?.totalPending ?? 0) > 0 && (
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>{summary?.totalPending}</Text>
          </View>
        )}
      </View>

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        depositsCount={summary?.pendingDeposits ?? 0}
        settlementsCount={summary?.pendingSettlements ?? 0}
      />

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'deposits' ? renderDepositsTab() : renderSettlementsTab()}
      </View>
    </SafeScreen>
  );
}

// Tab Bar Component
function TabBar({
  activeTab,
  onTabChange,
  depositsCount,
  settlementsCount,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  depositsCount: number;
  settlementsCount: number;
}) {
  const { t } = useTranslation('custodian');
  const indicatorPosition = useSharedValue(activeTab === 'deposits' ? 0 : 1);

  const handleTabPress = (tab: TabType) => {
    indicatorPosition.value = withSpring(tab === 'deposits' ? 0 : 1, {
      damping: 15,
      stiffness: 200,
    });
    onTabChange(tab);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          indicatorPosition.value,
          [0, 1],
          [0, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
    left: `${indicatorPosition.value * 50}%`,
  }));

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabContainer}>
        <Tab
          label={t('tabs.deposits')}
          count={depositsCount}
          isActive={activeTab === 'deposits'}
          onPress={() => handleTabPress('deposits')}
        />
        <Tab
          label={t('tabs.settlements')}
          count={settlementsCount}
          isActive={activeTab === 'settlements'}
          onPress={() => handleTabPress('settlements')}
        />
      </View>
      <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
    </View>
  );
}

// Tab Component
function Tab({
  label,
  count,
  isActive,
  onPress,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.tab, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12 });
        }}
        style={styles.tabPressable}
      >
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
              {count}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// Empty State Component
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyEmoji}>{icon}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: COLORS.neutral900,
  },
  summaryBadge: {
    backgroundColor: COLORS.copper,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  summaryBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: COLORS.white,
  },

  // Tab Bar
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral200,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
  },
  tabPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    color: COLORS.neutral500,
  },
  tabLabelActive: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.copper,
  },
  tabBadge: {
    backgroundColor: COLORS.neutral200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: COLORS.copperLight,
  },
  tabBadgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: COLORS.neutral600,
  },
  tabBadgeTextActive: {
    color: COLORS.copper,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 3,
    backgroundColor: COLORS.copper,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // Content
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    gap: 12,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: COLORS.neutral700,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.neutral500,
    textAlign: 'center',
  },
});
