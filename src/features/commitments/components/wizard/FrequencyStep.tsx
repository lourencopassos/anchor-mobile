import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FrequencyType, DayOfWeek, FrequencyConfig } from '@api/types';

interface FrequencyStepProps {
  frequencyType: FrequencyType;
  targetCount: number;
  specificDays: DayOfWeek[];
  onFrequencyTypeChange: (type: FrequencyType) => void;
  onTargetCountChange: (count: number) => void;
  onSpecificDaysChange: (days: DayOfWeek[]) => void;
}

interface FrequencyOption {
  value: FrequencyType;
  icon: string;
  accentColor: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'DAILY',
    icon: '📅',
    accentColor: '#10b981', // Emerald
  },
  {
    value: 'TIMES_PER_WEEK',
    icon: '📆',
    accentColor: '#6366f1', // Indigo
  },
  {
    value: 'TIMES_PER_MONTH',
    icon: '🗓️',
    accentColor: '#f59e0b', // Amber
  },
  {
    value: 'SPECIFIC_DAYS',
    icon: '🎯',
    accentColor: '#ec4899', // Pink
  },
];

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export function FrequencyStep({
  frequencyType,
  targetCount,
  specificDays,
  onFrequencyTypeChange,
  onTargetCountChange,
  onSpecificDaysChange,
}: FrequencyStepProps) {
  const { t } = useTranslation('commitments');

  const daysOfWeek = useMemo(
    () => DAY_KEYS.map((key, i) => ({
      value: (i + 1) as DayOfWeek,
      label: t(`frequency.days.${key}`),
    })),
    [t]
  );

  const toggleDay = (day: DayOfWeek) => {
    if (specificDays.includes(day)) {
      onSpecificDaysChange(specificDays.filter((d) => d !== day));
    } else {
      onSpecificDaysChange([...specificDays, day].sort((a, b) => a - b));
    }
  };

  const renderTargetCountSelector = () => {
    if (frequencyType !== 'TIMES_PER_WEEK' && frequencyType !== 'TIMES_PER_MONTH') {
      return null;
    }

    const maxCount = frequencyType === 'TIMES_PER_WEEK' ? 7 : 30;
    const options = frequencyType === 'TIMES_PER_WEEK'
      ? [1, 2, 3, 4, 5, 6, 7]
      : [5, 10, 15, 20, 25, 30];

    return (
      <View className="mt-4">
        <Text className="text-sm font-medium text-neutral-600 mb-2">
          {t('frequency.targetCount')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {options.map((count) => (
            <Pressable
              key={count}
              onPress={() => onTargetCountChange(count)}
              className="active:scale-95"
            >
              <View
                className={`
                  px-4 py-2.5 rounded-xl border-2
                  ${targetCount === count
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white'}
                `}
              >
                <Text
                  className={`
                    font-semibold text-base
                    ${targetCount === count ? 'text-primary-600' : 'text-neutral-700'}
                  `}
                >
                  {count}x
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderSpecificDaysSelector = () => {
    if (frequencyType !== 'SPECIFIC_DAYS') {
      return null;
    }

    return (
      <View className="mt-4">
        <Text className="text-sm font-medium text-neutral-600 mb-2">
          {t('frequency.selectDays')}
        </Text>
        <View className="flex-row gap-2 justify-between">
          {daysOfWeek.map((day) => {
            const isSelected = specificDays.includes(day.value);
            return (
              <Pressable
                key={day.value}
                onPress={() => toggleDay(day.value)}
                className="active:scale-95"
              >
                <View
                  className={`
                    w-11 h-11 rounded-xl items-center justify-center border-2
                    ${isSelected
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-neutral-200 bg-white'}
                  `}
                >
                  <Text
                    className={`
                      font-semibold text-xs
                      ${isSelected ? 'text-white' : 'text-neutral-600'}
                    `}
                  >
                    {day.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {specificDays.length === 0 && (
          <Text className="text-amber-600 text-xs mt-2">
            ⚠️ {t('frequency.selectAtLeastOne')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View>
      {/* Header */}
      <Text className="text-lg font-semibold text-neutral-700 mb-2">
        {t('frequency.title')}
      </Text>
      <Text className="text-sm text-neutral-500 mb-4">
        {t('frequency.subtitle')}
      </Text>

      {/* Frequency Type Options */}
      <View className="gap-3">
        {FREQUENCY_OPTIONS.map((option) => {
          const isSelected = frequencyType === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onFrequencyTypeChange(option.value)}
              className="active:scale-[0.98]"
            >
              <View
                className={`
                  rounded-2xl p-4 border-2
                  ${isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white'}
                `}
              >
                <View className="flex-row items-center gap-3">
                  {/* Icon */}
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: isSelected
                        ? `${option.accentColor}20`
                        : '#f5f5f5'
                    }}
                  >
                    <Text className="text-2xl">{option.icon}</Text>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text
                      className={`
                        font-semibold text-base
                        ${isSelected ? 'text-primary-700' : 'text-neutral-800'}
                      `}
                    >
                      {t(`frequency.${option.value.toLowerCase()}.title` as any)}
                    </Text>
                    <Text
                      className={`
                        text-sm
                        ${isSelected ? 'text-primary-600' : 'text-neutral-500'}
                      `}
                    >
                      {t(`frequency.${option.value.toLowerCase()}.description` as any)}
                    </Text>
                  </View>

                  {/* Radio */}
                  <View
                    className={`
                      w-6 h-6 rounded-full border-2 items-center justify-center
                      ${isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-neutral-300 bg-white'}
                    `}
                  >
                    {isSelected && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Target Count Selector (for TIMES_PER_WEEK/MONTH) */}
      {renderTargetCountSelector()}

      {/* Specific Days Selector (for SPECIFIC_DAYS) */}
      {renderSpecificDaysSelector()}

      {/* Info Box */}
      <View className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-lg bg-white items-center justify-center shadow-sm">
            <Text className="text-base">💡</Text>
          </View>
          <View className="flex-1">
            <Text className="text-blue-800 font-semibold text-sm mb-1">
              {t('frequency.makeUpInfo.title')}
            </Text>
            <Text className="text-blue-600 text-sm leading-5">
              {t('frequency.makeUpInfo.description')}
            </Text>
          </View>
        </View>
      </View>

      {/* Lock Warning */}
      <View className="mt-3 flex-row items-center gap-2 px-2">
        <Text className="text-amber-600 text-xs">🔒</Text>
        <Text className="text-amber-600 text-xs">
          {t('frequency.lockedWarning')}
        </Text>
      </View>
    </View>
  );
}
