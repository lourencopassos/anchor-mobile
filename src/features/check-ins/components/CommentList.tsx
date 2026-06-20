import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { useComments, useAddComment, useDeleteComment } from '../hooks';
import type { Comment } from '@api/types';

interface CommentListProps {
  checkInId: string;
  currentUserId?: string;
}

export function CommentList({ checkInId, currentUserId }: CommentListProps) {
  const { t } = useTranslation('checkins');
  const { t: tCommon } = useTranslation('common');
  const { data: commentsData, isLoading } = useComments(checkInId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const comments = commentsData?.comments || [];
  const totalCount = commentsData?.totalCount || 0;

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    addComment.mutate(
      { checkInId, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    Alert.alert(
      t('comments.deleteTitle'),
      t('comments.deleteConfirm'),
      [
        { text: tCommon('cancel'), style: 'cancel' },
        {
          text: tCommon('delete'),
          style: 'destructive',
          onPress: () => deleteComment.mutate({ checkInId, commentId }),
        },
      ]
    );
  };

  // Show summary view when collapsed
  if (!isExpanded && totalCount > 0) {
    return (
      <Pressable
        onPress={() => setIsExpanded(true)}
        className="flex-row items-center py-2"
      >
        <Text className="text-neutral-600 text-sm">
          {t('comments.viewAll', { count: totalCount })}
        </Text>
      </Pressable>
    );
  }

  return (
    <View>
      {/* Comments List */}
      {comments.length > 0 && (
        <View className="mb-3">
          <Pressable
            onPress={() => setIsExpanded(false)}
            className="flex-row justify-between items-center mb-2"
          >
            <Text className="text-sm font-medium text-neutral-700">
              {t('comments.title')} ({totalCount})
            </Text>
            <Text className="text-sm text-primary-500">{t('comments.collapse')}</Text>
          </Pressable>

          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={comment.userId === currentUserId}
              onDelete={() => handleDelete(comment.id)}
            />
          ))}
        </View>
      )}

      {/* Add Comment Input */}
      <View className="flex-row gap-2">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder={t('comments.placeholder')}
          placeholderTextColor="#9E9E9E"
          multiline
          maxLength={500}
          className="flex-1 bg-neutral-100 rounded-lg px-3 py-2 text-neutral-900 text-sm min-h-[40px] max-h-[100px]"
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!newComment.trim() || addComment.isPending}
          className={`px-4 py-2 rounded-lg items-center justify-center ${
            newComment.trim() && !addComment.isPending
              ? 'bg-primary-500'
              : 'bg-neutral-300'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              newComment.trim() && !addComment.isPending
                ? 'text-white'
                : 'text-neutral-500'
            }`}
          >
            {t('comments.send')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onDelete: () => void;
}

function CommentItem({ comment, isOwner, onDelete }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <View className="bg-neutral-50 rounded-lg p-3 mb-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-neutral-900 text-sm">{comment.content}</Text>
          <Text className="text-neutral-500 text-xs mt-1">{timeAgo}</Text>
        </View>
        {isOwner && (
          <Pressable onPress={onDelete} className="p-1 ml-2">
            <Text className="text-neutral-400 text-xs">x</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
