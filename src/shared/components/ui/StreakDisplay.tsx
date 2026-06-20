import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from './Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium color palette for streaks
const STREAK_COLORS = {
  // Base flame colors by tier
  starter: { primary: '#D4A574', secondary: '#B87333', glow: 'rgba(212, 165, 116, 0.3)' },
  bronze: { primary: '#CD7F32', secondary: '#8B4513', glow: 'rgba(205, 127, 50, 0.4)' },
  silver: { primary: '#C0C0C0', secondary: '#A8A8A8', glow: 'rgba(192, 192, 192, 0.4)' },
  gold: { primary: '#FFD700', secondary: '#DAA520', glow: 'rgba(255, 215, 0, 0.5)' },
  platinum: { primary: '#E5E4E2', secondary: '#BCC6CC', glow: 'rgba(229, 228, 226, 0.5)' },
  diamond: { primary: '#B9F2FF', secondary: '#87CEEB', glow: 'rgba(185, 242, 255, 0.6)' },
  // Ember particle colors
  embers: ['#FF6B35', '#FF9500', '#FFD700', '#D4A574', '#B87333'],
};

// Milestone definitions with premium styling
const MILESTONES = [
  { threshold: 365, label: '1 Year', icon: 'diamond', tier: 'diamond' as const },
  { threshold: 100, label: '100 Days', icon: 'medal', tier: 'platinum' as const },
  { threshold: 30, label: '30 Days', icon: 'ribbon', tier: 'gold' as const },
  { threshold: 14, label: '2 Weeks', icon: 'star', tier: 'silver' as const },
  { threshold: 7, label: '1 Week', icon: 'shield-checkmark', tier: 'bronze' as const },
];

export interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  showFlame?: boolean;
  size?: 'compact' | 'full';
  animated?: boolean;
  showParticles?: boolean;
  className?: string;
}

