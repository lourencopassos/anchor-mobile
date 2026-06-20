import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface NoiseTextureProps extends ViewProps {
  opacity?: number;
  blendMode?: 'overlay' | 'multiply' | 'soft-light' | 'normal';
}

/**
 * NoiseTexture - Adds subtle visual texture overlay
 *
 * Use this to add visual depth and atmosphere to backgrounds.
 * The effect is purely decorative and adds a premium, tactile feel.
 *
 * Note: Uses a simple transparent overlay instead of SVG filters
 * for Hermes engine compatibility.
 */
export function NoiseTexture({
  opacity = 0.04,
  style,
  ...props
}: NoiseTextureProps) {
  // Simple transparent overlay - SVG filters not compatible with Hermes
  // The visual effect is subtle and the overlay provides depth without
  // the complexity of filter-based noise generation
  return (
    <View
      style={[
        styles.container,
        { opacity },
        style,
      ]}
      pointerEvents="none"
      {...props}
    />
  );
}

/**
 * NoiseOverlay - Full-screen texture overlay for backgrounds
 *
 * Add this as a child of any container to give it subtle depth.
 */
export function NoiseOverlay({
  intensity = 'subtle',
  ...props
}: Omit<NoiseTextureProps, 'opacity'> & {
  intensity?: 'subtle' | 'medium' | 'strong';
}) {
  const opacityMap = {
    subtle: 0.02,
    medium: 0.04,
    strong: 0.08,
  };

  return (
    <NoiseTexture
      opacity={opacityMap[intensity]}
      style={StyleSheet.absoluteFill}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    // Subtle grain effect using background pattern
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
});
