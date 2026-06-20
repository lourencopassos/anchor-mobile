import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EvaluationTrend } from '@api/types';

interface TrendIndicatorProps {
  trend: EvaluationTrend;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get trend display configuration
 */
function getTrendConfig(trend: EvaluationTrend) {
  switch (trend) {
    case EvaluationTrend.UP:
      return {
        icon: '↑',
        color: 'text-success',
        bgColor: 'bg-success-100',
        labelKey: 'trend.up' as const,
      };
    case EvaluationTrend.DOWN:
      return {
        icon: '↓',
        color: 'text-error',
        bgColor: 'bg-error-100',
        labelKey: 'trend.down' as const,
      };
    case EvaluationTrend.STABLE:
    default:
      return {
        icon: '−',
        color: 'text-neutral-500',
        bgColor: 'bg-neutral-100',
        labelKey: 'trend.stable' as const,
      };
  }
}

const sizeClasses = {
  sm: { container: 'px-2 py-1', icon: 'text-sm', text: 'text-xs' },
  md: { container: 'px-3 py-1.5', icon: 'text-base', text: 'text-sm' },
  lg: { container: 'px-4 py-2', icon: 'text-lg', text: 'text-base' },
};

/**
 * Displays trend direction with icon and label
 * UP: Green arrow + "Improving"
 * DOWN: Red arrow + "Needs attention"
 * STABLE: Gray dash + "Steady"
 */
export function TrendIndicator({ trend, size = 'md' }: TrendIndicatorProps) {
  const { t } = useTranslation('evaluations');
  const config = getTrendConfig(trend);
  const classes = sizeClasses[size];

  return (
    <View
      className={`flex-row items-center rounded-full ${config.bgColor} ${classes.container}`}
    >
      <Text className={`font-bold ${config.color} ${classes.icon} mr-1`}>
        {config.icon}
      </Text>
      <Text className={`font-medium ${config.color} ${classes.text}`}>
        {t(config.labelKey)}
      </Text>
    </View>
  );
}
