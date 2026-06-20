import { View, Text } from 'react-native';
import type { CommitmentState } from '@api/types';

interface CommitmentStatusProps {
  state: CommitmentState;
  size?: 'sm' | 'md' | 'lg';
}

const STATE_CONFIG: Record<
  CommitmentState,
  { label: string; bgColor: string; textColor: string }
> = {
  DRAFT: {
    label: 'Draft',
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-600',
  },
  PENDING_DEPOSIT: {
    label: 'Pending Deposit',
    bgColor: 'bg-warning-100',
    textColor: 'text-warning-700',
  },
  ACTIVE: {
    label: 'Active',
    bgColor: 'bg-primary-100',
    textColor: 'text-primary-700',
  },
  COMPLETED: {
    label: 'Completed',
    bgColor: 'bg-success-100',
    textColor: 'text-success-700',
  },
  BROKEN: {
    label: 'Broken',
    bgColor: 'bg-error-100',
    textColor: 'text-error-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-500',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function CommitmentStatus({ state, size = 'md' }: CommitmentStatusProps) {
  const config = STATE_CONFIG[state];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <View className={`rounded-full ${config.bgColor} ${sizeClass}`}>
      <Text className={`font-medium ${config.textColor}`}>{config.label}</Text>
    </View>
  );
}
