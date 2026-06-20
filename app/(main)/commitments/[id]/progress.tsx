import React from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { useCommitment } from '@/features/commitments/hooks/useCommitment';
import { useCheckInHistory } from '@/features/check-ins/hooks/useCheckInHistory';
import { CheckInStreak } from '@/features/check-ins/components/CheckInStreak';
import { CheckInCalendar } from '@/features/check-ins/components/CheckInCalendar';
import { useEvaluation } from '@/features/evaluations/hooks';
import {
  MetricsCard,
  TrendIndicator,
  ProgressChart,
  CycleHistory,
} from '@/features/evaluations/components';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

export default function ProgressScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('evaluations');

  const { data: commitment } = useCommitment(id);
  const startDate = commitment?.currentCycle?.startDate ?? commitment?.startDate;

  const { metrics, cycleHistory, isLoading, refetch } = useEvaluation(id);

  const { checkIns } = useCheckInHistory(id, startDate);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header title={t('title')} showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {metrics && (
          <>
            {/* Metrics Card with Trend Indicator */}
            <View className="mb-4">
              <MetricsCard
                completionRatio={metrics.completionRatio}
                completedCount={metrics.completedCount}
                missedCount={metrics.missedCount}
                skippedCount={metrics.skippedCount}
                totalDays={metrics.totalDays}
              />
              {metrics.trend && (
                <View className="flex-row justify-center mt-3">
                  <TrendIndicator trend={metrics.trend} />
                </View>
              )}
            </View>

            {/* Streak Display */}
            <Card variant="elevated" className="mb-4">
              <CheckInStreak
                current={metrics.streakCurrent}
                longest={metrics.streakLongest}
              />
            </Card>

            {/* Progress Chart */}
            {startDate && (
              <View className="mb-4">
                <ProgressChart checkIns={checkIns} startDate={startDate} />
              </View>
            )}

            {/* Check-in Calendar */}
            {startDate && (commitment?.currentCycle?.endDate ?? commitment?.endDate) && (
              <Card variant="outlined" className="mb-4">
                <CheckInCalendar
                  checkIns={checkIns}
                  startDate={startDate}
                  endDate={(commitment?.currentCycle?.endDate ?? commitment?.endDate)!}
                />
              </Card>
            )}

            {/* Cycle History (for restarted commitments) */}
            {cycleHistory.length > 1 && (
              <View className="mb-4">
                <CycleHistory cycles={cycleHistory} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
