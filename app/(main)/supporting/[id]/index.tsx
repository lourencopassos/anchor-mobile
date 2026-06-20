/**
 * =============================================================================
 * SUPPORTER COMMITMENT DETAIL SCREEN
 * =============================================================================
 *
 * Detailed view of a commitment the user is supporting.
 * Shows owner info, progress, check-in feed, and encouragement actions.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Avatar } from '@shared/components/ui/Avatar';
import { useSupportedCommitment } from '@/features/supporting/hooks';
import {
  CheckInFeed,
  SupporterProgressView,
  EncouragementActions,
} from '@/features/supporting/components';
import { SupporterRole } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

export default function SupporterCommitmentDetailScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('supporting');

  const [refreshing, setRefreshing] = useState(false);

  const { data: commitment, isLoading, refetch } = useSupportedCommitment(id);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Check if current user can send encouragement (encourager or verifier)
  const canEncourage =
    commitment?.supporterRelationship.role === SupporterRole.ENCOURAGER ||
    commitment?.supporterRelationship.role === SupporterRole.VERIFIER;

  // Get the latest check-in ID for quick actions
  const latestCheckIn = commitment?.checkIns?.[0];

  const handleReaction = (emoji: string) => {
    // Navigate to latest check-in detail to react
    if (!latestCheckIn) {
      Alert.alert(
        t('noCheckIns.title', { defaultValue: 'No Check-ins' }),
        t('noCheckIns.message', { defaultValue: 'There are no check-ins to react to yet.' })
      );
      return;
    }
    router.push(`/supporting/${id}/check-ins/${latestCheckIn.id}?emoji=${encodeURIComponent(emoji)}`);
  };

  const handleComment = () => {
    // Navigate to latest check-in detail to comment
    if (!latestCheckIn) {
      Alert.alert(
        t('noCheckIns.title', { defaultValue: 'No Check-ins' }),
        t('noCheckIns.message', { defaultValue: 'There are no check-ins to comment on yet.' })
      );
      return;
    }
    router.push(`/supporting/${id}/check-ins/${latestCheckIn.id}?focus=comment`);
  };

  const handleSeeAllCheckIns = () => {
    // For now, navigate to the first check-in if available
    // In the future, this could navigate to a dedicated check-ins list screen
    if (latestCheckIn) {
      router.push(`/supporting/${id}/check-ins/${latestCheckIn.id}`);
    }
  };

  if (isLoading || !commitment) {
    return (
      <SafeScreen>
        <Header title={t('detail.title')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7C8C" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header title={t('detail.title')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          canEncourage && styles.scrollContentWithActions,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4A7C8C"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Owner header */}
        <View style={styles.ownerHeader}>
          <Avatar
            name={commitment.ownerDisplayName}
            source={commitment.ownerAvatarUrl}
            size="lg"
          />
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>{commitment.ownerDisplayName}</Text>
            <View style={styles.supportingBadge}>
              <Text style={styles.supportingBadgeText}>{t('detail.supporting')}</Text>
            </View>
          </View>
        </View>

        {/* Progress view */}
        <SupporterProgressView commitment={commitment} />

        {/* Check-in feed */}
        <CheckInFeed
          commitmentId={commitment.id}
          checkIns={commitment.checkIns || []}
          onSeeAll={handleSeeAllCheckIns}
          maxItems={7}
        />
      </ScrollView>

      {/* Encouragement actions (sticky bottom bar) */}
      {canEncourage && (
        <EncouragementActions
          onReaction={handleReaction}
          onComment={handleComment}
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  scrollContentWithActions: {
    paddingBottom: 100, // Extra space for sticky action bar
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  ownerName: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#1C1917',
    marginBottom: 4,
  },
  supportingBadge: {
    backgroundColor: '#4A7C8C15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  supportingBadgeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#4A7C8C',
  },
});
