/**
 * =============================================================================
 * CHECK-IN DETAIL SCREEN (Supporter View)
 * =============================================================================
 *
 * Detailed view of a specific check-in for supporters.
 * Shows check-in status, notes, full reaction picker, and comments.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Icon } from '@shared/components/ui/Icon';
import { Avatar } from '@shared/components/ui/Avatar';
import { haptics } from '@/shared/utils/haptics.utils';
import { useCheckIn } from '@/features/check-ins/hooks/useCheckIns';
import {
  useReactions,
  useAddReaction,
  useRemoveReaction,
} from '@/features/check-ins/hooks/useReactions';
import {
  useComments,
  useAddComment,
} from '@/features/check-ins/hooks/useComments';
import { AVAILABLE_EMOJIS } from '@api/types';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

// Extended emoji set for full reaction picker - use the constant from types
const REACTION_EMOJIS = AVAILABLE_EMOJIS;

/**
 * Status configuration with visual styles and translation keys.
 * Using explicit keys for type safety instead of dynamic string interpolation.
 */
const STATUS_CONFIG = {
  COMPLETED: {
    icon: 'checkmark-circle',
    color: '#2D5A4A',
    bg: '#D1FAE5',
    translationKey: 'checkIn.status_completed' as const,
  },
  SKIPPED: {
    icon: 'close-circle',
    color: '#78716C',
    bg: '#F3F4F6',
    translationKey: 'checkIn.status_skipped' as const,
  },
  MISSED: {
    icon: 'alert-circle',
    color: '#B54548',
    bg: '#FEE2E2',
    translationKey: 'checkIn.status_missed' as const,
  },
} as const;

type CheckInStatus = keyof typeof STATUS_CONFIG;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ReactionButtonProps {
  emoji: string;
  count: number;
  isSelected: boolean;
  onPress: () => void;
}

function ReactionButton({ emoji, count, isSelected, onPress }: ReactionButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 15 })
    );
    haptics.medium();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.reactionButton,
        isSelected && styles.reactionButtonSelected,
        animatedStyle,
      ]}
    >
      <Text style={styles.reactionEmoji}>{emoji}</Text>
      {count > 0 && <Text style={styles.reactionCount}>{count}</Text>}
    </AnimatedPressable>
  );
}

interface CommentItemProps {
  content: string;
  createdAt: string;
  userDisplayName: string | null;
  userAvatarUrl: string | null;
}

function CommentItem({ content, createdAt, userDisplayName, userAvatarUrl }: CommentItemProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const displayName = userDisplayName || 'Supporter';

  return (
    <View style={styles.commentItem}>
      <Avatar name={displayName} source={userAvatarUrl || undefined} size="xs" />
      <View style={styles.commentContent}>
        <Text style={styles.commentText}>{content}</Text>
        <Text style={styles.commentDate}>{formattedDate}</Text>
      </View>
    </View>
  );
}

