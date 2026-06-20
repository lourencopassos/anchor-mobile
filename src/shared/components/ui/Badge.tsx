import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-200',
  success: 'bg-green-100',
  warning: 'bg-yellow-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-neutral-700',
  success: 'text-green-700',
  warning: 'text-yellow-700',
  error: 'text-red-700',
  info: 'text-blue-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
};

const sizeTextStyles: Record<BadgeSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

export function Badge({
  label,
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  return (
    <View
      className={`
        rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      <Text
        className={`
          font-medium
          ${variantTextStyles[variant]}
          ${sizeTextStyles[size]}
        `}
      >
        {label}
      </Text>
    </View>
  );
}
