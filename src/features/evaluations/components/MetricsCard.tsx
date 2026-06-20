import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@shared/components/ui/Card';
import { getProgressColorClass } from '../hooks/useEvaluation';

interface MetricsCardProps {
  completionRatio: number;
  completedCount: number;
  missedCount: number;
  skippedCount: number;
  totalDays: number;
}

/**
 * Display key evaluation metrics with progress bar
 * Color coding: green (>80%), yellow (50-80%), red (<50%)
 */
export function MetricsCard({
  completionRatio,
  completedCount,
  missedCount,
  skippedCount,
  totalDays,
}: MetricsCardProps) {
  const { t } = useTranslation('evaluations');

  const percentage = Math.round(completionRatio * 100);
  const progressColorClass = getProgressColorClass(completionRatio);

  return (
    <Card variant="elevated">
      {/* Completion Rate */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-medium text-neutral-700">
            {t('metrics.completion')}
          </Text>
          <Text className="text-2xl font-bold text-neutral-900">
            {percentage}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-3 bg-neutral-200 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${progressColorClass}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-success">{completedCount}</Text>
          <Text className="text-xs text-neutral-500">{t('metrics.completed')}</Text>
        </View>

        <View className="w-px bg-neutral-200" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-error">{missedCount}</Text>
          <Text className="text-xs text-neutral-500">{t('metrics.missed')}</Text>
        </View>

        <View className="w-px bg-neutral-200" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-neutral-400">{skippedCount}</Text>
          <Text className="text-xs text-neutral-500">{t('metrics.skipped')}</Text>
        </View>

        <View className="w-px bg-neutral-200" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-neutral-700">{totalDays}</Text>
          <Text className="text-xs text-neutral-500">{t('metrics.totalDays')}</Text>
        </View>
      </View>
    </Card>
  );
}
