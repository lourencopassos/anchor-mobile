import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { formatCurrency } from '@/shared/utils/format.utils';
import { haptics } from '@/shared/utils/haptics.utils';
import type { PendingDeposit, DepositStatus } from '@api/types';
import { formatDistanceToNow } from 'date-fns';

// Design tokens
const COLORS = {
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.12)',
  forest: '#2D5A4A',
  forestLight: 'rgba(45, 90, 74, 0.12)',
  warmGold: '#D4A574',
  warmGoldLight: 'rgba(212, 165, 116, 0.12)',
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

interface DepositCardProps {
  deposit: PendingDeposit;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DepositCard({ deposit, onPress }: DepositCardProps) {
  const { t } = useTranslation('custodian');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  // Get initials for avatar
  const initials = deposit.creatorDisplayName
    ? deposit.creatorDisplayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Generate avatar color from name
  const avatarColor = getAvatarColor(deposit.creatorDisplayName || deposit.creatorUserId);

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(deposit.createdAt), { addSuffix: true });

  // Get status config
  const statusConfig = getStatusConfig(deposit.status);

  // Format date range
  const dateRange = `${formatDate(deposit.commitmentStartDate)} - ${formatDate(deposit.commitmentEndDate)}`;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {deposit.creatorDisplayName || 'Unknown User'}
          </Text>
          <View style={styles.detailRow}>
            <Text style={styles.emoji}>
              {TEMPLATE_EMOJIS[deposit.commitmentTemplateType] || '🎯'}
            </Text>
            <Text style={styles.details} numberOfLines={1}>
              {dateRange}
            </Text>
          </View>
          <StatusBadge status={deposit.status} />
        </View>

        {/* Amount & Time */}
        <View style={styles.right}>
          <Text style={styles.amount}>{formatCurrency(deposit.amountCents)}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: DepositStatus }) {
  const { t } = useTranslation('custodian');
  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.badgeText, { color: config.textColor }]}>
        {t(config.labelKey)}
      </Text>
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
      };
    case 'PAYMENT_MARKED_BY_CREATOR':
      return {
        bgColor: COLORS.copperLight,
        textColor: COLORS.copper,
        labelKey: 'deposits.status.paymentMarked' as const,
      };
    case 'RECEIVED_CONFIRMED_BY_CUSTODIAN':
      return {
        bgColor: COLORS.forestLight,
        textColor: COLORS.forest,
        labelKey: 'deposits.status.confirmed' as const,
      };
    case 'REJECTED_BY_CUSTODIAN':
      return {
        bgColor: COLORS.errorLight,
        textColor: COLORS.error,
        labelKey: 'deposits.status.rejected' as const,
      };
    default:
      return {
        bgColor: COLORS.neutral200,
        textColor: COLORS.neutral600,
        labelKey: 'deposits.status.awaitingPayment' as const,
      };
  }
}

function getAvatarColor(seed: string): string {
  const colors = ['#4A7C8C', '#87A878', '#B87333', '#6366f1', '#ec4899', '#8b5cf6'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.white,
  },

  // Info
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.neutral900,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 12,
  },
  details: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.neutral500,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
  },

  // Right
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 15,
    color: COLORS.copper,
  },
  time: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: COLORS.neutral400,
  },
});
