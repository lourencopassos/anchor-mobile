import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import type { ReportFailureRequest } from '@api/types';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

/**
 * Hook for self-reporting commitment failure.
 * Handles the mutation and clears cache on success.
 */
export function useReportFailure(commitmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request?: ReportFailureRequest) =>
      commitmentsApi.reportFailure(commitmentId, request),
    onSuccess: () => {
      console.log('[useReportFailure] Mutation succeeded, clearing cache...');

      // Clear the entire query cache to force fresh data
      queryClient.clear();

      console.log('[useReportFailure] Cache cleared');
    },
  });
}
