import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PendingCheckIn, SubmitCheckInRequest } from '@api/types';

const STORAGE_KEY = '@anchor/pending-checkins';

interface PendingCheckInsState {
  pendingCheckIns: PendingCheckIn[];
  isHydrated: boolean;
}

interface PendingCheckInsActions {
  addPending: (request: SubmitCheckInRequest) => string;
  removePending: (localId: string) => void;
  incrementRetryCount: (localId: string) => void;
  getPendingForCommitment: (commitmentId: string) => PendingCheckIn[];
  clearAll: () => void;
  setHydrated: (isHydrated: boolean) => void;
}

type PendingCheckInsStore = PendingCheckInsState & PendingCheckInsActions;

// Generate a simple UUID-like ID
function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const usePendingCheckInsStore = create<PendingCheckInsStore>()(
  persist(
    (set, get) => ({
      // State
      pendingCheckIns: [],
      isHydrated: false,

      // Actions
      addPending: (request: SubmitCheckInRequest) => {
        const localId = generateLocalId();
        const pending: PendingCheckIn = {
          localId,
          request,
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };

        set((state) => ({
          pendingCheckIns: [...state.pendingCheckIns, pending],
        }));

        return localId;
      },

      removePending: (localId: string) => {
        set((state) => ({
          pendingCheckIns: state.pendingCheckIns.filter(
            (p) => p.localId !== localId
          ),
        }));
      },

      incrementRetryCount: (localId: string) => {
        set((state) => ({
          pendingCheckIns: state.pendingCheckIns.map((p) =>
            p.localId === localId
              ? { ...p, retryCount: p.retryCount + 1 }
              : p
          ),
        }));
      },

      getPendingForCommitment: (commitmentId: string) => {
        return get().pendingCheckIns.filter(
          (p) => p.request.commitmentId === commitmentId
        );
      },

      clearAll: () => {
        set({ pendingCheckIns: [] });
      },

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pendingCheckIns: state.pendingCheckIns,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Selectors
export const selectPendingCheckIns = (state: PendingCheckInsStore) =>
  state.pendingCheckIns;
export const selectPendingCount = (state: PendingCheckInsStore) =>
  state.pendingCheckIns.length;
export const selectIsHydrated = (state: PendingCheckInsStore) =>
  state.isHydrated;
