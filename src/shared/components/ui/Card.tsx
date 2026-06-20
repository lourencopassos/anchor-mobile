import React from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

const variantStyles: Record<string, string> = {
  default: 'bg-white',
  outlined: 'bg-white border border-neutral-200',
  elevated: 'bg-white shadow-md',
};

export function Card({
  children,
  onPress,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const cardStyles = `
    rounded-xl p-4
    ${variantStyles[variant]}
    ${className}
  `;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={cardStyles}
        activeOpacity={0.7}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={cardStyles} {...props}>
      {children}
    </View>
  );
}
