import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useUnreadCount } from '../hooks';

interface NotificationBadgeProps {
  className?: string;
}

/**
 * Inner component that uses the hook - only rendered when ready
 */
function NotificationBadgeContent({ className }: NotificationBadgeProps) {
  const unreadCount = useUnreadCount();

  if (unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <View
      className={`absolute -top-1 -right-1 bg-error rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 ${className}`}
    >
      <Text className="text-white text-xs font-bold">{displayCount}</Text>
    </View>
  );
}

/**
 * Badge showing unread notification count
 * Defers hook calls until after initial render to avoid navigation context issues
 */
export function NotificationBadge({ className }: NotificationBadgeProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <NotificationBadgeContent className={className} />;
}
