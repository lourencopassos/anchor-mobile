import { useMemo } from 'react';
import { differenceInDays, parseISO, startOfDay, subWeeks } from 'date-fns';
import { useCommitment, useCommitmentCycles } from '@features/commitments/hooks/useCommitment';
import { useCheckInHistory } from '@features/check-ins/hooks/useCheckInHistory';
import type { EvaluationMetrics, CheckIn, CycleHistoryItem } from '@api/types';
import { EvaluationTrend, CheckInStatus } from '@api/types';

interface UseEvaluationResult {
  metrics: EvaluationMetrics | null;
  cycleHistory: CycleHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Calculate trend based on recent performance vs previous period
 * Threshold: 5% change triggers UP or DOWN
 */
function calculateTrend(
  checkIns: CheckIn[],
  startDate: Date | null
): EvaluationTrend {
  if (!startDate || checkIns.length === 0) {
    return EvaluationTrend.STABLE;
  }

  const today = startOfDay(new Date());
  const oneWeekAgo = subWeeks(today, 1);
  const twoWeeksAgo = subWeeks(today, 2);

  // Get check-ins for current week and previous week
  const currentWeekCheckIns = checkIns.filter((c) => {
    const date = parseISO(c.checkInDate);
    return date >= oneWeekAgo && date <= today;
  });

  const previousWeekCheckIns = checkIns.filter((c) => {
    const date = parseISO(c.checkInDate);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  });

  // Calculate completion ratios
  const currentCompleted = currentWeekCheckIns.filter(
    (c) => c.status === CheckInStatus.COMPLETED
  ).length;
  const previousCompleted = previousWeekCheckIns.filter(
    (c) => c.status === CheckInStatus.COMPLETED
  ).length;

  // Need at least some data in previous week to compare
  if (previousWeekCheckIns.length === 0) {
    return EvaluationTrend.STABLE;
  }

  const currentRatio = currentCompleted / 7; // Max 7 days in a week
  const previousRatio = previousCompleted / 7;

  const change = currentRatio - previousRatio;
  const threshold = 0.05; // 5% threshold

  if (change > threshold) {
    return EvaluationTrend.UP;
  } else if (change < -threshold) {
    return EvaluationTrend.DOWN;
  }

  return EvaluationTrend.STABLE;
}

/**
 * Hook to calculate evaluation metrics for a commitment
 */
export function useEvaluation(
  commitmentId: string | undefined
): UseEvaluationResult {
  const {
    data: commitment,
    isLoading: commitmentLoading,
    error: commitmentError,
  } = useCommitment(commitmentId);

  const {
    data: cycleHistory,
    isLoading: cyclesLoading,
    error: cyclesError,
  } = useCommitmentCycles(commitmentId);

  const startDate = commitment?.currentCycle?.startDate ?? commitment?.startDate;

  const {
    checkIns,
    streakCurrent,
    streakLongest,
    isLoading: checkInsLoading,
    error: checkInsError,
    refetch,
  } = useCheckInHistory(commitmentId, startDate);

  const metrics = useMemo((): EvaluationMetrics | null => {
    if (!commitment || !startDate) {
      return null;
    }

    const start = parseISO(startDate);
    const endDateStr = commitment.currentCycle?.endDate ?? commitment.endDate;
    const end = parseISO(endDateStr);
    const today = startOfDay(new Date());

    // Calculate evaluation date (today or end date, whichever is earlier)
    const evaluationDate = today < end ? today : end;

    // Total days from start to evaluation date
    const totalDays = differenceInDays(evaluationDate, start) + 1;

    // Count by status
    const completedCount = checkIns.filter(
      (c) => c.status === CheckInStatus.COMPLETED
    ).length;
    const skippedCount = checkIns.filter(
      (c) => c.status === CheckInStatus.SKIPPED
    ).length;
    const missedCount = Math.max(0, totalDays - completedCount - skippedCount);

    // Completion ratio (excludes skipped from denominator)
    const denominator = completedCount + missedCount;
    const completionRatio = denominator > 0 ? completedCount / denominator : 0;

    // Last check-in date
    const sortedCheckIns = [...checkIns].sort(
      (a, b) =>
        parseISO(b.checkInDate).getTime() - parseISO(a.checkInDate).getTime()
    );
    const lastCheckInDate =
      sortedCheckIns.length > 0 ? sortedCheckIns[0].checkInDate : null;

    // Calculate trend
    const trend = calculateTrend(checkIns, start);

    return {
      totalDays,
      completedCount,
      missedCount,
      skippedCount,
      completionRatio: Math.round(completionRatio * 10000) / 10000, // 4 decimal places
      streakCurrent,
      streakLongest,
      lastCheckInDate,
      trend,
    };
  }, [commitment, startDate, checkIns, streakCurrent, streakLongest]);

  const isLoading = commitmentLoading || cyclesLoading || checkInsLoading;
  const error = commitmentError || cyclesError || checkInsError;

  return {
    metrics,
    cycleHistory: cycleHistory || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get color based on completion ratio
 */
export function getCompletionColor(ratio: number): 'success' | 'warning' | 'error' {
  if (ratio >= 0.8) return 'success';
  if (ratio >= 0.5) return 'warning';
  return 'error';
}

/**
 * Get progress bar color class based on ratio
 */
export function getProgressColorClass(ratio: number): string {
  if (ratio >= 0.8) return 'bg-success';
  if (ratio >= 0.5) return 'bg-warning';
  return 'bg-error';
}
