import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import type { MarkDepositPaidRequest } from '@api/types';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

/**
 * Hook to mark a deposit as paid (creator action).
 */
export function useMarkDepositPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commitmentId,
      request,
    }: {
      commitmentId: string;
      request?: MarkDepositPaidRequest;
    }) => custodianApi.markDepositPaid(commitmentId, request),
    onSuccess: (_data, variables) => {
      // Invalidate the deposit status query
      queryClient.invalidateQueries({
        queryKey: [...COMMITMENTS_QUERY_KEY, variables.commitmentId, 'deposit'],
      });
      // Also invalidate the commitment itself
      queryClient.invalidateQueries({
        queryKey: [...COMMITMENTS_QUERY_KEY, variables.commitmentId],
      });
    },
  });
}
