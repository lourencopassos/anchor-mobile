import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { parseISO, isAfter, startOfDay } from 'date-fns';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { CommitmentStatus } from '@/features/commitments/components/CommitmentStatus';
import { CommitmentTimeline } from '@/features/commitments/components/CommitmentTimeline';
import { CommitmentMetadataCard } from '@/features/commitments/components/CommitmentMetadataCard';
import { FutureCommitmentHero } from '@/features/commitments/components/FutureCommitmentHero';
import { ProgressRing } from '@/features/commitments/components/ProgressRing';
import { PayoutStatus } from '@/features/commitments/components/PayoutStatus';
import { RestartModal } from '@/features/commitments/components/RestartModal';
import { ReportFailureModal } from '@/features/commitments/components/ReportFailureModal';
import { useCommitment, useRestartEligibility } from '@/features/commitments/hooks/useCommitment';
import { formatCurrency } from '@/shared/utils/format.utils';

import type { TemplateType, VerificationAuthorityType } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

const TEMPLATE_ICONS: Record<TemplateType, string> = {
  QUIT_SMOKING: '🚭',
  EXERCISE: '💪',
  MEDITATION: '🧘',
  DIET: '🥗',
  SLEEP: '😴',
  CUSTOM: '✨',
};

const TEMPLATE_LABELS: Record<
  TemplateType,
  | 'templates.quit_smoking'
  | 'templates.exercise'
  | 'templates.meditation'
  | 'templates.diet'
  | 'templates.sleep'
  | 'templates.custom'
> = {
  QUIT_SMOKING: 'templates.quit_smoking',
  EXERCISE: 'templates.exercise',
  MEDITATION: 'templates.meditation',
  DIET: 'templates.diet',
  SLEEP: 'templates.sleep',
  CUSTOM: 'templates.custom',
};

