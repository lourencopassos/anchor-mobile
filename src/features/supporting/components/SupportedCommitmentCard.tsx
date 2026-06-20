/**
 * =============================================================================
 * SUPPORTED COMMITMENT CARD
 * =============================================================================
 *
 * Card component for displaying commitments the user is supporting.
 * Shows owner info, progress, role badge, and voting alert indicator.
 * Uses teal accent (#4A7C8C) to distinguish from owned commitments.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { SupportedCommitment } from '@api/types';
import { SupporterRole, SupporterRelationshipState } from '@api/types';
import { haptics } from '@/shared/utils/haptics.utils';
import { Icon, ROLE_ICONS } from '@shared/components/ui/Icon';
import { ProgressRing } from '@shared/components/ui/ProgressRing';
import { Avatar } from '@shared/components/ui/Avatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SupportedCommitmentCardProps {
  commitment: SupportedCommitment;
  onAcceptInvite?: (supporterId: string) => void;
  onDeclineInvite?: (supporterId: string) => void;
}

const TEMPLATE_ICONS: Record<string, string> = {
  QUIT_SMOKING: 'ban-outline',
  EXERCISE: 'barbell-outline',
  MEDITATION: 'leaf-outline',
  DIET: 'nutrition-outline',
  SLEEP: 'moon-outline',
  CUSTOM: 'sparkles-outline',
};

const ROLE_COLORS = {
  [SupporterRole.OBSERVER]: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
  },
  [SupporterRole.ENCOURAGER]: {
    bg: '#D1FAE5',
    text: '#047857',
  },
  [SupporterRole.VERIFIER]: {
    bg: '#EDE9FE',
    text: '#6D28D9',
  },
};

export function SupportedCommitmentCard({ commitment, onAcceptInvite, onDeclineInvite }: SupportedCommitmentCardProps) {
  const router = useRouter();
  const { t } = useTranslation('supporting');
  const { t: tCommitments } = useTranslation('commitments');
  const scale = useSharedValue(1);

  const isPending = commitment.supporterRelationship.state === SupporterRelationshipState.INVITED;
  const roleStyle = ROLE_COLORS[commitment.supporterRelationship.role];
  const roleKey = commitment.supporterRelationship.role.toLowerCase() as 'observer' | 'encourager' | 'verifier';

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(commitment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    haptics.light();
    // Only navigate to detail if already accepted, otherwise do nothing (use action buttons)
    if (!isPending) {
      router.push(`/(main)/supporting/${commitment.id}` as const);
    }
  };

  const handleAccept = () => {
    haptics.medium();
    onAcceptInvite?.(commitment.supporterRelationship.id);
  };

  const handleDecline = () => {
    haptics.light();
    onDeclineInvite?.(commitment.supporterRelationship.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, isPending && styles.containerPending, animatedStyle]}
    >
      {/* Accent border - amber for pending, teal for active */}
      <View style={[styles.accentBorder, isPending && styles.accentBorderPending]} />

      <View style={styles.content}>
        {/* Pending invite banner */}
        {isPending && (
          <View style={styles.pendingBanner}>
            <Icon name="mail-outline" size="xs" color="#B45309" />
            <Text style={styles.pendingBannerText}>{t('card.pendingInvite')}</Text>
          </View>
        )}

        {/* Header with owner info */}
        <View style={styles.header}>
          <View style={styles.ownerSection}>
            <Avatar
              name={commitment.ownerDisplayName}
              source={commitment.ownerAvatarUrl}
              size="sm"
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName} numberOfLines={1}>
                {commitment.ownerDisplayName}
              </Text>
              <View style={styles.templateRow}>
                <Icon
                  name={TEMPLATE_ICONS[commitment.templateType] || 'flag-outline'}
                  size="xs"
                  color="#78716C"
                />
                <Text style={styles.templateText}>
                  {tCommitments(`templates.${commitment.templateType.toLowerCase()}`)}
                </Text>
              </View>
            </View>
          </View>

          {!isPending && (
            <View style={styles.progressSection}>
              <ProgressRing
                progress={commitment.progress}
                size="sm"
                color="#4A7C8C"
              />
            </View>
          )}
        </View>

        {/* Footer with badges and status */}
        <View style={styles.footer}>
          <View style={styles.badgesRow}>
            {/* Role badge */}
            <View style={[styles.badge, { backgroundColor: roleStyle.bg }]}>
              <Icon
                name={ROLE_ICONS[roleKey]}
                size="xs"
                color={roleStyle.text}
              />
              <Text style={[styles.badgeText, { color: roleStyle.text }]}>
                {t(`role.${roleKey}`)}
              </Text>
            </View>

            {/* Streak badge - only show for active supporters */}
            {!isPending && commitment.currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <Icon name="flame" size="xs" color="#D4A574" />
                <Text style={styles.streakText}>{commitment.currentStreak}</Text>
              </View>
            )}

          </View>

          {!isPending && (
            <Text style={styles.daysText}>
              {commitment.state === 'ACTIVE'
                ? t('card.daysRemaining', { count: daysRemaining })
                : tCommitments(`state.${commitment.state.toLowerCase()}`)}
            </Text>
          )}
        </View>

        {/* Pending invite action buttons */}
        {isPending && (
          <View style={styles.pendingActions}>
            <Pressable
              onPress={handleDecline}
              style={styles.declineButton}
            >
              <Text style={styles.declineButtonText}>{t('card.decline')}</Text>
            </Pressable>
            <Pressable
              onPress={handleAccept}
              style={styles.acceptButton}
            >
              <Icon name="checkmark" size="xs" color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>{t('card.accept')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  containerPending: {
    backgroundColor: '#FFFBEB', // Warm amber tint for pending invites
  },
  accentBorder: {
    width: 4,
    backgroundColor: '#4A7C8C', // Teal for supporter context
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  accentBorderPending: {
    backgroundColor: '#F59E0B', // Amber for pending invites
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  pendingBannerText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#B45309',
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  declineButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  declineButtonText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#6B7280',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2D5A4A',
  },
  acceptButtonText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  ownerName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
    marginBottom: 2,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },
  progressSection: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#B45309',
  },
  daysText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },
});
