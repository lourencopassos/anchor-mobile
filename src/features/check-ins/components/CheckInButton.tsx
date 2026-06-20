import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface CheckInButtonProps {
  onPress: () => void;
  hasCheckedInToday: boolean;
  isPendingSync: boolean;
  disabled?: boolean;
}

/**
 * Large tappable check-in button with state awareness
 *
 * States:
 * - Ready (green): Can check in today
 * - Completed (green checkmark): Already checked in today
 * - Pending Sync (yellow): Checked in but waiting to sync
 */
export function CheckInButton({
  onPress,
  hasCheckedInToday,
  isPendingSync,
  disabled = false,
}: CheckInButtonProps) {
  const { t } = useTranslation('checkins');

  // Determine button state
  const isDisabled = disabled || hasCheckedInToday;

  // Get appropriate styling and content
  const getButtonStyle = () => {
    if (isPendingSync) {
      return 'bg-warning-500 active:bg-warning-600';
    }
    if (hasCheckedInToday) {
      return 'bg-success-500';
    }
    if (disabled) {
      return 'bg-neutral-300';
    }
    return 'bg-primary-500 active:bg-primary-600';
  };

  const getIcon = () => {
    if (isPendingSync) {
      return '🔄';
    }
    if (hasCheckedInToday) {
      return '✓';
    }
    return '✓';
  };

  const getText = () => {
    if (isPendingSync) {
      return t('pendingSync');
    }
    if (hasCheckedInToday) {
      return t('alreadyCheckedIn');
    }
    return t('checkInToday');
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        w-full py-5 px-6 rounded-2xl items-center justify-center
        ${getButtonStyle()}
        ${isDisabled ? 'opacity-80' : ''}
      `}
      accessibilityRole="button"
      accessibilityLabel={getText()}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-3xl">{getIcon()}</Text>
        <Text className="text-white text-xl font-semibold">{getText()}</Text>
      </View>
    </Pressable>
  );
}
