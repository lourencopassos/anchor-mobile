import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  withTiming,
  interpolate,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import type { Commitment, TemplateType } from '@api/types';
import { haptics } from '@/shared/utils/haptics.utils';
import { Icon } from '@shared/components/ui/Icon';
import { ProgressRing } from '@shared/components/ui/ProgressRing';
import { StreakBadge } from '@shared/components/ui/StreakDisplay';
import { NoiseOverlay } from '@shared/components/ui/NoiseTexture';
import { ConfettiCelebration, ConfettiCelebrationRef } from '@shared/components/ui/ConfettiCelebration';
import { formatCurrency } from '@/shared/utils/format.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TodaysFocusCardProps {
  commitment: Commitment;
  hasCheckedIn: boolean;
  progress: number;
  daysRemaining: number;
  streak: number;
  onCheckIn?: () => void;
}

// Premium color palette
const COLORS = {
  forest: ['#2D5A4A', '#11261E'] as const,
  sage: ['#4D8670', '#2D5A4A'] as const,
  warm: ['#D4A574', '#B87333'] as const,
  danger: ['#B54548', '#7F2F32'] as const,
};

const TEMPLATE_ICONS: Record<TemplateType, string> = {
  QUIT_SMOKING: 'ban-outline',
  EXERCISE: 'barbell-outline',
  MEDITATION: 'leaf-outline',
  DIET: 'nutrition-outline',
  SLEEP: 'moon-outline',
  CUSTOM: 'sparkles-outline',
};

const TEMPLATE_LABELS: Record<
  TemplateType,
  | 'templates.quit_smoking'
  | 'templates.exercise'
  | 'templates.meditation'
  | 'templates.diet'
  | 'templates.sleep'
  | 'templates.custom'
> = {
  QUIT_SMOKING: 'templates.quit_smoking',
  EXERCISE: 'templates.exercise',
  MEDITATION: 'templates.meditation',
  DIET: 'templates.diet',
  SLEEP: 'templates.sleep',
  CUSTOM: 'templates.custom',
};

