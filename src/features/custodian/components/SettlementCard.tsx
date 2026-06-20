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
import type { PendingSettlement, SettlementRecipientType } from '@api/types';
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

const RECIPIENT_TYPE_CONFIG: Record<SettlementRecipientType, {
  emoji: string;
  color: string;
  bgColor: string;
}> = {
  SUPPORTER: {
    emoji: '👤',
    color: '#4A7C8C',
    bgColor: 'rgba(74, 124, 140, 0.12)',
  },
  CHARITY: {
    emoji: '💚',
    color: COLORS.forest,
    bgColor: COLORS.forestLight,
  },
  APP_POOL: {
    emoji: '🏛️',
    color: COLORS.copper,
    bgColor: COLORS.copperLight,
  },
};

interface SettlementCardProps {
  settlement: PendingSettlement;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SettlementCard({ settlement, onPress }: SettlementCardProps) {
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

  const recipientConfig = RECIPIENT_TYPE_CONFIG[settlement.recipientType];

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(settlement.createdAt), { addSuffix: true });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: recipientConfig.bgColor }]}>
          <Text style={styles.iconEmoji}>{recipientConfig.emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {settlement.recipientDisplayName || 'Recipient'}
            </Text>
            <RecipientTypeBadge type={settlement.recipientType} />
          </View>
          {settlement.commitmentFailureReason && (
            <Text style={styles.reason} numberOfLines={1}>
              {settlement.commitmentFailureReason}
            </Text>
          )}
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{t('settlements.status.pending')}</Text>
            </View>
          </View>
        </View>

        {/* Amount & Time */}
        <View style={styles.right}>
          <Text style={styles.amount}>{formatCurrency(settlement.amountCents)}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// Recipient Type Badge
function RecipientTypeBadge({ type }: { type: SettlementRecipientType }) {
  const { t } = useTranslation('custodian');
  const config = RECIPIENT_TYPE_CONFIG[type];

  const labelMap: Record<SettlementRecipientType, string> = {
    SUPPORTER: 'settlements.recipientType.supporter',
    CHARITY: 'settlements.recipientType.charity',
    APP_POOL: 'settlements.recipientType.appPool',
  };

  return (
    <View style={[styles.typeBadge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.typeBadgeText, { color: config.color }]}>
        {t(labelMap[type])}
      </Text>
    </View>
  );
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

  // Icon
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },

  // Info
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.neutral900,
    flexShrink: 1,
  },
  reason: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.neutral500,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: COLORS.warmGoldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.warmGold,
  },

  // Type Badge
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
