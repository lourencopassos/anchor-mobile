/**
 * =============================================================================
 * SUPPORT NETWORK SECTION
 * =============================================================================
 *
 * Horizontal scroll of people the user is supporting.
 * Each mini-card shows avatar, name, and progress ring.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Icon } from '@shared/components/ui/Icon';
import { Avatar } from '@shared/components/ui/Avatar';
import { haptics } from '@/shared/utils/haptics.utils';
import type { SupportedCommitment } from '@api/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Design tokens
const COLORS = {
  primary: '#2D5A4A',
  primaryLight: '#4D8670',
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    muted: '#78716C',
  },
  progress: {
    track: '#E5E7EB',
    active: '#2D5A4A',
    completed: '#4D8670',
  },
};

interface SupportNetworkSectionProps {
  commitments: SupportedCommitment[];
  onSeeAll?: () => void;
}

export function SupportNetworkSection({
  commitments,
  onSeeAll,
}: SupportNetworkSectionProps) {
  const router = useRouter();
  const { t } = useTranslation('home');

  const handleCardPress = (commitmentId: string) => {
    haptics.light();
    router.push(`/(main)/supporting/${commitmentId}` as const);
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
  if (commitments.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('community.supporting')}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="people-outline" size="lg" color={COLORS.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>{t('community.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('community.emptySubtitle')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('community.supporting')}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{commitments.length}</Text>
          </View>
        </View>
        <Pressable onPress={handleSeeAll} hitSlop={8} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>{t('actions.seeAll')}</Text>
          <Icon name="chevron-forward" size="xs" color={COLORS.primary} />
        </Pressable>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={92} // card width + gap
      >
        {commitments.map((commitment, index) => (
          <Animated.View
            key={commitment.id}
            entering={FadeInRight.delay(index * 50).springify()}
          >
            <SupportMiniCard
              commitment={commitment}
              onPress={() => handleCardPress(commitment.id)}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

interface SupportMiniCardProps {
  commitment: SupportedCommitment;
  onPress: () => void;
}

function SupportMiniCard({ commitment, onPress }: SupportMiniCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Extract first name
  const firstName = commitment.ownerDisplayName?.split(' ')[0] || 'User';

  // Calculate progress percentage
  const progress = commitment.progress || 0;

  // Status indicator color
  const getStatusColor = () => {
    if (commitment.state === 'COMPLETED') return COLORS.progress.completed;
    return COLORS.progress.active;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      {/* Avatar with Progress Ring */}
      <View style={styles.avatarContainer}>
        <ProgressRing progress={progress} color={getStatusColor()} />
        <View style={styles.avatarInner}>
          <Avatar
            name={commitment.ownerDisplayName}
            source={commitment.ownerAvatarUrl}
            size="sm"
          />
        </View>
      </View>

      {/* Name */}
      <Text style={styles.cardName} numberOfLines={1}>
        {firstName}
      </Text>
    </AnimatedPressable>
  );
}

interface ProgressRingProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({
  progress,
  color,
  size = 48,
  strokeWidth = 2.5,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Clamp progress to 0-100 range
  const clampedProgress = Math.min(100, Math.max(0, progress || 0));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={styles.progressRing}
    >
      {/* Background track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={COLORS.progress.track}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress arc */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
  },
  countBadge: {
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.primary,
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
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  avatarContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressRing: {
    position: 'absolute',
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardName: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 76,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(120, 113, 108, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.text.muted,
    textAlign: 'center',
    maxWidth: 240,
  },
});
