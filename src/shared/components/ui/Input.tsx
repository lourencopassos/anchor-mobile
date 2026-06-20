import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <View className="w-full">
        {label && (
          <Text className="text-neutral-700 text-sm font-medium mb-1">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`
            bg-white border rounded-lg px-4 py-3 text-base text-neutral-900
            ${hasError ? 'border-error' : 'border-neutral-300'}
            ${props.editable === false ? 'bg-neutral-100 text-neutral-500' : ''}
            ${className}
          `}
          placeholderTextColor="#9E9E9E"
          accessibilityLabel={label}
          accessibilityHint={helperText}
          {...props}
        />
        {error && (
          <Text className="text-error text-sm mt-1">{error}</Text>
        )}
        {helperText && !error && (
          <Text className="text-neutral-500 text-sm mt-1">{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
