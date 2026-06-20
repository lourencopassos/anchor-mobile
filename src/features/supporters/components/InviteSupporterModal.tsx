import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SupporterRole } from '@api/types';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Card } from '@shared/components/ui/Card';
import { useInviteSupporter, isValidEmail, isValidPhone } from '../hooks/useInviteSupporter';

interface InviteSupporterModalProps {
  visible: boolean;
  onClose: () => void;
  commitmentId: string;
}

const ROLES: { value: SupporterRole; key: string }[] = [
  { value: SupporterRole.OBSERVER, key: 'observer' },
  { value: SupporterRole.ENCOURAGER, key: 'encourager' },
  { value: SupporterRole.VERIFIER, key: 'verifier' },
];

/**
 * Modal for inviting a new supporter via email or phone
 */
export function InviteSupporterModal({
  visible,
  onClose,
  commitmentId,
}: InviteSupporterModalProps) {
  const { t } = useTranslation('supporters');
  const { inviteSupporter, isInviting, error, reset } = useInviteSupporter(commitmentId);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<SupporterRole>(
    SupporterRole.OBSERVER
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = () => {
    setEmailOrPhone('');
    setSelectedRole(SupporterRole.OBSERVER);
    setValidationError(null);
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setValidationError(null);

    const value = emailOrPhone.trim();
    if (!value) {
      setValidationError('Please enter an email or phone number');
      return;
    }

    const emailValid = isValidEmail(value);
    const phoneValid = isValidPhone(value);

    if (!emailValid && !phoneValid) {
      setValidationError('Please enter a valid email or phone number');
      return;
    }

    try {
      await inviteSupporter({
        email: emailValid ? value : undefined,
        phone: phoneValid ? value : undefined,
        role: selectedRole,
      });
      handleClose();
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-200">
          <Pressable onPress={handleClose} className="p-2">
            <Text className="text-primary-600 text-base">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-neutral-900">
            {t('inviteModal.title')}
          </Text>
          <View className="w-16" />
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Email/Phone Input */}
          <Input
            label={t('inviteModal.emailOrPhone')}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="email@example.com or +1234567890"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={validationError || undefined}
          />

          {/* Role Selection */}
          <Text className="text-neutral-700 text-sm font-medium mt-6 mb-3">
            {t('inviteModal.selectRole')}
          </Text>

          {ROLES.map(({ value, key }) => {
            const isSelected = selectedRole === value;
            return (
              <Pressable
                key={value}
                onPress={() => setSelectedRole(value)}
                className="mb-3"
              >
                <Card
                  variant={isSelected ? 'elevated' : 'outlined'}
                  className={isSelected ? 'border-2 border-primary-500' : ''}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-300'
                      }`}
                    >
                      {isSelected && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-neutral-900">
                        {t(`role.${key as 'observer' | 'encourager' | 'verifier'}`)}
                      </Text>
                      <Text className="text-sm text-neutral-500">
                        {t(`role.${key as 'observer' | 'encourager' | 'verifier'}Desc`)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}

          {/* API Error */}
          {error && (
            <View className="bg-error-50 border border-error-200 rounded-lg p-3 mt-4">
              <Text className="text-error text-sm">{error.message}</Text>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View className="px-4 py-4 border-t border-neutral-200">
          <Button
            title={t('inviteModal.send')}
            onPress={handleSubmit}
            loading={isInviting}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
