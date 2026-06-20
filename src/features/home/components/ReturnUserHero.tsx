/**
 * =============================================================================
 * RETURN USER HERO
 * =============================================================================
 *
 * A celebratory hero card for users who have completed commitments
 * but don't currently have any active ones. Encourages them to start
 * a new commitment while acknowledging their past success.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@shared/components/ui/Icon';
import { haptics } from '@/shared/utils/haptics.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Design tokens - warm celebration palette
const COLORS = {
  primary: '#2D5A4A',
  trophy: '#F59E0B',
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    muted: '#78716C',
    white: '#FFFFFF',
  },
  gradient: {
    start: '#FEF7ED',
    end: '#FDF2E9',
  },
};

interface ReturnUserHeroProps {
  completedCount: number;
  successRate: number;
  onCreateNew?: () => void;
  onViewHistory?: () => void;
}

export function ReturnUserHero({
  completedCount,
  successRate,
  onCreateNew,
  onViewHistory,
}: ReturnUserHeroProps) {
  const router = useRouter();
  const { t } = useTranslation('home');

  const primaryScale = useSharedValue(1);

  const handlePressIn = () => {
    primaryScale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    primaryScale.value = withSpring(1, { damping: 12 });
  };

  const handleCreateNew = () => {
    haptics.medium();
    if (onCreateNew) {
      onCreateNew();
    } else {
      router.push('/(main)/commitments/new');
    }
  };

  const handleViewHistory = () => {
    haptics.light();
    if (onViewHistory) {
      onViewHistory();
    } else {
      router.push('/(main)/commitments');
    }
  };

  const animatedPrimaryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      style={styles.container}
    >
      <LinearGradient
        colors={[COLORS.gradient.start, COLORS.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Trophy Icon */}
        <View style={styles.trophyContainer}>
          <View style={styles.trophyGlow}>
            <Icon name="trophy" size="xl" color={COLORS.trophy} />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.content}>
          <Text style={styles.title}>{t('returnUser.title')}</Text>
          <Text style={styles.subtitle}>
            {t('returnUser.subtitle', { count: completedCount })}
          </Text>

          {/* Success Rate Badge */}
          {successRate > 0 && (
            <View style={styles.rateBadge}>
              <Icon name="star" size="xs" color={COLORS.trophy} />
              <Text style={styles.rateText}>
                {t('returnUser.successRate', { rate: Math.round(successRate) })}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AnimatedPressable
            onPress={handleCreateNew}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.primaryButton, animatedPrimaryStyle]}
          >
            <Icon name="add" size="sm" color={COLORS.text.white} />
            <Text style={styles.primaryButtonText}>
              {t('returnUser.createNew')}
            </Text>
          </AnimatedPressable>

          <Pressable onPress={handleViewHistory} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              {t('returnUser.viewHistory')}
            </Text>
            <Icon name="chevron-forward" size="xs" color={COLORS.primary} />
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 16,
  },
  rateText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.trophy,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.primary,
  },
});
