/**
 * =============================================================================
 * COMMUNITY DATA HOOK
 * =============================================================================
 *
 * Aggregates data for the Community Hub home view, including:
 * - People the user is supporting
 * - Pending supporter invitations
 * - Recent activity from the user's network
 */

import { useMemo } from 'react';
import { useSupportedCommitments } from '@/features/supporting/hooks/useSupportedCommitments';
import type {
  SupportedCommitment,
  SupporterRelationshipState,
} from '@api/types';
import type { TemplateType } from '@api/types';

/**
 * Activity item from the user's support network.
 */
export interface CommunityActivity {
  id: string;
  type: 'CHECK_IN' | 'STREAK_MILESTONE' | 'COMMITMENT_COMPLETED';
  ownerDisplayName: string;
  ownerAvatarUrl?: string;
  templateType: TemplateType;
  commitmentId: string;
  timestamp: string;
  checkInStatus?: 'COMPLETED' | 'SKIPPED' | 'MISSED';
  streakDays?: number;
}

/**
 * Community data for the home view.
 */
export interface CommunityData {
  /** All commitments the user is actively supporting */
  supportedCommitments: SupportedCommitment[];
  /** Only ACTIVE commitments being supported */
  activeSupporting: SupportedCommitment[];
  /** Pending invitations to support others */
  pendingInvites: SupportedCommitment[];
  /** Recent activity from the support network */
  recentActivity: CommunityActivity[];
  /** Aggregate stats */
  networkStats: {
    totalSupporting: number;
    activeInNetwork: number;
  };
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook that aggregates community data for the home view.
 * Combines supported commitments and derives pending invites and activity.
 */
export function useCommunityData(): CommunityData {
  const {
    data: supportedData,
    isLoading,
    refetch,
  } = useSupportedCommitments('all');

  // Filter commitments by relationship state
  const { activeSupporting, pendingInvites } = useMemo(() => {
    const commitments = supportedData?.commitments ?? [];

    const active = commitments.filter(
      (c) =>
        c.supporterRelationship.state === 'ACTIVE' &&
        c.state === 'ACTIVE'
    );

    const pending = commitments.filter(
      (c) => c.supporterRelationship.state === 'INVITED'
    );

    return { activeSupporting: active, pendingInvites: pending };
  }, [supportedData]);

  // All accepted supporter relationships (any commitment state)
  const allAccepted = useMemo(() => {
    const commitments = supportedData?.commitments ?? [];
    return commitments.filter(
      (c) => c.supporterRelationship.state === 'ACTIVE'
    );
  }, [supportedData]);

  // Generate mock activity from supported commitments
  // In a real implementation, this would come from a dedicated activity endpoint
  const recentActivity = useMemo((): CommunityActivity[] => {
    const activities: CommunityActivity[] = [];

    // Generate activity based on supported commitments
    activeSupporting.forEach((commitment) => {
      // Add a check-in activity if they have recent completions
      if (commitment.completedCheckIns > 0) {
        activities.push({
          id: `${commitment.id}-checkin`,
          type: 'CHECK_IN',
          ownerDisplayName: commitment.ownerDisplayName,
          ownerAvatarUrl: commitment.ownerAvatarUrl,
          templateType: commitment.templateType,
          commitmentId: commitment.id,
          timestamp: new Date().toISOString(), // Would be actual check-in time from API
          checkInStatus: 'COMPLETED',
        });
      }

      // Add streak milestone for notable streaks
      if (commitment.currentStreak >= 7) {
        activities.push({
          id: `${commitment.id}-streak`,
          type: 'STREAK_MILESTONE',
          ownerDisplayName: commitment.ownerDisplayName,
          ownerAvatarUrl: commitment.ownerAvatarUrl,
          templateType: commitment.templateType,
          commitmentId: commitment.id,
          timestamp: new Date().toISOString(),
          streakDays: commitment.currentStreak,
        });
      }
    });

    // Add completed commitment activities
    allAccepted
      .filter((c) => c.state === 'COMPLETED')
      .slice(0, 2) // Limit to avoid clutter
      .forEach((commitment) => {
        activities.push({
          id: `${commitment.id}-completed`,
          type: 'COMMITMENT_COMPLETED',
          ownerDisplayName: commitment.ownerDisplayName,
          ownerAvatarUrl: commitment.ownerAvatarUrl,
          templateType: commitment.templateType,
          commitmentId: commitment.id,
          timestamp: commitment.endDate,
        });
      });

    // Sort by timestamp descending and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [activeSupporting, allAccepted]);

  // Network stats
  const networkStats = useMemo(() => ({
    totalSupporting: allAccepted.length,
    activeInNetwork: activeSupporting.length,
  }), [allAccepted, activeSupporting]);

  return {
    supportedCommitments: allAccepted,
    activeSupporting,
    pendingInvites,
    recentActivity,
    networkStats,
    isLoading,
    refetch,
  };
}
