import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { useCommitment } from '@/features/commitments/hooks/useCommitment';
import { useSubmitCheckIn } from '@/features/check-ins/hooks/useSubmitCheckIn';
import { useCheckInHistory } from '@/features/check-ins/hooks/useCheckInHistory';
import { useNetworkSync } from '@/features/check-ins/hooks/useNetworkSync';
import { CheckInStatus, EvidenceType } from '@api/types';
import { CHECKIN } from '@config/constants';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

export default function CheckInScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('checkins');
  const { t: tCommon } = useTranslation('common');

  // State
  const [status, setStatus] = useState<CheckInStatus>(CheckInStatus.COMPLETED);
  const [notes, setNotes] = useState('');

  // Hooks
  const { data: commitment, isLoading: isLoadingCommitment } = useCommitment(id);
  const { submitCheckIn, isSubmitting, isOffline } = useSubmitCheckIn();
  const { hasCheckedInToday, pendingCount } = useCheckInHistory(
    id,
    commitment?.startDate
  );

  // Initialize network sync
  useNetworkSync();

  // Validation
  const isNotesTooLong = notes.length > CHECKIN.NOTES_MAX_LENGTH;
  const canSubmit =
    !hasCheckedInToday &&
    !isSubmitting &&
    !isNotesTooLong &&
    commitment?.state === 'ACTIVE';

  const handleSubmit = async () => {
    if (!id || !canSubmit) return;

    try {
      await submitCheckIn({
        commitmentId: id,
        status,
        evidenceType: EvidenceType.SELF_REPORT,
        notes: notes.trim() || undefined,
      });

      // Navigate to commitments list, show alert for offline case
      if (isOffline) {
        Alert.alert(t('success'), t('offline.message'));
      }
      router.replace('/(main)/commitments');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Something went wrong'
      );
    }
  };

  const handleBack = () => {
    router.replace('/(main)/commitments');
  };

  // Show loading state
  if (isLoadingCommitment) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack onBackPress={handleBack} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">{tCommon('loading')}</Text>
        </View>
      </SafeScreen>
    );
  }

  // Already checked in today
  if (hasCheckedInToday) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack onBackPress={handleBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">✓</Text>
          <Text className="text-xl font-semibold text-neutral-900 text-center mb-2">
            {t('alreadyCheckedIn')}
          </Text>
          {pendingCount > 0 && (
            <Text className="text-sm text-warning-600 text-center">
              {t('pendingSync')} ({pendingCount})
            </Text>
          )}
          <Button
            title={tCommon('back')}
            onPress={handleBack}
            variant="outline"
            className="mt-6"
          />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header title={t('title')} showBack onBackPress={handleBack} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Offline Banner */}
        {isOffline && (
          <View className="bg-warning-100 border border-warning-300 rounded-lg p-3 mb-4">
            <Text className="text-warning-800 font-medium">
              {t('offline.title')}
            </Text>
            <Text className="text-warning-700 text-sm mt-1">
              {t('offline.message')}
            </Text>
          </View>
        )}

        {/* Pending sync indicator */}
        {pendingCount > 0 && (
          <View className="bg-neutral-100 rounded-lg p-3 mb-4 flex-row items-center gap-2">
            <Text className="text-lg">🔄</Text>
            <Text className="text-neutral-700">
              {t('pendingSync')} ({pendingCount})
            </Text>
          </View>
        )}

        <Text className="text-lg text-neutral-600 mb-6">
          {t('checkInToday')}
        </Text>

        {/* Status Selector */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Status
          </Text>
          <View className="flex-row gap-3">
            <Card
              variant="outlined"
              className={`flex-1 ${status === CheckInStatus.COMPLETED ? 'bg-success-100 border-success-500' : ''}`}
              onPress={() => setStatus(CheckInStatus.COMPLETED)}
            >
              <View className="items-center py-2">
                <Text className="text-2xl mb-1">✓</Text>
                <Text
                  className={`text-center font-medium ${status === CheckInStatus.COMPLETED ? 'text-success-700' : 'text-neutral-700'}`}
                >
                  {t('status.completed')}
                </Text>
              </View>
            </Card>
            <Card
              variant="outlined"
              className={`flex-1 ${status === CheckInStatus.SKIPPED ? 'bg-neutral-200 border-neutral-500' : ''}`}
              onPress={() => setStatus(CheckInStatus.SKIPPED)}
            >
              <View className="items-center py-2">
                <Text className="text-2xl mb-1">−</Text>
                <Text
                  className={`text-center font-medium ${status === CheckInStatus.SKIPPED ? 'text-neutral-700' : 'text-neutral-700'}`}
                >
                  {t('status.skipped')}
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Notes Input */}
        <View className="mb-6">
          <Input
            label={t('notes')}
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            error={isNotesTooLong ? `Max ${CHECKIN.NOTES_MAX_LENGTH} characters` : undefined}
          />
          <Text
            className={`text-xs mt-1 text-right ${isNotesTooLong ? 'text-error-500' : 'text-neutral-500'}`}
          >
            {notes.length}/{CHECKIN.NOTES_MAX_LENGTH}
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title={isSubmitting ? tCommon('loading') : t('submit')}
          onPress={handleSubmit}
          disabled={!canSubmit}
          fullWidth
        />

        {/* Commitment not active warning */}
        {commitment && commitment.state !== 'ACTIVE' && (
          <Text className="text-sm text-warning-600 text-center mt-4">
            Check-ins are only available for active commitments
          </Text>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
