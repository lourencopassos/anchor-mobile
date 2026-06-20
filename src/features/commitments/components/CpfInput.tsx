import React, { forwardRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { Input } from '@/shared/components/ui/Input';

interface CpfInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
}

/**
 * Format CPF as user types: 000.000.000-00
 */
function formatCpf(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 11 digits
  const limited = digits.slice(0, 11);

  // Apply formatting
  if (limited.length <= 3) {
    return limited;
  }
  if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  }
  if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  }
  return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
}

/**
 * Extract raw digits from formatted CPF
 */
function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validate CPF has exactly 11 digits
 */
export function isValidCpf(value: string): boolean {
  const digits = extractDigits(value);
  return digits.length === 11;
}

export const CpfInput = forwardRef<TextInput, CpfInputProps>(
  ({ value, onChange, label, error, helperText, placeholder }, ref) => {
    const handleChangeText = useCallback(
      (text: string) => {
        const formatted = formatCpf(text);
        onChange(formatted);
      },
      [onChange]
    );

    return (
      <Input
        ref={ref}
        label={label}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        keyboardType="numeric"
        maxLength={14} // 000.000.000-00
        autoComplete="off"
        autoCorrect={false}
      />
    );
  }
);

CpfInput.displayName = 'CpfInput';
