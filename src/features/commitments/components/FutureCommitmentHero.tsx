import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { parseISO, differenceInDays, startOfDay } from 'date-fns';
import { formatDate } from '@/shared/utils/date.utils';

interface FutureCommitmentHeroProps {
  startDate: string;
  endDate: string;
}

const COLORS = {
  gradient: {
    start: '#EEF2FF',
    end: '#E0E7FF',
  },
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  accent: '#818CF8',
  text: {
    primary: '#1E1B4B',
    secondary: '#4338CA',
    muted: '#6366F1',
  },
};

function AnimatedHourglass() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 500 }),
        withTiming(-10, { duration: 1000 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.Text style={[styles.hourglassIcon, animatedStyle]}>
      ⏳
    </Animated.Text>
  );
}

function CountdownNumber({ count }: { count: number }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.countdownNumber, animatedStyle]}>
      {count}
    </Animated.Text>
  );
}

export function FutureCommitmentHero({ startDate, endDate }: FutureCommitmentHeroProps) {
  const { t } = useTranslation('commitments');

  const today = startOfDay(new Date());
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));

  const daysUntilStart = Math.max(0, differenceInDays(start, today));
  const durationDays = differenceInDays(end, start) + 1;

  const getCountdownText = () => {
    if (daysUntilStart === 0) {
      return t('detail.future.startsToday');
    }
    if (daysUntilStart === 1) {
      return t('detail.future.startsTomorrow');
    }
    return t('detail.future.startsIn', { count: daysUntilStart });
  };

  return (
    <Animated.View entering={FadeInUp.duration(400).springify()}>
      <LinearGradient
        colors={[COLORS.gradient.start, COLORS.gradient.end]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Hourglass Icon */}
        <AnimatedHourglass />

        {/* Countdown Display */}
        <View style={styles.countdownContainer}>
          {daysUntilStart > 1 ? (
            <>
              <CountdownNumber count={daysUntilStart} />
              <Text style={styles.countdownLabel}>
                {daysUntilStart === 1 ? 'day' : 'days'}
              </Text>
            </>
          ) : (
            <Text style={styles.countdownText}>{getCountdownText()}</Text>
          )}
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateRange}>
            <Text style={styles.dateText}>{formatDate(startDate, 'MMM d, yyyy')}</Text>
            <Text style={styles.dateArrow}>→</Text>
            <Text style={styles.dateText}>{formatDate(endDate, 'MMM d, yyyy')}</Text>
          </View>
          <Text style={styles.durationText}>
            {t('detail.future.journey', { count: durationDays })}
          </Text>
        </View>

        {/* Motivational Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{t('detail.future.getReady')}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  hourglassIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownNumber: {
    fontSize: 56,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: COLORS.text.primary,
    lineHeight: 64,
  },
  countdownLabel: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.text.secondary,
    marginTop: -4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  countdownText: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  dateRangeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.primary,
  },
  dateArrow: {
    fontSize: 16,
    color: COLORS.primary,
    marginHorizontal: 12,
  },
  durationText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.text.muted,
  },
  messageContainer: {
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 260,
    lineHeight: 20,
  },
});
