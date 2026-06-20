import React from 'react';
import { View, ViewProps, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScreenProps extends ViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: 'light-content' | 'dark-content';
  backgroundColor?: string;
}

export function SafeScreen({
  children,
  edges = ['top', 'bottom'],
  statusBarStyle = 'dark-content',
  backgroundColor = '#FFFFFF',
  className = '',
  ...props
}: SafeScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-white ${className}`}
      style={{ backgroundColor }}
      {...props}
    >
      <StatusBar barStyle={statusBarStyle} />
      <View className="flex-1 px-4">{children}</View>
    </SafeAreaView>
  );
}
