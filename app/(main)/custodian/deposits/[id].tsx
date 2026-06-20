import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useDepositDetail, useConfirmDeposit, useRejectDeposit } from '@/features/custodian/hooks';
import { formatCurrency } from '@/shared/utils/format.utils';
import { formatDate } from '@/shared/utils/date.utils';
import { haptics } from '@/shared/utils/haptics.utils';
import type { DepositStatus, DepositDetail } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

// Design tokens
const COLORS = {
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.12)',
  forest: '#2D5A4A',
  forestLight: 'rgba(45, 90, 74, 0.12)',
  warmGold: '#D4A574',
  warmGoldLight: 'rgba(212, 165, 116, 0.12)',
  cream: '#F5F0EB',
  error: '#B54548',
  errorLight: 'rgba(181, 69, 72, 0.12)',
  neutral900: '#1C1917',
  neutral700: '#44403C',
  neutral600: '#57534E',
  neutral500: '#78716C',
  neutral400: '#A8A29E',
  neutral300: '#D6D3D1',
  neutral200: '#E7E5E4',
  neutral100: '#F5F5F4',
  white: '#FFFFFF',
};

const TEMPLATE_EMOJIS: Record<string, string> = {
  QUIT_SMOKING: '🚭',
  EXERCISE: '💪',
  MEDITATION: '🧘',
  DIET: '🥗',
  SLEEP: '😴',
  CUSTOM: '🎯',
};

