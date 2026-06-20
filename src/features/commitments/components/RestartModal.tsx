import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { DatePickerButton } from '@/shared/components/ui/DatePickerButton';
import { Card } from '@/shared/components/ui/Card';
import { formatCurrency } from '@/shared/utils/format.utils';
import { useRestartCommitment } from '../hooks';
import type { RecoveryMode, Commitment } from '@api/types';
import type { FrequencyType, DayOfWeek } from '@api/types/commitment.types';
import {
  getEasierFrequencyRecommendation,
  formatFrequency,
} from '@api/types/commitment.types';
import { FrequencyStep } from './wizard/FrequencyStep';

interface RestartModalProps {
  visible: boolean;
  onClose: () => void;
  commitment: Commitment;
  onSuccess?: () => void;
}

interface RecoveryOption {
  mode: RecoveryMode;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  requiresNewStake: boolean;
}

const RECOVERY_OPTIONS: RecoveryOption[] = [
  {
    mode: 'RETRY_WITH_SAME_RULES',
    titleKey: 'restart.sameRules',
    descriptionKey: 'restart.sameRulesDesc',
    icon: '🔄',
    requiresNewStake: false,
  },
  {
    mode: 'FULL_RESET',
    titleKey: 'restart.fullReset',
    descriptionKey: 'restart.fullResetDesc',
    icon: '🆕',
    requiresNewStake: true,
  },
  {
    mode: 'ADJUSTED_RETRY',
    titleKey: 'restart.adjusted',
    descriptionKey: 'restart.adjustedDesc',
    icon: '⚙️',
    requiresNewStake: true,
  },
];

const STAKE_AMOUNTS = [500, 2500, 5000, 10000, 25000];

