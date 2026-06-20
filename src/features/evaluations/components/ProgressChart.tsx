import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  eachWeekOfInterval,
  eachMonthOfInterval,
  parseISO,
  format,
  isWithinInterval,
  subMonths,
  differenceInDays,
} from 'date-fns';
import { Card } from '@shared/components/ui/Card';
import type { CheckIn } from '@api/types';
import { CheckInStatus } from '@api/types';

type ViewMode = 'weekly' | 'monthly';

interface ProgressChartProps {
  checkIns: CheckIn[];
  startDate: string;
}

interface DataPoint {
  label: string;
  completed: number;
  total: number;
  ratio: number;
}

/**
 * Get color based on completion ratio
 */
function getBarColor(ratio: number): string {
  if (ratio >= 0.8) return '#2D5A4A'; // success - forest green
  if (ratio >= 0.5) return '#D4A574'; // warning - warm gold
  return '#B54548'; // error - muted red
}

/**
 * Generate weekly data points
 */
function generateWeeklyData(
  checkIns: CheckIn[],
  startDate: Date
): DataPoint[] {
  // Normalize all dates to start of day in local timezone for consistent comparisons
  const today = startOfDay(new Date());
  const commitmentStart = startOfDay(startDate);
  const chartStart = subMonths(today, 2); // Last 2 months
  const intervalStart = chartStart > commitmentStart ? chartStart : commitmentStart;

  const weeks = eachWeekOfInterval(
    { start: intervalStart, end: today },
    { weekStartsOn: 1 } // Monday
  );

  return weeks.slice(-8).map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    // Don't count days after today
    const effectiveEnd = weekEnd > today ? today : weekEnd;
    // Don't count days before commitment started
    const effectiveStart = weekStart < commitmentStart ? commitmentStart : weekStart;

    // Skip weeks that are entirely before the commitment started
    if (effectiveStart > effectiveEnd) {
      return {
        label: format(weekStart, 'MMM d'),
        completed: 0,
        total: 0,
        ratio: 0,
      };
    }

    const weekCheckIns = checkIns.filter((c) => {
      const date = startOfDay(parseISO(c.checkInDate));
      return isWithinInterval(date, { start: effectiveStart, end: effectiveEnd });
    });

    const completed = weekCheckIns.filter(
      (c) => c.status === CheckInStatus.COMPLETED
    ).length;

    // Calculate expected days only for the period the commitment existed
    // Use differenceInDays for accurate day counting regardless of timezone
    const daysInWeek = differenceInDays(effectiveEnd, effectiveStart) + 1;

    return {
      label: format(weekStart, 'MMM d'),
      completed,
      total: daysInWeek,
      ratio: daysInWeek > 0 ? completed / daysInWeek : 0,
    };
  });
}

/**
 * Generate monthly data points
 */
function generateMonthlyData(
  checkIns: CheckIn[],
  startDate: Date
): DataPoint[] {
  // Normalize all dates to start of day in local timezone for consistent comparisons
  const today = startOfDay(new Date());
  const commitmentStart = startOfDay(startDate);
  const chartStart = subMonths(today, 5); // Last 6 months
  const intervalStart = chartStart > commitmentStart ? chartStart : commitmentStart;

  const months = eachMonthOfInterval({ start: intervalStart, end: today });

  return months.slice(-6).map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    // Don't count days after today
    const effectiveEnd = monthEnd > today ? today : monthEnd;
    // Don't count days before commitment started
    const effectiveStart = monthStart < commitmentStart ? commitmentStart : monthStart;

    // Skip months that are entirely before the commitment started
    if (effectiveStart > effectiveEnd) {
      return {
        label: format(monthStart, 'MMM'),
        completed: 0,
        total: 0,
        ratio: 0,
      };
    }

    const monthCheckIns = checkIns.filter((c) => {
      const date = startOfDay(parseISO(c.checkInDate));
      return isWithinInterval(date, { start: effectiveStart, end: effectiveEnd });
    });

    const completed = monthCheckIns.filter(
      (c) => c.status === CheckInStatus.COMPLETED
    ).length;

    // Calculate expected days only for the period the commitment existed
    // Use differenceInDays for accurate day counting regardless of timezone
    const daysInMonth = differenceInDays(effectiveEnd, effectiveStart) + 1;

    return {
      label: format(monthStart, 'MMM'),
      completed,
      total: daysInMonth,
      ratio: daysInMonth > 0 ? completed / daysInMonth : 0,
    };
  });
}

/**
 * View-based Bar Chart showing completion over time
 * Uses native Views instead of SVG for Hermes compatibility
 */
export function ProgressChart({ checkIns, startDate }: ProgressChartProps) {
  const { t } = useTranslation('evaluations');
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for padding
  const chartHeight = 150;

  const data = useMemo(() => {
    const start = parseISO(startDate);
    return viewMode === 'weekly'
      ? generateWeeklyData(checkIns, start)
      : generateMonthlyData(checkIns, start);
  }, [checkIns, startDate, viewMode]);

  const maxRatio = Math.max(...data.map((d) => d.ratio), 0.1);

  return (
    <Card variant="outlined">
      {/* Toggle */}
      <View className="flex-row mb-4">
        <Pressable
          onPress={() => setViewMode('weekly')}
          className={`flex-1 py-2 rounded-l-lg ${
            viewMode === 'weekly' ? 'bg-primary-500' : 'bg-neutral-200'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              viewMode === 'weekly' ? 'text-white' : 'text-neutral-600'
            }`}
          >
            {t('chart.weekly')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('monthly')}
          className={`flex-1 py-2 rounded-r-lg ${
            viewMode === 'monthly' ? 'bg-primary-500' : 'bg-neutral-200'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              viewMode === 'monthly' ? 'text-white' : 'text-neutral-600'
            }`}
          >
            {t('chart.monthly')}
          </Text>
        </Pressable>
      </View>

      {/* Chart */}
      {data.length > 0 ? (
        <View style={[styles.chartContainer, { width: chartWidth, height: chartHeight + 30 }]}>
          {/* Baseline */}
          <View style={[styles.baseline, { top: chartHeight, width: chartWidth }]} />

          {/* Bars container */}
          <View style={styles.barsContainer}>
            {data.map((point, index) => {
              const barHeight = Math.max((point.ratio / maxRatio) * (chartHeight - 20), 2);
              const color = getBarColor(point.ratio);
              const percentage = Math.round(point.ratio * 100);

              return (
                <View key={point.label} style={styles.barWrapper}>
                  {/* Bar column */}
                  <View style={[styles.barColumn, { height: chartHeight }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: color,
                        },
                      ]}
                    >
                      {/* Percentage label on bar */}
                      {barHeight > 20 && (
                        <Text style={styles.percentageLabel}>{percentage}%</Text>
                      )}
                    </View>
                  </View>

                  {/* Date label below */}
                  <Text style={styles.dateLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View className="h-32 items-center justify-center">
          <Text className="text-neutral-400">{t('chart.noData')}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    position: 'relative',
  },
  baseline: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#E7E5E4',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barColumn: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 28,
    borderRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  percentageLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  dateLabel: {
    fontSize: 9,
    color: '#78716C',
    marginTop: 4,
    textAlign: 'center',
  },
});
