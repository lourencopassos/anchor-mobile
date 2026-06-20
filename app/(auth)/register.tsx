import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { DatePickerButton } from '@/shared/components/ui/DatePickerButton';
import { Header } from '@/shared/components/layout/Header';
import { useRegister } from '@/features/auth/hooks';

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function RegisterScreen() {
  const { t } = useTranslation('auth');
  const { t: tErrors } = useTranslation('errors');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, isPending, isError, error, reset } = useRegister();

  // Maximum date is 13 years ago (minimum age requirement)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);

  const handleRegister = () => {
    setValidationError(null);
    reset();

    // Basic validation
    if (!firstName.trim()) {
      setValidationError(tErrors('firstNameRequired'));
      return;
    }
    if (!lastName.trim()) {
      setValidationError(tErrors('lastNameRequired'));
      return;
    }
    if (!dateOfBirth) {
      setValidationError(tErrors('dateOfBirthRequired'));
      return;
    }
    if (!email.trim()) {
      setValidationError(tErrors('emailRequired'));
      return;
    }
    if (!password.trim()) {
      setValidationError(tErrors('passwordRequired'));
      return;
    }
    if (password.length < 8) {
      setValidationError(tErrors('passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(tErrors('passwordMismatch'));
      return;
    }

    register({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: formatDateToISO(dateOfBirth),
      phone: phone.trim() || undefined,
    });
  };

  const displayError = validationError || (isError ? error?.message || tErrors('registrationFailed') : null);

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    dateOfBirth &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim();

  return (
    <SafeScreen>
      <Header title={t('register')} showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="justify-center py-8"
        keyboardShouldPersistTaps="handled"
      >
        {displayError && (
          <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-sm">{displayError}</Text>
          </View>
        )}

        <View className="gap-4 mb-6">
          <Input
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
            autoCapitalize="words"
            autoComplete="given-name"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isPending}
          />
          <Input
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
            autoCapitalize="words"
            autoComplete="family-name"
            value={lastName}
            onChangeText={setLastName}
            editable={!isPending}
          />
          <DatePickerButton
            label={t('dateOfBirth')}
            placeholder={t('dateOfBirthPlaceholder')}
            value={dateOfBirth}
            onChange={setDateOfBirth}
            maximumDate={maxDate}
          />
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
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            editable={!isPending}
          />
          <Input
            label={t('confirmPassword')}
            placeholder="********"
            secureTextEntry
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isPending}
          />
          <Input
            label={t('phone')}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            autoComplete="tel"
            value={phone}
            onChangeText={setPhone}
            editable={!isPending}
          />
        </View>

        <Button
          title={t('register')}
          onPress={handleRegister}
          fullWidth
          loading={isPending}
          disabled={isPending || !isFormValid}
        />

        <View className="flex-row justify-center mt-4">
          <Text className="text-neutral-600">{t('haveAccount')} </Text>
          <Link href="/(auth)/login" asChild>
            <Text className="text-primary-500 font-semibold">{t('login')}</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
