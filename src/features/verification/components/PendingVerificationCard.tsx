/**
 * =============================================================================
 * PENDING VERIFICATION CARD
 * =============================================================================
 *
 * A card component displaying a check-in awaiting verification.
 * Features an elegant deadline countdown ring and clear action buttons.
 *
 * Design: Editorial/Magazine aesthetic with warm organic accents.
 * Uses teal (#4A7C8C) for supporter context with warm gold for urgency.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { haptics } from '../../../shared/utils/haptics.utils';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Icon } from '../../../shared/components/ui/Icon';
import type { PendingVerification, EvidenceType } from '../../../api/types';
import { getTimeRemaining, formatCheckInDate } from '../hooks/useVerifications';

interface PendingVerificationCardProps {
  verification: PendingVerification;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Deadline countdown ring component
function DeadlineRing({
  hoursRemaining,
  isUrgent,
}: {
  hoursRemaining: number;
  isUrgent: boolean;
}) {
  // 48 hours total, calculate progress (1 = full, 0 = empty)
  const progress = Math.min(1, Math.max(0, hoursRemaining / 48));
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const ringColor = isUrgent ? '#D4A574' : '#4A7C8C'; // Warm gold when urgent, teal otherwise
  const bgColor = isUrgent ? '#F5EDE5' : '#E8F0F2';

  return (
    <View style={styles.ringContainer}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringContent}>
        <Text style={[styles.ringHours, isUrgent && styles.ringHoursUrgent]}>
          {hoursRemaining}
        </Text>
        <Text style={[styles.ringLabel, isUrgent && styles.ringLabelUrgent]}>
          hr
        </Text>
      </View>
    </View>
  );
}

// Evidence type badge
function EvidenceBadge({ type }: { type: EvidenceType }) {
  const { t } = useTranslation('supporting');

  const evidenceConfig = {
    SELF_REPORT: { icon: 'chatbox-outline', color: '#78716C' },
    PHOTO: { icon: 'camera-outline', color: '#4A7C8C' },
    MANUAL: { icon: 'create-outline', color: '#87A878' },
  };

  const config = evidenceConfig[type] || evidenceConfig.SELF_REPORT;
  const label = t(`verification.card.evidence.${type.toLowerCase() as 'self_report' | 'photo' | 'manual'}`);

  return (
    <View style={[styles.evidenceBadge, { backgroundColor: `${config.color}15` }]}>
      <Icon name={config.icon as any} size="xs" color={config.color} />
      <Text style={[styles.evidenceText, { color: config.color }]}>{label}</Text>
    </View>
  );
}

export function PendingVerificationCard({
  verification,
  onPress,
}: PendingVerificationCardProps) {
  const { t } = useTranslation('supporting');
  const scale = useSharedValue(1);

  const timeInfo = useMemo(
    () => getTimeRemaining(verification.deadline),
    [verification.deadline]
  );

  const formattedDate = useMemo(
    () => formatCheckInDate(verification.checkInDate),
    [verification.checkInDate]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      {/* Urgent indicator strip */}
      {timeInfo.isUrgent && <View style={styles.urgentStrip} />}

      <View style={styles.content}>
        {/* Left: Avatar + Info */}
        <View style={styles.leftSection}>
          <Avatar
            name={verification.ownerDisplayName}
            source={verification.ownerAvatarUrl}
            size="md"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.ownerName} numberOfLines={1}>
              {verification.ownerDisplayName}
            </Text>
            <View style={styles.dateRow}>
              <Icon name="calendar-outline" size="xs" color="#78716C" />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <EvidenceBadge type={verification.evidenceType} />
          </View>
        </View>

        {/* Right: Deadline Ring */}
        <View style={styles.rightSection}>
          <DeadlineRing
            hoursRemaining={timeInfo.hours}
            isUrgent={timeInfo.isUrgent}
          />
          {timeInfo.isUrgent && (
            <Text style={styles.urgentLabel}>
              {t('verification.card.urgent')}
            </Text>
          )}
        </View>
      </View>

      {/* Notes preview (if present) */}
      {verification.notes && (
        <View style={styles.notesContainer}>
          <Icon name="document-text-outline" size="xs" color="#78716C" />
          <Text style={styles.notesText} numberOfLines={2}>
            {verification.notes}
          </Text>
        </View>
      )}

      {/* Tap hint */}
      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>Tap to review</Text>
        <Icon name="chevron-forward" size="xs" color="#A8A29E" />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  urgentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#D4A574',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  ownerName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#1C1917',
    letterSpacing: -0.2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#78716C',
  },
  rightSection: {
    alignItems: 'center',
    gap: 4,
  },
  ringContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  ringContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ringHours: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#4A7C8C',
  },
  ringHoursUrgent: {
    color: '#D4A574',
  },
  ringLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#4A7C8C',
    marginLeft: 1,
  },
  ringLabelUrgent: {
    color: '#D4A574',
  },
  urgentLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    color: '#D4A574',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  evidenceText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: -4,
  },
  notesText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#57534E',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
    backgroundColor: '#FAFAF9',
  },
  tapHintText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#A8A29E',
  },
});
