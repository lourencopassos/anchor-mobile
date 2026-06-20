import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { VerificationAuthorityType } from '@api/types';

interface VerificationSettingsStepProps {
  selectedAuthority: VerificationAuthorityType;
  onSelectAuthority: (authority: VerificationAuthorityType) => void;
  supporterCount: number;
}

interface AuthorityOption {
  value: VerificationAuthorityType;
  icon: string;
  accentColor: string;
  requiresSupporters: boolean;
}

const AUTHORITY_OPTIONS: AuthorityOption[] = [
  {
    value: 'SELF_ONLY',
    icon: '🎯',
    accentColor: '#6366f1', // Indigo
    requiresSupporters: false,
  },
  {
    value: 'SINGLE_SUPPORTER',
    icon: '👤',
    accentColor: '#f59e0b', // Amber
    requiresSupporters: true,
  },
  {
    value: 'MAJORITY',
    icon: '⚖️',
    accentColor: '#10b981', // Emerald
    requiresSupporters: true,
  },
  {
    value: 'UNANIMOUS',
    icon: '🤝',
    accentColor: '#ec4899', // Pink
    requiresSupporters: true,
  },
];

export function VerificationSettingsStep({
  selectedAuthority,
  onSelectAuthority,
  supporterCount,
}: VerificationSettingsStepProps) {
  const { t } = useTranslation('commitments');
  const hasSupporters = supporterCount > 0;

  // Calculate required votes for display
  const getRequiredVotes = (authority: VerificationAuthorityType): string => {
    if (authority === 'SELF_ONLY') return '-';
    if (authority === 'SINGLE_SUPPORTER') return '1';
    if (authority === 'UNANIMOUS') return supporterCount.toString();
    if (authority === 'MAJORITY') {
      const required = Math.floor(supporterCount / 2) + 1;
      return required.toString();
    }
    return '-';
  };

  return (
    <View>
      {/* Header Section */}
      <Text className="text-lg font-semibold text-neutral-700 mb-2">
        {t('wizard.step6Verification')}
      </Text>
      <Text className="text-sm text-neutral-500 mb-4">
        {t('wizard.verificationHelper')}
      </Text>

      {/* Supporter Context Badge */}
      <View className="flex-row items-center gap-2 mb-5 bg-neutral-100 rounded-full px-4 py-2 self-start">
        <Text className="text-base">👥</Text>
        <Text className="text-neutral-700 font-medium text-sm">
          {supporterCount === 0
            ? t('verification.noSupporters')
            : supporterCount === 1
            ? t('verification.oneSupporter')
            : t('verification.multipleSupporters', { count: supporterCount })}
        </Text>
      </View>

      {/* Authority Options */}
      <View className="gap-3">
        {AUTHORITY_OPTIONS.map((option) => {
          const isSelected = selectedAuthority === option.value;
          const isDisabled = option.requiresSupporters && !hasSupporters;
          const requiredVotes = getRequiredVotes(option.value);

          return (
            <Pressable
              key={option.value}
              onPress={() => !isDisabled && onSelectAuthority(option.value)}
              disabled={isDisabled}
              className="active:scale-[0.98]"
              style={{ opacity: isDisabled ? 0.5 : 1 }}
            >
              <View
                className={`
                  rounded-2xl p-4 border-2
                  ${isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white'}
                `}
              >
                <View className="flex-row items-start gap-3">
                  {/* Icon with accent background */}
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: isSelected
                        ? `${option.accentColor}20`
                        : '#f5f5f5'
                    }}
                  >
                    <Text className="text-2xl">{option.icon}</Text>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text
                        className={`
                          font-semibold text-base
                          ${isSelected ? 'text-primary-700' : 'text-neutral-800'}
                        `}
                      >
                        {t(`verification.${option.value.toLowerCase()}.title` as any)}
                      </Text>

                      {/* Votes Required Badge */}
                      {option.requiresSupporters && hasSupporters && (
                        <View
                          className="rounded-full px-2.5 py-1"
                          style={{
                            backgroundColor: isSelected
                              ? `${option.accentColor}20`
                              : '#f0f0f0'
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{
                              color: isSelected ? option.accentColor : '#666'
                            }}
                          >
                            {requiredVotes}/{supporterCount}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      className={`
                        text-sm leading-5
                        ${isSelected ? 'text-primary-600' : 'text-neutral-500'}
                      `}
                    >
                      {t(`verification.${option.value.toLowerCase()}.description` as any)}
                    </Text>

                    {/* Supporters Required Warning */}
                    {option.requiresSupporters && !hasSupporters && (
                      <View className="flex-row items-center gap-1.5 mt-2">
                        <Text className="text-amber-600 text-xs">⚠️</Text>
                        <Text className="text-amber-600 text-xs font-medium">
                          {t('verification.requiresSupporters')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Selection Radio */}
                  <View
                    className={`
                      w-6 h-6 rounded-full border-2 items-center justify-center mt-1
                      ${isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-neutral-300 bg-white'}
                    `}
                  >
                    {isSelected && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Info Box */}
      <View className="mt-6 bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 rounded-2xl p-4">
        <View className="flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-lg bg-white items-center justify-center shadow-sm">
            <Text className="text-base">💡</Text>
          </View>
          <View className="flex-1">
            <Text className="text-neutral-700 font-semibold text-sm mb-1">
              {t('verification.infoTitle')}
            </Text>
            <Text className="text-neutral-500 text-sm leading-5">
              {t('verification.infoText')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
