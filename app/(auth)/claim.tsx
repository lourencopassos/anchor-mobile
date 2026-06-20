import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { DatePickerButton } from '@/shared/components/ui/DatePickerButton';
import { Card } from '@/shared/components/ui/Card';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { useValidateInvitation, useClaimAccount, useRespondToInvitation } from '@/features/auth/hooks';

type ClaimStep = 'loading' | 'form' | 'invitation' | 'error';

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ClaimScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { t } = useTranslation('claim');
  const { t: tErrors } = useTranslation('errors');
  const { t: tAuth } = useTranslation('auth');

  const [step, setStep] = useState<ClaimStep>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Maximum date is 13 years ago (minimum age requirement)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);

  // Queries and mutations
  const {
    data: invitation,
    isLoading: isValidating,
    isError: isValidationError,
    error: validationErrorObj,
  } = useValidateInvitation(token ?? null);

  const {
    claimAccount,
    isPending: isClaiming,
    isError: isClaimError,
    error: claimError,
    isSuccess: isClaimSuccess,
    reset: resetClaim,
  } = useClaimAccount(token ?? '');

  const {
    accept,
    decline,
    isPending: isResponding,
  } = useRespondToInvitation(invitation?.supporterId ?? '');

  // Handle validation result
  useEffect(() => {
    if (!token) {
      setStep('error');
      setErrorMessage(t('invalidToken'));
      return;
    }

    if (isValidating) {
      setStep('loading');
      return;
    }

    if (isValidationError) {
      setStep('error');
      const status = (validationErrorObj as any)?.response?.status;
      if (status === 410) {
        setErrorMessage(t('alreadyClaimed'));
      } else if (status === 404) {
        setErrorMessage(t('expiredToken'));
      } else {
        setErrorMessage(t('invalidToken'));
      }
      return;
    }

    if (invitation) {
      setEmail(invitation.email);
      if (invitation.phone) {
        setPhone(invitation.phone);
      }
      setStep('form');
    }
  }, [token, isValidating, isValidationError, invitation, validationErrorObj, t]);

  // Handle claim success - move to invitation step
  useEffect(() => {
    if (isClaimSuccess) {
      setStep('invitation');
    }
  }, [isClaimSuccess]);

  const handleClaim = () => {
    setValidationError(null);
    resetClaim();

    // Validation
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
    if (!displayName.trim()) {
      setValidationError(t('displayNameRequired'));
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

    claimAccount({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: formatDateToISO(dateOfBirth),
      phone: phone.trim() || undefined,
    });
  };

  const handleAccept = () => {
    accept();
  };

  const handleDecline = () => {
    decline();
  };

  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  // Loading state
  if (step === 'loading') {
    return (
      <SafeScreen>
        <LoadingSpinner fullScreen message={t('validating')} />
      </SafeScreen>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <SafeScreen>
        <Header title={t('title')} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-error/10 border border-error rounded-xl p-6 w-full items-center">
            <Text className="text-error text-lg font-semibold mb-2">
              {t('errorTitle')}
            </Text>
            <Text className="text-neutral-600 text-center mb-6">
              {errorMessage}
            </Text>
            <Button
              title={tAuth('login')}
              onPress={handleGoToLogin}
              fullWidth
            />
          </View>
        </View>
      </SafeScreen>
    );
  }

  // Invitation response state (after claiming)
  if (step === 'invitation' && invitation) {
    return (
      <SafeScreen>
        <View className="flex-1 px-6 py-8">
          {/* Success header */}
          <View className="items-center mb-8">
            <View className="bg-success/20 rounded-full w-20 h-20 items-center justify-center mb-4">
              <Text className="text-4xl">✓</Text>
            </View>
            <Text className="text-2xl font-bold text-neutral-800">
              {t('successTitle')}
            </Text>
            <Text className="text-neutral-600 text-center mt-2">
              {t('successSubtitle')}
            </Text>
          </View>

          {/* Invitation card */}
          <Card variant="elevated" className="mb-8">
            <View className="items-center mb-4">
              <Avatar name={invitation.inviterName} size="large" />
              <Text className="text-lg font-semibold mt-3">
                {invitation.inviterName}
              </Text>
              <Text className="text-neutral-500">
                {t('wantsYouToSupport')}
              </Text>
            </View>

            <View className="border-t border-neutral-100 pt-4 mt-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-neutral-500">{t('commitment')}</Text>
                <Text className="font-semibold text-neutral-800 flex-1 text-right ml-4" numberOfLines={2}>
                  {invitation.commitmentName}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-neutral-500">{t('yourRole')}</Text>
                <Badge
                  label={t(`roles.${invitation.supporterRole.toLowerCase()}`)}
                  variant={getRoleBadgeVariant(invitation.supporterRole)}
                />
              </View>
            </View>

            <View className="bg-neutral-50 rounded-lg p-3 mt-4">
              <Text className="text-sm text-neutral-600 text-center">
                {t(`roleDescriptions.${invitation.supporterRole.toLowerCase()}`)}
              </Text>
            </View>
          </Card>

          {/* Action buttons */}
          <View className="gap-3">
            <Button
              title={t('accept')}
              onPress={handleAccept}
              fullWidth
              loading={isResponding}
              disabled={isResponding}
            />
            <Button
              title={t('decline')}
              onPress={handleDecline}
              variant="outline"
              fullWidth
              loading={isResponding}
              disabled={isResponding}
            />
          </View>
        </View>
      </SafeScreen>
    );
  }

  // Claim form state
  const displayError =
    validationError ||
    (isClaimError ? claimError?.message || tErrors('claimFailed') : null);

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    dateOfBirth &&
    displayName.trim() &&
    password.trim() &&
    confirmPassword.trim();

  return (
    <SafeScreen>
      <Header title={t('title')} showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="py-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome message */}
        {invitation && (
          <View className="items-center mb-6">
            <Avatar name={invitation.inviterName} size="large" />
            <Text className="text-lg font-semibold mt-3 text-center">
              {t('welcomeTitle', { name: invitation.inviterName })}
            </Text>
            <Text className="text-neutral-500 text-center mt-1">
              {t('welcomeSubtitle')}
            </Text>
          </View>
        )}

        {displayError && (
          <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-sm">{displayError}</Text>
          </View>
        )}

        <View className="gap-4 mb-6">
          <Input
            label={tAuth('firstName')}
            placeholder={tAuth('firstNamePlaceholder')}
            autoCapitalize="words"
            autoComplete="given-name"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isClaiming}
          />
          <Input
            label={tAuth('lastName')}
            placeholder={tAuth('lastNamePlaceholder')}
            autoCapitalize="words"
            autoComplete="family-name"
            value={lastName}
            onChangeText={setLastName}
            editable={!isClaiming}
          />
          <DatePickerButton
            label={tAuth('dateOfBirth')}
            placeholder={tAuth('dateOfBirthPlaceholder')}
            value={dateOfBirth}
            onChange={setDateOfBirth}
            maximumDate={maxDate}
          />
          <Input
            label={tAuth('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!isClaiming && !invitation?.email}
          />
          <Input
            label={t('displayName')}
            placeholder={t('displayNamePlaceholder')}
            autoCapitalize="words"
            autoComplete="name"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!isClaiming}
          />
          <Input
            label={tAuth('password')}
            placeholder="********"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            editable={!isClaiming}
          />
          <Input
            label={tAuth('confirmPassword')}
            placeholder="********"
            secureTextEntry
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isClaiming}
          />
          <Input
            label={tAuth('phone')}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            autoComplete="tel"
            value={phone}
            onChangeText={setPhone}
            editable={!isClaiming}
          />
        </View>

        <Button
          title={t('createAccount')}
          onPress={handleClaim}
          fullWidth
          loading={isClaiming}
          disabled={isClaiming || !isFormValid}
        />

        <View className="flex-row justify-center mt-4">
          <Text className="text-neutral-600">{tAuth('haveAccount')} </Text>
          <Link href="/(auth)/login" asChild>
            <Text className="text-primary-500 font-semibold">{tAuth('login')}</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function getRoleBadgeVariant(role: string): 'success' | 'warning' | 'info' | 'default' {
  switch (role.toUpperCase()) {
    case 'VERIFIER':
      return 'success';
    case 'ENCOURAGER':
      return 'warning';
    case 'OBSERVER':
      return 'info';
    default:
      return 'default';
  }
}
