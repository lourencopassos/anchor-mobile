import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore, selectIsAuthenticated, selectIsHydrated } from '@features/auth/stores/auth.store';
import { hasValidTokens } from '@features/auth/services/token.service';

interface AuthContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isReady: false,
  isAuthenticated: false,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    async function checkAuth() {
      if (!isHydrated) return;

      // Verify tokens are still valid
      const hasTokens = await hasValidTokens();

      if (isAuthenticated && !hasTokens) {
        // Tokens are missing or invalid, logout
        logout();
      }

      setIsReady(true);
    }

    checkAuth();
  }, [isHydrated, isAuthenticated, logout]);

  const value: AuthContextValue = {
    isReady,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
