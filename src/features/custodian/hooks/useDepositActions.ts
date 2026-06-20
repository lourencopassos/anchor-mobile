import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import type { ConfirmDepositRequest, RejectDepositRequest } from '@api/types';
import { CUSTODIAN_QUERY_KEY } from './useCustodianSummary';
import { COMMITMENTS_QUERY_KEY } from '@features/commitments/hooks/useCommitments';

/**
 * Hook to confirm a deposit as received.
 */
export function useConfirmDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      depositId,
      request,
    }: {
      depositId: string;
      request?: ConfirmDepositRequest;
    }) => custodianApi.confirmDeposit(depositId, request),
    onSuccess: () => {
      // Invalidate custodian queries
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'deposits'] });
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'summary'] });
      // Also invalidate commitments as the commitment state will change
      queryClient.invalidateQueries({ queryKey: COMMITMENTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to reject a deposit.
 */
export function useRejectDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      depositId,
      request,
    }: {
      depositId: string;
      request: RejectDepositRequest;
    }) => custodianApi.rejectDeposit(depositId, request),
    onSuccess: () => {
      // Invalidate custodian queries
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'deposits'] });
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'summary'] });
      // Also invalidate commitments as the commitment state may change
      queryClient.invalidateQueries({ queryKey: COMMITMENTS_QUERY_KEY });
    },
  });
}
