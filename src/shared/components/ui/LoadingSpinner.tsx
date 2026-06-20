import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#4CAF50',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-neutral-600 mt-2 text-sm">{message}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return content;
}