export function TodaysFocusCard({
  commitment,
  hasCheckedIn,
  progress,
  daysRemaining,
  streak,
  onCheckIn,
}: TodaysFocusCardProps) {
  const router = useRouter();
  const { t } = useTranslation('commitments');
  const { t: tHome } = useTranslation('home');
  const confettiRef = useRef<ConfettiCelebrationRef>(null);

  // Animation values
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(hasCheckedIn ? 1 : 0);
  const buttonGlow = useSharedValue(0);
  const decorRotation = useSharedValue(0);

  // Subtle glow animation for check-in button
  React.useEffect(() => {
    if (!hasCheckedIn) {
      buttonGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      buttonGlow.value = 0;
    }
  }, [hasCheckedIn, buttonGlow]);

  // Slow rotation for decorative element
  React.useEffect(() => {
    decorRotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );
  }, [decorRotation]);

  // Animate checkmark when checked in
  React.useEffect(() => {
    checkmarkScale.value = withSpring(hasCheckedIn ? 1 : 0, { damping: 12 });
  }, [hasCheckedIn, checkmarkScale]);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const handlePress = () => {
    router.push(`/(main)/commitments/${commitment.id}` as const);
  };

  const handleCheckIn = () => {
    haptics.heavy();
    confettiRef.current?.play();
    onCheckIn?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(buttonGlow.value, [0, 1], [0.2, 0.5]),
    transform: [{ scale: interpolate(buttonGlow.value, [0, 1], [1, 1.02]) }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const decorStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotateZ: decorRotation.value + 'deg' }],
    };
  });

  // Determine gradient colors based on progress
  const getGradientColors = (): readonly [string, string] => {
    if (hasCheckedIn) return COLORS.forest;
    if (progress >= 80) return COLORS.forest;
    if (progress >= 60) return COLORS.sage;
    if (progress >= 40) return COLORS.warm;
    return COLORS.danger;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <LinearGradient
        colors={[...getGradientColors()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Noise texture overlay */}
        <NoiseOverlay intensity="subtle" />

        {/* Header with overline */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.overlineContainer}>
              <Text style={styles.overlineText}>{tHome('todaysFocusLabel')}</Text>
              <View style={styles.overlineLine} />
            </View>
            <Text style={styles.title}>
              {t(TEMPLATE_LABELS[commitment.templateType])}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {hasCheckedIn ? (
              <Animated.View style={[styles.checkedBadge, checkmarkStyle]}>
                <Icon name="checkmark-circle" size="sm" color="#FFFFFF" />
                <Text style={styles.checkedText}>{tHome('checkedIn')}</Text>
              </Animated.View>
            ) : (
              streak > 0 && <StreakBadge streak={streak} />
            )}
          </View>
        </Animated.View>

        {/* Progress Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.progressSection}>
          <View style={styles.progressRingContainer}>
            <ProgressRing
              progress={progress}
              size="lg"
              color="#FFFFFF"
              backgroundColor="rgba(255, 255, 255, 0.2)"
            />
          </View>
          <View style={styles.progressInfo}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar-outline" size="sm" color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.infoText}>
                {t('detail.daysRemaining', { count: daysRemaining })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="wallet-outline" size="sm" color="#D4A574" />
              </View>
              <Text style={styles.infoTextHighlight}>
                {formatCurrency(commitment.stakeAmountCents ?? 0)} {t('common.staked')}
              </Text>
            </View>
            {streak > 0 && !hasCheckedIn && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon name="flame" size="sm" color="#D4A574" />
                </View>
                <Text style={styles.infoText}>
                  {tHome('keepStreak', { count: streak })}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Action Button */}
        {!hasCheckedIn && onCheckIn && (
          <Animated.View entering={FadeInDown.delay(300)} style={[styles.buttonWrapper, buttonGlowStyle]}>
            <Pressable
              onPress={handleCheckIn}
              style={styles.checkInButton}
            >
              <Icon name="checkmark-circle" size="md" color="#2D5A4A" />
              <Text style={styles.checkInButtonText}>{t('detail.checkIn')}</Text>
            </Pressable>
          </Animated.View>
        )}

        {hasCheckedIn && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.completedSection}>
            <View style={styles.completedBadge}>
              <Icon name="sparkles" size="sm" color="#D4A574" />
              <Text style={styles.completedText}>{tHome('greatJob')}</Text>
            </View>
          </Animated.View>
        )}

        {/* Decorative Elements */}
        <View style={styles.decorContainer}>
          <Animated.View style={[styles.decorCircle, decorStyle]}>
            <View style={styles.decorCircleInner} />
          </Animated.View>
        </View>

        <View style={styles.iconOverlay}>
          <Icon
            name={TEMPLATE_ICONS[commitment.templateType]}
            size="xl"
            color="rgba(255, 255, 255, 0.08)"
          />
        </View>
      </LinearGradient>

      {/* Confetti celebration on check-in */}
      <ConfettiCelebration ref={confettiRef} pieceCount={40} duration={2000} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#2D5A4A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 20,
  },
  gradient: {
    padding: 24,
    borderRadius: 24,
    minHeight: 220,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  overlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overlineText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    marginRight: 12,
  },
  overlineLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Fraunces_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  checkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.3,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  progressRingContainer: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 60,
  },
  progressInfo: {
    flex: 1,
    marginLeft: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    letterSpacing: 0.2,
  },
  infoTextHighlight: {
    color: '#D4A574',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.2,
  },
  buttonWrapper: {
    zIndex: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 10,
  },
  checkInButtonText: {
    color: '#2D5A4A',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.3,
  },
  completedSection: {
    alignItems: 'center',
    zIndex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.3,
  },
  decorContainer: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
  },
  decorCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconOverlay: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});
