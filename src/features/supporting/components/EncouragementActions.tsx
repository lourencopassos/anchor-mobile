/**
 * =============================================================================
 * ENCOURAGEMENT ACTIONS
 * =============================================================================
 *
 * Sticky bottom bar for ENCOURAGER/VERIFIER roles.
 * Quick emoji reaction buttons and comment action.
 * Includes haptic feedback for delightful interactions.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/shared/utils/haptics.utils';

interface EncouragementActionsProps {
  onReaction: (emoji: string) => void;
  onComment: () => void;
  disabled?: boolean;
}

const QUICK_EMOJIS = ['💪', '🔥', '👏', '❤️', '🎉'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EmojiButtonProps {
  emoji: string;
  onPress: () => void;
  disabled?: boolean;
}

function EmojiButton({ emoji, onPress, disabled }: EmojiButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;

    // Bounce animation
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
      style={[styles.emojiButton, animatedStyle, disabled && styles.emojiButtonDisabled]}
      disabled={disabled}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </AnimatedPressable>
  );
}

export function EncouragementActions({
  onReaction,
  onComment,
  disabled = false,
}: EncouragementActionsProps) {
  const { t } = useTranslation('supporting');
  const insets = useSafeAreaInsets();

  const handleComment = () => {
    haptics.light();
    onComment();
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.content}>
        <View style={styles.emojisRow}>
          {QUICK_EMOJIS.map((emoji) => (
            <EmojiButton
              key={emoji}
              emoji={emoji}
              onPress={() => onReaction(emoji)}
              disabled={disabled}
            />
          ))}
        </View>

        <Pressable
          onPress={handleComment}
          style={[styles.commentButton, disabled && styles.commentButtonDisabled]}
          disabled={disabled}
        >
          <Text style={styles.commentButtonText}>{t('actions.addComment')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emojisRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButtonDisabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 24,
  },
  commentButton: {
    backgroundColor: '#4A7C8C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#4A7C8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  commentButtonDisabled: {
    opacity: 0.5,
  },
  commentButtonText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#FFFFFF',
  },
});
