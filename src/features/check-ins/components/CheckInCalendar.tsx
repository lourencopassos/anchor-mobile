import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import type { CheckIn } from '@api/types';

interface CheckInCalendarProps {
  checkIns: CheckIn[];
  startDate: string;
  endDate: string;
  onDayPress?: (date: string) => void;
}

type DayStatus = 'completed' | 'skipped' | 'missed' | 'future' | 'outside';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/**
 * Get the status of a day based on check-ins
 */
function getDayStatus(
  date: Date,
  checkIns: CheckIn[],
  cycleStart: Date,
  cycleEnd: Date,
  today: Date
): DayStatus {
  // Normalize all dates to start of day for consistent comparison
  const dateOnly = startOfDay(date);
  const cycleStartDay = startOfDay(cycleStart);
  const cycleEndDay = startOfDay(cycleEnd);
  const todayDay = startOfDay(today);

  // Find check-in for this date using string comparison to avoid timezone issues
  // Check this FIRST - if there's a check-in, show it regardless of cycle boundaries
  const dateStr = format(date, 'yyyy-MM-dd');
  const checkIn = checkIns.find((c) => {
    // Extract date part only (handles both "2026-01-14" and "2026-01-14T00:00:00Z")
    const checkInDateStr = c.checkInDate.split('T')[0];
    return checkInDateStr === dateStr;
  });

  // If we have a check-in for this date, show its status
  if (checkIn) {
    // Compare against string values directly for reliability
    const status = String(checkIn.status).toUpperCase();
    if (status === 'COMPLETED') return 'completed';
    if (status === 'SKIPPED') return 'skipped';
    if (status === 'MISSED') return 'missed';
  }

  // Outside the commitment period (no check-in exists)
  if (isBefore(dateOnly, cycleStartDay) || isAfter(dateOnly, cycleEndDay)) {
    return 'outside';
  }

  // Future date (after today)
  if (isAfter(dateOnly, todayDay)) {
    return 'future';
  }

  // Past date within cycle with no check-in = missed
  return 'missed';
}

/**
 * Get background color class for day status
 */
function getStatusColor(status: DayStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-success-500';
    case 'skipped':
      return 'bg-neutral-300';
    case 'missed':
      return 'bg-error-400';
    case 'future':
      return 'bg-primary-50 border border-dashed border-primary-300';
    case 'outside':
      return 'bg-transparent';
  }
}

/**
 * Get text color class for day status
 */
function getTextColor(status: DayStatus, isCurrentMonth: boolean): string {
  if (!isCurrentMonth) {
    return 'text-neutral-300';
  }
  switch (status) {
    case 'completed':
    case 'missed':
      return 'text-white';
    case 'skipped':
      return 'text-neutral-700';
    case 'future':
      return 'text-primary-600';
    case 'outside':
      return 'text-neutral-400';
  }
}

/**
 * Month view calendar showing check-in history with color-coded days
 */
export function CheckInCalendar({
  checkIns,
  startDate,
  endDate,
  onDayPress,
}: CheckInCalendarProps) {
  const { t } = useTranslation(['checkins', 'commitments']);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekdays = useMemo(
    () => WEEKDAY_KEYS.map((key) => t(`commitments:frequency.days.${key}`)),
    [t]
  );

  const cycleStart = parseISO(startDate);
  const cycleEnd = parseISO(endDate);
  const today = new Date();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayPress = (date: Date) => {
    if (onDayPress) {
      onDayPress(format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <View className="bg-white rounded-xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={handlePrevMonth} className="p-2">
          <Text className="text-lg text-primary-600">{'<'}</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-neutral-900">
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <Pressable onPress={handleNextMonth} className="p-2">
          <Text className="text-lg text-primary-600">{'>'}</Text>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View className="flex-row mb-2">
        {weekdays.map((day) => (
          <View key={day} className="flex-1 items-center">
            <Text className="text-xs text-neutral-500 font-medium">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, today);
          const status = getDayStatus(date, checkIns, cycleStart, cycleEnd, today);

          return (
            <Pressable
              key={index}
              onPress={() => handleDayPress(date)}
              className="w-[14.28%] aspect-square items-center justify-center p-1"
            >
              <View
                className={`
                  w-8 h-8 rounded-full items-center justify-center
                  ${isCurrentMonth ? getStatusColor(status) : ''}
                  ${isToday ? 'border-2 border-primary-600' : ''}
                `}
              >
                <Text
                  className={`
                    text-sm font-medium
                    ${getTextColor(status, isCurrentMonth)}
                  `}
                >
                  {format(date, 'd')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-neutral-100">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-success-500" />
          <Text className="text-xs text-neutral-600">
            {t('status.completed')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-error-400" />
          <Text className="text-xs text-neutral-600">{t('status.missed')}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-neutral-300" />
          <Text className="text-xs text-neutral-600">{t('status.skipped')}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-primary-50 border border-dashed border-primary-300" />
          <Text className="text-xs text-neutral-600">{t('status.upcoming')}</Text>
        </View>
      </View>
    </View>
  );
}
