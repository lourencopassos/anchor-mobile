import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

export interface Country {
  code: string;
  name: string;
  flag: string;
  paymentMethod: string;
}

const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', paymentMethod: 'Card' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', paymentMethod: 'PIX / Card' },
];

interface CountrySelectorProps {
  value?: string;
  onChange: (country: string) => void;
  label?: string;
  helperText?: string;
}

export function CountrySelector({
  value,
  onChange,
  label,
  helperText,
}: CountrySelectorProps) {
  const { t } = useTranslation('common');

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row gap-3">
        {SUPPORTED_COUNTRIES.map((country) => {
          const isSelected = value === country.code;
          return (
            <Pressable
              key={country.code}
              onPress={() => onChange(country.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${country.name}, ${country.paymentMethod}`}
              className={`flex-1 p-4 rounded-xl border-2 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <Text className="text-2xl mb-2">{country.flag}</Text>
              <Text
                className={`text-base font-semibold ${
                  isSelected ? 'text-primary-700' : 'text-neutral-900'
                }`}
              >
                {country.name}
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  isSelected ? 'text-primary-600' : 'text-neutral-500'
                }`}
              >
                {country.paymentMethod}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {helperText && (
        <Text className="text-xs text-neutral-500 mt-2">{helperText}</Text>
      )}
    </View>
  );
}

export { SUPPORTED_COUNTRIES };
