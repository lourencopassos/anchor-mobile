import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: number | string;
  height?: number | string;
  animated?: boolean;
  className?: string;
  style?: ViewStyle;
}

const VARIANT_STYLES = {
  text: {
    height: 14,
    borderRadius: 4,
  },
  circular: {
    borderRadius: 9999,
  },
  rectangular: {
    borderRadius: 8,
  },
  card: {
    borderRadius: 12,
    height: 120,
  },
} as const;

export function Skeleton({
  variant = 'rectangular',
  width = '100%',
  height,
  animated = true,
  className = '',
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      shimmer.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [animated, shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return {
      opacity,
    };
  });

  const variantStyle = VARIANT_STYLES[variant];
  const computedHeight = height ?? variantStyle.height ?? 40;

  return (
    <View
      className={className}
      style={[
        styles.base,
        {
          width: width as number | undefined,
          height: computedHeight as number | undefined,
          borderRadius: variantStyle.borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmer,
          { borderRadius: variantStyle.borderRadius },
          animated ? animatedStyle : { opacity: 0.4 },
        ]}
      />
    </View>
  );
}

// Pre-built skeleton patterns
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <View className={`bg-white rounded-2xl p-4 ${className}`}>
      <View className="flex-row items-center mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <View className="ml-3 flex-1">
          <Skeleton variant="text" width="60%" height={14} className="mb-2" />
          <Skeleton variant="text" width="40%" height={12} />
        </View>
      </View>
      <Skeleton variant="rectangular" height={80} className="mb-3" />
      <View className="flex-row justify-between">
        <Skeleton variant="text" width="30%" height={12} />
        <Skeleton variant="text" width="20%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <View className={`flex-row items-center p-3 ${className}`}>
      <Skeleton variant="circular" width={48} height={48} />
      <View className="ml-3 flex-1">
        <Skeleton variant="text" width="70%" height={16} className="mb-2" />
        <Skeleton variant="text" width="50%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonStats({ className = '' }: { className?: string }) {
  return (
    <View className={`flex-row justify-between ${className}`}>
      {[1, 2, 3].map((i) => (
        <View key={i} className="items-center flex-1">
          <Skeleton variant="text" width={40} height={24} className="mb-1" />
          <Skeleton variant="text" width={60} height={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  shimmer: {
    backgroundColor: '#F3F4F6',
  },
});
