import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function Toast({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute top-12 left-4 right-4 z-50"
      style={{ transform: [{ translateY }] }}
    >
      <View
        className={`
          ${typeStyles[type]}
          rounded-lg px-4 py-3 flex-row items-center shadow-lg
        `}
      >
        <Text className="text-white text-lg mr-2">{typeIcons[type]}</Text>
        <Text className="text-white flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
}