export function RestartModal({
  visible,
  onClose,
  commitment,
  onSuccess,
}: RestartModalProps) {
  const { t } = useTranslation('commitments');
  const { t: tCommon } = useTranslation('common');
  const restartMutation = useRestartCommitment(commitment.id);

  const [step, setStep] = useState<'mode' | 'dates' | 'frequency' | 'stake'>('mode');
  const [selectedMode, setSelectedMode] = useState<RecoveryMode | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [stakeAmount, setStakeAmount] = useState(commitment.stakeAmountCents ?? 2500);

  // Frequency state for ADJUSTED_RETRY mode
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('DAILY');
  const [frequencyTargetCount, setFrequencyTargetCount] = useState(3);
  const [frequencySpecificDays, setFrequencySpecificDays] = useState<DayOfWeek[]>([]);
  const [useRecommendedFrequency, setUseRecommendedFrequency] = useState(true);

  // Get frequency recommendation based on previous commitment's frequency
  const frequencyRecommendation = useMemo(() => {
    // Try to get from commitment's rule snapshot if available
    const currentFrequency = commitment.frequency?.type ?? 'DAILY';
    const currentTargetCount = commitment.frequency?.targetCount;
    return getEasierFrequencyRecommendation(currentFrequency, currentTargetCount);
  }, [commitment.frequency]);

  const selectedOption = RECOVERY_OPTIONS.find((o) => o.mode === selectedMode);

  const resetState = () => {
    setStep('mode');
    setSelectedMode(null);
    setStartDate(null);
    setEndDate(null);
    setStakeAmount(commitment.stakeAmountCents ?? 2500);
    setFrequencyType(frequencyRecommendation?.type ?? 'DAILY');
    setFrequencyTargetCount(frequencyRecommendation?.targetCount ?? 3);
    setFrequencySpecificDays([]);
    setUseRecommendedFrequency(true);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSelectMode = (mode: RecoveryMode) => {
    setSelectedMode(mode);
    setStep('dates');
  };

  const handleDatesNext = () => {
    const option = RECOVERY_OPTIONS.find((o) => o.mode === selectedMode);
    // For ADJUSTED_RETRY, show frequency step first
    if (selectedMode === 'ADJUSTED_RETRY') {
      // Initialize with recommendation
      if (frequencyRecommendation) {
        setFrequencyType(frequencyRecommendation.type);
        setFrequencyTargetCount(frequencyRecommendation.targetCount ?? 3);
        setFrequencySpecificDays(frequencyRecommendation.specificDays ?? []);
      }
      setStep('frequency');
    } else if (option?.requiresNewStake) {
      setStep('stake');
    } else {
      handleSubmit();
    }
  };

  const handleFrequencyNext = () => {
    setStep('stake');
  };

  const handleSubmit = async () => {
    if (!selectedMode || !startDate || !endDate) return;

    try {
      // Build frequency config for ADJUSTED_RETRY mode
      const newFrequencyConfig =
        selectedMode === 'ADJUSTED_RETRY'
          ? {
              type: frequencyType,
              ...(frequencyType === 'TIMES_PER_WEEK' || frequencyType === 'TIMES_PER_MONTH'
                ? { targetCount: frequencyTargetCount }
                : {}),
              ...(frequencyType === 'SPECIFIC_DAYS' && frequencySpecificDays.length > 0
                ? { specificDays: frequencySpecificDays }
                : {}),
            }
          : undefined;

      await restartMutation.mutateAsync({
        recoveryMode: selectedMode,
        newStartDate: startDate.toISOString().split('T')[0],
        newEndDate: endDate.toISOString().split('T')[0],
        newStakeAmountCents: selectedOption?.requiresNewStake ? stakeAmount : undefined,
        newFrequencyConfig,
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to restart commitment:', error);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const minEndDate = startDate
    ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
    : new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);

  const renderModeSelection = () => (
    <>
      <Text className="text-lg font-bold text-neutral-900 mb-4">
        {t('restart.selectMode')}
      </Text>
      <View className="gap-3">
        {RECOVERY_OPTIONS.map((option) => (
          <Pressable
            key={option.mode}
            onPress={() => handleSelectMode(option.mode)}
            className="bg-white border border-neutral-200 rounded-xl p-4 flex-row items-start"
          >
            <Text className="text-2xl mr-3">{option.icon}</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900">
                {t(option.titleKey as never)}
              </Text>
              <Text className="text-sm text-neutral-600 mt-1">
                {t(option.descriptionKey as never)}
              </Text>
            </View>
            <Text className="text-neutral-400">→</Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderDateSelection = () => (
    <>
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => setStep('mode')} className="mr-3">
          <Text className="text-primary-500">← Back</Text>
        </Pressable>
        <Text className="text-lg font-bold text-neutral-900">
          {t('wizard.step2')}
        </Text>
      </View>

      <View className="gap-4">
        <DatePickerButton
          label={t('wizard.startDate')}
          value={startDate}
          onChange={setStartDate}
          placeholder={t('wizard.selectStartDate')}
          minimumDate={tomorrow}
          helperText={t('wizard.startDateHelper')}
        />

        <DatePickerButton
          label={t('wizard.endDate')}
          value={endDate}
          onChange={setEndDate}
          placeholder={t('wizard.selectEndDate')}
          minimumDate={minEndDate}
          helperText={t('wizard.endDateHelper')}
          error={
            startDate && endDate && endDate <= startDate
              ? t('wizard.endDateError')
              : undefined
          }
        />
      </View>

      <Button
        title={selectedOption?.requiresNewStake ? tCommon('next') : t('restart.confirm')}
        onPress={handleDatesNext}
        disabled={!startDate || !endDate || (endDate && startDate && endDate <= startDate)}
        loading={restartMutation.isPending}
        fullWidth
        className="mt-6"
      />
    </>
  );

  const renderFrequencySelection = () => {
    const previousFrequency = commitment.frequency?.type ?? 'DAILY';
    const hasRecommendation = frequencyRecommendation !== null;

    return (
      <>
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => setStep('dates')} className="mr-3">
            <Text className="text-primary-500">← {tCommon('back')}</Text>
          </Pressable>
          <Text className="text-lg font-bold text-neutral-900">
            {t('restart.adjustFrequency')}
          </Text>
        </View>

        {/* Recommendation Banner */}
        {hasRecommendation && (
          <Card variant="outlined" className="mb-4 bg-primary-50 border-primary-200">
            <View className="flex-row items-start gap-3">
              <Text className="text-2xl">💡</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary-700 mb-1">
                  {t('restart.frequencyRecommendationTitle')}
                </Text>
                <Text className="text-sm text-neutral-600 mb-2">
                  {t('restart.frequencyRecommendationDesc', {
                    previous: formatFrequency(previousFrequency),
                    recommended: formatFrequency(
                      frequencyRecommendation.type,
                      frequencyRecommendation.targetCount
                    ),
                  })}
                </Text>
                <View className="flex-row items-center">
                  <Switch
                    value={useRecommendedFrequency}
                    onValueChange={(value) => {
                      setUseRecommendedFrequency(value);
                      if (value && frequencyRecommendation) {
                        setFrequencyType(frequencyRecommendation.type);
                        setFrequencyTargetCount(frequencyRecommendation.targetCount ?? 3);
                        setFrequencySpecificDays(frequencyRecommendation.specificDays ?? []);
                      }
                    }}
                  />
                  <Text className="text-sm text-neutral-600 ml-2">
                    {t('restart.useRecommendation')}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Custom frequency selection (shown when not using recommendation) */}
        {!useRecommendedFrequency && (
          <FrequencyStep
            frequencyType={frequencyType}
            targetCount={frequencyTargetCount}
            specificDays={frequencySpecificDays}
            onFrequencyTypeChange={setFrequencyType}
            onTargetCountChange={setFrequencyTargetCount}
            onSpecificDaysChange={setFrequencySpecificDays}
          />
        )}

        {/* Show current selection summary when using recommendation */}
        {useRecommendedFrequency && frequencyRecommendation && (
          <Card variant="elevated" className="items-center py-4 mb-4">
            <Text className="text-sm text-neutral-500 mb-1">
              {t('restart.newFrequency')}
            </Text>
            <Text className="text-xl font-bold text-primary-600">
              {formatFrequency(
                frequencyRecommendation.type,
                frequencyRecommendation.targetCount
              )}
            </Text>
          </Card>
        )}

        <Button
          title={tCommon('next')}
          onPress={handleFrequencyNext}
          fullWidth
          className="mt-4"
        />
      </>
    );
  };

  const renderStakeSelection = () => (
    <>
      <View className="flex-row items-center mb-4">
        <Pressable
          onPress={() =>
            setStep(selectedMode === 'ADJUSTED_RETRY' ? 'frequency' : 'dates')
          }
          className="mr-3"
        >
          <Text className="text-primary-500">← {tCommon('back')}</Text>
        </Pressable>
        <Text className="text-lg font-bold text-neutral-900">
          {t('wizard.step3')}
        </Text>
      </View>

      <Card variant="elevated" className="items-center py-6 mb-4">
        <Text className="text-4xl font-bold text-primary-600 mb-2">
          {formatCurrency(stakeAmount)}
        </Text>
        <Text className="text-sm text-neutral-500">
          {t('wizard.stakeRange')}
        </Text>
      </Card>

      <View className="flex-row justify-between gap-2 mb-6">
        {STAKE_AMOUNTS.map((amount) => (
          <Pressable
            key={amount}
            onPress={() => setStakeAmount(amount)}
            className={`flex-1 py-2 rounded-lg border ${
              stakeAmount === amount
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200'
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                stakeAmount === amount
                  ? 'text-primary-600'
                  : 'text-neutral-700'
              }`}
            >
              ${amount / 100}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button
        title={t('restart.confirm')}
        onPress={handleSubmit}
        loading={restartMutation.isPending}
        fullWidth
      />
    </>
  );

  return (
    <Modal visible={visible} onClose={handleClose} title={t('restart.title')}>
      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
        {step === 'mode' && renderModeSelection()}
        {step === 'dates' && renderDateSelection()}
        {step === 'frequency' && renderFrequencySelection()}
        {step === 'stake' && renderStakeSelection()}

        {restartMutation.isError && (
          <Text className="text-error text-center mt-4">
            {t('restart.error')}
          </Text>
        )}
      </ScrollView>
    </Modal>
  );
}
