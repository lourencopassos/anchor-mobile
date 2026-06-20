import { useState, useEffect, useCallback } from 'react';
import { View, Text, Switch, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useUserProfile, useUpdateUserProfile } from '@/features/user/hooks';
import type { NotificationPreferences } from '@api/types/user.types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

// Reminder lead time options (in minutes)
const REMINDER_LEAD_TIMES = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

export default function SettingsScreen() {
  useHideTabBar();
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();

  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  // Local state for settings
  const [checkInRemindersEnabled, setCheckInRemindersEnabled] = useState(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from profile
  useEffect(() => {
    if (profile?.notificationPreferences) {
      setCheckInRemindersEnabled(
        profile.notificationPreferences.checkInRemindersEnabled ?? true
      );
      setReminderLeadTime(
        profile.notificationPreferences.reminderLeadTimeOverride ?? null
      );
    }
  }, [profile]);

  const handleToggleReminders = useCallback((value: boolean) => {
    setCheckInRemindersEnabled(value);
    setHasChanges(true);
  }, []);

  const handleLeadTimeChange = useCallback((value: number | null) => {
    setReminderLeadTime(value);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const notificationPreferences: Partial<NotificationPreferences> = {
        ...profile?.notificationPreferences,
        checkInRemindersEnabled,
        reminderLeadTimeOverride: reminderLeadTime ?? undefined,
      };

      await updateProfile.mutateAsync({ notificationPreferences });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [
    profile,
    checkInRemindersEnabled,
    reminderLeadTime,
    updateProfile,
  ]);

  return (
    <SafeScreen>
      <Header
        title={t('title')}
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Check-in Reminders Section */}
        <Card variant="outlined" className="mb-4">
          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            {t('reminders.title')}
          </Text>

          {/* Enable/Disable Reminders */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-base text-neutral-800">
                {t('reminders.enable')}
              </Text>
              <Text className="text-sm text-neutral-500">
                {t('reminders.enableDescription')}
              </Text>
            </View>
            <Switch
              value={checkInRemindersEnabled}
              onValueChange={handleToggleReminders}
              disabled={isLoading}
            />
          </View>

          {/* Lead Time Override (only shown when reminders enabled) */}
          {checkInRemindersEnabled && (
            <>
              <View className="h-px bg-neutral-100 my-4" />

              <Text className="text-base text-neutral-800 mb-2">
                {t('reminders.leadTime')}
              </Text>
              <Text className="text-sm text-neutral-500 mb-3">
                {t('reminders.leadTimeDescription')}
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {/* Default option */}
                <Pressable
                  onPress={() => handleLeadTimeChange(null)}
                  className={`px-4 py-2 rounded-lg border ${
                    reminderLeadTime === null
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      reminderLeadTime === null
                        ? 'text-primary-600'
                        : 'text-neutral-700'
                    }`}
                  >
                    {t('reminders.useCommitmentDefault')}
                  </Text>
                </Pressable>

                {/* Specific times */}
                {REMINDER_LEAD_TIMES.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleLeadTimeChange(option.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      reminderLeadTime === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        reminderLeadTime === option.value
                          ? 'text-primary-600'
                          : 'text-neutral-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </Card>

        {/* Info Card */}
        <Card variant="outlined" className="bg-neutral-50 border-neutral-200">
          <View className="flex-row items-start gap-3">
            <Text className="text-xl">ℹ️</Text>
            <View className="flex-1">
              <Text className="text-sm text-neutral-600 leading-relaxed">
                {t('reminders.infoText')}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View className="mt-4">
          <Button
            title={tCommon('save')}
            onPress={handleSave}
            loading={updateProfile.isPending}
            fullWidth
          />
        </View>
      )}
    </SafeScreen>
  );
}
