import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useSettlementDetail, useCompleteSettlement, useFailSettlement } from '@/features/custodian/hooks';
import { formatCurrency } from '@/shared/utils/format.utils';
import { haptics } from '@/shared/utils/haptics.utils';
import type { SettlementStatus, SettlementRecipientType } from '@api/types';
import { format } from 'date-fns';
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

const RECIPIENT_CONFIG: Record<SettlementRecipientType, { emoji: string; color: string; bgColor: string }> = {
  SUPPORTER: { emoji: '👥', color: '#4A7C8C', bgColor: 'rgba(74, 124, 140, 0.12)' },
  CHARITY: { emoji: '💝', color: '#87A878', bgColor: 'rgba(135, 168, 120, 0.12)' },
  APP_POOL: { emoji: '🏛️', color: COLORS.copper, bgColor: COLORS.copperLight },
};

const TEMPLATE_EMOJIS: Record<string, string> = {
  QUIT_SMOKING: '🚭',
  EXERCISE: '💪',
  MEDITATION: '🧘',
  DIET: '🥗',
  SLEEP: '😴',
  CUSTOM: '🎯',
};

export default function SettlementDetailScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('custodian');

  const { data: settlement, isLoading, error, refetch } = useSettlementDetail(id);
  const { mutate: completeSettlement, isPending: isCompleting } = useCompleteSettlement();
  const { mutate: failSettlement, isPending: isFailing } = useFailSettlement();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [externalReference, setExternalReference] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [pixCopied, setPixCopied] = useState(false);

  const handleComplete = () => {
    if (!id) return;

    completeSettlement(
      {
        settlementId: id,
        request: {
          ...(externalReference.trim() && { externalReference: externalReference.trim() }),
          ...(completionNotes.trim() && { notes: completionNotes.trim() }),
        },
      },
      {
        onSuccess: () => {
          haptics.medium();
          setShowCompleteModal(false);
          router.back();
        },
      }
    );
  };

  const handleFail = () => {
    if (!id || !failureReason.trim()) return;

    failSettlement(
      {
        settlementId: id,
        request: { reason: failureReason.trim() },
      },
      {
        onSuccess: () => {
          haptics.medium();
          setShowFailModal(false);
          router.back();
        },
      }
    );
  };

  const handleCopyPixKey = async (pixKey: string) => {
    await Clipboard.setStringAsync(pixKey);
    haptics.light();
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <Header title={t('settlements.detail.title')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.copper} />
        </View>
      </SafeScreen>
    );
  }

  if (error || !settlement) {
    return (
      <SafeScreen>
        <Header title={t('settlements.detail.title')} showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load settlement details</Text>
          <Button title="Retry" onPress={() => refetch()} variant="outline" />
        </View>
      </SafeScreen>
    );
  }

  const statusConfig = getStatusConfig(settlement.status);
  const recipientConfig = RECIPIENT_CONFIG[settlement.recipientType];
  const isActionable = settlement.status === 'PENDING';
  const pixKey = getPixKey(settlement.payoutDetails);

  return (
    <SafeScreen style={{ backgroundColor: COLORS.cream }}>
      <Header title={t('settlements.detail.title')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
            {format(new Date(settlement.createdAt), 'MMM d, yyyy • h:mm a')}
          </Text>
        </Animated.View>

        {/* Recipient Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Card variant="elevated" className="mb-4">
            <View style={styles.recipientHeader}>
              <View style={[styles.recipientBadge, { backgroundColor: recipientConfig.bgColor }]}>
                <Text style={styles.recipientEmoji}>{recipientConfig.emoji}</Text>
                <Text style={[styles.recipientType, { color: recipientConfig.color }]}>
                  {t(`settlements.recipientType.${settlement.recipientType.toLowerCase() as 'supporter' | 'charity' | 'appPool'}`)}
                </Text>
              </View>
            </View>

            <Text style={styles.recipientName}>
              {settlement.recipientDisplayName || 'Unknown Recipient'}
            </Text>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>
                {t('settlements.detail.amount').toUpperCase()}
              </Text>
              <Text style={styles.amountValue}>
                {formatCurrency(settlement.amountCents)}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* PIX Details Card */}
        {pixKey && (
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <Card variant="outlined" className="mb-4">
              <Text style={styles.sectionLabel}>{t('settlements.detail.payoutDetails')}</Text>

              <View style={styles.pixRow}>
                <View style={styles.pixInfo}>
                  <Text style={styles.pixLabel}>{t('settlements.detail.pixKey')}</Text>
                  <Text style={styles.pixValue}>{pixKey}</Text>
                </View>
                <Pressable
                  style={[styles.copyButton, pixCopied && styles.copyButtonSuccess]}
                  onPress={() => handleCopyPixKey(pixKey)}
                >
                  <Ionicons
                    name={pixCopied ? 'checkmark' : 'copy-outline'}
                    size={18}
                    color={pixCopied ? COLORS.forest : COLORS.copper}
                  />
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Failure Context Card */}
        {settlement.commitmentFailureReason && (
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <Card variant="outlined" className="mb-4" style={styles.failureCard}>
              <View style={styles.failureHeader}>
                <View style={styles.failureIconContainer}>
                  <Ionicons name="warning" size={18} color={COLORS.error} />
                </View>
                <Text style={styles.failureSectionLabel}>{t('settlements.detail.commitmentFailed')}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settlements.detail.failureReason')}</Text>
                <Text style={styles.failureReason}>{settlement.commitmentFailureReason}</Text>
              </View>

              {settlement.commitmentFailedAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('settlements.detail.failedAt')}</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(settlement.commitmentFailedAt), 'MMM d, yyyy • h:mm a')}
                  </Text>
                </View>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Commitment Summary Card */}
        <Animated.View entering={FadeInDown.delay(400).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>Commitment</Text>

            <View style={styles.commitmentRow}>
              <Text style={styles.commitmentEmoji}>
                {TEMPLATE_EMOJIS[settlement.commitmentTemplateType] || '🎯'}
              </Text>
              <Text style={styles.commitmentType}>
                {settlement.commitmentTemplateType.replace('_', ' ')}
              </Text>
            </View>

            <View style={styles.creatorRow}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(settlement.commitmentCreatorDisplayName || settlement.commitmentCreatorUserId) }]}>
                <Text style={styles.avatarText}>
                  {getInitials(settlement.commitmentCreatorDisplayName)}
                </Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorLabel}>Creator</Text>
                <Text style={styles.creatorName}>
                  {settlement.commitmentCreatorDisplayName || 'Unknown User'}
                </Text>
              </View>
            </View>

            {settlement.attemptCount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settlements.detail.attemptCount')}</Text>
                <Text style={styles.infoValue}>{settlement.attemptCount}</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Timeline Card */}
        <Animated.View entering={FadeInDown.delay(500).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>Timeline</Text>
            <Timeline settlement={settlement} />
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      {isActionable && (
        <View style={styles.footer}>
          <Button
            title={t('settlements.actions.markFailed')}
            variant="outline"
            onPress={() => setShowFailModal(true)}
            className="flex-1"
          />
          <Button
            title={t('settlements.actions.markCompleted')}
            onPress={() => setShowCompleteModal(true)}
            className="flex-1"
          />
        </View>
      )}

      {/* Complete Modal */}
      <Modal
        visible={showCompleteModal}
        title={t('settlements.actions.completeTitle')}
        onClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="checkmark" size={32} color={COLORS.forest} />
          </View>
          <Text style={styles.modalMessage}>
            {t('settlements.actions.completeMessage', {
              amount: formatCurrency(settlement.amountCents),
              recipient: settlement.recipientDisplayName || 'the recipient',
            })}
          </Text>

          <Text style={styles.inputLabel}>{t('settlements.actions.externalRefPlaceholder')}</Text>
          <TextInput
            style={styles.input}
            value={externalReference}
            onChangeText={setExternalReference}
            placeholder="e.g., PIX receipt ID"
            placeholderTextColor={COLORS.neutral400}
          />

          <Text style={styles.inputLabel}>{t('settlements.actions.notesPlaceholder')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={completionNotes}
            onChangeText={setCompletionNotes}
            placeholder="Add any notes"
            placeholderTextColor={COLORS.neutral400}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowCompleteModal(false)}
              className="flex-1"
            />
            <Button
              title={t('settlements.actions.completeButton')}
              onPress={handleComplete}
              loading={isCompleting}
              className="flex-1"
            />
          </View>
        </View>
      </Modal>

      {/* Fail Modal */}
      <Modal
        visible={showFailModal}
        title={t('settlements.actions.failTitle')}
        onClose={() => setShowFailModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={[styles.modalIconContainer, { backgroundColor: COLORS.errorLight }]}>
            <Ionicons name="close" size={32} color={COLORS.error} />
          </View>
          <Text style={styles.modalMessage}>
            {t('settlements.actions.failMessage')}
          </Text>

          <Text style={styles.inputLabel}>{t('settlements.actions.failPlaceholder')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={failureReason}
            onChangeText={setFailureReason}
            placeholder="e.g., Invalid PIX key, recipient unreachable"
            placeholderTextColor={COLORS.neutral400}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowFailModal(false)}
              className="flex-1"
            />
            <Button
              title={t('settlements.actions.failButton')}
              variant="danger"
              onPress={handleFail}
              loading={isFailing}
              disabled={!failureReason.trim()}
              className="flex-1"
            />
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

// Timeline Component
function Timeline({ settlement }: { settlement: any }) {
  const steps = [
    {
      label: 'Created',
      date: settlement.createdAt,
      completed: true,
    },
    {
      label: 'Completed',
      date: settlement.completedAt,
      completed: !!settlement.completedAt,
      failed: !!settlement.failedAt,
    },
  ];

  // If failed, replace "Completed" with "Failed"
  if (settlement.failedAt) {
    steps[1] = {
      label: 'Failed',
      date: settlement.failedAt,
      completed: true,
      failed: true,
    };
  }

  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => (
        <View key={step.label} style={styles.timelineItem}>
          <View style={styles.timelineDotContainer}>
            <View
              style={[
                styles.timelineDot,
                step.completed && (step.failed ? styles.timelineDotFailed : styles.timelineDotCompleted),
              ]}
            >
              {step.completed && (
                <Ionicons
                  name={step.failed ? 'close' : 'checkmark'}
                  size={12}
                  color={COLORS.white}
                />
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
                {format(new Date(step.date), 'MMM d, h:mm a')}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// Helper functions
function getStatusConfig(status: SettlementStatus) {
  switch (status) {
    case 'PENDING':
      return {
        bgColor: COLORS.warmGoldLight,
        textColor: COLORS.warmGold,
        labelKey: 'settlements.status.pending' as const,
        icon: <Text style={{ fontSize: 24 }}>📤</Text>,
      };
    case 'COMPLETED':
      return {
        bgColor: COLORS.forestLight,
        textColor: COLORS.forest,
        labelKey: 'settlements.status.completed' as const,
        icon: <Ionicons name="checkmark" size={24} color={COLORS.forest} />,
      };
    case 'FAILED':
      return {
        bgColor: COLORS.errorLight,
        textColor: COLORS.error,
        labelKey: 'settlements.status.failed' as const,
        icon: <Ionicons name="close" size={24} color={COLORS.error} />,
      };
    default:
      return {
        bgColor: COLORS.neutral200,
        textColor: COLORS.neutral600,
        labelKey: 'settlements.status.pending' as const,
        icon: <Text style={{ fontSize: 24 }}>📤</Text>,
      };
  }
}

function getPixKey(payoutDetails?: Record<string, unknown>): string | null {
  if (!payoutDetails) return null;
  return (payoutDetails.pixKey as string) || (payoutDetails.pix_key as string) || null;
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

  // Recipient Card
  recipientHeader: {
    marginBottom: 12,
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  recipientEmoji: {
    fontSize: 14,
  },
  recipientType: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: COLORS.neutral900,
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral100,
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
    fontSize: 32,
    color: COLORS.neutral900,
  },

  // Section
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.neutral700,
    marginBottom: 12,
  },

  // PIX Row
  pixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral100,
    borderRadius: 12,
    padding: 14,
  },
  pixInfo: {
    flex: 1,
  },
  pixLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pixValue: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    color: COLORS.neutral900,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  copyButtonSuccess: {
    backgroundColor: COLORS.forestLight,
  },

  // Failure Card
  failureCard: {
    borderColor: COLORS.errorLight,
    borderWidth: 1,
  },
  failureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  failureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failureSectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.error,
  },
  failureReason: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.neutral900,
    lineHeight: 20,
  },

  // Commitment Row
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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

  // Creator Row
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral100,
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
  creatorInfo: {
    flex: 1,
  },
  creatorLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: COLORS.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  creatorName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
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
  timelineDotFailed: {
    backgroundColor: COLORS.error,
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
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral200,
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
