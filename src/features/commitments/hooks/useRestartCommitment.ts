import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import type { RestartCommitmentRequest } from '@api/types';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

export function useRestartCommitment(commitmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RestartCommitmentRequest) =>
      commitmentsApi.restart(commitmentId, request),
    onSuccess: () => {
      // Invalidate both the specific commitment and the list
      queryClient.invalidateQueries({
        queryKey: [...COMMITMENTS_QUERY_KEY, commitmentId],
      });
      queryClient.invalidateQueries({ queryKey: COMMITMENTS_QUERY_KEY });
    },
  });
}
