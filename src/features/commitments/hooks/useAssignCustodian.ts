import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

/**
 * Assign a custodian (money-holder) to a PENDING_CUSTODIAN commitment by email.
 * On success the commitment moves to PENDING_DEPOSIT.
 */
export function useAssignCustodian(commitmentId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (custodianEmail: string) => {
      if (!commitmentId) {
        throw new Error('Commitment ID is required');
      }
      return commitmentsApi.assignCustodian(commitmentId, custodianEmail);
    },
    onSuccess: () => {
      // Invalidates both the list (['commitments']) and the detail
      // (['commitments', id]) queries, which share this key prefix.
      queryClient.invalidateQueries({ queryKey: COMMITMENTS_QUERY_KEY });
    },
  });

  return {
    assignCustodian: mutation.mutateAsync,
    isAssigning: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
