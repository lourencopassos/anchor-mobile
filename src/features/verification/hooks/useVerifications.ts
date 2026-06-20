/**
 * =============================================================================
 * VERIFICATION HOOKS
 * =============================================================================
 *
 * React Query hooks for check-in verification operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import i18n from '@i18n/index';
import * as supportersApi from '../../../api/endpoints/supporters.api';
import type {
  PendingVerification,
  VerifyCheckInRequest,
  VerificationResponse,
  VerificationType,
} from '../../../api/types';

// Query keys
export const verificationKeys = {
  all: ['verifications'] as const,
  pending: () => [...verificationKeys.all, 'pending'] as const,
};

/**
 * Fetch pending verifications for the current supporter.
 */
export function usePendingVerifications() {
  return useQuery({
    queryKey: verificationKeys.pending(),
    queryFn: async () => {
      const response = await supportersApi.getPendingVerifications();
      return response;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Submit a verification for a check-in.
 */
export function useVerifyCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: VerifyCheckInRequest): Promise<VerificationResponse> => {
      return supportersApi.verifyCheckIn(request);
    },
    onSuccess: () => {
      // Invalidate pending verifications to refetch the list
      queryClient.invalidateQueries({ queryKey: verificationKeys.pending() });
      // Also invalidate supported commitments as the state may have changed
      queryClient.invalidateQueries({ queryKey: ['supportedCommitments'] });
    },
  });
}

/**
 * Helper to calculate time remaining until deadline.
 */
export function getTimeRemaining(deadline: string): {
  hours: number;
  isUrgent: boolean;
  isPast: boolean;
} {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  return {
    hours,
    isUrgent: hours <= 6,
    isPast: diffMs <= 0,
  };
}

/**
 * Helper to format check-in date for display.
 */
export function formatCheckInDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return i18n.t('common:today');
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return i18n.t('common:yesterday');
  }

  return date.toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}
