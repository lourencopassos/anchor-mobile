import { useMemo } from 'react';
import { useCheckIns } from './useCheckIns';
import { usePendingCheckInsStore } from '../stores/pending-checkins.store';
import {
  differenceInDays,
  parseISO,
  startOfDay,
  isSameDay,
  format,
} from 'date-fns';
import type { CheckIn, PendingCheckIn } from '@api/types';
import { CheckInStatus } from '@api/types';

interface CheckInHistoryResult {
  checkIns: CheckIn[];
  pendingCheckIns: PendingCheckIn[];
  streakCurrent: number;
  streakLongest: number;
  hasCheckedInToday: boolean;
  pendingCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Calculate current and longest streaks from check-ins
 */
function calculateStreaks(
  checkIns: CheckIn[],
  startDateStr: string | undefined
): { current: number; longest: number } {
  if (!startDateStr || checkIns.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Filter to only completed check-ins and sort by date descending
  const completed = [...checkIns]
    .filter((c) => c.status === CheckInStatus.COMPLETED)
    .sort(
      (a, b) =>
        parseISO(b.checkInDate).getTime() - parseISO(a.checkInDate).getTime()
    );

  if (completed.length === 0) {
    return { current: 0, longest: 0 };
  }

  let current = 0;
  let longest = 0;
  let streak = 0;
  let lastDate: Date | null = null;
  const today = startOfDay(new Date());

  for (const checkIn of completed) {
    const checkInDate = startOfDay(parseISO(checkIn.checkInDate));

    if (!lastDate) {
      // First check-in - check if it's today or yesterday
      const daysSinceToday = differenceInDays(today, checkInDate);
      if (daysSinceToday <= 1) {
        streak = 1;
        current = 1;
      } else {
        // Streak is broken, but count for longest
        streak = 1;
        current = 0;
      }
    } else {
      const gap = differenceInDays(lastDate, checkInDate);
      if (gap === 1) {
        // Consecutive day
        streak++;
        if (current > 0) {
          current = streak;
        }
      } else if (gap === 0) {
        // Same day (shouldn't happen but handle it)
        continue;
      } else {
        // Gap in streak
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }

    lastDate = checkInDate;
  }

  longest = Math.max(longest, streak);

  return { current, longest };
}

/**
 * Hook that combines API check-ins with pending offline check-ins
 * and calculates streak information
 */
export function useCheckInHistory(
  commitmentId: string | undefined,
  startDate: string | undefined
): CheckInHistoryResult {
  const {
    data: apiCheckIns,
    isLoading,
    error,
    refetch,
  } = useCheckIns(commitmentId);

  const getPendingForCommitment = usePendingCheckInsStore(
    (state) => state.getPendingForCommitment
  );

  return useMemo(() => {
    const pendingCheckIns = commitmentId
      ? getPendingForCommitment(commitmentId)
      : [];

    // Merge API check-ins with pending
    const allCheckIns = [...(apiCheckIns || [])];
    const todayStr = getTodayDateString();

    // Add pending that aren't already in API response
    pendingCheckIns.forEach((pending) => {
      const existsInApi = allCheckIns.some(
        (c) =>
          c.checkInDate === todayStr &&
          c.commitmentId === pending.request.commitmentId
      );

      if (!existsInApi) {
        allCheckIns.push({
          id: pending.localId,
          commitmentId: pending.request.commitmentId,
          cycleId: '', // Unknown until synced
          userId: '', // Unknown until synced
          checkInDate: todayStr,
          status: pending.request.status,
          evidenceType: pending.request.evidenceType,
          notes: pending.request.notes || null,
          createdAt: pending.createdAt,
          wasCached: true,
        });
      }
    });

    // Calculate streaks
    const { current, longest } = calculateStreaks(allCheckIns, startDate);

    // Check if user has checked in today
    const hasCheckedInToday = allCheckIns.some((c) =>
      isSameDay(parseISO(c.checkInDate), new Date())
    );

    return {
      checkIns: allCheckIns,
      pendingCheckIns,
      streakCurrent: current,
      streakLongest: longest,
      hasCheckedInToday,
      pendingCount: pendingCheckIns.length,
      isLoading,
      error: error as Error | null,
      refetch,
    };
  }, [
    apiCheckIns,
    commitmentId,
    getPendingForCommitment,
    startDate,
    isLoading,
    error,
    refetch,
  ]);
}
