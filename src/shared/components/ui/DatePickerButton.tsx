import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface DatePickerButtonProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  helperText?: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePickerButton({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  error,
  helperText,
}: DatePickerButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const hasError = !!error;

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const handleIOSClose = () => {
    setShowPicker(false);
  };

  const handleWebDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = event.target.value;
    if (dateString) {
      // Parse the date string (YYYY-MM-DD) and create a date at noon to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day, 12, 0, 0);
      onChange(selectedDate);
    }
  };

  // Web platform uses native HTML date input
  if (Platform.OS === 'web') {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-neutral-700 text-sm font-medium mb-1">
            {label}
          </Text>
        )}
        <View
          className={`
            bg-white border rounded-lg overflow-hidden
            ${hasError ? 'border-error' : 'border-neutral-300'}
          `}
        >
          <input
            type="date"
            value={value ? formatDateForInput(value) : ''}
            onChange={handleWebDateChange}
            min={minimumDate ? formatDateForInput(minimumDate) : undefined}
            max={maximumDate ? formatDateForInput(maximumDate) : undefined}
            placeholder={placeholder}
            aria-label={label}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: value ? '#171717' : '#a3a3a3',
              fontFamily: 'inherit',
            }}
          />
        </View>

        {error && <Text className="text-error text-sm mt-1">{error}</Text>}
        {helperText && !error && (
          <Text className="text-neutral-500 text-sm mt-1">{helperText}</Text>
        )}
      </View>
    );
  }

  // Native platforms (iOS/Android) use the native date picker
  return (
    <View className="w-full">
      {label && (
        <Text className="text-neutral-700 text-sm font-medium mb-1">
          {label}
        </Text>
      )}
      <Pressable
        onPress={handlePress}
        className={`
          bg-white border rounded-lg px-4 py-3
          ${hasError ? 'border-error' : 'border-neutral-300'}
        `}
        accessibilityLabel={label}
        accessibilityHint={helperText || placeholder}
        accessibilityRole="button"
      >
        <Text
          className={value ? 'text-neutral-900 text-base' : 'text-neutral-400 text-base'}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      {error && <Text className="text-error text-sm mt-1">{error}</Text>}
      {helperText && !error && (
        <Text className="text-neutral-500 text-sm mt-1">{helperText}</Text>
      )}

      {showPicker && (
        <>
          {Platform.OS === 'ios' && (
            <View className="flex-row justify-end mt-2">
              <Pressable onPress={handleIOSClose} className="px-4 py-2">
                <Text className="text-primary-500 font-medium">Done</Text>
              </Pressable>
            </View>
          )}
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        </>
      )}
    </View>
  );
}
