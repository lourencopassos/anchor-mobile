import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Header } from '@/shared/components/layout/Header';

// TODO: Phase 1 - Implement forgot password functionality
// - Add email validation
// - Implement API call to request password reset
// - Show success message after request

export default function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');

  return (
    <SafeScreen>
      <Header title={t('forgotPassword')} showBack />

      <View className="flex-1 justify-center">
        <Text className="text-neutral-600 mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>

        <View className="gap-4 mb-6">
          <Input
            label={t('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Button title="Send Reset Link" onPress={() => {}} fullWidth />
      </View>
    </SafeScreen>
  );
}
