import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { haptics } from '@/shared/utils/haptics.utils';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { useHomeData } from '@/features/home/hooks/useHomeData';
import { useCommunityData } from '@/features/home/hooks/useCommunityData';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { TodaysFocusCard } from '@/features/commitments/components/TodaysFocusCard';
import { CommitmentCard } from '@/features/commitments/components/CommitmentCard';
import { PendingCommitmentCard } from '@/features/commitments/components/PendingCommitmentCard';
import { SupportNetworkSection } from '@/features/home/components/SupportNetworkSection';
import { PendingInviteCard } from '@/features/home/components/PendingInviteCard';
import { NetworkActivityFeed } from '@/features/home/components/NetworkActivityFeed';
import { ReturnUserHero } from '@/features/home/components/ReturnUserHero';
import { Icon } from '@/shared/components/ui/Icon';
import { StatCard, StatsRow } from '@/shared/components/ui/StatCard';
import { SkeletonCard, SkeletonStats, SkeletonListItem } from '@/shared/components/ui/Skeleton';
import { GradientCard } from '@/shared/components/ui/GradientCard';
import { MeshGradient } from '@/shared/components/ui/MeshGradient';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Premium color palette
const COLORS = {
  primary: '#2D5A4A',
  primaryLight: '#4D8670',
  accent: {
    warm: '#D4A574',
    copper: '#B87333',
    sage: '#87A878',
  },
  success: '#2D5A4A',
  warning: '#D4A574',
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    muted: '#78716C',
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('home');
  const { t: tCommitments } = useTranslation('commitments');
  const {
    user,
    greeting,
    stats,
    activeCommitments,
    pendingCommitments,
    todaysFocus,
    unreadNotifications,
    isLoading,
    refetch,
  } = useHomeData();

  const {
    activeSupporting,
    pendingInvites,
    recentActivity,
    isLoading: isCommunityLoading,
    refetch: refetchCommunity,
  } = useCommunityData();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    refetch();
    refetchCommunity();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refetch, refetchCommunity]);

  // Determine the view type based on user state
  // Wait for BOTH data sources to avoid view-type switching mid-render
  const viewType = useMemo(() => {
    if (isLoading || isCommunityLoading) return 'loading';

    const hasNoOwnCommitments =
      activeCommitments.length === 0 &&
      pendingCommitments.length === 0;

    // Brand new user with no history and no community ties
    if (hasNoOwnCommitments && stats.completedCommitments === 0 && pendingInvites.length === 0 && activeSupporting.length === 0) {
      return 'onboarding';
    }

    // User has pending invites but no own commitments
    if (hasNoOwnCommitments && stats.completedCommitments === 0 && pendingInvites.length > 0) {
      return 'invites-focused';
    }

    // Return user - has completed but no active
    if (activeCommitments.length === 0 && pendingCommitments.length === 0 && stats.completedCommitments > 0) {
      return 'return-user';
    }

    // Active user with commitments
    return 'dashboard';
  }, [isLoading, isCommunityLoading, activeCommitments, pendingCommitments, stats.completedCommitments, pendingInvites, activeSupporting]);

  const handleCreateCommitment = () => {
    haptics.medium();
    router.push('/(main)/commitments/create');
  };

  const handleCheckIn = (commitmentId: string) => {
    router.push(`/(main)/commitments/${commitmentId}/check-in` as const);
  };

  // Loading state — separate return since it shows skeleton header
  if (viewType === 'loading') {
    return (
      <SafeScreen>
        <View style={styles.headerSkeleton}>
          <View style={styles.headerSkeletonLeft}>
            <SkeletonListItem showAvatar />
          </View>
        </View>
        <SkeletonCard style={{ marginBottom: 16 }} />
        <SkeletonStats count={3} />
        <SkeletonCard style={{ marginTop: 16 }} />
        <SkeletonCard style={{ marginTop: 12 }} />
      </SafeScreen>
    );
  }

  // Shared render tree for all non-loading states.
  // HomeHeader, SafeScreen, and ScrollView stay mounted across viewType changes,
  // preventing animation re-entry and component remounting.
  return (
    <SafeScreen>
      <HomeHeader
        firstName={user?.firstName || 'User'}
        lastName={user?.lastName || ''}
        greeting={greeting}
        unreadCount={unreadNotifications}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          viewType === 'onboarding' ? styles.emptyContainer : styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Onboarding: brand new user ── */}
        {viewType === 'onboarding' && (
          <>
            <Animated.View entering={FadeInUp.delay(200)} style={styles.emptyContent}>
              <View style={styles.emptyIllustration}>
                <MeshGradient preset="forest" style={styles.emptyGradient} />
                <View style={styles.emptyIconRing}>
                  <View style={styles.emptyIconInner}>
                    <Icon name="rocket-outline" size="xl" color={COLORS.primary} />
                  </View>
                </View>
              </View>

              <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
              <Text style={styles.emptySubtitle}>{t('empty.subtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400)} style={styles.emptyAction}>
              <CreateCommitmentButton onPress={handleCreateCommitment} label={t('empty.createFirst')} />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600)} style={styles.featuresContainer}>
              <FeatureHighlight
                icon="shield-checkmark-outline"
                title={t('features.stake.title')}
                description={t('features.stake.description')}
              />
              <FeatureHighlight
                icon="people-outline"
                title={t('features.partners.title')}
                description={t('features.partners.description')}
              />
              <FeatureHighlight
                icon="trending-up-outline"
                title={t('features.progress.title')}
                description={t('features.progress.description')}
              />
            </Animated.View>
          </>
        )}

        {/* ── Invites-focused: pending invites, no own commitments ── */}
        {viewType === 'invites-focused' && (
          <>
            <Animated.View entering={FadeInDown.delay(100)}>
              <SectionHeader
                title={t('invites.title')}
                icon="mail-outline"
                iconColor={COLORS.accent.warm}
              />
              {pendingInvites.map((commitment, index) => (
                <Animated.View
                  key={commitment.id}
                  entering={FadeInDown.delay(150 + index * 100)}
                >
                  <PendingInviteCard
                    commitment={commitment}
                    onAccepted={refetchCommunity}
                    onDeclined={refetchCommunity}
                  />
                </Animated.View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.emptyAction}>
              <CreateCommitmentButton onPress={handleCreateCommitment} label={t('empty.createFirst')} />
            </Animated.View>
          </>
        )}

        {/* ── Return user: completed commitments but no active ── */}
        {viewType === 'return-user' && (
          <>
            <Animated.View entering={FadeInDown.delay(100)}>
              <ReturnUserHero
                completedCount={stats.completedCommitments}
                successRate={stats.overallSuccessRate}
              />
            </Animated.View>

            {pendingInvites.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200)}>
                <SectionHeader
                  title={t('invites.title')}
                  icon="mail-outline"
                  iconColor={COLORS.accent.warm}
                />
                {pendingInvites.map((commitment, index) => (
                  <Animated.View
                    key={commitment.id}
                    entering={FadeInDown.delay(250 + index * 100)}
                  >
                    <PendingInviteCard
                      commitment={commitment}
                      onAccepted={refetchCommunity}
                      onDeclined={refetchCommunity}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {activeSupporting.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300)}>
                <SupportNetworkSection commitments={activeSupporting} />
              </Animated.View>
            )}

            {recentActivity.length > 0 && (
              <Animated.View entering={FadeInDown.delay(400)}>
                <NetworkActivityFeed activities={recentActivity} />
              </Animated.View>
            )}
          </>
        )}

        {/* ── Dashboard: active user with commitments ── */}
        {viewType === 'dashboard' && (
          <>
            {todaysFocus && (
              <Animated.View entering={FadeInDown.delay(100)}>
                <TodaysFocusCard
                  commitment={todaysFocus.commitment}
                  hasCheckedIn={todaysFocus.hasCheckedIn}
                  progress={todaysFocus.progress}
                  daysRemaining={todaysFocus.daysRemaining}
                  streak={todaysFocus.streak}
                  onCheckIn={() => handleCheckIn(todaysFocus.commitment.id)}
                />
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(200)}>
              <StatsRow
                stats={[
                  {
                    label: t('stats.activeCommitments'),
                    value: stats.activeCommitments,
                    icon: 'flag-outline',
                    iconColor: COLORS.primary,
                  },
                  {
                    label: t('stats.currentStreak'),
                    value: `${stats.currentStreak}d`,
                    icon: 'flame',
                    iconColor: COLORS.accent.copper,
                  },
                  {
                    label: t('stats.successRate'),
                    value: `${stats.overallSuccessRate}%`,
                    icon: 'trending-up',
                    iconColor: COLORS.primaryLight,
                  },
                ]}
                className="mb-6"
              />
            </Animated.View>

            {pendingCommitments.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300)}>
                <SectionHeader
                  title={tCommitments('pending.sectionTitle')}
                  icon="time-outline"
                  iconColor={COLORS.accent.warm}
                />
                {pendingCommitments.map((commitment, index) => (
                  <Animated.View
                    key={commitment.id}
                    entering={FadeInDown.delay(300 + index * 100)}
                  >
                    <PendingCommitmentCard commitment={commitment} />
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {activeCommitments.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(pendingCommitments.length > 0 ? 400 : 300)}
              >
                <SectionHeader
                  title={t('sections.activeCommitments')}
                  action={t('actions.seeAll')}
                  onAction={() => router.push('/(main)/commitments')}
                />
                {activeCommitments.slice(0, 3).map((commitment, index) => (
                  <Animated.View
                    key={commitment.id}
                    entering={FadeInDown.delay(
                      (pendingCommitments.length > 0 ? 400 : 300) + index * 100
                    )}
                  >
                    <CommitmentCard
                      commitment={commitment}
                      onCheckIn={() => handleCheckIn(commitment.id)}
                      streak={index === 0 ? stats.currentStreak : 0}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {pendingInvites.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(pendingCommitments.length > 0 ? 500 : 400)}
              >
                <SectionHeader
                  title={t('invites.title')}
                  icon="mail-outline"
                  iconColor={COLORS.accent.warm}
                />
                {pendingInvites.map((commitment, index) => (
                  <Animated.View
                    key={commitment.id}
                    entering={FadeInDown.delay(
                      (pendingCommitments.length > 0 ? 500 : 400) + 50 + index * 100
                    )}
                  >
                    <PendingInviteCard
                      commitment={commitment}
                      onAccepted={refetchCommunity}
                      onDeclined={refetchCommunity}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {activeSupporting.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(
                  (pendingCommitments.length > 0 ? 500 : 400) +
                  (pendingInvites.length > 0 ? 150 : 0) + 100
                )}
              >
                <SupportNetworkSection commitments={activeSupporting} />
              </Animated.View>
            )}

            {activeCommitments.length > 0 && activeCommitments.length < 3 && (
              <Animated.View entering={FadeInDown.delay(600)}>
                <AddCommitmentButton onPress={handleCreateCommitment} />
              </Animated.View>
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeScreen>
  );
}

// Premium section header component
function SectionHeader({
  title,
  icon,
  iconColor,
  action,
  onAction,
}: {
  title: string;
  icon?: string;
  iconColor?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        {icon && (
          <View style={[styles.sectionIcon, { backgroundColor: `${iconColor || COLORS.primary}15` }]}>
            <Icon name={icon} size="sm" color={iconColor || COLORS.primary} />
          </View>
        )}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>{action}</Text>
          <Icon name="chevron-forward" size="xs" color={COLORS.primary} />
        </Pressable>
      )}
    </View>
  );
}

// Premium create commitment button
function CreateCommitmentButton({ onPress, label }: { onPress: () => void; label: string }) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.createButton, animatedStyle]}
    >
      <LinearGradient
        colors={['#2D5A4A', '#1F4034']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.createButtonGradient}
      >
        <View style={styles.createButtonIconContainer}>
          <Icon name="add" size="lg" color="#FFFFFF" />
        </View>
        <Text style={styles.createButtonText}>{label}</Text>
        <Icon name="arrow-forward" size="md" color="rgba(255,255,255,0.7)" />
      </LinearGradient>
    </AnimatedPressable>
  );
}

// Feature highlight for empty state
function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size="sm" color={COLORS.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Add more commitment button (dashed)
function AddCommitmentButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('home');
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.addMoreButton, animatedStyle]}
    >
      <View style={styles.addMoreIconContainer}>
        <Icon name="add" size="sm" color={COLORS.primary} />
      </View>
      <Text style={styles.addMoreText}>{t('actions.createAnother')}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSkeletonLeft: {
    flex: 1,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  emptyContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emptyGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  emptyIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(45, 90, 74, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontFamily: 'Fraunces_700Bold',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#57534E',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  emptyAction: {
    marginTop: 32,
  },

  // Create button styles
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2D5A4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 16,
  },
  createButtonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.2,
  },

  // Features styles
  featuresContainer: {
    marginTop: 40,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 90, 74, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },

  // Section header styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#1C1917',
    letterSpacing: -0.3,
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
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#2D5A4A',
  },

  // Add more button styles
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 2,
    borderColor: 'rgba(45, 90, 74, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(45, 90, 74, 0.03)',
  },
  addMoreIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#2D5A4A',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 80,
  },
});
