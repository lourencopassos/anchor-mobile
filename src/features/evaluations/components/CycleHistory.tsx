import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Card } from '@shared/components/ui/Card';
import type { CycleHistoryItem, CycleStatus } from '@api/types';

interface CycleHistoryProps {
  cycles: CycleHistoryItem[];
}

/**
 * Get status display configuration
 */
function getStatusConfig(status: CycleStatus) {
  switch (status) {
    case 'SUCCEEDED':
      return { color: 'text-success', bgColor: 'bg-success-100', icon: '✓' };
    case 'FAILED':
      return { color: 'text-error', bgColor: 'bg-error-100', icon: '✗' };
    case 'ACTIVE':
      return { color: 'text-primary-600', bgColor: 'bg-primary-100', icon: '●' };
    case 'EXPIRED':
      return { color: 'text-neutral-500', bgColor: 'bg-neutral-100', icon: '○' };
    case 'ABANDONED':
      return { color: 'text-warning', bgColor: 'bg-warning-100', icon: '−' };
    default:
      return { color: 'text-neutral-500', bgColor: 'bg-neutral-100', icon: '?' };
  }
}

interface CycleItemProps {
  cycle: CycleHistoryItem;
  isLast: boolean;
}

function CycleItem({ cycle, isLast }: CycleItemProps) {
  const { t } = useTranslation('evaluations');
  const config = getStatusConfig(cycle.status);

  const startDate = format(parseISO(cycle.startDate), 'MMM d, yyyy');
  const endDate = cycle.endDate
    ? format(parseISO(cycle.endDate), 'MMM d, yyyy')
    : t('cycles.ongoing');

  return (
    <View className={`flex-row py-3 ${!isLast ? 'border-b border-neutral-100' : ''}`}>
      {/* Sequence number with status indicator */}
      <View className="w-12 items-center">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${config.bgColor}`}
        >
          <Text className={`font-bold ${config.color}`}>{cycle.sequenceNumber}</Text>
        </View>
      </View>

      {/* Cycle details */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-medium text-neutral-900">
            {t('cycles.cycle', { number: cycle.sequenceNumber })}
          </Text>
          <View className={`px-2 py-0.5 rounded ${config.bgColor}`}>
            <Text className={`text-xs font-medium ${config.color}`}>
              {cycle.status}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-neutral-500 mt-1">
          {startDate} → {endDate}
        </Text>

        {cycle.endReason && (
          <Text className="text-xs text-neutral-400 mt-1 italic">
            {cycle.endReason}
          </Text>
        )}
      </View>

      {/* Status icon */}
      <View className="justify-center">
        <Text className={`text-xl ${config.color}`}>{config.icon}</Text>
      </View>
    </View>
  );
}

/**
 * Display history of cycles for restarted commitments
 */
export function CycleHistory({ cycles }: CycleHistoryProps) {
  const { t } = useTranslation('evaluations');

  // Only show if there are multiple cycles (meaning commitment was restarted)
  if (cycles.length <= 1) {
    return null;
  }

  // Sort by sequence number descending (most recent first)
  const sortedCycles = [...cycles].sort(
    (a, b) => b.sequenceNumber - a.sequenceNumber
  );

  return (
    <Card variant="outlined">
      <Text className="text-lg font-semibold text-neutral-900 mb-3">
        {t('cycles.title')}
      </Text>

      {sortedCycles.map((cycle, index) => (
        <CycleItem
          key={cycle.id}
          cycle={cycle}
          isLast={index === sortedCycles.length - 1}
        />
      ))}
    </Card>
  );
}
