/**
 * =============================================================================
 * PENDING INVITE CARD
 * =============================================================================
 *
 * A warm, inviting card for pending supporter invitations.
 * Features amber/copper accents and Accept/Decline buttons.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Icon } from '@shared/components/ui/Icon';
import { Avatar } from '@shared/components/ui/Avatar';
import { haptics } from '@/shared/utils/haptics.utils';
import { useAcceptInvite, useDeclineInvite } from '@/features/supporting/hooks/useSupportedCommitments';
import type { SupportedCommitment, TemplateType } from '@api/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Design tokens - warm copper/amber palette
const COLORS = {
  invite: {
    bg: '#FEF7ED',
    border: '#D4A574',
    accent: '#B87333',
    text: '#92400E',
  },
  primary: '#2D5A4A',
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    muted: '#78716C',
  },
  decline: {
    bg: 'transparent',
    text: '#78716C',
  },
};

// Template icons mapping
const TEMPLATE_ICONS: Record<TemplateType, string> = {
  QUIT_SMOKING: 'leaf-outline',
  EXERCISE: 'fitness-outline',
  MEDITATION: 'flower-outline',
  DIET: 'nutrition-outline',
  SLEEP: 'moon-outline',
  CUSTOM: 'flag-outline',
};

interface PendingInviteCardProps {
  commitment: SupportedCommitment;
  onAccepted?: () => void;
  onDeclined?: () => void;
}

export function PendingInviteCard({
  commitment,
  onAccepted,
  onDeclined,
}: PendingInviteCardProps) {
  const { t } = useTranslation('home');
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptMutation = useAcceptInvite();
  const declineMutation = useDeclineInvite();

  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  const handlePressIn = () => {
    cardScale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 12 });
  };

  const handleAccept = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    haptics.medium();

    try {
      await acceptMutation.mutateAsync(commitment.supporterRelationship.id);
      haptics.success();

      // Animate out
      cardOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(handleAcceptComplete)();
      });
    } catch (error) {
      setIsProcessing(false);
      haptics.error();
    }
  };

  const handleAcceptComplete = () => {
    onAccepted?.();
    // Navigate to the commitment detail
    router.push(`/(main)/supporting/${commitment.id}` as const);
  };

  const handleDecline = () => {
    haptics.light();
    Alert.alert(
      t('invites.declineConfirm'),
      t('invites.declineMessage'),
      [
        {
          text: t('invites.accept'),
          style: 'cancel',
        },
        {
          text: t('invites.decline'),
          style: 'destructive',
          onPress: confirmDecline,
        },
      ]
    );
  };

  const confirmDecline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await declineMutation.mutateAsync(commitment.supporterRelationship.id);
      haptics.light();

      // Animate out
      cardOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(handleDeclineComplete)();
      });
    } catch (error) {
      setIsProcessing(false);
      haptics.error();
    }
  };

  const handleDeclineComplete = () => {
    onDeclined?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const templateIcon = TEMPLATE_ICONS[commitment.templateType] || 'flag-outline';

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.card}>
        {/* Left accent border */}
        <View style={styles.accentBorder} />

        <View style={styles.content}>
          {/* Header with avatar and info */}
          <View style={styles.header}>
            <View style={styles.avatarGlow}>
              <Avatar
                name={commitment.ownerDisplayName}
                source={commitment.ownerAvatarUrl}
                size="md"
              />
            </View>

            <View style={styles.info}>
              <Text style={styles.inviteLabel}>{t('invites.title')}</Text>
              <Text style={styles.ownerName} numberOfLines={1}>
                {t('invites.subtitle', { name: commitment.ownerDisplayName })}
              </Text>
            </View>
          </View>

          {/* Commitment type */}
          <View style={styles.commitmentType}>
            <View style={styles.typeIconContainer}>
              <Icon name={templateIcon} size="sm" color={COLORS.invite.accent} />
            </View>
            <Text style={styles.typeText}>
              {commitment.templateType.replace('_', ' ')}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleDecline}
              disabled={isProcessing}
              style={[styles.button, styles.declineButton]}
            >
              <Text style={styles.declineText}>{t('invites.decline')}</Text>
            </Pressable>

            <AnimatedPressable
              onPress={handleAccept}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isProcessing}
              style={[styles.button, styles.acceptButton]}
            >
              {isProcessing ? (
                <Icon name="hourglass-outline" size="sm" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark" size="sm" color="#FFFFFF" />
                  <Text style={styles.acceptText}>{t('invites.accept')}</Text>
                </>
              )}
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.invite.bg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  accentBorder: {
    width: 4,
    backgroundColor: COLORS.invite.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGlow: {
    padding: 2,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  inviteLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.invite.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.primary,
  },
  commitmentType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeIconContainer: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: COLORS.invite.text,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.text.muted,
  },
  declineText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.text.muted,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#FFFFFF',
  },
});
