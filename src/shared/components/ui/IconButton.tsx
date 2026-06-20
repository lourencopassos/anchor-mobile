import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from './Icon';
import { haptics } from '@/shared/utils/haptics.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SIZES = {
  sm: { container: 32, icon: 'sm' as const },
  md: { container: 44, icon: 'md' as const },
  lg: { container: 56, icon: 'lg' as const },
} as const;

const VARIANTS = {
  ghost: {
    backgroundColor: 'transparent',
    pressedBackground: 'rgba(0, 0, 0, 0.05)',
    iconColor: '#374151',
  },
  filled: {
    backgroundColor: '#4CAF50',
    pressedBackground: '#43A047',
    iconColor: '#FFFFFF',
  },
  outline: {
    backgroundColor: 'transparent',
    pressedBackground: 'rgba(76, 175, 80, 0.1)',
    iconColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  danger: {
    backgroundColor: 'transparent',
    pressedBackground: 'rgba(239, 68, 68, 0.1)',
    iconColor: '#EF4444',
  },
  'danger-filled': {
    backgroundColor: '#EF4444',
    pressedBackground: '#DC2626',
    iconColor: '#FFFFFF',
  },
} as const;

export interface IconButtonProps {
  icon: string;
  onPress: () => void;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  accessibilityLabel?: string;
  className?: string;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  color,
  loading = false,
  disabled = false,
  haptic = true,
  accessibilityLabel,
  className = '',
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const dimensions = SIZES[size];
  const variantStyle = VARIANTS[variant];

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      haptics.light();
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = color ?? variantStyle.iconColor;
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={className}
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
          backgroundColor: variantStyle.backgroundColor,
          borderWidth: 'borderWidth' in variantStyle ? variantStyle.borderWidth : 0,
          borderColor: 'borderColor' in variantStyle ? variantStyle.borderColor : undefined,
          opacity: isDisabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Icon name={icon} size={dimensions.icon} color={iconColor} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
