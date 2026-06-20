import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-neutral-900 mb-2 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-neutral-600 text-center mb-6">{description}</Text>
      )}
      {action}
      {!action && actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} />
      )}
    </View>
  );
}
