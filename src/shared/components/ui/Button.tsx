import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/shared/utils/haptics.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premium';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

// Premium design system colors
const COLORS = {
  primary: '#2D5A4A',
  primaryDark: '#1F4034',
  secondary: '#F5F5F4',
  secondaryDark: '#E7E5E4',
  outline: '#2D5A4A',
  ghost: '#57534E',
  danger: '#B54548',
  dangerDark: '#9A3A3D',
  premium: ['#2D5A4A', '#11261E'] as const,
  text: {
    primary: '#FFFFFF',
    secondary: '#1C1917',
    outline: '#2D5A4A',
    ghost: '#44403C',
    danger: '#FFFFFF',
    premium: '#FFFFFF',
  },
};

const sizeConfig = {
  sm: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    borderRadius: 10,
    iconSize: 16,
    gap: 6,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    borderRadius: 12,
    iconSize: 18,
    gap: 8,
  },
  lg: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    fontSize: 17,
    borderRadius: 14,
    iconSize: 20,
    gap: 10,
  },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const config = sizeConfig[size];

  // Animation values
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    shadowOpacity.value = withTiming(0.5, { duration: 100 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    shadowOpacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = (e: any) => {
    if (!isDisabled && onPress) {
      haptics.medium();
      onPress(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(shadowOpacity.value, [0, 1], [0.08, 0.2]),
  }));

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return COLORS.danger;
      case 'premium':
        return undefined; // Uses gradient
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    return COLORS.text[variant] || COLORS.text.primary;
  };

  const renderContent = () => (
    <View style={[styles.content, { gap: config.gap }]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ width: config.iconSize, height: config.iconSize }}>
              {icon}
            </View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: config.fontSize,
                fontFamily: 'PlusJakartaSans_600SemiBold',
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={{ width: config.iconSize, height: config.iconSize }}>
              {icon}
            </View>
          )}
        </>
      )}
    </View>
  );

  const baseButtonStyle = [
    styles.button,
    {
      paddingHorizontal: config.paddingHorizontal,
      paddingVertical: config.paddingVertical,
      borderRadius: config.borderRadius,
      backgroundColor: getBackgroundColor(),
    },
    variant === 'outline' && styles.outlineButton,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
  ];

  // Premium variant with gradient
  if (variant === 'premium') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        style={[animatedStyle, shadowAnimatedStyle, styles.premiumShadow]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        {...props}
      >
        <LinearGradient
          colors={[...COLORS.premium]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            styles.premiumGradient,
            {
              paddingHorizontal: config.paddingHorizontal,
              paddingVertical: config.paddingVertical,
              borderRadius: config.borderRadius,
            },
            fullWidth && styles.fullWidth,
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        baseButtonStyle,
        animatedStyle,
        variant === 'primary' && shadowAnimatedStyle,
        variant === 'primary' && styles.primaryShadow,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

/**
 * IconButton - Compact button for icon-only actions
 */
export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  onPress,
  disabled,
  accessibilityLabel,
  ...props
}: Omit<ButtonProps, 'title' | 'icon'> & {
  icon: React.ReactNode;
  accessibilityLabel: string;
}) {
  const scale = useSharedValue(1);
  const isDisabled = disabled;

  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const handlePress = (e: any) => {
    if (!isDisabled && onPress) {
      haptics.medium();
      onPress(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonSize = iconSizes[size];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.iconButton,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: variant === 'ghost' ? 'transparent' : COLORS[variant as keyof typeof COLORS] || 'transparent',
        },
        animatedStyle,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!isDisabled }}
      {...props}
    >
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.3,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.outline,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  primaryShadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  premiumShadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  premiumGradient: {
    overflow: 'hidden',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
