import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_EMOJIS, type ReactionSummary } from '@api/types';
import { useReactions, useAddReaction, useRemoveReaction } from '../hooks';

interface ReactionPickerProps {
  checkInId: string;
  compact?: boolean;
}

export function ReactionPicker({ checkInId, compact = false }: ReactionPickerProps) {
  const { t } = useTranslation('checkins');
  const { data: reactionsData, isLoading } = useReactions(checkInId);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  const handleToggleReaction = (emoji: string) => {
    const existingReaction = reactionsData?.reactions.find(
      (r) => r.emoji === emoji
    );

    if (existingReaction?.currentUserReacted) {
      removeReaction.mutate({ checkInId, emoji });
    } else {
      addReaction.mutate({ checkInId, emoji });
    }
  };

  const reactions = reactionsData?.reactions || [];

  if (compact) {
    // Show only reactions that exist
    return (
      <View className="flex-row flex-wrap gap-1">
        {reactions.map((reaction) => (
          <Pressable
            key={reaction.emoji}
            onPress={() => handleToggleReaction(reaction.emoji)}
            className={`flex-row items-center px-2 py-1 rounded-full ${
              reaction.currentUserReacted
                ? 'bg-primary-100 border border-primary-300'
                : 'bg-neutral-100'
            }`}
          >
            <Text className="text-sm">{reaction.emoji}</Text>
            <Text className="text-xs text-neutral-600 ml-1">{reaction.count}</Text>
          </Pressable>
        ))}
        <AddReactionButton
          onSelect={handleToggleReaction}
          existingEmojis={reactions.map((r) => r.emoji)}
        />
      </View>
    );
  }

  // Full picker with all emojis
  return (
    <View>
      <Text className="text-sm text-neutral-600 mb-2">{t('reactions.title')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {AVAILABLE_EMOJIS.map((emoji) => {
          const reaction = reactions.find((r) => r.emoji === emoji);
          const isSelected = reaction?.currentUserReacted || false;
          const count = reaction?.count || 0;

          return (
            <Pressable
              key={emoji}
              onPress={() => handleToggleReaction(emoji)}
              disabled={addReaction.isPending || removeReaction.isPending}
              className={`items-center justify-center w-12 h-12 rounded-xl ${
                isSelected
                  ? 'bg-primary-100 border-2 border-primary-400'
                  : 'bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Text className="text-xl">{emoji}</Text>
              {count > 0 && (
                <Text className="text-xs text-neutral-600 absolute -top-1 -right-1 bg-white rounded-full px-1">
                  {count}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface AddReactionButtonProps {
  onSelect: (emoji: string) => void;
  existingEmojis: string[];
}

function AddReactionButton({ onSelect, existingEmojis }: AddReactionButtonProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  const availableToAdd = AVAILABLE_EMOJIS.filter(
    (emoji) => !existingEmojis.includes(emoji)
  );

  if (availableToAdd.length === 0) {
    return null;
  }

  return (
    <View className="relative">
      <Pressable
        onPress={() => setShowPicker(!showPicker)}
        className="w-8 h-8 items-center justify-center rounded-full bg-neutral-100"
      >
        <Text className="text-neutral-500">+</Text>
      </Pressable>

      {showPicker && (
        <View className="absolute bottom-10 left-0 bg-white rounded-lg shadow-lg p-2 flex-row flex-wrap gap-1 z-10 border border-neutral-200">
          {availableToAdd.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                onSelect(emoji);
                setShowPicker(false);
              }}
              className="w-10 h-10 items-center justify-center rounded-lg hover:bg-neutral-100"
            >
              <Text className="text-xl">{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