export default function CommitmentDetailScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('commitments');

  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showReportFailureModal, setShowReportFailureModal] = useState(false);

  const { data: commitment, isLoading, error, refetch } = useCommitment(id);
  const { data: restartEligibility } = useRestartEligibility(
    commitment?.state === 'BROKEN' ? id : undefined
  );

  // Auto-redirect to deposit screen for PENDING_DEPOSIT commitments
  useEffect(() => {
    if (commitment?.state === 'PENDING_DEPOSIT' && id) {
      router.replace({
        pathname: '/(main)/commitments/[id]/deposit',
        params: { id },
      });
    }
  }, [commitment?.state, id, router]);

  // Determine if this is a future commitment (hasn't started yet)
  const isFutureCommitment = useMemo(() => {
    if (!commitment) return false;
    const startDate = parseISO(commitment.startDate);
    const today = startOfDay(new Date());
    return isAfter(startDate, today);
  }, [commitment]);

  if (isLoading) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
        </View>
      </SafeScreen>
    );
  }

  if (error || !commitment) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-error text-center">
            Failed to load commitment
          </Text>
          <Button
            title="Try Again"
            onPress={() => router.back()}
            variant="outline"
            className="mt-4"
          />
        </View>
      </SafeScreen>
    );
  }

  const progress = commitment.currentCycle
    ? Math.round(
        (commitment.currentCycle.completedCheckIns /
          commitment.currentCycle.totalDays) *
          100
      )
    : 0;

  const canRestart =
    commitment.state === 'BROKEN' && restartEligibility?.canRestart;

  const handleCheckIn = () => {
    router.push({
      pathname: '/(main)/commitments/[id]/check-in',
      params: { id: id! },
    });
  };

  const handleRestart = () => {
    setShowRestartModal(true);
  };

  const handleRestartSuccess = () => {
    refetch();
  };

  const handleReportFailure = () => {
    setShowReportFailureModal(true);
  };

  const handleReportFailureSuccess = () => {
    router.replace('/(main)/commitments');
  };

  // Render for Future Commitments (not started yet)
  if (isFutureCommitment && commitment.state === 'ACTIVE') {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />

        <ScrollView showsVerticalScrollIndicator={false} className="px-4">
          {/* Header Card - Simplified for future */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center">
              <Text className="text-4xl mr-4">
                {TEMPLATE_ICONS[commitment.templateType] || '📋'}
              </Text>
              <View className="flex-1">
                <Text className="text-xl font-bold text-neutral-900">
                  {t(TEMPLATE_LABELS[commitment.templateType])}
                </Text>
                <Text className="text-sm text-neutral-500">
                  {formatCurrency(commitment.stakeAmountCents ?? 0)} staked
                </Text>
              </View>
              <View className="bg-indigo-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-indigo-700">
                  {t('state.scheduled')}
                </Text>
              </View>
            </View>
          </Card>

          {/* Future Commitment Hero - Countdown */}
          <FutureCommitmentHero
            startDate={commitment.startDate}
            endDate={commitment.endDate}
          />

          {/* Preparation Checklist */}
          <Card variant="outlined" className="mb-4">
            <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              {t('detail.preparation.title')}
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center">
                <Text className="text-base mr-3">✓</Text>
                <Text className="text-sm text-neutral-700">
                  {t('detail.preparation.stakeDeposited')}
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(main)/commitments/[id]/supporters',
                    params: { id: id! },
                  })
                }
                className="flex-row items-center"
              >
                <Text className="text-base mr-3">○</Text>
                <Text className="text-sm text-primary-600">
                  {t('detail.preparation.inviteSupporters')}
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Metadata Card - Show dates for future */}
          <CommitmentMetadataCard
            startDate={commitment.startDate}
            endDate={commitment.endDate}
            createdAt={commitment.createdAt}
            timezone={commitment.timezone}
            verificationAuthorityType={
              (commitment as unknown as { verificationAuthorityType?: VerificationAuthorityType })
                .verificationAuthorityType
            }
            showDates
          />

          {/* Navigation - Just Supporters for future */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(main)/commitments/[id]/supporters',
                params: { id: id! },
              })
            }
            className="bg-white p-4 rounded-xl border border-neutral-200 flex-row justify-between items-center mb-6"
          >
            <Text className="text-base text-neutral-900">
              👥 {t('detail.supporters')}
            </Text>
            <Text className="text-neutral-400">→</Text>
          </Pressable>
        </ScrollView>

        {/* Modals */}
        {commitment && (
          <RestartModal
            visible={showRestartModal}
            onClose={() => setShowRestartModal(false)}
            commitment={commitment}
            onSuccess={handleRestartSuccess}
          />
        )}
      </SafeScreen>
    );
  }

  // Standard Render for Active/Completed/Broken Commitments
  return (
    <SafeScreen>
      <Header title={t('title')} showBack />

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Header Card with Timeline */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-4xl mr-4">
              {TEMPLATE_ICONS[commitment.templateType] || '📋'}
            </Text>
            <View className="flex-1">
              <Text className="text-xl font-bold text-neutral-900">
                {t(TEMPLATE_LABELS[commitment.templateType])}
              </Text>
              <Text className="text-sm text-neutral-500">
                {formatCurrency(commitment.stakeAmountCents ?? 0)} staked
              </Text>
            </View>
            <CommitmentStatus state={commitment.state} />
          </View>

          {/* Timeline */}
          <CommitmentTimeline
            createdAt={commitment.createdAt}
            startDate={commitment.startDate}
            endDate={commitment.endDate}
            activatedAt={commitment.activatedAt}
            state={commitment.state}
          />

          {/* Progress Ring for Active Commitments */}
          {commitment.state === 'ACTIVE' && commitment.currentCycle && (
            <View className="items-center py-4 border-t border-neutral-100 mt-2">
              <ProgressRing progress={progress} size={100} strokeWidth={10} />
              <Text className="text-sm text-neutral-600 mt-3">
                {t('detail.daysRemaining', {
                  count:
                    commitment.currentCycle.totalDays -
                    commitment.currentCycle.completedCheckIns,
                })}
              </Text>
            </View>
          )}
        </Card>

        {/* Payout Status for Failed Commitments */}
        {commitment.state === 'BROKEN' && (
          <PayoutStatus commitmentId={commitment.id} />
        )}

        {/* Current Cycle Info */}
        {commitment.currentCycle && (
          <Card variant="outlined" className="mb-4">
            <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              {t('detail.currentCycle')}
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600">{t('detail.metadata.startDate')}</Text>
              <Text className="text-neutral-900 font-medium">
                {new Date(commitment.currentCycle.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600">{t('detail.metadata.endDate')}</Text>
              <Text className="text-neutral-900 font-medium">
                {new Date(commitment.currentCycle.endDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-600">Check-ins</Text>
              <Text className="text-neutral-900 font-medium">
                {commitment.currentCycle.completedCheckIns} /{' '}
                {commitment.currentCycle.totalDays}
              </Text>
            </View>
          </Card>
        )}

        {/* Metadata Card */}
        <CommitmentMetadataCard
          startDate={commitment.startDate}
          endDate={commitment.endDate}
          createdAt={commitment.createdAt}
          timezone={commitment.timezone}
          verificationAuthorityType={
            (commitment as unknown as { verificationAuthorityType?: VerificationAuthorityType })
              .verificationAuthorityType
          }
        />

        {/* Navigation Links */}
        <View className="gap-3 mb-6">
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(main)/commitments/[id]/progress',
                params: { id: id! },
              })
            }
            className="bg-white p-4 rounded-xl border border-neutral-200 flex-row justify-between items-center"
          >
            <Text className="text-base text-neutral-900">
              📊 {t('detail.progress')}
            </Text>
            <Text className="text-neutral-400">→</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(main)/commitments/[id]/supporters',
                params: { id: id! },
              })
            }
            className="bg-white p-4 rounded-xl border border-neutral-200 flex-row justify-between items-center"
          >
            <Text className="text-base text-neutral-900">
              👥 {t('detail.supporters')}
            </Text>
            <Text className="text-neutral-400">→</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(main)/commitments/[id]/activity',
                params: { id: id! },
              })
            }
            className="bg-white p-4 rounded-xl border border-neutral-200 flex-row justify-between items-center"
          >
            <Text className="text-base text-neutral-900">
              💬 {t('detail.activity')}
            </Text>
            <Text className="text-neutral-400">→</Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        {commitment.state === 'ACTIVE' && !isFutureCommitment && (
          <View className="gap-3 mb-6">
            <Button
              title={t('detail.checkIn')}
              onPress={handleCheckIn}
              fullWidth
            />
            <Button
              title={t('reportFailure.button')}
              onPress={handleReportFailure}
              variant="outline"
              fullWidth
            />
          </View>
        )}

        {canRestart && (
          <Button
            title={t('detail.restart')}
            onPress={handleRestart}
            variant="outline"
            fullWidth
            className="mb-6"
          />
        )}

        {!canRestart && commitment.state === 'BROKEN' && (
          <Text className="text-sm text-neutral-500 text-center mb-6">
            {restartEligibility?.reason || t('detail.cannotRestart')}
          </Text>
        )}
      </ScrollView>

      {/* Restart Modal */}
      {commitment && (
        <RestartModal
          visible={showRestartModal}
          onClose={() => setShowRestartModal(false)}
          commitment={commitment}
          onSuccess={handleRestartSuccess}
        />
      )}

      {/* Report Failure Modal */}
      {commitment && id && (
        <ReportFailureModal
          visible={showReportFailureModal}
          onClose={() => setShowReportFailureModal(false)}
          commitmentId={id}
          onSuccess={handleReportFailureSuccess}
        />
      )}
    </SafeScreen>
  );
}
