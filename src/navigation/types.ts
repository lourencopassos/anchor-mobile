// Navigation type definitions for type-safe navigation

// Auth stack params
export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
};

// Main stack params
export type MainStackParamList = {
  index: undefined;
  profile: undefined;
  notifications: undefined;
  'commitments/index': undefined;
  'commitments/create': undefined;
  'commitments/[id]/index': { id: string };
  'commitments/[id]/check-in': { id: string };
  'commitments/[id]/supporters': { id: string };
  'commitments/[id]/progress': { id: string };
};

// Root stack params
export type RootStackParamList = {
  '(auth)': AuthStackParamList;
  '(main)': MainStackParamList;
  index: undefined;
};

// Extend the global namespace for React Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
