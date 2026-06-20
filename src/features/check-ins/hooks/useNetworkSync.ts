import { useEffect, useRef, useCallback } from 'react';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useOnAppActive } from '@/shared/hooks/useAppState';
import { usePendingCheckInsStore } from '../stores/pending-checkins.store';
import * as checkInsApi from '@api/endpoints/check-ins.api';
import { useQueryClient } from '@tanstack/react-query';
import { CHECKINS_QUERY_KEY } from './useCheckIns';
import { COMMITMENTS_QUERY_KEY } from '@/features/commitments/hooks/useCommitments';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

/**
 * Hook that automatically syncs pending check-ins when network reconnects
 * or when the app becomes active
 */
export function useNetworkSync() {
  const { isConnected } = useNetworkStatus();
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);

  const pendingCheckIns = usePendingCheckInsStore(
    (state) => state.pendingCheckIns
  );
  const removePending = usePendingCheckInsStore((state) => state.removePending);
  const incrementRetryCount = usePendingCheckInsStore(
    (state) => state.incrementRetryCount
  );

  const syncPendingCheckIns = useCallback(async () => {
    if (isSyncing.current || !isConnected || pendingCheckIns.length === 0) {
      return;
    }

    isSyncing.current = true;

    try {
      // Process each pending check-in
      for (const pending of pendingCheckIns) {
        if (pending.retryCount >= MAX_RETRIES) {
          // Max retries exceeded, remove from queue
          console.warn(
            `Check-in ${pending.localId} exceeded max retries, removing`
          );
          removePending(pending.localId);
          continue;
        }

        try {
          // Attempt to sync
          await checkInsApi.submit(pending.request);

          // Success: remove from pending queue
          removePending(pending.localId);

          // Invalidate queries
          queryClient.invalidateQueries({
            queryKey: [...CHECKINS_QUERY_KEY, pending.request.commitmentId],
          });
          queryClient.invalidateQueries({
            queryKey: [...COMMITMENTS_QUERY_KEY, pending.request.commitmentId],
          });
        } catch (error) {
          // Check if it's a 409 Conflict (duplicate) - treat as success
          if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            (error as { response?: { status?: number } }).response?.status ===
              409
          ) {
            // Already submitted, remove from queue
            removePending(pending.localId);
            continue;
          }

          // Increment retry count
          incrementRetryCount(pending.localId);

          // If retryable error, add delay before next attempt
          if (pending.retryCount < MAX_RETRIES - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAYS[pending.retryCount])
            );
          }
        }
      }
    } finally {
      isSyncing.current = false;
    }
  }, [
    isConnected,
    pendingCheckIns,
    removePending,
    incrementRetryCount,
    queryClient,
  ]);

  // Sync when network reconnects
  useEffect(() => {
    if (isConnected && pendingCheckIns.length > 0) {
      syncPendingCheckIns();
    }
  }, [isConnected, pendingCheckIns.length, syncPendingCheckIns]);

  // Sync when app becomes active
  useOnAppActive(() => {
    if (isConnected && pendingCheckIns.length > 0) {
      syncPendingCheckIns();
    }
  });

  return {
    pendingCount: pendingCheckIns.length,
    isSyncing: isSyncing.current,
    triggerSync: syncPendingCheckIns,
  };
}
