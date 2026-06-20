import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook to track app state (active, background, inactive)
 */
export function useAppState() {
  const appState = useRef(AppState.currentState);
  const [currentState, setCurrentState] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        appState.current = nextAppState;
        setCurrentState(nextAppState);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    currentState,
    isActive: currentState === 'active',
    isBackground: currentState === 'background',
    isInactive: currentState === 'inactive',
  };
}

/**
 * Hook to run callback when app becomes active
 */
export function useOnAppActive(callback: () => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          callback();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [callback]);
}
