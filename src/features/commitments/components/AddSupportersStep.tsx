import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SupporterRole } from '@api/types';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { PendingSupporterInvite } from '../hooks/useCreateCommitment';

interface AddSupportersStepProps {
  pendingSupporters: PendingSupporterInvite[];
  onAddSupporter: (supporter: Omit<PendingSupporterInvite, 'id'>) => void;
  onRemoveSupporter: (id: string) => void;
}

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple phone validation (international format)
function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{6,14}$/.test(phone.replace(/[\s\-()]/g, ''));
}

export function AddSupportersStep({
  pendingSupporters,
  onAddSupporter,
  onRemoveSupporter,
}: AddSupportersStepProps) {
  const { t } = useTranslation('supporters');
  const { t: tCommitments } = useTranslation('commitments');

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    setError(null);
    const value = emailOrPhone.trim();

    if (!value) {
      setError(t('inviteModal.errorEmpty'));
      return;
    }

    const emailValid = isValidEmail(value);
    const phoneValid = isValidPhone(value);

    if (!emailValid && !phoneValid) {
      setError(t('inviteModal.errorInvalid'));
      return;
    }

    // Check for duplicates
    const isDuplicate = pendingSupporters.some(
      (s) => s.email === value || s.phone === value
    );
    if (isDuplicate) {
      setError(t('inviteModal.errorDuplicate'));
      return;
    }

    onAddSupporter({
      email: emailValid ? value : undefined,
      phone: phoneValid ? value : undefined,
      role: SupporterRole.VERIFIER, // All supporters are assigned VERIFIER role
    });

    // Reset form
    setEmailOrPhone('');
    setShowAddForm(false);
  };

  return (
    <View>
      <Text className="text-lg font-semibold text-neutral-700 mb-2">
        {tCommitments('wizard.step5Supporters')}
      </Text>
      <Text className="text-sm text-neutral-500 mb-4">
        {tCommitments('wizard.supportersHelper')}
      </Text>

      {/* Added Supporters List */}
      {pendingSupporters.length > 0 && (
        <View className="mb-4">
          {pendingSupporters.map((supporter) => (
            <Card key={supporter.id} variant="outlined" className="mb-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-neutral-900 font-medium flex-1">
                  {supporter.email || supporter.phone}
                </Text>
                <Pressable
                  onPress={() => onRemoveSupporter(supporter.id)}
                  className="p-2"
                >
                  <Text className="text-error text-sm">{t('remove')}</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Add Supporter Form */}
      {showAddForm ? (
        <Card variant="elevated" className="mb-4">
          <Input
            label={t('inviteModal.emailOrPhone')}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={error || undefined}
          />

          <View className="flex-row gap-2 mt-4">
            <Button
              title={t('cancel')}
              onPress={() => {
                setShowAddForm(false);
                setEmailOrPhone('');
                setError(null);
              }}
              variant="outline"
              className="flex-1"
            />
            <Button
              title={t('add')}
              onPress={handleAdd}
              className="flex-1"
            />
          </View>
        </Card>
      ) : (
        <Pressable
          onPress={() => setShowAddForm(true)}
          className="border-2 border-dashed border-neutral-300 rounded-xl p-4 items-center"
        >
          <Text className="text-2xl mb-1">+</Text>
          <Text className="text-neutral-600 font-medium">
            {t('addSupporter')}
          </Text>
        </Pressable>
      )}

      {/* Info about supporters */}
      <View className="mt-4 bg-neutral-50 rounded-lg p-3">
        <Text className="text-neutral-600 text-sm">
          {tCommitments('wizard.supportersInfo')}
        </Text>
      </View>
    </View>
  );
}
