import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

// Premium color presets
const GRADIENT_PRESETS = {
  forest: {
    colors: ['#2D5A4A', '#1F4034', '#11261E'] as const,
    orbColors: ['rgba(135, 168, 120, 0.25)', 'rgba(77, 134, 112, 0.2)', 'rgba(45, 90, 74, 0.15)'],
  },
  warm: {
    colors: ['#D4A574', '#B87333', '#8B5A2B'] as const,
    orbColors: ['rgba(212, 165, 116, 0.3)', 'rgba(184, 115, 51, 0.25)', 'rgba(139, 90, 43, 0.2)'],
  },
  sage: {
    colors: ['#87A878', '#6B8B5E', '#4D6B4A'] as const,
    orbColors: ['rgba(135, 168, 120, 0.3)', 'rgba(107, 139, 94, 0.25)', 'rgba(77, 107, 74, 0.2)'],
  },
  neutral: {
    colors: ['#57534E', '#44403C', '#292524'] as const,
    orbColors: ['rgba(120, 113, 108, 0.25)', 'rgba(87, 83, 78, 0.2)', 'rgba(68, 64, 60, 0.15)'],
  },
  cream: {
    colors: ['#F5F0EB', '#E8E2DC', '#D6D0CA'] as const,
    orbColors: ['rgba(212, 165, 116, 0.1)', 'rgba(135, 168, 120, 0.08)', 'rgba(74, 124, 140, 0.08)'],
  },
} as const;

type GradientPreset = keyof typeof GRADIENT_PRESETS;

interface MeshGradientProps extends ViewProps {
  preset?: GradientPreset;
  colors?: readonly [string, string, string];
  animated?: boolean;
  intensity?: 'subtle' | 'medium' | 'strong';
}

/**
 * MeshGradient - Premium animated gradient background with floating orbs
 *
 * Creates a sophisticated, multi-layered gradient effect that adds
 * depth and visual interest to hero sections and cards.
 *
 * Uses View-based orbs instead of SVG for Hermes compatibility.
 */
export function MeshGradient({
  preset = 'forest',
  colors,
  animated = true,
  intensity = 'medium',
  style,
  children,
  ...props
}: MeshGradientProps) {
  const { width } = Dimensions.get('window');
  const gradientConfig = GRADIENT_PRESETS[preset];
  const baseColors = colors || gradientConfig.colors;

  // Animation values for floating orbs
  const orb1Progress = useSharedValue(0);
  const orb2Progress = useSharedValue(0);
  const orb3Progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      orb1Progress.value = withRepeat(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      orb2Progress.value = withRepeat(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      orb3Progress.value = withRepeat(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [animated, orb1Progress, orb2Progress, orb3Progress]);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb1Progress.value, [0, 1], [-20, 20]) },
      { translateY: interpolate(orb1Progress.value, [0, 1], [-15, 15]) },
      { scale: interpolate(orb1Progress.value, [0, 0.5, 1], [1, 1.1, 1]) },
    ],
    opacity: interpolate(orb1Progress.value, [0, 0.5, 1], [0.6, 0.8, 0.6]),
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb2Progress.value, [0, 1], [15, -15]) },
      { translateY: interpolate(orb2Progress.value, [0, 1], [20, -20]) },
      { scale: interpolate(orb2Progress.value, [0, 0.5, 1], [1, 1.15, 1]) },
    ],
    opacity: interpolate(orb2Progress.value, [0, 0.5, 1], [0.5, 0.7, 0.5]),
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb3Progress.value, [0, 1], [-10, 10]) },
      { translateY: interpolate(orb3Progress.value, [0, 1], [-25, 25]) },
      { scale: interpolate(orb3Progress.value, [0, 0.5, 1], [1, 1.2, 1]) },
    ],
    opacity: interpolate(orb3Progress.value, [0, 0.5, 1], [0.4, 0.6, 0.4]),
  }));

  const intensityScale = {
    subtle: 0.6,
    medium: 1,
    strong: 1.4,
  }[intensity];

  const orbSize1 = width * 0.8;
  const orbSize2 = width * 0.6;
  const orbSize3 = width * 0.5;

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Base gradient layer */}
      <LinearGradient
        colors={[...baseColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated orb layers - using View with backgroundColor for Hermes compatibility */}
      <AnimatedView
        style={[
          styles.orb,
          styles.orb1,
          {
            width: orbSize1,
            height: orbSize1,
            borderRadius: orbSize1 / 2,
            backgroundColor: gradientConfig.orbColors[0],
            opacity: intensityScale,
          },
          orb1Style,
        ]}
      />

      <AnimatedView
        style={[
          styles.orb,
          styles.orb2,
          {
            width: orbSize2,
            height: orbSize2,
            borderRadius: orbSize2 / 2,
            backgroundColor: gradientConfig.orbColors[1],
            opacity: intensityScale * 0.8,
          },
          orb2Style,
        ]}
      />

      <AnimatedView
        style={[
          styles.orb,
          styles.orb3,
          {
            width: orbSize3,
            height: orbSize3,
            borderRadius: orbSize3 / 2,
            backgroundColor: gradientConfig.orbColors[2],
            opacity: intensityScale * 0.6,
          },
          orb3Style,
        ]}
      />

      {/* Content */}
      {children}
    </View>
  );
}

/**
 * SimpleGradient - Non-animated gradient for lighter usage
 */
export function SimpleGradient({
  preset = 'forest',
  colors,
  style,
  children,
  ...props
}: Omit<MeshGradientProps, 'animated' | 'intensity'>) {
  const gradientConfig = GRADIENT_PRESETS[preset];
  const baseColors = colors || gradientConfig.colors;

  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[...baseColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
  orb1: {
    top: '-20%',
    left: '-10%',
  },
  orb2: {
    bottom: '-15%',
    right: '-20%',
  },
  orb3: {
    top: '40%',
    left: '30%',
  },
});
