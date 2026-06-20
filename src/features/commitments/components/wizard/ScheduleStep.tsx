import React, { useState } from 'react';
import { View, Text, Pressable, Switch, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ScheduleStepProps {
  preferredTime: string | null;
  reminderMinutesBefore: number;
  reminderAtTime: boolean;
  onPreferredTimeChange: (time: string | null) => void;
  onReminderMinutesChange: (minutes: number) => void;
  onReminderAtTimeChange: (enabled: boolean) => void;
}

const REMINDER_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

export function ScheduleStep({
  preferredTime,
  reminderMinutesBefore,
  reminderAtTime,
  onPreferredTimeChange,
  onReminderMinutesChange,
  onReminderAtTimeChange,
}: ScheduleStepProps) {
  const { t } = useTranslation('commitments');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasPreferredTime, setHasPreferredTime] = useState(!!preferredTime);

  // Convert HH:mm string to Date for picker
  const getTimeAsDate = (): Date => {
    const date = new Date();
    if (preferredTime) {
      const [hours, minutes] = preferredTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  };

  // Format Date to HH:mm string
  const formatTimeToString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format time for display (12h format)
  const formatTimeForDisplay = (time: string | null): string => {
    if (!time) return t('schedule.noPreference');
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleTogglePreferredTime = (enabled: boolean) => {
    setHasPreferredTime(enabled);
    if (!enabled) {
      onPreferredTimeChange(null);
    } else {
      // Default to 9:00 AM when enabling
      onPreferredTimeChange('09:00');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onPreferredTimeChange(formatTimeToString(selectedDate));
    }
  };

  return (
    <View>
      {/* Header */}
      <Text className="text-lg font-semibold text-neutral-700 mb-2">
        {t('schedule.title')}
      </Text>
      <Text className="text-sm text-neutral-500 mb-6">
        {t('schedule.subtitle')}
      </Text>

      {/* Preferred Time Toggle */}
      <View className="bg-white rounded-2xl p-4 border border-neutral-200 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center">
              <Text className="text-xl">⏰</Text>
            </View>
            <View>
              <Text className="font-semibold text-neutral-800">
                {t('schedule.setPreferredTime')}
              </Text>
              <Text className="text-xs text-neutral-500">
                {t('schedule.setPreferredTimeDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={hasPreferredTime}
            onValueChange={handleTogglePreferredTime}
            trackColor={{ false: '#d4d4d4', true: '#c7d2fe' }}
            thumbColor={hasPreferredTime ? '#6366f1' : '#f4f4f5'}
          />
        </View>

        {/* Time Picker Button */}
        {hasPreferredTime && (
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="active:scale-[0.98]"
          >
            <View className="bg-neutral-50 rounded-xl p-4 flex-row items-center justify-between">
              <Text className="text-neutral-600">
                {t('schedule.preferredTimeLabel')}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-primary-600 font-bold text-lg">
                  {formatTimeForDisplay(preferredTime)}
                </Text>
                <Text className="text-neutral-400">›</Text>
              </View>
            </View>
          </Pressable>
        )}
      </View>

      {/* Reminder Settings (only show if preferred time is set) */}
      {hasPreferredTime && (
        <>
          {/* Reminder Before */}
          <View className="bg-white rounded-2xl p-4 border border-neutral-200 mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center">
                <Text className="text-xl">🔔</Text>
              </View>
              <Text className="font-semibold text-neutral-800">
                {t('schedule.reminderBefore')}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {REMINDER_OPTIONS.map((option) => {
                const isSelected = reminderMinutesBefore === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onReminderMinutesChange(option.value)}
                    className="active:scale-95"
                  >
                    <View
                      className={`
                        px-4 py-2.5 rounded-xl border-2
                        ${isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 bg-neutral-50'}
                      `}
                    >
                      <Text
                        className={`
                          font-medium
                          ${isSelected ? 'text-primary-600' : 'text-neutral-600'}
                        `}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Reminder At Time Toggle */}
          <View className="bg-white rounded-2xl p-4 border border-neutral-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                  <Text className="text-xl">📍</Text>
                </View>
                <View>
                  <Text className="font-semibold text-neutral-800">
                    {t('schedule.reminderAtTime')}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {t('schedule.reminderAtTimeDesc')}
                  </Text>
                </View>
              </View>
              <Switch
                value={reminderAtTime}
                onValueChange={onReminderAtTimeChange}
                trackColor={{ false: '#d4d4d4', true: '#bbf7d0' }}
                thumbColor={reminderAtTime ? '#22c55e' : '#f4f4f5'}
              />
            </View>
          </View>
        </>
      )}

      {/* Info Box */}
      <View className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-lg bg-white items-center justify-center shadow-sm">
            <Text className="text-base">💡</Text>
          </View>
          <View className="flex-1">
            <Text className="text-green-800 font-semibold text-sm mb-1">
              {t('schedule.softEnforcement.title')}
            </Text>
            <Text className="text-green-600 text-sm leading-5">
              {t('schedule.softEnforcement.description')}
            </Text>
          </View>
        </View>
      </View>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={getTimeAsDate()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
