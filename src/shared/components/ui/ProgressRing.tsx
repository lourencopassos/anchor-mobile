import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const SIZE_PRESETS = {
  xs: { size: 32, strokeWidth: 3, fontSize: 10 },
  sm: { size: 48, strokeWidth: 4, fontSize: 12 },
  md: { size: 64, strokeWidth: 5, fontSize: 14 },
  lg: { size: 88, strokeWidth: 6, fontSize: 18 },
  xl: { size: 120, strokeWidth: 8, fontSize: 22 },
} as const;

type SizePreset = keyof typeof SIZE_PRESETS;

// Premium color palette
const PROGRESS_COLORS = {
  excellent: { primary: '#2D5A4A', secondary: '#4D8670' },
  good: { primary: '#4D8670', secondary: '#87A878' },
  fair: { primary: '#D4A574', secondary: '#B87333' },
  poor: { primary: '#B54548', secondary: '#9A3A3D' },
};

// Helper to get dimensions from size prop (supports both preset strings and numbers)
function getDimensions(size: SizePreset | number, customStrokeWidth?: number) {
  if (typeof size === 'number') {
    // Calculate proportional values for numeric size
    const strokeWidth = customStrokeWidth ?? Math.max(3, Math.round(size / 15));
    const fontSize = Math.max(10, Math.round(size / 5.5));
    return { size, strokeWidth, fontSize };
  }
  return SIZE_PRESETS[size];
}

export interface ProgressRingProps {
  progress: number; // 0-100
  size?: SizePreset | number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelSuffix?: string;
  animated?: boolean;
  duration?: number;
  className?: string;
  variant?: 'default' | 'gradient' | 'glow';
}

/**
 * ProgressRing - Circular progress indicator
 *
 * Uses View-based rendering for Hermes compatibility.
 * Creates a progress ring using border techniques.
 */
export function ProgressRing({
  progress,
  size = 'md',
  strokeWidth: customStrokeWidth,
  color,
  backgroundColor = 'rgba(45, 90, 74, 0.15)',
  showLabel = true,
  labelSuffix = '%',
  animated = true,
  duration = 1200,
  className = '',
  // variant is reserved for future use (gradient, glow effects)
  variant: _variant = 'default',
}: ProgressRingProps) {
  const dimensions = getDimensions(size, customStrokeWidth);
  const strokeWidth = customStrokeWidth ?? dimensions.strokeWidth;
  const ringSize = dimensions.size;
  const innerSize = ringSize - strokeWidth * 2;

  // Clamp progress to 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Determine colors based on progress
  const colorScheme = getProgressColorScheme(clampedProgress);
  const progressColor = color ?? colorScheme.primary;

  const animatedProgress = useSharedValue(0);
  const labelScale = useSharedValue(1);
  const displayProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(clampedProgress, {
        duration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      displayProgress.value = withTiming(clampedProgress, {
        duration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });

      labelScale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    } else {
      animatedProgress.value = clampedProgress;
      displayProgress.value = clampedProgress;
    }
  }, [clampedProgress, animated, duration, animatedProgress, displayProgress, labelScale]);

  // Create animated styles for the progress segments
  const leftHalfStyle = useAnimatedStyle(() => {
    'worklet';
    // Left half shows progress from 50-100%
    const rotation = interpolate(
      animatedProgress.value,
      [50, 100],
      [0, 180],
      'clamp'
    );
    return {
      transform: [{ rotateZ: rotation + 'deg' }],
      opacity: animatedProgress.value > 50 ? 1 : 0,
    };
  });

  const rightHalfStyle = useAnimatedStyle(() => {
    'worklet';
    // Right half shows progress from 0-50%
    // Start at -90° so the arc is hidden at 0% progress
    const rotation = interpolate(
      animatedProgress.value,
      [0, 50],
      [-90, 90],
      'clamp'
    );
    return {
      transform: [{ rotateZ: `${rotation}deg` }],
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: labelScale.value }],
    };
  });

  return (
    <View className={className} style={[styles.container, { width: ringSize, height: ringSize }]}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />

      {/* Progress ring using clip technique */}
      <View style={[styles.progressContainer, { width: ringSize, height: ringSize }]}>
        {/* Right half (0-50%) */}
        <View style={[styles.halfContainer, styles.rightHalf, { width: ringSize / 2, height: ringSize }]}>
          <Animated.View
            style={[
              styles.halfCircle,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: strokeWidth,
                borderColor: progressColor,
                borderLeftColor: 'transparent',
                borderBottomColor: 'transparent',
                left: -ringSize / 2,
              },
              rightHalfStyle,
            ]}
          />
        </View>

        {/* Left half (50-100%) */}
        <View style={[styles.halfContainer, styles.leftHalf, { width: ringSize / 2, height: ringSize }]}>
          <Animated.View
            style={[
              styles.halfCircle,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: strokeWidth,
                borderColor: progressColor,
                borderRightColor: 'transparent',
                borderTopColor: 'transparent',
              },
              leftHalfStyle,
            ]}
          />
        </View>
      </View>

      {/* Inner circle to create ring effect */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: strokeWidth,
            left: strokeWidth,
          },
        ]}
      />

      {/* Label */}
      {showLabel && (
        <Animated.View style={[styles.labelContainer, labelAnimatedStyle]}>
          <Text
            style={[
              styles.label,
              {
                fontSize: dimensions.fontSize,
                color: progressColor,
              },
            ]}
          >
            {Math.round(clampedProgress)}{labelSuffix}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// Get color scheme based on progress value
function getProgressColorScheme(progress: number) {
  if (progress >= 80) return PROGRESS_COLORS.excellent;
  if (progress >= 60) return PROGRESS_COLORS.good;
  if (progress >= 40) return PROGRESS_COLORS.fair;
  return PROGRESS_COLORS.poor;
}

// Mini progress ring for compact displays
export function ProgressRingMini({
  progress,
  color,
  className = '',
}: {
  progress: number;
  color?: string;
  className?: string;
}) {
  return (
    <ProgressRing
      progress={progress}
      size="xs"
      showLabel={false}
      color={color}
      animated={false}
      className={className}
    />
  );
}

// Progress ring with label below
export function ProgressRingWithLabel({
  progress,
  label,
  sublabel,
  size = 'lg',
  color,
  className = '',
}: {
  progress: number;
  label: string;
  sublabel?: string;
  size?: SizePreset | number;
  color?: string;
  className?: string;
}) {
  return (
    <View className={`items-center ${className}`}>
      <ProgressRing progress={progress} size={size} color={color} />
      <Text
        style={styles.progressLabel}
        className="text-neutral-900 dark:text-white"
      >
        {label}
      </Text>
      {sublabel && (
        <Text
          style={styles.progressSublabel}
          className="text-neutral-500 dark:text-neutral-400"
        >
          {sublabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  progressContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
  halfContainer: {
    overflow: 'hidden',
  },
  rightHalf: {
    position: 'absolute',
    right: 0,
  },
  leftHalf: {
    position: 'absolute',
    left: 0,
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  innerCircle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: -0.5,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 8,
    textAlign: 'center',
  },
  progressSublabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
    textAlign: 'center',
  },
});
