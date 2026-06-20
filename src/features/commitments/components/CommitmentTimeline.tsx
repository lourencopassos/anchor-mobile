import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { parseISO, isBefore, isAfter, startOfDay } from 'date-fns';
import { formatDate } from '@/shared/utils/date.utils';
import type { CommitmentState } from '@api/types';

interface CommitmentTimelineProps {
  createdAt: string;
  startDate: string;
  endDate: string;
  activatedAt?: string;
  state: CommitmentState;
}

const COLORS = {
  // Past/completed milestone
  past: {
    dot: '#2D5A4A',
    dotBorder: '#2D5A4A',
    line: '#2D5A4A',
    text: '#1C1917',
    dateText: '#57534E',
  },
  // Current/active milestone
  current: {
    dot: '#2D5A4A',
    dotBorder: '#2D5A4A',
    glow: 'rgba(45, 90, 74, 0.3)',
    text: '#2D5A4A',
    dateText: '#2D5A4A',
  },
  // Future milestone
  future: {
    dot: 'transparent',
    dotBorder: '#D1D5DB',
    line: '#E5E7EB',
    text: '#9CA3AF',
    dateText: '#9CA3AF',
  },
  // Future commitment (indigo theme)
  futureCommitment: {
    dot: '#6366F1',
    dotBorder: '#6366F1',
    glow: 'rgba(99, 102, 241, 0.3)',
    text: '#6366F1',
    dateText: '#6366F1',
  },
};

type MilestoneStatus = 'past' | 'current' | 'future';

interface Milestone {
  key: string;
  label: string;
  date: string;
  status: MilestoneStatus;
}

function getMilestones(
  createdAt: string,
  startDate: string,
  endDate: string,
  state: CommitmentState,
  t: (key: string) => string
): Milestone[] {
  const today = startOfDay(new Date());
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));

  const isFuture = isAfter(start, today);
  const hasStarted = !isFuture;
  const hasEnded = state === 'COMPLETED' || state === 'BROKEN' || isAfter(today, end);

  const milestones: Milestone[] = [
    {
      key: 'created',
      label: t('detail.timeline.created'),
      date: formatDate(createdAt, 'MMM d'),
      status: 'past',
    },
  ];

  // Start milestone
  if (isFuture) {
    milestones.push({
      key: 'starts',
      label: t('detail.timeline.starts'),
      date: formatDate(startDate, 'MMM d'),
      status: 'future',
    });
  } else {
    milestones.push({
      key: 'started',
      label: hasEnded ? t('detail.timeline.started') : t('detail.timeline.now'),
      date: formatDate(startDate, 'MMM d'),
      status: hasEnded ? 'past' : 'current',
    });
  }

  // End milestone
  milestones.push({
    key: 'ends',
    label: t('detail.timeline.ends'),
    date: formatDate(endDate, 'MMM d'),
    status: hasEnded ? (state === 'COMPLETED' ? 'past' : 'past') : 'future',
  });

  return milestones;
}

function PulsingDot({ color, glowColor }: { color: string; glowColor: string }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.pulsingDotContainer, animatedStyle]}>
      <View style={[styles.dotGlow, { backgroundColor: glowColor }]} />
      <View style={[styles.dot, { backgroundColor: color, borderColor: color }]} />
    </Animated.View>
  );
}

function TimelineDot({
  status,
  isFutureCommitment,
}: {
  status: MilestoneStatus;
  isFutureCommitment: boolean;
}) {
  if (status === 'current') {
    const colors = isFutureCommitment ? COLORS.futureCommitment : COLORS.current;
    return <PulsingDot color={colors.dot} glowColor={colors.glow} />;
  }

  const colorSet = status === 'past' ? COLORS.past : COLORS.future;

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: colorSet.dot,
          borderColor: colorSet.dotBorder,
        },
      ]}
    />
  );
}

function TimelineLine({ status }: { status: 'solid' | 'dashed' }) {
  if (status === 'dashed') {
    return (
      <View style={styles.lineContainer}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[styles.dashSegment, { backgroundColor: COLORS.future.line }]} />
        ))}
      </View>
    );
  }

  return <View style={[styles.solidLine, { backgroundColor: COLORS.past.line }]} />;
}

export function CommitmentTimeline({
  createdAt,
  startDate,
  endDate,
  state,
}: CommitmentTimelineProps) {
  const { t } = useTranslation('commitments');

  const today = startOfDay(new Date());
  const start = startOfDay(parseISO(startDate));
  const isFutureCommitment = isAfter(start, today);

  const milestones = getMilestones(createdAt, startDate, endDate, state, t);

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;
          const nextMilestone = milestones[index + 1];
          const lineStatus =
            milestone.status === 'past' && nextMilestone?.status !== 'future'
              ? 'solid'
              : 'dashed';

          return (
            <Animated.View
              key={milestone.key}
              entering={FadeIn.delay(index * 100).duration(300)}
              style={styles.milestoneContainer}
            >
              {/* Dot */}
              <View style={styles.dotWrapper}>
                <TimelineDot
                  status={milestone.status}
                  isFutureCommitment={isFutureCommitment && milestone.key === 'starts'}
                />
              </View>

              {/* Line (except for last) */}
              {!isLast && (
                <View style={styles.lineWrapper}>
                  <TimelineLine status={lineStatus} />
                </View>
              )}

              {/* Labels below */}
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        milestone.status === 'current'
                          ? isFutureCommitment
                            ? COLORS.futureCommitment.text
                            : COLORS.current.text
                          : milestone.status === 'past'
                            ? COLORS.past.text
                            : COLORS.future.text,
                      fontWeight: milestone.status === 'current' ? '600' : '500',
                    },
                  ]}
                >
                  {milestone.label}
                </Text>
                <Text
                  style={[
                    styles.date,
                    {
                      color:
                        milestone.status === 'current'
                          ? isFutureCommitment
                            ? COLORS.futureCommitment.dateText
                            : COLORS.current.dateText
                          : milestone.status === 'past'
                            ? COLORS.past.dateText
                            : COLORS.future.dateText,
                    },
                  ]}
                >
                  {milestone.date}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  milestoneContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dotWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  pulsingDotContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  lineWrapper: {
    position: 'absolute',
    top: 11,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: 1,
  },
  solidLine: {
    flex: 1,
    height: 2,
  },
  lineContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 2,
  },
  dashSegment: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
  },
});
