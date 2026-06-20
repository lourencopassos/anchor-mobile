import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as custodianApi from '@api/endpoints/custodian.api';
import type { CompleteSettlementRequest, FailSettlementRequest } from '@api/types';
import { CUSTODIAN_QUERY_KEY } from './useCustodianSummary';

/**
 * Hook to mark a settlement as completed.
 */
export function useCompleteSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      request,
    }: {
      taskId: string;
      request?: CompleteSettlementRequest;
    }) => custodianApi.completeSettlement(taskId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'settlements'] });
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'summary'] });
    },
  });
}

/**
 * Hook to mark a settlement as failed.
 */
export function useFailSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      request,
    }: {
      taskId: string;
      request: FailSettlementRequest;
    }) => custodianApi.failSettlement(taskId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'settlements'] });
      queryClient.invalidateQueries({ queryKey: [...CUSTODIAN_QUERY_KEY, 'summary'] });
    },
  });
}
