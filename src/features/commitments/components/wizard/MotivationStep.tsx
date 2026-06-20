import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MotivationStepProps {
  whyNote: string;
  onWhyNoteChange: (note: string) => void;
}

const MAX_LENGTH = 500;

export function MotivationStep({
  whyNote,
  onWhyNoteChange,
}: MotivationStepProps) {
  const { t } = useTranslation('commitments');
  const remainingChars = MAX_LENGTH - whyNote.length;

  return (
    <View>
      {/* Header */}
      <Text className="text-lg font-semibold text-neutral-700 mb-2">
        {t('motivation.title')}
      </Text>
      <Text className="text-sm text-neutral-500 mb-4">
        {t('motivation.subtitle')}
      </Text>

      {/* Text Input */}
      <View className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <TextInput
          value={whyNote}
          onChangeText={onWhyNoteChange}
          placeholder={t('motivation.placeholder')}
          placeholderTextColor="#a3a3a3"
          multiline
          numberOfLines={5}
          maxLength={MAX_LENGTH}
          className="p-4 text-base text-neutral-800 min-h-[140px]"
          style={{ textAlignVertical: 'top' }}
        />

        {/* Character Count */}
        <View className="px-4 pb-3 flex-row justify-between items-center border-t border-neutral-100 pt-2">
          <Text className="text-xs text-neutral-400">
            {t('motivation.optional')}
          </Text>
          <Text
            className={`
              text-xs font-medium
              ${remainingChars < 50 ? 'text-amber-500' : 'text-neutral-400'}
            `}
          >
            {remainingChars}
          </Text>
        </View>
      </View>

      {/* Benefits Box */}
      <View className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-lg bg-white items-center justify-center shadow-sm">
            <Text className="text-base">💜</Text>
          </View>
          <View className="flex-1">
            <Text className="text-purple-800 font-semibold text-sm mb-1">
              {t('motivation.benefits.title')}
            </Text>
            <Text className="text-purple-600 text-sm leading-5">
              {t('motivation.benefits.description')}
            </Text>
          </View>
        </View>
      </View>

      {/* Privacy Note */}
      <View className="mt-3 flex-row items-center gap-2 px-2">
        <Text className="text-neutral-500 text-xs">🔐</Text>
        <Text className="text-neutral-500 text-xs">
          {t('motivation.privacyNote')}
        </Text>
      </View>
    </View>
  );
}
