import React, { createContext, useContext } from 'react';

/**
 * Web stub for NotificationProvider
 * Push notifications are not available on web platform
 */

interface NotificationContextValue {
  expoPushToken: string | null;
  notification: null;
}

const NotificationContext = createContext<NotificationContextValue>({
  expoPushToken: null,
  notification: null,
});

export function useNotifications() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const value: NotificationContextValue = {
    expoPushToken: null,
    notification: null,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
