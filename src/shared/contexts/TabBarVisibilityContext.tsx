import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

interface TabBarVisibilityContextValue {
  isTabBarVisible: boolean;
  requestHide: () => void;
  releaseHide: () => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | undefined>(
  undefined,
);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  // Ref-counted: multiple screens can request hide simultaneously.
  // The ref holds the authoritative count; the state boolean drives re-renders
  // only at the 0↔1 threshold to minimize render cycles.
  const hideCountRef = useRef(0);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const requestHide = useCallback(() => {
    hideCountRef.current += 1;
    if (hideCountRef.current === 1) {
      setIsTabBarVisible(false);
    }
  }, []);

  const releaseHide = useCallback(() => {
    hideCountRef.current = Math.max(0, hideCountRef.current - 1);
    if (hideCountRef.current === 0) {
      setIsTabBarVisible(true);
    }
  }, []);

  return (
    <TabBarVisibilityContext.Provider value={{ isTabBarVisible, requestHide, releaseHide }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility(): TabBarVisibilityContextValue {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error('useTabBarVisibility must be used within a TabBarVisibilityProvider');
  }
  return context;
}

/**
 * Call in any screen that should hide the tab bar while focused.
 * Uses ref-counting so transitions between two hidden-tab-bar screens
 * never briefly flash the tab bar.
 */
export function useHideTabBar(): void {
  const { requestHide, releaseHide } = useTabBarVisibility();

  useFocusEffect(
    useCallback(() => {
      requestHide();
      return () => {
        releaseHide();
      };
    }, [requestHide, releaseHide]),
  );
}
