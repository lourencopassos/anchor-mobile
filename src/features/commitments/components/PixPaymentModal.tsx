import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface PixPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  qrCode: string;
  copyPaste: string;
  expiresAt: string;
}

export function PixPaymentModal({
  visible,
  onClose,
  qrCode,
  copyPaste,
  expiresAt,
}: PixPaymentModalProps) {
  const { t } = useTranslation('commitments');
  const { t: tCommon } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);

  // Calculate and update remaining time
  useEffect(() => {
    const calculateRemaining = () => {
      const expiresDate = new Date(expiresAt);
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.floor((expiresDate.getTime() - now) / 60000)
      );
      setMinutesRemaining(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 60000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copyPaste]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('payment.pixTitle')}
      showCloseButton={false}
    >
      <View className="items-center">
        {/* QR Code */}
        <View className="bg-white p-4 rounded-xl mb-4">
          <Image
            source={{ uri: qrCode }}
            className="w-48 h-48"
            resizeMode="contain"
            accessibilityLabel="PIX QR Code"
          />
        </View>

        {/* Expiration Timer */}
        <View className="bg-yellow-50 rounded-lg px-4 py-2 mb-4 w-full">
          <Text className="text-center text-yellow-800 font-medium">
            {t('payment.pixExpires', { minutes: minutesRemaining })}
          </Text>
        </View>

        {/* Copy/Paste Code */}
        <Pressable
          onPress={handleCopy}
          className="bg-neutral-100 rounded-lg p-4 w-full mb-4"
          accessibilityRole="button"
          accessibilityLabel={tCommon('tapToCopy')}
        >
          <Text className="text-xs text-neutral-500 mb-1">
            {t('payment.pixCopyPaste')}
          </Text>
          <Text className="font-mono text-sm text-neutral-800" numberOfLines={2}>
            {copyPaste}
          </Text>
          <Text className="text-primary-500 text-sm mt-2 font-medium">
            {copied ? tCommon('copied') : tCommon('tapToCopy')}
          </Text>
        </Pressable>

        {/* Instructions */}
        <Text className="text-xs text-neutral-500 text-center mb-6">
          {t('payment.pixInstructions')}
        </Text>

        {/* Dismiss Button */}
        <Button
          title={t('payment.pixDismiss')}
          onPress={onClose}
          variant="outline"
          fullWidth
        />
      </View>
    </Modal>
  );
}