// Ember particle component
interface EmberParticle {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

function EmberParticleComponent({
  particle,
  isActive,
}: {
  particle: EmberParticle;
  isActive: boolean;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(particle.startX);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Floating up animation
      translateY.value = withDelay(
        particle.delay,
        withRepeat(
          withSequence(
            withTiming(-60, { duration: particle.duration, easing: Easing.out(Easing.ease) }),
            withTiming(0, { duration: 0 })
          ),
          -1,
          false
        )
      );

      // Horizontal drift
      translateX.value = withDelay(
        particle.delay,
        withRepeat(
          withSequence(
            withTiming(particle.startX + (Math.random() - 0.5) * 20, {
              duration: particle.duration / 2,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(particle.startX + (Math.random() - 0.5) * 20, {
              duration: particle.duration / 2,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        )
      );

      // Fade in/out
      opacity.value = withDelay(
        particle.delay,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: particle.duration * 0.2 }),
            withTiming(0.6, { duration: particle.duration * 0.5 }),
            withTiming(0, { duration: particle.duration * 0.3 })
          ),
          -1,
          false
        )
      );

      // Scale animation
      scale.value = withDelay(
        particle.delay,
        withRepeat(
          withSequence(
            withSpring(1, { damping: 8 }),
            withTiming(0.3, { duration: particle.duration * 0.8 })
          ),
          -1,
          false
        )
      );
    }
  }, [isActive, particle, translateY, translateX, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ember,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

// Generate ember particles based on streak level
function generateEmbers(streak: number): EmberParticle[] {
  const particleCount = Math.min(Math.floor(streak / 3) + 2, 12);
  return Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    startX: (Math.random() - 0.5) * 30,
    delay: Math.random() * 1500,
    duration: 1500 + Math.random() * 1000,
    size: 3 + Math.random() * 4,
    color: STREAK_COLORS.embers[Math.floor(Math.random() * STREAK_COLORS.embers.length)],
  }));
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  showFlame = true,
  size = 'full',
  animated = true,
  showParticles = true,
  className = '',
}: StreakDisplayProps) {
  const flameScale = useSharedValue(1);
  const flameRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  const embers = useMemo(() => generateEmbers(currentStreak), [currentStreak]);

  const getStreakTier = () => {
    if (currentStreak >= 365) return STREAK_COLORS.diamond;
    if (currentStreak >= 100) return STREAK_COLORS.platinum;
    if (currentStreak >= 30) return STREAK_COLORS.gold;
    if (currentStreak >= 14) return STREAK_COLORS.silver;
    if (currentStreak >= 7) return STREAK_COLORS.bronze;
    return STREAK_COLORS.starter;
  };

  const tierColors = getStreakTier();

  useEffect(() => {
    if (animated && showFlame && currentStreak > 0) {
      // Enhanced pulsing scale animation
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(1, { duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1) })
        ),
        -1,
        true
      );

      // Organic rotation animation
      flameRotate.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Glow pulse animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated, showFlame, currentStreak, flameScale, flameRotate, glowOpacity, glowScale]);

  const flameAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scale: flameScale.value },
        { rotateZ: flameRotate.value + 'deg' },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const isCompact = size === 'compact';

  if (isCompact) {
    return (
      <View className={`flex-row items-center ${className}`}>
        {showFlame && currentStreak > 0 && (
          <Animated.View style={flameAnimatedStyle}>
            <Icon name="flame" size="sm" color={tierColors.primary} />
          </Animated.View>
        )}
        <Text style={[styles.compactValue, { color: tierColors.primary }]}>
          {currentStreak}
        </Text>
      </View>
    );
  }

  return (
    <View className={className} style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAF9']}
        style={styles.gradientContainer}
      >
        {/* Main content */}
        <View style={styles.header}>
          {showFlame && currentStreak > 0 ? (
            <View style={styles.flameWrapper}>
              {/* Glow effect */}
              <Animated.View
                style={[
                  styles.flameGlow,
                  { backgroundColor: tierColors.glow },
                  glowAnimatedStyle,
                ]}
              />

              {/* Ember particles */}
              {showParticles && animated && currentStreak >= 3 && (
                <View style={styles.emberContainer}>
                  {embers.map((ember) => (
                    <EmberParticleComponent
                      key={ember.id}
                      particle={ember}
                      isActive={animated}
                    />
                  ))}
                </View>
              )}

              {/* Main flame icon */}
              <Animated.View style={[styles.flameContainer, flameAnimatedStyle]}>
                <Icon name="flame" size="xl" color={tierColors.primary} />
              </Animated.View>
            </View>
          ) : (
            <View style={[styles.flameContainer, styles.flameDisabled]}>
              <Icon name="flame-outline" size="xl" color="#A8A29E" />
            </View>
          )}

          <Animated.View entering={FadeInUp.delay(100)} style={styles.valueContainer}>
            <Text style={[styles.value, { color: currentStreak > 0 ? '#1C1917' : '#78716C' }]}>
              {currentStreak}
            </Text>
            <Text style={styles.label}>
              {currentStreak === 1 ? 'day streak' : 'day streak'}
            </Text>
          </Animated.View>
        </View>

        {longestStreak !== undefined && longestStreak > 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.footer}>
            <View style={styles.trophyContainer}>
              <Icon name="trophy" size="sm" color="#D4A574" />
            </View>
            <Text style={styles.longestStreak}>
              Personal best: {longestStreak} days
            </Text>
          </Animated.View>
        )}

        {currentStreak >= 7 && (
          <View style={styles.milestone}>
            <StreakMilestoneBadge streak={currentStreak} />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

// Premium milestone badge component
function StreakMilestoneBadge({ streak }: { streak: number }) {
  const milestone = MILESTONES.find((m) => streak >= m.threshold);
  if (!milestone) return null;

  const colors = STREAK_COLORS[milestone.tier];

  return (
    <Animated.View
      entering={FadeIn.delay(300)}
      style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}
    >
      <Icon name={milestone.icon} size="xs" color={colors.primary} />
      <Text style={[styles.badgeText, { color: colors.primary }]}>
        {milestone.label}
      </Text>
    </Animated.View>
  );
}

// Premium inline streak badge for lists
export function StreakBadge({
  streak,
  variant = 'default',
  className = '',
}: {
  streak: number;
  variant?: 'default' | 'light' | 'solid';
  className?: string;
}) {
  if (streak === 0) return null;

  const getColors = () => {
    if (streak >= 30) return STREAK_COLORS.gold;
    if (streak >= 14) return STREAK_COLORS.silver;
    if (streak >= 7) return STREAK_COLORS.bronze;
    return STREAK_COLORS.starter;
  };

  const colors = getColors();

  const getBadgeStyle = () => {
    switch (variant) {
      case 'light':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'solid':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      default:
        return {
          backgroundColor: `${colors.primary}15`,
          borderColor: `${colors.primary}30`,
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View
      className={className}
      style={[
        styles.inlineBadge,
        {
          backgroundColor: badgeStyle.backgroundColor,
          borderColor: badgeStyle.borderColor,
        },
      ]}
    >
      <Icon
        name="flame"
        size="xs"
        color={variant === 'solid' ? '#FFFFFF' : colors.primary}
      />
      <Text
        style={[
          styles.inlineBadgeText,
          { color: variant === 'solid' ? '#FFFFFF' : colors.primary },
        ]}
      >
        {streak}
      </Text>
    </View>
  );
}

// Compact streak counter for headers
export function StreakCounter({
  streak,
  showLabel = false,
  className = '',
}: {
  streak: number;
  showLabel?: boolean;
  className?: string;
}) {
  const flameScale = useSharedValue(1);

  useEffect(() => {
    if (streak > 0) {
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [streak, flameScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const colors =
    streak >= 30
      ? STREAK_COLORS.gold
      : streak >= 7
      ? STREAK_COLORS.bronze
      : STREAK_COLORS.starter;

  return (
    <View className={`flex-row items-center ${className}`} style={styles.counterContainer}>
      <Animated.View style={animatedStyle}>
        <Icon name="flame" size="md" color={colors.primary} />
      </Animated.View>
      <View style={styles.counterTextContainer}>
        <Text style={[styles.counterValue, { color: colors.primary }]}>{streak}</Text>
        {showLabel && <Text style={styles.counterLabel}>streak</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  gradientContainer: {
    padding: 20,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  flameGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  emberContainer: {
    position: 'absolute',
    width: 60,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ember: {
    position: 'absolute',
    bottom: 20,
  },
  flameContainer: {
    zIndex: 1,
  },
  flameDisabled: {
    opacity: 0.4,
    marginRight: 16,
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontSize: 36,
    fontFamily: 'Fraunces_700Bold',
    lineHeight: 42,
    letterSpacing: -1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#78716C',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    gap: 10,
  },
  trophyContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  longestStreak: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#57534E',
  },
  milestone: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.3,
  },
  compactValue: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginLeft: 4,
  },
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  inlineBadgeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.2,
  },
  counterContainer: {
    gap: 6,
  },
  counterTextContainer: {
    alignItems: 'flex-start',
  },
  counterValue: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 24,
  },
  counterLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#78716C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
