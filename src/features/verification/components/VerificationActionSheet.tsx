/**
 * =============================================================================
 * VERIFICATION ACTION SHEET
 * =============================================================================
 *
 * A modal bottom sheet for taking verification actions on a check-in.
 * Supports Verify, Dispute, and Skip actions with contextual messaging.
 *
 * Design: Clean editorial style with clear action hierarchy.
 * - Verify: Primary teal action (positive)
 * - Dispute: Danger action requiring reason input
 * - Skip: Neutral ghost action
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { haptics } from '../../../shared/utils/haptics.utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Icon } from '../../../shared/components/ui/Icon';
import type { PendingVerification, VerificationType } from '../../../api/types';
import { formatCheckInDate, getTimeRemaining } from '../hooks/useVerifications';

interface VerificationActionSheetProps {
  visible: boolean;
  verification: PendingVerification | null;
  isLoading: boolean;
  onVerify: () => void;
  onDispute: (reason: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Action button component
function ActionButton({
  type,
  label,
  description,
  icon,
  onPress,
  isLoading,
  loadingType,
}: {
  type: 'verify' | 'dispute' | 'skip';
  label: string;
  description: string;
  icon: string;
  onPress: () => void;
  isLoading: boolean;
  loadingType: VerificationType | null;
}) {
  const scale = useSharedValue(1);

  const isActive = isLoading && loadingType === type.toUpperCase();
  const isDisabled = isLoading && loadingType !== type.toUpperCase();

  const buttonStyles = {
    verify: {
      bg: '#4A7C8C',
      text: '#FFFFFF',
      iconBg: 'rgba(255,255,255,0.2)',
    },
    dispute: {
      bg: '#B54548',
      text: '#FFFFFF',
      iconBg: 'rgba(255,255,255,0.2)',
    },
    skip: {
      bg: 'transparent',
      text: '#78716C',
      iconBg: '#F5F5F4',
      border: '#E7E5E4',
    },
  };

  const style = buttonStyles[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDisabled ? 0.5 : 1,
  }));

  const handlePressIn = () => {
    if (!isLoading) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (!isLoading) {
      type === 'verify' ? haptics.medium() : haptics.light();
      onPress();
    }
  };

  return (
    <AnimatedPressable
      style={[
        styles.actionButton,
        {
          backgroundColor: style.bg,
          borderWidth: type === 'skip' ? 1.5 : 0,
          borderColor: style.border,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isLoading}
    >
      <View style={[styles.actionIcon, { backgroundColor: style.iconBg }]}>
        {isActive ? (
          <ActivityIndicator size="small" color={style.text} />
        ) : (
          <Icon name={icon as any} size="md" color={style.text} />
        )}
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, { color: style.text }]}>{label}</Text>
        <Text
          style={[
            styles.actionDescription,
            { color: type === 'skip' ? '#A8A29E' : 'rgba(255,255,255,0.8)' },
          ]}
        >
          {description}
        </Text>
      </View>
      <Icon
        name="chevron-forward"
        size="sm"
        color={type === 'skip' ? '#A8A29E' : 'rgba(255,255,255,0.6)'}
      />
    </AnimatedPressable>
  );
}

export function VerificationActionSheet({
  visible,
  verification,
  isLoading,
  onVerify,
  onDispute,
  onSkip,
  onClose,
}: VerificationActionSheetProps) {
  const { t } = useTranslation('supporting');
  const insets = useSafeAreaInsets();
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [loadingType, setLoadingType] = useState<VerificationType | null>(null);

  const handleClose = useCallback(() => {
    setShowDisputeInput(false);
    setDisputeReason('');
    setReasonError(false);
    setLoadingType(null);
    onClose();
  }, [onClose]);

  const handleVerify = useCallback(() => {
    setLoadingType('VERIFY');
    onVerify();
  }, [onVerify]);

  const handleDisputePress = useCallback(() => {
    setShowDisputeInput(true);
    haptics.light();
  }, []);

  const handleDisputeSubmit = useCallback(() => {
    if (!disputeReason.trim()) {
      setReasonError(true);
      haptics.error();
      return;
    }
    setReasonError(false);
    setLoadingType('DISPUTE');
    onDispute(disputeReason.trim());
  }, [disputeReason, onDispute]);

  const handleSkip = useCallback(() => {
    setLoadingType('SKIP');
    onSkip();
  }, [onSkip]);

  if (!verification) return null;

  const formattedDate = formatCheckInDate(verification.checkInDate);
  const timeInfo = getTimeRemaining(verification.deadline);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={12}
          >
            <Text style={styles.closeText}>
              {showDisputeInput ? 'Back' : 'Cancel'}
            </Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {showDisputeInput
              ? t('verification.sheet.disputeTitle')
              : t('verification.sheet.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Check-in Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Avatar
                name={verification.ownerDisplayName}
                source={verification.ownerAvatarUrl}
                size="lg"
              />
              <View style={styles.infoDetails}>
                <Text style={styles.ownerName}>
                  {verification.ownerDisplayName}
                </Text>
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateBadge}>
                    <Icon name="calendar-outline" size="xs" color="#4A7C8C" />
                    <Text style={styles.dateText}>{formattedDate}</Text>
                  </View>
                  <View
                    style={[
                      styles.deadlineBadge,
                      timeInfo.isUrgent && styles.deadlineBadgeUrgent,
                    ]}
                  >
                    <Icon
                      name="time-outline"
                      size="xs"
                      color={timeInfo.isUrgent ? '#D4A574' : '#78716C'}
                    />
                    <Text
                      style={[
                        styles.deadlineText,
                        timeInfo.isUrgent && styles.deadlineTextUrgent,
                      ]}
                    >
                      {t('verification.card.timeLeft', { hours: timeInfo.hours })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Notes */}
            {verification.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes from check-in:</Text>
                <Text style={styles.notesContent}>{verification.notes}</Text>
              </View>
            )}
          </View>

          {/* Dispute Input */}
          {showDisputeInput ? (
            <View style={styles.disputeSection}>
              <Text style={styles.disputeMessage}>
                {t('verification.sheet.disputeMessage')}
              </Text>
              <TextInput
                style={[
                  styles.reasonInput,
                  reasonError && styles.reasonInputError,
                ]}
                placeholder={t('verification.sheet.reasonPlaceholder')}
                placeholderTextColor="#A8A29E"
                value={disputeReason}
                onChangeText={(text) => {
                  setDisputeReason(text);
                  if (reasonError) setReasonError(false);
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              {reasonError && (
                <Text style={styles.errorText}>
                  {t('verification.sheet.reasonRequired')}
                </Text>
              )}
              <Pressable
                style={[
                  styles.submitDisputeButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleDisputeSubmit}
                disabled={isLoading}
              >
                {isLoading && loadingType === 'DISPUTE' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="alert-circle" size="sm" color="#FFFFFF" />
                    <Text style={styles.submitDisputeText}>
                      {t('verification.actions.dispute')}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            /* Action Buttons */
            <View style={styles.actionsSection}>
              <ActionButton
                type="verify"
                label={t('verification.actions.verify')}
                description={t('verification.actions.verifyDescription')}
                icon="checkmark-circle"
                onPress={handleVerify}
                isLoading={isLoading}
                loadingType={loadingType}
              />
              <ActionButton
                type="dispute"
                label={t('verification.actions.dispute')}
                description={t('verification.actions.disputeDescription')}
                icon="alert-circle"
                onPress={handleDisputePress}
                isLoading={isLoading}
                loadingType={loadingType}
              />
              <ActionButton
                type="skip"
                label={t('verification.actions.skip')}
                description={t('verification.actions.skipDescription')}
                icon="arrow-forward-circle"
                onPress={handleSkip}
                isLoading={isLoading}
                loadingType={loadingType}
              />
            </View>
          )}

          {/* Info text */}
          {!showDisputeInput && (
            <View style={styles.infoFooter}>
              <Icon name="information-circle-outline" size="sm" color="#A8A29E" />
              <Text style={styles.infoText}>
                {t('verification.sheet.skipMessage')}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    minWidth: 60,
  },
  closeText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: '#4A7C8C',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 17,
    color: '#1C1917',
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoDetails: {
    flex: 1,
    gap: 8,
  },
  ownerName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E8F0F2',
    borderRadius: 10,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#4A7C8C',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F5F5F4',
    borderRadius: 10,
  },
  deadlineBadgeUrgent: {
    backgroundColor: '#F5EDE5',
  },
  deadlineText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#78716C',
  },
  deadlineTextUrgent: {
    color: '#D4A574',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
  },
  notesLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#78716C',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesContent: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#44403C',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionsSection: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  actionDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#A8A29E',
    lineHeight: 19,
  },
  disputeSection: {
    gap: 12,
  },
  disputeMessage: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#57534E',
    lineHeight: 22,
  },
  reasonInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    padding: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#1C1917',
    minHeight: 120,
  },
  reasonInputError: {
    borderColor: '#B54548',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#B54548',
  },
  submitDisputeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B54548',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  submitDisputeText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
