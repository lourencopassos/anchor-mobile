import { useState } from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useLogin } from '@/features/auth/hooks';

export default function LoginScreen() {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isPending, isError, error, reset } = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    reset();
    login({ email: email.trim(), password });
  };

  return (
    <SafeScreen>
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-neutral-900 mb-2">
          {tCommon('appName')}
        </Text>
        <Text className="text-lg text-neutral-600 mb-8">{t('login')}</Text>

        {isError && (
          <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-sm">
              {error?.message || tErrors('loginFailed')}
            </Text>
          </View>
        )}

        <View className="gap-4 mb-6">
          <Input
            label={t('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!isPending}
          />
          <Input
            label={t('password')}
            placeholder="********"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            editable={!isPending}
            onSubmitEditing={handleLogin}
          />
        </View>

        <Button
          title={t('login')}
          onPress={handleLogin}
          fullWidth
          loading={isPending}
          disabled={isPending || !email.trim() || !password.trim()}
        />

        <View className="flex-row justify-center mt-4">
          <Text className="text-neutral-600">{t('noAccount')} </Text>
          <Link href="/(auth)/register" asChild>
            <Text className="text-primary-500 font-semibold">
              {t('register')}
            </Text>
          </Link>
        </View>

        <Link href="/(auth)/forgot-password" asChild>
          <Text className="text-primary-500 text-center mt-4">
            {t('forgotPassword')}
          </Text>
        </Link>
      </View>
    </SafeScreen>
  );
}
