import React, { useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { haptics } from '@/shared/utils/haptics.utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Premium confetti colors matching our palette
const CONFETTI_COLORS = [
  '#2D5A4A', // Forest green
  '#4D8670', // Sage
  '#D4A574', // Warm gold
  '#B87333', // Copper
  '#87A878', // Light sage
  '#F5F0EB', // Cream
  '#4A7C8C', // Teal
];

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
  shape: 'square' | 'circle' | 'rectangle';
}

interface ConfettiCelebrationProps {
  autoPlay?: boolean;
  duration?: number;
  pieceCount?: number;
  onComplete?: () => void;
}

export interface ConfettiCelebrationRef {
  play: () => void;
  stop: () => void;
}

/**
 * ConfettiCelebration - Premium celebration animation
 *
 * Use this for successful check-ins and milestone achievements.
 * Provides a satisfying burst of confetti with haptic feedback.
 */
export const ConfettiCelebration = forwardRef<ConfettiCelebrationRef, ConfettiCelebrationProps>(
  ({ autoPlay = false, duration = 2500, pieceCount = 50, onComplete }, ref) => {
    const isPlaying = useSharedValue(false);
    const confettiPieces = React.useMemo(() => generateConfetti(pieceCount), [pieceCount]);

    const play = useCallback(() => {
      isPlaying.value = true;
      haptics.heavy();

      // Secondary haptic bursts
      setTimeout(() => haptics.medium(), 150);
      setTimeout(() => haptics.light(), 300);
    }, [isPlaying]);

    const stop = useCallback(() => {
      isPlaying.value = false;
    }, [isPlaying]);

    useImperativeHandle(ref, () => ({ play, stop }), [play, stop]);

    useEffect(() => {
      if (autoPlay) {
        play();
      }
    }, [autoPlay, play]);

    useEffect(() => {
      if (isPlaying.value && onComplete) {
        const timeout = setTimeout(() => {
          runOnJS(onComplete)();
        }, duration);
        return () => clearTimeout(timeout);
      }
    }, [duration, isPlaying.value, onComplete]);

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confettiPieces.map((piece) => (
          <ConfettiPieceComponent
            key={piece.id}
            piece={piece}
            isPlaying={isPlaying}
            duration={duration}
          />
        ))}
      </View>
    );
  }
);

ConfettiCelebration.displayName = 'ConfettiCelebration';

interface ConfettiPieceComponentProps {
  piece: ConfettiPiece;
  isPlaying: Animated.SharedValue<boolean>;
  duration: number;
}

function ConfettiPieceComponent({ piece, isPlaying, duration }: ConfettiPieceComponentProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(piece.x);
  const rotate = useSharedValue(piece.rotation);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isPlaying.value) {
      // Initial burst
      scale.value = withDelay(
        piece.delay,
        withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 12 })
        )
      );

      opacity.value = withDelay(
        piece.delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(duration - 600, withTiming(0, { duration: 500 }))
        )
      );

      // Fall animation
      translateY.value = withDelay(
        piece.delay,
        withTiming(SCREEN_HEIGHT + 100, {
          duration: duration - piece.delay,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      // Horizontal drift
      const drift = (Math.random() - 0.5) * 100;
      translateX.value = withDelay(
        piece.delay,
        withTiming(piece.x + drift, {
          duration: duration - piece.delay,
          easing: Easing.inOut(Easing.ease),
        })
      );

      // Rotation
      rotate.value = withDelay(
        piece.delay,
        withTiming(piece.rotation + (Math.random() - 0.5) * 720, {
          duration: duration - piece.delay,
        })
      );
    } else {
      // Reset
      translateY.value = -50;
      translateX.value = piece.x;
      rotate.value = piece.rotation;
      scale.value = 0;
      opacity.value = 0;
    }
  }, [isPlaying.value, piece, duration, translateY, translateX, rotate, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: rotate.value + 'deg' },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const shapeStyle = getShapeStyle(piece);

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        shapeStyle,
        { backgroundColor: piece.color },
        animatedStyle,
      ]}
    />
  );
}

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 400,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    shape: ['square', 'circle', 'rectangle'][Math.floor(Math.random() * 3)] as ConfettiPiece['shape'],
  }));
}

function getShapeStyle(piece: ConfettiPiece) {
  switch (piece.shape) {
    case 'circle':
      return {
        width: piece.size,
        height: piece.size,
        borderRadius: piece.size / 2,
      };
    case 'rectangle':
      return {
        width: piece.size * 0.4,
        height: piece.size * 1.2,
        borderRadius: 2,
      };
    case 'square':
    default:
      return {
        width: piece.size,
        height: piece.size,
        borderRadius: 2,
      };
  }
}

/**
 * SuccessBurst - Simpler radial burst animation
 *
 * Use this for smaller celebrations like streaks or badges.
 */
export function SuccessBurst({
  isActive,
  color = '#2D5A4A',
  size = 100,
}: {
  isActive: boolean;
  color?: string;
  size?: number;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withSpring(1.5, { damping: 8 }),
        withTiming(2, { duration: 300 })
      );
      opacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [isActive, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.burstContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.burst,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
  },
  burstContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
  },
});