export default function CheckInDetailScreen() {
  useHideTabBar();
  const { id, checkInId, emoji: initialEmoji, focus } = useLocalSearchParams<{
    id: string;
    checkInId: string;
    emoji?: string;
    focus?: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation('supporting');
  const [comment, setComment] = useState('');
  const commentInputRef = useRef<TextInput>(null);
  const hasAppliedInitialEmoji = useRef(false);

  // Fetch check-in data
  const { data: checkIn, isLoading: isLoadingCheckIn } = useCheckIn(checkInId);

  // Fetch reactions
  const { data: reactionsData, isLoading: isLoadingReactions } = useReactions(checkInId);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } = useComments(checkInId);
  const addCommentMutation = useAddComment();

  const status = (checkIn?.status ?? 'MISSED') as CheckInStatus;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.MISSED;

  // Build a map of emoji -> reaction summary for quick lookup
  const reactionMap = new Map(
    reactionsData?.reactions?.map((r) => [r.emoji, r]) ?? []
  );

  const handleReactionToggle = useCallback((emoji: string) => {
    if (!checkInId) return;

    const reaction = reactionMap.get(emoji);
    const isSelected = reaction?.currentUserReacted ?? false;

    if (isSelected) {
      removeReaction.mutate({ checkInId, emoji });
    } else {
      addReaction.mutate({ checkInId, emoji });
    }
  }, [checkInId, reactionMap, addReaction, removeReaction]);

  const handleSubmitComment = useCallback(() => {
    if (!comment.trim() || !checkInId) return;
    haptics.light();
    addCommentMutation.mutate(
      { checkInId, content: comment.trim() },
      {
        onSuccess: () => {
          setComment('');
        },
      }
    );
  }, [checkInId, comment, addCommentMutation]);

  // Handle initial emoji reaction from navigation params
  useEffect(() => {
    if (initialEmoji && checkInId && !hasAppliedInitialEmoji.current && !isLoadingReactions) {
      hasAppliedInitialEmoji.current = true;
      const reaction = reactionMap.get(initialEmoji);
      const isAlreadyReacted = reaction?.currentUserReacted ?? false;

      // Only add if not already reacted
      if (!isAlreadyReacted) {
        addReaction.mutate({ checkInId, emoji: initialEmoji });
        haptics.medium();
      }

      // Clear the param from URL to prevent re-triggering
      router.setParams({ emoji: undefined });
    }
  }, [initialEmoji, checkInId, isLoadingReactions, reactionMap, addReaction, router]);

  // Handle focus=comment param - focus the comment input
  useEffect(() => {
    if (focus === 'comment' && !isLoadingCheckIn) {
      // Small delay to ensure the input is mounted
      const timeout = setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [focus, isLoadingCheckIn]);

  // Custom back handler to ensure we go back to the supporting commitment detail
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback: navigate explicitly to the supporting commitment detail
      router.replace(`/supporting/${id}`);
    }
  }, [router, id]);

  // Loading state
  if (isLoadingCheckIn && !checkIn) {
    return (
      <SafeScreen>
        <Header title={t('checkIn.detail.title')} showBack onBackPress={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7C8C" />
        </View>
      </SafeScreen>
    );
  }

  // Error state or no data
  if (!checkIn) {
    return (
      <SafeScreen>
        <Header title={t('checkIn.detail.title')} showBack onBackPress={handleBack} />
        <View style={styles.loadingContainer}>
          <Icon name="alert-circle" size="xl" color="#B54548" />
          <Text style={styles.errorText}>Check-in not found</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header title={t('checkIn.detail.title')} showBack onBackPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Check-in status card */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIconContainer,
                { backgroundColor: statusConfig.bg },
              ]}
            >
              <Icon name={statusConfig.icon} size="xl" color={statusConfig.color} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                {t(statusConfig.translationKey)}
              </Text>
              <Text style={styles.statusDate}>
                {new Date(checkIn.checkInDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Notes section */}
          {checkIn.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>{t('checkIn.detail.notes')}</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{checkIn.notes}</Text>
              </View>
            </View>
          )}

          {/* Reactions section */}
          <View style={styles.reactionsSection}>
            <Text style={styles.sectionTitle}>{t('checkIn.detail.reactions')}</Text>
            {isLoadingReactions ? (
              <ActivityIndicator size="small" color="#4A7C8C" />
            ) : (
              <View style={styles.reactionsGrid}>
                {REACTION_EMOJIS.map((emoji) => {
                  const reaction = reactionMap.get(emoji);
                  return (
                    <ReactionButton
                      key={emoji}
                      emoji={emoji}
                      count={reaction?.count ?? 0}
                      isSelected={reaction?.currentUserReacted ?? false}
                      onPress={() => handleReactionToggle(emoji)}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {/* Comments section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>
              {t('checkIn.detail.comments')}
              {(commentsData?.totalCount ?? 0) > 0 && (
                <Text style={styles.commentCount}> ({commentsData?.totalCount})</Text>
              )}
            </Text>
            {isLoadingComments ? (
              <ActivityIndicator size="small" color="#4A7C8C" />
            ) : commentsData?.comments && commentsData.comments.length > 0 ? (
              <View style={styles.commentsList}>
                {commentsData.comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    content={c.content}
                    createdAt={c.createdAt}
                    userDisplayName={c.userDisplayName}
                    userAvatarUrl={c.userAvatarUrl}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyComments}>
                <Icon name="chatbubble-outline" size="lg" color="#A8A29E" />
                <Text style={styles.emptyCommentsText}>
                  {t('checkIn.detail.noComments')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment input */}
        <View style={styles.commentInputContainer}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder={t('checkIn.detail.addComment')}
            placeholderTextColor="#A8A29E"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSubmitComment}
            style={[
              styles.sendButton,
              (!comment.trim() || addCommentMutation.isPending) && styles.sendButtonDisabled,
            ]}
            disabled={!comment.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon
                name="send"
                size="sm"
                color={comment.trim() ? '#FFFFFF' : '#A8A29E'}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#78716C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1C1917',
    marginBottom: 12,
  },
  commentCount: {
    color: '#78716C',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A7C8C',
  },
  notesText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#1C1917',
    lineHeight: 22,
  },
  reactionsSection: {
    marginBottom: 24,
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    gap: 6,
  },
  reactionButtonSelected: {
    backgroundColor: '#4A7C8C15',
    borderWidth: 1,
    borderColor: '#4A7C8C',
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionCount: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#57534E',
  },
  commentsSection: {
    marginBottom: 24,
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#1C1917',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#A8A29E',
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyCommentsText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
    marginTop: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#1C1917',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A7C8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