export default function DepositDetailScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(['custodian', 'commitments']);
  const insets = useSafeAreaInsets();

  const { data: deposit, isLoading, error, refetch } = useDepositDetail(id);
  const { mutate: confirmDeposit, isPending: isConfirming } = useConfirmDeposit();
  const { mutate: rejectDeposit, isPending: isRejecting } = useRejectDeposit();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [confirmReference, setConfirmReference] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirm = () => {
    if (!id) return;

    confirmDeposit(
      {
        depositId: id,
        request: {
          ...(confirmReference.trim() && { reference: confirmReference.trim() }),
          ...(confirmNotes.trim() && { notes: confirmNotes.trim() }),
        },
      },
      {
        onSuccess: () => {
          haptics.medium();
          setShowConfirmModal(false);
          router.back();
        },
      }
    );
  };

  const handleReject = () => {
    if (!id || !rejectReason.trim()) return;

    rejectDeposit(
      {
        depositId: id,
        request: { reason: rejectReason.trim() },
      },
      {
        onSuccess: () => {
          haptics.medium();
          setShowRejectModal(false);
          router.back();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <Header title={t('deposits.detail.title')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.copper} />
        </View>
      </SafeScreen>
    );
  }

  if (error || !deposit) {
    return (
      <SafeScreen>
        <Header title={t('deposits.detail.title')} showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('deposits.detail.loadError')}</Text>
          <Button title={t('deposits.detail.retry')} onPress={() => refetch()} variant="outline" />
        </View>
      </SafeScreen>
    );
  }

  const statusConfig = getStatusConfig(deposit.status);
  const isActionable = deposit.status === 'PAYMENT_MARKED_BY_CREATOR';
  const footerBottomPadding = Math.max(insets.bottom, 24);

  return (
    <SafeScreen style={{ backgroundColor: COLORS.cream }}>
      <Header title={t('deposits.detail.title')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !isActionable && { paddingBottom: footerBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: statusConfig.bgColor }]}>
            {statusConfig.icon}
          </View>
          <Text style={[styles.statusTitle, { color: statusConfig.textColor }]}>
            {t(statusConfig.labelKey)}
          </Text>
          <Text style={styles.statusTime}>
            {formatDate(deposit.createdAt, 'PPp')}
          </Text>
        </Animated.View>

        {/* Amount Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Card variant="elevated" className="mb-4">
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>
                {t('deposits.detail.amount').toUpperCase()}
              </Text>
              <Text style={styles.amountValue}>
                {formatCurrency(deposit.amountCents)}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Creator Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>{t('deposits.detail.from')}</Text>
            <View style={styles.creatorRow}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(deposit.creatorDisplayName || deposit.creatorUserId) }]}>
                <Text style={styles.avatarText}>
                  {getInitials(deposit.creatorDisplayName)}
                </Text>
              </View>
              <Text style={styles.creatorName}>
                {deposit.creatorDisplayName}
              </Text>
            </View>

            {deposit.creatorReference && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('deposits.detail.creatorReference')}</Text>
                <Text style={styles.infoValue}>{deposit.creatorReference}</Text>
              </View>
            )}

            {deposit.creatorNotes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('deposits.detail.creatorNotes')}</Text>
                <Text style={styles.infoValueNote}>{deposit.creatorNotes}</Text>
              </View>
            )}

            {deposit.markedPaidAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('deposits.detail.markedPaidAt')}</Text>
                <Text style={styles.infoValue}>
                  {formatDate(deposit.markedPaidAt, 'PPp')}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Commitment Summary Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>{t('deposits.detail.commitment')}</Text>

            <View style={styles.commitmentRow}>
              <Text style={styles.commitmentEmoji}>
                {TEMPLATE_EMOJIS[deposit.commitmentTemplateType] || '🎯'}
              </Text>
              <Text style={styles.commitmentType}>
                {t(`commitments:templates.${deposit.commitmentTemplateType.toLowerCase()}`)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('deposits.detail.dateRange')}</Text>
              <Text style={styles.infoValue}>
                {formatDate(deposit.commitmentStartDate, 'MMM d')} - {formatDate(deposit.commitmentEndDate, 'PP')}
              </Text>
            </View>

            {deposit.commitmentWhyNote && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('deposits.detail.motivation')}</Text>
                <Text style={styles.infoValueNote}>"{deposit.commitmentWhyNote}"</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Distribution Card */}
        <Animated.View entering={FadeInDown.delay(400).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>{t('deposits.detail.distribution')}</Text>

            <View style={styles.distributionRow}>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionLabel}>{t('deposits.detail.charityPercent')}</Text>
                <Text style={styles.distributionValue}>{deposit.charityPercent}%</Text>
              </View>
              <View style={styles.distributionDivider} />
              <View style={styles.distributionItem}>
                <Text style={styles.distributionLabel}>{t('deposits.detail.supportersPercent')}</Text>
                <Text style={styles.distributionValue}>{deposit.supportersPercent}%</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Supporters Card */}
        <Animated.View entering={FadeInDown.delay(450).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>{t('deposits.detail.supporters')}</Text>

            {deposit.supporters.length > 0 ? (
              <>
                <Text style={styles.supporterCountText}>
                  {t('deposits.detail.supporterCount', { count: deposit.supporterCount })}
                </Text>
                {deposit.supporters.map((supporter, index) => (
                  <View
                    key={index}
                    style={[
                      styles.supporterRow,
                      index > 0 && styles.supporterRowBorder,
                    ]}
                  >
                    <View style={styles.supporterInfo}>
                      <View style={[styles.supporterAvatar, { backgroundColor: getAvatarColor(supporter.displayName) }]}>
                        <Text style={styles.supporterAvatarText}>
                          {getInitials(supporter.displayName)}
                        </Text>
                      </View>
                      <Text style={styles.supporterName}>{supporter.displayName}</Text>
                    </View>
                    <Text style={styles.supporterAmount}>
                      {formatCurrency(supporter.amountCents)}
                    </Text>
                  </View>
                ))}
                {deposit.supportersPercent > 0 && (
                  <Text style={styles.perSupporterNote}>
                    {t('deposits.detail.perSupporter')}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.noSupportersText}>
                {t('deposits.detail.noSupporters')}
              </Text>
            )}
          </Card>
        </Animated.View>

        {/* Timeline Card */}
        <Animated.View entering={FadeInDown.delay(500).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>{t('deposits.detail.timeline')}</Text>
            <Timeline deposit={deposit} t={t} />
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      {isActionable && (
        <View style={[styles.footer, { paddingBottom: footerBottomPadding }]}>
          <View style={styles.footerButton}>
            <Button
              title={t('deposits.actions.reject')}
              variant="outline"
              onPress={() => setShowRejectModal(true)}
              fullWidth
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              title={t('deposits.actions.confirmReceived')}
              onPress={() => setShowConfirmModal(true)}
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        title={t('deposits.actions.confirmTitle')}
        onClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="checkmark" size={32} color={COLORS.forest} />
          </View>
          <Text style={styles.modalMessage}>
            {t('deposits.actions.confirmMessage', {
              amount: formatCurrency(deposit.amountCents),
              name: deposit.creatorDisplayName,
            })}
          </Text>

          <Text style={styles.inputLabel}>{t('deposits.actions.confirmReferenceLabel')}</Text>
          <TextInput
            style={styles.input}
            value={confirmReference}
            onChangeText={setConfirmReference}
            placeholder={t('deposits.actions.confirmReferencePlaceholder')}
            placeholderTextColor={COLORS.neutral400}
          />

          <Text style={styles.inputLabel}>{t('deposits.actions.confirmNotesLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={confirmNotes}
            onChangeText={setConfirmNotes}
            placeholder={t('deposits.actions.confirmNotesPlaceholder')}
            placeholderTextColor={COLORS.neutral400}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <View style={styles.footerButton}>
              <Button
                title={t('deposits.actions.cancel')}
                variant="ghost"
                onPress={() => setShowConfirmModal(false)}
                fullWidth
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('deposits.actions.confirmButton')}
                onPress={handleConfirm}
                loading={isConfirming}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        title={t('deposits.actions.rejectTitle')}
        onClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={[styles.modalIconContainer, { backgroundColor: COLORS.errorLight }]}>
            <Ionicons name="close" size={32} color={COLORS.error} />
          </View>
          <Text style={styles.modalMessage}>
            {t('deposits.actions.rejectMessage')}
          </Text>

          <Text style={styles.inputLabel}>{t('deposits.actions.rejectReasonLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder={t('deposits.actions.rejectPlaceholder')}
            placeholderTextColor={COLORS.neutral400}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <View style={styles.footerButton}>
              <Button
                title={t('deposits.actions.cancel')}
                variant="ghost"
                onPress={() => setShowRejectModal(false)}
                fullWidth
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('deposits.actions.rejectButton')}
                variant="danger"
                onPress={handleReject}
                loading={isRejecting}
                disabled={!rejectReason.trim()}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

// Timeline Component
function Timeline({ deposit, t }: { deposit: DepositDetail; t: (key: string) => string }) {
  const steps = [
    {
      label: t('deposits.detail.timelineCreated'),
      date: deposit.createdAt,
      completed: true,
    },
    {
      label: t('deposits.detail.timelinePaymentMarked'),
      date: deposit.markedPaidAt,
      completed: !!deposit.markedPaidAt,
    },
    {
      label: t('deposits.detail.timelineConfirmed'),
      date: deposit.confirmedAt,
      completed: !!deposit.confirmedAt,
    },
  ];

  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineDotContainer}>
            <View
              style={[
                styles.timelineDot,
                step.completed && styles.timelineDotCompleted,
              ]}
            >
              {step.completed && (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              )}
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  step.completed && styles.timelineLineCompleted,
                ]}
              />
            )}
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>{step.label}</Text>
            {step.date && (
              <Text style={styles.timelineDate}>
                {formatDate(step.date, 'PPp')}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// Helper functions
function getStatusConfig(status: DepositStatus) {
  switch (status) {
    case 'AWAITING_PAYMENT':
      return {
        bgColor: COLORS.warmGoldLight,
        textColor: COLORS.warmGold,
        labelKey: 'deposits.status.awaitingPayment' as const,
        icon: <Text style={{ fontSize: 24 }}>💰</Text>,
      };
    case 'PAYMENT_MARKED_BY_CREATOR':
      return {
        bgColor: COLORS.copperLight,
        textColor: COLORS.copper,
        labelKey: 'deposits.status.paymentMarked' as const,
        icon: <Text style={{ fontSize: 24 }}>⏳</Text>,
      };
    case 'RECEIVED_CONFIRMED_BY_CUSTODIAN':
      return {
        bgColor: COLORS.forestLight,
        textColor: COLORS.forest,
        labelKey: 'deposits.status.confirmed' as const,
        icon: <Ionicons name="checkmark" size={24} color={COLORS.forest} />,
      };
    case 'REJECTED_BY_CUSTODIAN':
      return {
        bgColor: COLORS.errorLight,
        textColor: COLORS.error,
        labelKey: 'deposits.status.rejected' as const,
        icon: <Ionicons name="close" size={24} color={COLORS.error} />,
      };
    default:
      return {
        bgColor: COLORS.neutral200,
        textColor: COLORS.neutral600,
        labelKey: 'deposits.status.awaitingPayment' as const,
        icon: <Text style={{ fontSize: 24 }}>💰</Text>,
      };
  }
}

function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(seed: string): string {
  const colors = ['#4A7C8C', '#87A878', '#B87333', '#6366f1', '#ec4899', '#8b5cf6'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: COLORS.neutral600,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 4,
  },

  // Status Header
  statusHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  statusTime: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.neutral500,
  },

  // Amount Card
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.copper,
    marginBottom: 8,
  },
  amountValue: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 36,
    color: COLORS.neutral900,
  },

  // Section
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.neutral700,
    marginBottom: 12,
  },

  // Creator Row
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  creatorName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.neutral900,
  },

  // Info Row
  infoRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral100,
    marginTop: 12,
  },
  infoLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: COLORS.neutral500,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.neutral900,
  },
  infoValueNote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.neutral700,
    fontStyle: 'italic',
  },

  // Commitment Row
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  commitmentEmoji: {
    fontSize: 20,
  },
  commitmentType: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.neutral900,
    textTransform: 'capitalize',
  },

  // Distribution
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionItem: {
    flex: 1,
    alignItems: 'center',
  },
  distributionLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.neutral500,
    marginBottom: 4,
  },
  distributionValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: COLORS.neutral900,
  },
  distributionDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.neutral200,
  },

  // Supporters
  supporterCountText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.neutral500,
    marginBottom: 12,
  },
  supporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  supporterRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral100,
  },
  supporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  supporterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supporterAvatarText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: COLORS.white,
  },
  supporterName: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.neutral900,
    flex: 1,
  },
  supporterAmount: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    color: COLORS.copper,
  },
  perSupporterNote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.neutral400,
    textAlign: 'center',
    marginTop: 8,
  },
  noSupportersText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.neutral400,
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Timeline
  timeline: {
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineDotContainer: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: COLORS.copper,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.neutral200,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.copper,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.neutral900,
  },
  timelineDate: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.neutral500,
    marginTop: 2,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral200,
  },
  footerButton: {
    flex: 1,
  },

  // Modal
  modalContent: {
    gap: 16,
  },
  modalIconContainer: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.forestLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMessage: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.neutral700,
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.neutral500,
  },
  input: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.neutral900,
    backgroundColor: COLORS.neutral100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
