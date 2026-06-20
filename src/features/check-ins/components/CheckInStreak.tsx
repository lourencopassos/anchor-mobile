import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface CheckInStreakProps {
  current: number;
  longest: number;
  showDetails?: boolean;
}

/**
 * Display current and longest streak prominently
 *
 * Features:
 * - Large current streak number
 * - Fire emoji for streaks > 7 days
 * - "Personal Best!" badge when current equals longest
 */
export function CheckInStreak({
  current,
  longest,
  showDetails = true,
}: CheckInStreakProps) {
  const { t } = useTranslation('checkins');

  const isPersonalBest = current > 0 && current === longest;
  const showFire = current >= 7;

  return (
    <View className="items-center py-4">
      {/* Current Streak */}
      <View className="flex-row items-center gap-2">
        {showFire && <Text className="text-4xl">🔥</Text>}
        <Text className="text-5xl font-bold text-primary-600">{current}</Text>
        {showFire && <Text className="text-4xl">🔥</Text>}
      </View>

      <Text className="text-lg text-neutral-600 mt-1">
        {t('streak.days', { count: current })}
      </Text>

      {/* Personal Best Badge */}
      {isPersonalBest && current > 0 && (
        <View className="bg-primary-100 px-3 py-1 rounded-full mt-2">
          <Text className="text-primary-700 font-semibold text-sm">
            {t('streak.personalBest')}
          </Text>
        </View>
      )}

      {/* Longest Streak */}
      {showDetails && longest > 0 && !isPersonalBest && (
        <View className="mt-4 flex-row items-center gap-2">
          <Text className="text-neutral-500">{t('streak.longest')}:</Text>
          <Text className="text-neutral-700 font-medium">
            {t('streak.days', { count: longest })}
          </Text>
        </View>
      )}
    </View>
  );
}
