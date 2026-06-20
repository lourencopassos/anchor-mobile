/**
 * =============================================================================
 * PENDING VERIFICATIONS SECTION
 * =============================================================================
 *
 * A section component that shows pending verifications inline on the Supporting page.
 * Displays as a horizontal scrollable list with a "See all" link.
 *
 * Design: Compact horizontal cards with urgency indicators.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { haptics } from '../../../shared/utils/haptics.utils';
import { Icon } from '../../../shared/components/ui/Icon';
import { PendingVerificationCard } from './PendingVerificationCard';
import { VerificationActionSheet } from './VerificationActionSheet';
import {
  usePendingVerifications,
  useVerifyCheckIn,
} from '../hooks/useVerifications';
import type { PendingVerification, VerificationType } from '../../../api/types';

interface PendingVerificationsSectionProps {
  maxItems?: number;
  onSeeAll?: () => void;
}

export function PendingVerificationsSection({
  maxItems = 5,
  onSeeAll,
}: PendingVerificationsSectionProps) {
  const { t } = useTranslation('supporting');
  const { data, isLoading, error, refetch } = usePendingVerifications();
  const verifyMutation = useVerifyCheckIn();

  const [selectedVerification, setSelectedVerification] =
    useState<PendingVerification | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const verifications = data?.verifications || [];
  const totalCount = data?.totalCount || 0;
  const displayItems = verifications.slice(0, maxItems);
  const hasMore = totalCount > maxItems;

  const handleCardPress = useCallback((verification: PendingVerification) => {
    setSelectedVerification(verification);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedVerification(null);
  }, []);

  const handleVerificationSuccess = useCallback(
    (type: VerificationType) => {
      const messageKey = {
        VERIFY: 'verification.success.verified',
        DISPUTE: 'verification.success.disputed',
        SKIP: 'verification.success.skipped',
      }[type];

      haptics.success();
      handleCloseSheet();

      // Show brief toast/feedback
      Alert.alert('', t(messageKey));
    },
    [handleCloseSheet, t]
  );

  const handleVerificationError = useCallback(() => {
    haptics.error();
    Alert.alert(t('verification.error.title'), t('verification.error.message'));
  }, [t]);

  const handleVerify = useCallback(() => {
    if (!selectedVerification) return;

    verifyMutation.mutate(
      {
        checkInId: selectedVerification.checkInId,
        verificationType: 'VERIFY',
      },
      {
        onSuccess: () => handleVerificationSuccess('VERIFY'),
        onError: handleVerificationError,
      }
    );
  }, [
    selectedVerification,
    verifyMutation,
    handleVerificationSuccess,
    handleVerificationError,
  ]);

  const handleDispute = useCallback(
    (reason: string) => {
      if (!selectedVerification) return;

      verifyMutation.mutate(
        {
          checkInId: selectedVerification.checkInId,
          verificationType: 'DISPUTE',
          reason,
        },
        {
          onSuccess: () => handleVerificationSuccess('DISPUTE'),
          onError: handleVerificationError,
        }
      );
    },
    [
      selectedVerification,
      verifyMutation,
      handleVerificationSuccess,
      handleVerificationError,
    ]
  );

  const handleSkip = useCallback(() => {
    if (!selectedVerification) return;

    verifyMutation.mutate(
      {
        checkInId: selectedVerification.checkInId,
        verificationType: 'SKIP',
      },
      {
        onSuccess: () => handleVerificationSuccess('SKIP'),
        onError: handleVerificationError,
      }
    );
  }, [
    selectedVerification,
    verifyMutation,
    handleVerificationSuccess,
    handleVerificationError,
  ]);

  // Don't render if no pending verifications
  if (!isLoading && verifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Icon name="shield-checkmark-outline" size="md" color="#4A7C8C" />
            <Text style={styles.title}>{t('verification.title')}</Text>
          </View>
          {totalCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          )}
        </View>
        {hasMore && onSeeAll && (
          <Pressable onPress={onSeeAll} hitSlop={12}>
            <Text style={styles.seeAll}>{t('checkIn.seeAll')}</Text>
          </Pressable>
        )}
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4A7C8C" />
        </View>
      )}

      {/* Error state */}
      {error && (
        <Pressable style={styles.errorContainer} onPress={() => refetch()}>
          <Icon name="refresh-outline" size="sm" color="#B54548" />
          <Text style={styles.errorText}>Tap to retry</Text>
        </Pressable>
      )}

      {/* Verifications list */}
      {!isLoading && !error && displayItems.length > 0 && (
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item.checkInId}
          renderItem={({ item }) => (
            <PendingVerificationCard
              verification={item}
              onPress={() => handleCardPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action Sheet */}
      <VerificationActionSheet
        visible={sheetVisible}
        verification={selectedVerification}
        isLoading={verifyMutation.isPending}
        onVerify={handleVerify}
        onDispute={handleDispute}
        onSkip={handleSkip}
        onClose={handleCloseSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 17,
    color: '#1C1917',
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: '#4A7C8C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  seeAll: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#4A7C8C',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#B54548',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
});
