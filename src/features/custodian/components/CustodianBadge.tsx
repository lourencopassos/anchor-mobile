import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useCustodianSummary } from '../hooks';

interface CustodianBadgeProps {
  className?: string;
}

/**
 * Inner component that uses the hook - only rendered when ready
 */
function CustodianBadgeContent({ className }: CustodianBadgeProps) {
  const { data: summary } = useCustodianSummary();

  const count = summary?.totalPending ?? 0;

  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View
      className={`absolute -top-1 -right-1 bg-error rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 ${className}`}
    >
      <Text className="text-white text-xs font-bold">{displayCount}</Text>
    </View>
  );
}

/**
 * Badge showing pending custodian task count (deposits + settlements)
 * Defers hook calls until after initial render to avoid navigation context issues
 */
export function CustodianBadge({ className }: CustodianBadgeProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <CustodianBadgeContent className={className} />;
}
