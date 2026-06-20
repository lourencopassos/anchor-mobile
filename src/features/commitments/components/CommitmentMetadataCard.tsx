import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { parseISO, differenceInDays } from 'date-fns';
import { formatDate } from '@/shared/utils/date.utils';
import { Card } from '@/shared/components/ui/Card';
import type { VerificationAuthorityType } from '@api/types';

interface CommitmentMetadataCardProps {
  startDate: string;
  endDate: string;
  createdAt: string;
  timezone?: string;
  verificationAuthorityType?: VerificationAuthorityType;
  showDates?: boolean;
}

const VERIFICATION_LABELS: Record<VerificationAuthorityType, string> = {
  SELF_ONLY: 'verification.self_only.short',
  SINGLE_SUPPORTER: 'verification.single_supporter.short',
  UNANIMOUS: 'verification.unanimous.short',
  MAJORITY: 'verification.majority.short',
  SUPERMAJORITY: 'verification.majority.short',
};

interface MetadataRowProps {
  label: string;
  value: string;
}

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function CommitmentMetadataCard({
  startDate,
  endDate,
  createdAt,
  timezone,
  verificationAuthorityType,
  showDates = false,
}: CommitmentMetadataCardProps) {
  const { t } = useTranslation('commitments');

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const durationDays = differenceInDays(end, start) + 1;

  // Format timezone for display (e.g., "America/Sao_Paulo" -> "Sao Paulo")
  const formatTimezone = (tz: string): string => {
    if (!tz) return '';
    const parts = tz.split('/');
    const city = parts[parts.length - 1];
    return city.replace(/_/g, ' ');
  };

  return (
    <Card variant="outlined" className="mb-4">
      <Text style={styles.title}>{t('detail.metadata.title')}</Text>

      {showDates && (
        <>
          <MetadataRow
            label={t('detail.metadata.startDate')}
            value={formatDate(startDate, 'PPP')}
          />
          <MetadataRow
            label={t('detail.metadata.endDate')}
            value={formatDate(endDate, 'PPP')}
          />
        </>
      )}

      <MetadataRow
        label={t('detail.metadata.duration')}
        value={t('detail.metadata.durationDays', { count: durationDays })}
      />

      {verificationAuthorityType && (
        <MetadataRow
          label={t('detail.metadata.verification')}
          value={t(VERIFICATION_LABELS[verificationAuthorityType] || 'verification.self_only.short')}
        />
      )}

      <MetadataRow
        label={t('detail.metadata.createdOn')}
        value={formatDate(createdAt, 'PPP')}
      />

      {timezone && (
        <MetadataRow
          label={t('detail.metadata.timezone')}
          value={formatTimezone(timezone)}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#78716C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E5E4',
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#57534E',
  },
  value: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
  },
});
