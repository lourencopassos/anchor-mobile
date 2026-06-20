import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { haptics } from '@/shared/utils/haptics.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANTS = {
  success: {
    colors: ['#10B981', '#059669'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warning: {
    colors: ['#F59E0B', '#D97706'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  danger: {
    colors: ['#EF4444', '#DC2626'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primary: {
    colors: ['#6366F1', '#4F46E5'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  neutral: {
    colors: ['#6B7280', '#4B5563'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accent: {
    colors: ['#8B5CF6', '#7C3AED'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export interface GradientCardProps {
  variant?: keyof typeof VARIANTS;
  children: React.ReactNode;
  onPress?: () => void;
  animated?: boolean;
  haptic?: boolean;
  className?: string;
  style?: ViewStyle;
  contentClassName?: string;
}

export function GradientCard({
  variant = 'primary',
  children,
  onPress,
  animated = true,
  haptic = true,
  className = '',
  style,
  contentClassName = '',
}: GradientCardProps) {
  const scale = useSharedValue(1);
  const variantStyle = VARIANTS[variant];

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 15 });
    }
  };

  const handlePress = () => {
    if (onPress) {
      if (haptic) {
        haptics.light();
      }
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <LinearGradient
      colors={[...variantStyle.colors]}
      start={variantStyle.start}
      end={variantStyle.end}
      style={[styles.gradient, style]}
    >
      <View className={`p-4 ${contentClassName}`}>
        {children}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={className}
        style={[styles.container, animatedStyle]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <View className={className} style={styles.container}>
      {content}
    </View>
  );
}

// Lighter gradient card variant for non-hero uses
export function GradientCardLight({
  variant = 'primary',
  children,
  onPress,
  className = '',
  contentClassName = '',
}: Omit<GradientCardProps, 'style'>) {
  const variantColors = {
    success: ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.15)'],
    warning: ['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.15)'],
    danger: ['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.15)'],
    primary: ['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.15)'],
    neutral: ['rgba(107, 114, 128, 0.1)', 'rgba(75, 85, 99, 0.15)'],
    accent: ['rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.15)'],
  } as const;

  return (
    <GradientCard
      variant={variant}
      onPress={onPress}
      className={className}
      contentClassName={contentClassName}
      style={{ opacity: 1 }}
    >
      <LinearGradient
        colors={[...variantColors[variant]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    borderRadius: 16,
  },
});
