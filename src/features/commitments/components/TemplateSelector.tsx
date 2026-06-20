import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TemplateType } from '@api/types';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null;
  onSelect: (template: TemplateType) => void;
}

interface TemplateOption {
  key: TemplateType;
  icon: string;
  labelKey:
    | 'templates.quit_smoking'
    | 'templates.exercise'
    | 'templates.meditation'
    | 'templates.diet'
    | 'templates.sleep'
    | 'templates.custom';
}

const TEMPLATES: TemplateOption[] = [
  { key: 'QUIT_SMOKING', icon: '🚭', labelKey: 'templates.quit_smoking' },
  { key: 'EXERCISE', icon: '💪', labelKey: 'templates.exercise' },
  { key: 'MEDITATION', icon: '🧘', labelKey: 'templates.meditation' },
  { key: 'DIET', icon: '🥗', labelKey: 'templates.diet' },
  { key: 'SLEEP', icon: '😴', labelKey: 'templates.sleep' },
  { key: 'CUSTOM', icon: '✨', labelKey: 'templates.custom' },
];

export function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  const { t } = useTranslation('commitments');

  return (
    <View className="gap-3">
      {TEMPLATES.map(({ key, icon, labelKey }) => {
        const isSelected = selectedTemplate === key;

        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            className={`flex-row items-center p-4 rounded-xl border-2 ${
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <Text className="text-3xl mr-4">{icon}</Text>
            <Text
              className={`text-lg font-medium ${
                isSelected ? 'text-primary-700' : 'text-neutral-900'
              }`}
            >
              {t(labelKey)}
            </Text>
            {isSelected && (
              <View className="ml-auto">
                <Text className="text-primary-500 text-xl">✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
