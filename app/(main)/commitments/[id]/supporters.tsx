import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useCommitment } from '@/features/commitments/hooks/useCommitment';
import { useSupporters } from '@/features/supporters/hooks';
import {
  useAcceptInvite,
  useDeclineInvite,
  useRemoveSupporter,
  useResendInvite,
} from '@/features/supporters/hooks/useRespondToInvite';
import {
  SupporterList,
  InviteSupporterModal,
} from '@/features/supporters/components';
import { useAuthStore, selectUser } from '@/features/auth/stores/auth.store';
import { SupporterRelationshipState } from '@api/types';
import type { Supporter } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

export default function SupportersScreen() {
  useHideTabBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('supporters');
  const currentUser = useAuthStore(selectUser);

  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  // Fetch data
  const { data: commitment } = useCommitment(id);
  const {
    data: supporters,
    isLoading: supportersLoading,
    refetch: refetchSupporters,
  } = useSupporters(id);

  // Mutations
  const { acceptInvite, isAccepting } = useAcceptInvite();
  const { declineInvite, isDeclining } = useDeclineInvite();
  const { removeSupporter, isRemoving } = useRemoveSupporter();
  const { resendInvite, isResending } = useResendInvite();

  const [refreshing, setRefreshing] = useState(false);

  // Check if current user is the commitment owner
  const isOwner = commitment?.userId === currentUser?.userId;

  // Find current user's supporter record (if they were invited)
  const currentUserSupporter = useMemo(() => {
    if (!supporters || !currentUser) return null;
    return supporters.find((s) => s.supporterUserId === currentUser.userId);
  }, [supporters, currentUser]);

  // Check if current user has a pending invitation
  const hasPendingInvitation =
    currentUserSupporter?.state === SupporterRelationshipState.INVITED;

  // Filter to show only relevant supporters (hide removed/declined for non-owners)
  const displaySupporters = useMemo(() => {
    if (!supporters) return [];
    if (isOwner) return supporters;
    return supporters.filter(
      (s) =>
        s.state === SupporterRelationshipState.ACTIVE ||
        s.state === SupporterRelationshipState.INVITED
    );
  }, [supporters, isOwner]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchSupporters();
    setRefreshing(false);
  };

  const handleAcceptInvitation = async () => {
    if (!currentUserSupporter) return;
    try {
      await acceptInvite(currentUserSupporter.id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeclineInvitation = async () => {
    if (!currentUserSupporter || !id) return;
    try {
      await declineInvite({
        supporterId: currentUserSupporter.id,
        commitmentId: id,
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleRemoveSupporter = async (supporter: Supporter) => {
    if (!id) return;
    try {
      await removeSupporter({
        supporterId: supporter.id,
        commitmentId: id,
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleResendInvite = async (supporter: Supporter) => {
    try {
      await resendInvite(supporter.id);
    } catch {
      // Error handled by hook
    }
  };

  if (supportersLoading) {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header
        title={t('title')}
        showBack
        rightAction={
          isOwner ? (
            <Button
              title={t('invite')}
              variant="ghost"
              size="sm"
              onPress={() => setInviteModalVisible(true)}
            />
          ) : undefined
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Pending Invitation Card */}
        {hasPendingInvitation && (
          <Card variant="elevated" className="mb-4 bg-primary-50">
            <Text className="text-base text-primary-800 mb-3">
              {t('invitation.received')}
            </Text>
            <View className="flex-row gap-3">
              <Button
                title={t('invitation.accept')}
                onPress={handleAcceptInvitation}
                loading={isAccepting}
                className="flex-1"
              />
              <Button
                title={t('invitation.decline')}
                variant="outline"
                onPress={handleDeclineInvitation}
                loading={isDeclining}
                className="flex-1"
              />
            </View>
          </Card>
        )}

        {/* Supporters List */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-neutral-900 mb-3">
            {t('title')} ({displaySupporters.length})
          </Text>
          <SupporterList
            supporters={displaySupporters}
            isOwner={isOwner}
            onRemove={isOwner ? handleRemoveSupporter : undefined}
            onResendInvite={isOwner ? handleResendInvite : undefined}
          />
        </View>

        {/* Invite CTA for owners with no supporters */}
        {isOwner && displaySupporters.length === 0 && (
          <View className="items-center py-4">
            <Button
              title={t('invite')}
              onPress={() => setInviteModalVisible(true)}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* Invite Modal */}
      <InviteSupporterModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        commitmentId={id!}
      />
    </SafeScreen>
  );
}
