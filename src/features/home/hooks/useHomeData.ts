import { useMemo } from 'react';
import { useCommitments, filterCommitments } from '@/features/commitments/hooks/useCommitments';
import { useCheckInHistory } from '@/features/check-ins/hooks/useCheckInHistory';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useAuthStore, selectUser } from '@/features/auth/stores/auth.store';
import type { Commitment } from '@api/types';

export interface HomeStats {
  activeCommitments: number;
  completedCommitments: number;
  brokenCommitments: number;
  overallSuccessRate: number;
  longestStreak: number;
  currentStreak: number;
  todayCheckInsNeeded: number;
  todayCheckInsCompleted: number;
}

export interface TodaysFocus {
  commitment: Commitment;
  hasCheckedIn: boolean;
  progress: number;
  daysRemaining: number;
  streak: number;
}

export interface HomeData {
  user: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  greeting: string;
  stats: HomeStats;
  activeCommitments: Commitment[];
  pendingCommitments: Commitment[];
  todaysFocus: TodaysFocus | null;
  unreadNotifications: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'good_morning';
  if (hour < 17) return 'good_afternoon';
  return 'good_evening';
}

/**
 * Aggregate all data needed for the home screen
 * Combines commitments, check-ins, notifications, and user data
 */
export function useHomeData(): HomeData {
  const user = useAuthStore(selectUser);
  const {
    data: commitments,
    isLoading: commitmentsLoading,
    isError: commitmentsError,
    refetch: refetchCommitments,
  } = useCommitments();

  const unreadNotifications = useUnreadCount();

  // Get the primary active commitment for streak tracking
  const primaryCommitment = useMemo(() => {
    const active = filterCommitments(commitments, 'active');
    return active.length > 0 ? active[0] : null;
  }, [commitments]);

  // Get check-in history for the primary commitment
  const {
    streakCurrent,
    streakLongest,
    hasCheckedInToday,
    isLoading: checkInsLoading,
  } = useCheckInHistory(primaryCommitment?.id, primaryCommitment?.startDate);

  // Calculate aggregated stats
  const stats = useMemo((): HomeStats => {
    if (!commitments) {
      return {
        activeCommitments: 0,
        completedCommitments: 0,
        brokenCommitments: 0,
        overallSuccessRate: 0,
        longestStreak: 0,
        currentStreak: 0,
        todayCheckInsNeeded: 0,
        todayCheckInsCompleted: 0,
      };
    }

    const active = filterCommitments(commitments, 'active');
    const completed = filterCommitments(commitments, 'completed');
    const broken = filterCommitments(commitments, 'broken');

    // Calculate success rate from completed and broken
    const totalFinished = completed.length + broken.length;
    const successRate = totalFinished > 0
      ? Math.round((completed.length / totalFinished) * 100)
      : 0;

    // For now, count all active as needing check-in (simplified)
    const todayCheckInsNeeded = active.length;
    const todayCheckInsCompleted = hasCheckedInToday ? 1 : 0;

    return {
      activeCommitments: active.length,
      completedCommitments: completed.length,
      brokenCommitments: broken.length,
      overallSuccessRate: successRate,
      longestStreak: streakLongest,
      currentStreak: streakCurrent,
      todayCheckInsNeeded,
      todayCheckInsCompleted,
    };
  }, [commitments, streakCurrent, streakLongest, hasCheckedInToday]);

  // Get active commitments - all ACTIVE state commitments
  // Note: todaysFocus separately checks for currentCycle for the check-in card
  const activeCommitments = useMemo(() => {
    return filterCommitments(commitments, 'active');
  }, [commitments]);

  // Get pending commitments (awaiting payment/activation)
  const pendingCommitments = useMemo(() => {
    return filterCommitments(commitments, 'pending');
  }, [commitments]);

  // Determine today's focus - the commitment that most needs attention
  const todaysFocus = useMemo((): TodaysFocus | null => {
    // Must be ACTIVE state AND have an active cycle to be today's focus
    if (!primaryCommitment || primaryCommitment.state !== 'ACTIVE' || !primaryCommitment.currentCycle) {
      return null;
    }

    const cycle = primaryCommitment.currentCycle;
    const progress = cycle
      ? Math.round((cycle.completedCheckIns / cycle.totalDays) * 100)
      : 0;
    const daysRemaining = cycle
      ? cycle.totalDays - cycle.completedCheckIns
      : 0;

    return {
      commitment: primaryCommitment,
      hasCheckedIn: hasCheckedInToday,
      progress,
      daysRemaining,
      streak: streakCurrent,
    };
  }, [primaryCommitment, hasCheckedInToday, streakCurrent]);

  // User info - use firstName/lastName from auth store (from JWT token)
  const userData = useMemo(() => {
    if (!user) return null;
    return {
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    };
  }, [user]);

  return {
    user: userData,
    greeting: getGreeting(),
    stats,
    activeCommitments,
    pendingCommitments,
    todaysFocus,
    unreadNotifications,
    isLoading: commitmentsLoading || checkInsLoading,
    isError: commitmentsError,
    refetch: refetchCommitments,
  };
}
