import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Commitment, TemplateType, CommitmentState, CommitmentFilterState } from '@api/types';
import { haptics } from '@/shared/utils/haptics.utils';
import { Icon } from '@shared/components/ui/Icon';
import { ProgressRing } from '@shared/components/ui/ProgressRing';
import { StreakBadge } from '@shared/components/ui/StreakDisplay';
import { formatCurrency } from '@/shared/utils/format.utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CommitmentCardProps {
  commitment: Commitment;
  onCheckIn?: () => void;
  variant?: 'default' | 'compact' | 'gradient';
  streak?: number;
}

const TEMPLATE_EMOJIS: Record<TemplateType, string> = {
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

// Premium color palette aligned with new design system
// Using Partial<Record> since not all filter states may be defined
const STATE_GRADIENTS: Record<CommitmentState | 'PENDING_STAKE', { colors: readonly [string, string]; textColor: string; accent: string }> = {
  DRAFT: { colors: ['#78716C', '#57534E'] as const, textColor: '#FFFFFF', accent: '#A8A29E' },
  PENDING_STAKE: { colors: ['#78716C', '#57534E'] as const, textColor: '#FFFFFF', accent: '#A8A29E' },
  ACTIVE: { colors: ['#2D5A4A', '#1F4034'] as const, textColor: '#FFFFFF', accent: '#87A878' },
  COMPLETED: { colors: ['#4A7C8C', '#3D6673'] as const, textColor: '#FFFFFF', accent: '#87A878' },
  BROKEN: { colors: ['#B54548', '#9A3A3D'] as const, textColor: '#FFFFFF', accent: '#D4A574' },
  CANCELLED: { colors: ['#78716C', '#57534E'] as const, textColor: '#FFFFFF', accent: '#A8A29E' },
};

function getHealthIndicator(progress: number): { label: string; color: string; icon: string } {
  if (progress >= 80) return { label: 'On Track', color: '#2D5A4A', icon: 'checkmark-circle' };
  if (progress >= 60) return { label: 'Good', color: '#4D8670', icon: 'thumbs-up' };
  if (progress >= 40) return { label: 'Needs Attention', color: '#D4A574', icon: 'alert-circle' };
  return { label: 'At Risk', color: '#B54548', icon: 'warning' };
}

export function CommitmentCard({ commitment, onCheckIn, variant = 'default', streak = 0 }: CommitmentCardProps) {
  const router = useRouter();
  const { t } = useTranslation('commitments');
  const scale = useSharedValue(1);

  const hasValidProgress = commitment.currentCycle && commitment.currentCycle.totalDays > 0;
  const progress = hasValidProgress
    ? Math.round(
        (commitment.currentCycle.completedCheckIns /
          commitment.currentCycle.totalDays) *
          100
      )
    : null;

  const daysRemaining = commitment.currentCycle
    ? commitment.currentCycle.totalDays - commitment.currentCycle.completedCheckIns
    : 0;

  const stateStyle = STATE_GRADIENTS[commitment.state] || STATE_GRADIENTS.DRAFT;
  const health = getHealthIndicator(progress ?? 0);

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

  if (variant === 'gradient') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.gradientContainer, animatedStyle]}
      >
        <LinearGradient
          colors={[...stateStyle.colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.gradientHeader}>
            <View style={styles.gradientIconContainer}>
              <Text style={styles.gradientEmoji}>
                {TEMPLATE_EMOJIS[commitment.templateType] || '✨'}
              </Text>
            </View>
            <View style={styles.gradientTitleSection}>
              <Text style={styles.gradientTitle} numberOfLines={1}>
                {t(TEMPLATE_LABELS[commitment.templateType])}
              </Text>
              <Text style={styles.gradientSubtitle}>
                {formatCurrency(commitment.stakeAmountCents ?? 0)} staked
              </Text>
            </View>
            {commitment.state === 'ACTIVE' && progress !== null && (
              <ProgressRing progress={progress} size="sm" color="#FFFFFF" showLabel={false} />
            )}
          </View>

          {commitment.state === 'ACTIVE' && progress !== null && (
            <View style={styles.gradientProgressBar}>
              <View style={[styles.gradientProgressFill, { width: `${progress}%` }]} />
            </View>
          )}

          <View style={styles.gradientFooter}>
            <View style={styles.gradientFooterLeft}>
              {commitment.state === 'ACTIVE' && (
                <View style={styles.healthBadge}>
                  <Icon name={health.icon} size="xs" color="#FFFFFF" />
                  <Text style={styles.healthText}>{health.label}</Text>
                </View>
              )}
              {streak > 0 && <StreakBadge streak={streak} />}
            </View>
            <Text style={styles.gradientDaysLeft}>
              {commitment.state === 'ACTIVE'
                ? t('detail.daysRemaining', { count: daysRemaining })
                : t(`state.${commitment.state.toLowerCase()}`)}
            </Text>
          </View>
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Default variant (premium design)
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.defaultContainer, animatedStyle]}
    >
      {/* Left accent border */}
      <View style={[styles.accentBorder, { backgroundColor: stateStyle.colors[0] }]} />

      <View style={styles.defaultContent}>
        <View style={styles.defaultHeader}>
          <View style={styles.defaultHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${stateStyle.colors[0]}15` }]}>
              <Text style={styles.defaultEmoji}>
                {TEMPLATE_EMOJIS[commitment.templateType] || '✨'}
              </Text>
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.defaultTitle}>
                {t(TEMPLATE_LABELS[commitment.templateType])}
              </Text>
              <View style={styles.stakeRow}>
                <Icon name="wallet-outline" size="xs" color="#B87333" />
                <Text style={styles.stakeText}>
                  {formatCurrency(commitment.stakeAmountCents ?? 0)} staked
                </Text>
              </View>
            </View>
          </View>
          {commitment.state === 'ACTIVE' && progress !== null && (
            <View style={styles.progressContainer}>
              <ProgressRing progress={progress} size="sm" />
            </View>
          )}
        </View>

        <View style={styles.defaultFooter}>
          <View style={styles.statusSection}>
            {commitment.state === 'ACTIVE' && commitment.currentCycle && (
              <View style={styles.healthRow}>
                <View style={[styles.healthDot, { backgroundColor: health.color }]} />
                <Text style={styles.healthLabel}>{health.label}</Text>
                <Text style={styles.healthDivider}>·</Text>
                <Text style={styles.daysText}>
                  {t('detail.daysRemaining', { count: daysRemaining })}
                </Text>
              </View>
            )}

            {commitment.state === 'COMPLETED' && (
              <View style={styles.statusBadge}>
                <Icon name="checkmark-circle" size="sm" color="#2D5A4A" />
                <Text style={styles.statusBadgeText}>
                  {t('state.completed')}
                </Text>
              </View>
            )}

            {commitment.state === 'BROKEN' && (
              <View style={[styles.statusBadge, styles.statusBadgeDanger]}>
                <Icon name="refresh-outline" size="sm" color="#B54548" />
                <Text style={[styles.statusBadgeText, styles.statusBadgeTextDanger]}>
                  {t('detail.restart')}
                </Text>
              </View>
            )}
          </View>

          {commitment.state === 'ACTIVE' && commitment.currentCycle && onCheckIn && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                haptics.medium();
                onCheckIn();
              }}
              style={styles.checkInButton}
            >
              <Icon name="checkmark" size="sm" color="#FFFFFF" />
              <Text style={styles.checkInText}>{t('detail.checkIn')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  // Default variant styles
  defaultContainer: {
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
  accentBorder: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  defaultContent: {
    flex: 1,
    padding: 16,
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  defaultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultEmoji: {
    fontSize: 26,
    textAlign: 'center',
  },
  titleSection: {
    flex: 1,
    marginLeft: 12,
  },
  defaultTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
    marginBottom: 4,
  },
  stakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stakeText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#B87333',
  },
  progressContainer: {
    marginLeft: 12,
  },
  defaultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSection: {
    flex: 1,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  healthLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#57534E',
  },
  healthDivider: {
    fontSize: 13,
    color: '#A8A29E',
    marginHorizontal: 6,
  },
  daysText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0F5F3',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeDanger: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#2D5A4A',
  },
  statusBadgeTextDanger: {
    color: '#B54548',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5A4A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#2D5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  checkInText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
  },
  // Gradient variant styles
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2D5A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  gradient: {
    padding: 16,
    borderRadius: 16,
  },
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradientIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gradientEmoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  gradientTitleSection: {
    flex: 1,
  },
  gradientTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  gradientSubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  gradientProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginBottom: 12,
  },
  gradientProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  gradientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradientFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  healthText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#FFFFFF',
  },
  gradientDaysLeft: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
