import React from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { getPayoutStatus } from '@api/endpoints/commitments.api';
import { formatCurrency } from '@/shared/utils/format.utils';
import type { PayoutTransaction, PayoutStatusType } from '@api/types';

interface PayoutStatusProps {
  commitmentId: string;
}

const STATUS_BADGE_VARIANT: Record<
  PayoutStatusType,
  'default' | 'success' | 'warning' | 'error' | 'info'
> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
};

function PayoutRow({ payout }: { payout: PayoutTransaction }) {
  const { t } = useTranslation('commitments');

  const recipientLabel =
    payout.recipientType === 'CHARITY'
      ? t('payout.charity')
      : payout.recipientType === 'SUPPORTER'
        ? t('payout.supporters')
        : 'App Pool';

  return (
    <View className="flex-row justify-between items-center py-2">
      <View className="flex-1">
        <Text className="text-neutral-800 font-medium">{recipientLabel}</Text>
        <Text className="text-neutral-500 text-sm">
          {formatCurrency(payout.amountCents)}
        </Text>
      </View>
      <Badge
        label={t(`payout.${payout.status.toLowerCase()}` as never)}
        variant={STATUS_BADGE_VARIANT[payout.status]}
        size="sm"
      />
    </View>
  );
}

function DistributionRow({
  label,
  amount,
  bold = false,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center">
      <Text
        className={`text-neutral-700 ${bold ? 'font-bold' : ''}`}
      >
        {label}
      </Text>
      <Text
        className={`text-neutral-900 ${bold ? 'font-bold' : 'font-medium'}`}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}

function PayoutStatusSkeleton() {
  return (
    <Card variant="outlined" className="mb-4">
      <View className="items-center py-4">
        <LoadingSpinner size="small" />
        <Text className="text-neutral-500 text-sm mt-2">
          Loading payout status...
        </Text>
      </View>
    </Card>
  );
}

export function PayoutStatus({ commitmentId }: PayoutStatusProps) {
  const { t } = useTranslation('commitments');

  const { data, isLoading, error } = useQuery({
    queryKey: ['payout-status', commitmentId],
    queryFn: () => getPayoutStatus(commitmentId),
    refetchInterval: (query) => {
      // Stop polling when all payouts are completed
      if (query.state.data?.allPayoutsCompleted) {
        return false;
      }
      return 30000; // Poll every 30 seconds
    },
  });

  if (isLoading) {
    return <PayoutStatusSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  // No distribution result means no payout for this commitment
  if (!data.distributionResult) {
    return null;
  }

  const { distributionResult, payouts, allPayoutsCompleted } = data;

  return (
    <Card variant="outlined" className="mb-4">
      <Text className="text-lg font-bold text-neutral-900 mb-4">
        {t('payout.title')}
      </Text>

      {/* Distribution Summary */}
      <View className="bg-neutral-50 rounded-lg p-4 mb-4 gap-2">
        <DistributionRow
          label={t('payout.charity')}
          amount={distributionResult.charityAmountCents}
        />
        <DistributionRow
          label={t('payout.supporters')}
          amount={distributionResult.supportersAmountCents}
        />
        <View className="border-t border-neutral-200 pt-2 mt-2">
          <DistributionRow
            label={t('payout.total')}
            amount={distributionResult.totalDistributedCents}
            bold
          />
        </View>
      </View>

      {/* Individual Payouts */}
      {payouts.length > 0 && (
        <View className="mb-4">
          {payouts.map((payout) => (
            <PayoutRow key={payout.id} payout={payout} />
          ))}
        </View>
      )}

      {/* Overall Status */}
      <View
        className={`rounded-lg p-3 ${
          allPayoutsCompleted ? 'bg-green-50' : 'bg-yellow-50'
        }`}
      >
        <Text
          className={`text-center font-medium ${
            allPayoutsCompleted ? 'text-green-700' : 'text-yellow-700'
          }`}
        >
          {allPayoutsCompleted
            ? t('payout.complete')
            : t('payout.processing')}
        </Text>
      </View>
    </Card>
  );
}
