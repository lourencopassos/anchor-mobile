/**
 * =============================================================================
 * SUPPORTER PROGRESS VIEW
 * =============================================================================
 *
 * Full progress display for a supported commitment.
 * Reuses existing progress components (ProgressRing, StreakDisplay).
 * Shows stats row with total check-ins, completion rate, and streaks.
 * Read-only view - no check-in button.
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SupportedCommitment } from '@api/types';
import { Icon } from '@shared/components/ui/Icon';
import { ProgressRing } from '@shared/components/ui/ProgressRing';

interface SupporterProgressViewProps {
  commitment: SupportedCommitment;
}

interface StatItemProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size="sm" color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export function SupporterProgressView({ commitment }: SupporterProgressViewProps) {
  const { t } = useTranslation('supporting');

  const completionRate =
    commitment.totalCheckIns > 0
      ? Math.round((commitment.completedCheckIns / commitment.totalCheckIns) * 100)
      : 0;

  return (
    <View style={styles.container}>
      {/* Main progress ring */}
      <View style={styles.progressSection}>
        <ProgressRing
          progress={commitment.progress}
          size="lg"
          color="#4A7C8C"
          showLabel
        />
        <Text style={styles.progressLabel}>{t('progress.overall')}</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="checkmark-done"
          label={t('progress.completed')}
          value={`${commitment.completedCheckIns}/${commitment.totalCheckIns}`}
          color="#2D5A4A"
        />
        <StatItem
          icon="analytics"
          label={t('progress.completionRate')}
          value={`${completionRate}%`}
          color="#4A7C8C"
        />
        <StatItem
          icon="flame"
          label={t('progress.currentStreak')}
          value={commitment.currentStreak}
          color="#D4A574"
        />
      </View>

      {/* Date range */}
      <View style={styles.dateRange}>
        <View style={styles.dateItem}>
          <Icon name="calendar-outline" size="xs" color="#78716C" />
          <Text style={styles.dateLabel}>{t('progress.started')}</Text>
          <Text style={styles.dateValue}>
            {new Date(commitment.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.dateDivider} />
        <View style={styles.dateItem}>
          <Icon name="flag-outline" size="xs" color="#78716C" />
          <Text style={styles.dateLabel}>{t('progress.ends')}</Text>
          <Text style={styles.dateValue}>
            {new Date(commitment.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#78716C',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#1C1917',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
    textAlign: 'center',
    marginTop: 2,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },
  dateValue: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
  },
  dateDivider: {
    width: 24,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
});
