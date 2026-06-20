import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useReportFailure } from '../hooks';

interface ReportFailureModalProps {
  visible: boolean;
  onClose: () => void;
  commitmentId: string;
  onSuccess?: () => void;
}

export function ReportFailureModal({
  visible,
  onClose,
  commitmentId,
  onSuccess,
}: ReportFailureModalProps) {
  const { t } = useTranslation('commitments');
  const { t: tCommon } = useTranslation('common');
  const reportFailureMutation = useReportFailure(commitmentId);

  const [reason, setReason] = useState('');

  const resetState = () => {
    setReason('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = async () => {
    try {
      await reportFailureMutation.mutateAsync({
        reason: reason.trim() || undefined,
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to report failure:', error);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title={t('reportFailure.title')}>
      <View className="gap-4">
        {/* Warning Icon */}
        <View className="items-center py-4">
          <View className="w-16 h-16 rounded-full bg-error-100 items-center justify-center mb-3">
            <Text className="text-3xl">⚠️</Text>
          </View>
          <Text className="text-base text-neutral-700 text-center px-4">
            {t('reportFailure.message')}
          </Text>
        </View>

        {/* Optional Reason Input */}
        <View>
          <Input
            label={t('reportFailure.reasonLabel')}
            placeholder={t('reportFailure.reasonPlaceholder')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text className="text-xs text-neutral-500 text-right mt-1">
            {reason.length}/500
          </Text>
        </View>

        {/* Error Message */}
        {reportFailureMutation.isError && (
          <Text className="text-error-500 text-center">
            {tCommon('errorTryAgain')}
          </Text>
        )}

        {/* Action Buttons */}
        <View className="gap-3 pt-2">
          <Button
            title={t('reportFailure.confirm')}
            onPress={handleConfirm}
            loading={reportFailureMutation.isPending}
            fullWidth
            variant="danger"
          />
          <Button
            title={t('reportFailure.cancel')}
            onPress={handleClose}
            variant="outline"
            fullWidth
            disabled={reportFailureMutation.isPending}
          />
        </View>
      </View>
    </Modal>
  );
}
