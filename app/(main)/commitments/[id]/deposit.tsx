import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { useQueryClient } from '@tanstack/react-query';
import { useDepositStatus } from '@/features/commitments/hooks/useDepositStatus';
import { useMarkDepositPaid } from '@/features/commitments/hooks/useMarkDepositPaid';
import { COMMITMENTS_QUERY_KEY } from '@/features/commitments/hooks/useCommitments';
import { SUPPORTED_COMMITMENTS_KEY } from '@/features/supporting/hooks/useSupportedCommitments';
import { formatCurrency } from '@/shared/utils/format.utils';
import { haptics } from '@/shared/utils/haptics.utils';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

// Design tokens following "Trusted Guardian" aesthetic
const COLORS = {
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.12)',
  copperMuted: 'rgba(184, 115, 51, 0.08)',
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DepositRequiredScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('custodian');

  const queryClient = useQueryClient();
  const { data: deposit, isLoading, error, refetch } = useDepositStatus(id);
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkDepositPaid();

  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Auto-redirect when confirmed.
  // Invalidate the commitment (now ACTIVE) and the supporting list first, so the
  // detail screen reads fresh state and does not bounce straight back here on a
  // stale PENDING_DEPOSIT cache (the redirect-loop bug).
  useEffect(() => {
    if (deposit?.status === 'RECEIVED_CONFIRMED_BY_CUSTODIAN') {
      queryClient.invalidateQueries({ queryKey: [...COMMITMENTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: SUPPORTED_COMMITMENTS_KEY });
      const timer = setTimeout(() => {
        router.replace(`/(main)/commitments/${id}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deposit?.status, id, router, queryClient]);

  const handleCopyPixKey = async () => {
    if (deposit?.custodianPixKey) {
      await Clipboard.setStringAsync(deposit.custodianPixKey);
      haptics.light();
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleMarkPaid = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    if (!id) return;

    markPaid(
      {
        commitmentId: id,
        request: {
          ...(reference.trim() && { reference: reference.trim() }),
          ...(notes.trim() && { notes: notes.trim() }),
        },
      },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          haptics.medium();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <Header title={t('creatorDeposit.title')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.copper} />
        </View>
      </SafeScreen>
    );
  }

  if (error || !deposit) {
    return (
      <SafeScreen>
        <Header title={t('creatorDeposit.title')} showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('creatorDeposit.loadError')}</Text>
          <Button title={t('creatorDeposit.retry')} onPress={() => refetch()} variant="outline" />
        </View>
      </SafeScreen>
    );
  }

  const renderStatusContent = () => {
    switch (deposit.status) {
      case 'AWAITING_PAYMENT':
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: COLORS.warmGoldLight }]}>
              <Text style={styles.statusEmoji}>💰</Text>
            </View>
            <Text style={[styles.statusTitle, { color: COLORS.warmGold }]}>
              {t('creatorDeposit.status.awaitingPayment')}
            </Text>
          </Animated.View>
        );

      case 'PAYMENT_MARKED_BY_CREATOR':
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.statusCard}>
            <PulsingIcon />
            <Text style={[styles.statusTitle, { color: COLORS.copper }]}>
              {t('creatorDeposit.status.paymentMarked')}
            </Text>
          </Animated.View>
        );

      case 'RECEIVED_CONFIRMED_BY_CUSTODIAN':
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: COLORS.forestLight }]}>
              <Ionicons name="checkmark" size={32} color={COLORS.forest} />
            </View>
            <Text style={[styles.statusTitle, { color: COLORS.forest }]}>
              {t('creatorDeposit.status.confirmed')}
            </Text>
            <Text style={styles.redirectText}>{t('creatorDeposit.redirecting')}</Text>
          </Animated.View>
        );

      case 'REJECTED_BY_CUSTODIAN':
        return (
          <Animated.View entering={FadeIn.duration(300)} style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: COLORS.errorLight }]}>
              <Ionicons name="close" size={32} color={COLORS.error} />
            </View>
            <Text style={[styles.statusTitle, { color: COLORS.error }]}>
              {t('creatorDeposit.status.rejected')}
            </Text>
            {deposit.rejectionReason && (
              <View style={styles.rejectionCard}>
                <Text style={styles.rejectionText}>
                  {t('creatorDeposit.rejectedMessage', { reason: deposit.rejectionReason })}
                </Text>
              </View>
            )}
            <Text style={styles.contactText}>{t('creatorDeposit.contactCustodian')}</Text>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const isAwaitingPayment = deposit.status === 'AWAITING_PAYMENT';
  const isPaymentMarked = deposit.status === 'PAYMENT_MARKED_BY_CREATOR';
  const isConfirmed = deposit.status === 'RECEIVED_CONFIRMED_BY_CUSTODIAN';
  const isRejected = deposit.status === 'REJECTED_BY_CUSTODIAN';

  return (
    <SafeScreen style={{ backgroundColor: COLORS.cream }}>
      <Header title={t('creatorDeposit.title')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        {renderStatusContent()}

        {/* Amount Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Card variant="elevated" className="mb-4">
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>
                {t('creatorDeposit.amount').toUpperCase()}
              </Text>
              <Text style={styles.amountValue}>
                {formatCurrency(deposit.amountCents)}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Custodian Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Card variant="outlined" className="mb-4">
            <Text style={styles.sectionLabel}>{t('creatorDeposit.payTo')}</Text>
            <Text style={styles.custodianName}>
              {deposit.custodianDisplayName || 'Custodian'}
            </Text>

            {deposit.custodianPixKey && (
              <View style={styles.pixKeyContainer}>
                <Text style={styles.pixKeyLabel}>{t('creatorDeposit.pixKey')}</Text>
                <View style={styles.pixKeyRow}>
                  <Text style={styles.pixKeyValue} numberOfLines={1}>
                    {deposit.custodianPixKey}
                  </Text>
                  <Pressable
                    onPress={handleCopyPixKey}
                    style={styles.copyButton}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={copiedKey ? 'checkmark' : 'copy-outline'}
                      size={18}
                      color={copiedKey ? COLORS.forest : COLORS.neutral500}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Instructions */}
        {isAwaitingPayment && (
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <Text style={styles.instructionsText}>
              {t('creatorDeposit.instructions')}
            </Text>

            {/* Optional Reference Input */}
            <Card variant="outlined" className="mt-4">
              <Text style={styles.inputLabel}>
                {t('creatorDeposit.referencePlaceholder')}
              </Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholder={t('creatorDeposit.referencePlaceholder')}
                placeholderTextColor={COLORS.neutral400}
              />

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                {t('creatorDeposit.notesPlaceholder')}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('creatorDeposit.notesPlaceholder')}
                placeholderTextColor={COLORS.neutral400}
                multiline
                numberOfLines={3}
              />
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        {isAwaitingPayment && (
          <Button
            title={t('creatorDeposit.markPaid')}
            onPress={handleMarkPaid}
            fullWidth
          />
        )}
        {isPaymentMarked && (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="small" color={COLORS.copper} />
            <Text style={styles.waitingText}>
              {t('creatorDeposit.status.paymentMarked')}
            </Text>
          </View>
        )}
        {isRejected && (
          <Button
            title={t('creatorDeposit.backToCommitment')}
            onPress={() => router.replace(`/(main)/commitments/${id}`)}
            variant="outline"
            fullWidth
          />
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        title={t('creatorDeposit.markPaidTitle')}
        onClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Text style={styles.modalIcon}>💸</Text>
          </View>
          <Text style={styles.modalMessage}>
            {t('creatorDeposit.markPaidMessage', {
              amount: formatCurrency(deposit.amountCents),
              custodian: deposit.custodianDisplayName || 'your custodian',
            })}
          </Text>

          <View style={styles.modalButtons}>
            <Button
              title={t('creatorDeposit.cancel')}
              variant="ghost"
              onPress={() => setShowConfirmModal(false)}
              className="flex-1"
            />
            <Button
              title={t('creatorDeposit.markPaidButton')}
              onPress={handleConfirmPayment}
              loading={isMarkingPaid}
              className="flex-1"
            />
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

// Pulsing icon for "waiting" state
function PulsingIcon() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statusIcon, { backgroundColor: COLORS.copperLight }, animatedStyle]}>
      <Text style={styles.statusEmoji}>⏳</Text>
    </Animated.View>
  );
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
    gap: 16,
  },

  // Status Card
  statusCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
  statusEmoji: {
    fontSize: 32,
  },
  statusTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  redirectText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.neutral500,
  },
  rejectionCard: {
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  rejectionText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  contactText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.neutral500,
    textAlign: 'center',
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

  // Custodian Info
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.neutral500,
    marginBottom: 4,
  },
  custodianName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: COLORS.neutral900,
    marginBottom: 16,
  },
  pixKeyContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral200,
    paddingTop: 16,
  },
  pixKeyLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.neutral500,
    marginBottom: 4,
  },
  pixKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pixKeyValue: {
    flex: 1,
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    color: COLORS.neutral700,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Instructions
  instructionsText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.neutral600,
    textAlign: 'center',
  },

  // Input
  inputLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.neutral500,
    marginBottom: 8,
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

  // Footer
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral200,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  waitingText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: COLORS.copper,
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
  modalIcon: {
    fontSize: 32,
  },
  modalMessage: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.neutral700,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
