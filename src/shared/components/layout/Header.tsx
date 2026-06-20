import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  onBackPress,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="mr-3 p-2 -ml-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text className="text-2xl text-primary-500">←</Text>
          </TouchableOpacity>
        )}
        <Text
          className="text-xl font-bold text-neutral-900 flex-1"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
