import { useQuery } from '@tanstack/react-query';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import type { Commitment } from '@api/types';

export const COMMITMENTS_QUERY_KEY = ['commitments'] as const;

export function useCommitments() {
  return useQuery({
    queryKey: COMMITMENTS_QUERY_KEY,
    queryFn: commitmentsApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Filter helpers
export type CommitmentFilter = 'all' | 'active' | 'active_with_cycle' | 'pending' | 'draft' | 'completed' | 'broken';

export function filterCommitments(
  commitments: Commitment[] | undefined,
  filter: CommitmentFilter
): Commitment[] {
  if (!commitments) return [];

  // CANCELLED commitments are removed artifacts — never show them in any list.
  commitments = commitments.filter((c) => c.state !== 'CANCELLED');

  switch (filter) {
    case 'active':
      // All ACTIVE state commitments (regardless of cycle status)
      return commitments.filter((c) => c.state === 'ACTIVE');
    case 'active_with_cycle':
      // Only ACTIVE commitments that have an active cycle (can receive check-ins)
      return commitments.filter((c) => c.state === 'ACTIVE' && c.currentCycle);
    case 'pending':
      // "Pending Activation" = successfully created commitments not yet active:
      // either awaiting a money-holder (PENDING_CUSTODIAN) or awaiting the
      // custodian's deposit confirmation (PENDING_DEPOSIT). A DRAFT is a
      // failed/incomplete creation artifact, NOT pending, so it never appears
      // here (it can only be removed — see 'draft').
      return commitments.filter(
        (c) => c.state === 'PENDING_DEPOSIT' || c.state === 'PENDING_CUSTODIAN',
      );
    case 'draft':
      return commitments.filter((c) => c.state === 'DRAFT');
    case 'completed':
      return commitments.filter((c) => c.state === 'COMPLETED');
    case 'broken':
      return commitments.filter((c) => c.state === 'BROKEN');
    default:
      return commitments;
  }
}
