import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Commitment, TemplateType } from '@api/types';
import { haptics } from '@/shared/utils/haptics.utils';
import { Icon } from '@shared/components/ui/Icon';
import { formatCurrency } from '@/shared/utils/format.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PendingCommitmentCardProps {
  commitment: Commitment;
}

const TEMPLATE_ICONS: Record<TemplateType, string> = {
  QUIT_SMOKING: 'ban-outline',
  EXERCISE: 'barbell-outline',
  MEDITATION: 'leaf-outline',
  DIET: 'nutrition-outline',
  SLEEP: 'moon-outline',
  CUSTOM: 'sparkles-outline',
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

export function PendingCommitmentCard({ commitment }: PendingCommitmentCardProps) {
  const router = useRouter();
  const { t } = useTranslation('commitments');
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    haptics.light();
    router.push(`/(main)/commitments/${commitment.id}` as const);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-3 border border-amber-200 dark:border-amber-800"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon
            name={TEMPLATE_ICONS[commitment.templateType] || 'flag-outline'}
            size="md"
            color="#D97706"
          />
        </View>
        <View style={styles.content}>
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t(TEMPLATE_LABELS[commitment.templateType])}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatCurrency(commitment.stakeAmountCents ?? 0)} {t('common.staked')}
          </Text>
        </View>
        <View style={styles.badge}>
          <Icon name="time-outline" size="xs" color="#D97706" />
          <Text style={styles.badgeText}>{t('state.pending_payment')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Icon name="alert-circle-outline" size="sm" color="#D97706" />
          <Text className="text-sm text-amber-700 dark:text-amber-400 ml-2">
            {t('pending.completePayment')}
          </Text>
        </View>
        <Icon name="chevron-forward" size="sm" color="#D97706" />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 119, 6, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
