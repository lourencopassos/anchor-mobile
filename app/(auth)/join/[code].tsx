import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import * as invitationLinksApi from '@/api/endpoints/invitation-links.api';
import type { InvitationLinkContext, ClaimInvitationLinkResponse } from '@/api/types';

type JoinStep = 'loading' | 'preview' | 'success' | 'error';

/**
 * Join screen for shareable invitation links.
 * Route: /join/:code
 *
 * This screen:
 * 1. Fetches invitation link context (public, no auth required)
 * 2. Shows commitment preview to potential supporter
 * 3. If authenticated: allows claiming the link
 * 4. If not authenticated: redirects to register/login with return URL
 */
export default function JoinScreen() {
  const { code, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = useLocalSearchParams<{
    code: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation('invitation');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  const queryClient = useQueryClient();

  const [step, setStep] = useState<JoinStep>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuthStore();

  // Build UTM params object
  const utmParams = {
    ...(utm_source && { utm_source }),
    ...(utm_medium && { utm_medium }),
    ...(utm_campaign && { utm_campaign }),
    ...(utm_term && { utm_term }),
    ...(utm_content && { utm_content }),
  };

  // Fetch invitation link context (public endpoint)
  const {
    data: context,
    isLoading,
    isError,
    error,
  } = useQuery<InvitationLinkContext, Error>({
    queryKey: ['invitation-link', code],
    queryFn: () => invitationLinksApi.getLinkContext(code ?? '', utmParams),
    enabled: !!code,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // Claim mutation
  const claimMutation = useMutation<ClaimInvitationLinkResponse, Error>({
    mutationFn: () =>
      invitationLinksApi.claimLink(code ?? '', {
        utmSource: utm_source,
        utmMedium: utm_medium,
        utmCampaign: utm_campaign,
        utmTerm: utm_term,
        utmContent: utm_content,
      }),
    onSuccess: () => {
      setStep('success');
      // Invalidate supported commitments to refresh the list
      queryClient.invalidateQueries({ queryKey: ['supported-commitments'] });
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) {
        setErrorMessage(t('errors.alreadySupporter'));
      } else if (status === 400) {
        setErrorMessage(t('errors.linkFull'));
      } else {
        setErrorMessage(t('errors.claimFailed'));
      }
    },
  });

  // Handle loading/error states
  useEffect(() => {
    if (!code) {
      setStep('error');
      setErrorMessage(t('errors.invalidLink'));
      return;
    }

    if (isLoading) {
      setStep('loading');
      return;
    }

    if (isError) {
      setStep('error');
      const status = (error as any)?.response?.status;
      if (status === 404) {
        setErrorMessage(t('errors.linkNotFound'));
      } else if (status === 410) {
        setErrorMessage(t('errors.linkExpired'));
      } else {
        setErrorMessage(t('errors.invalidLink'));
      }
      return;
    }

    if (context) {
      setStep('preview');
    }
  }, [code, isLoading, isError, error, context, t]);

  const handleJoin = () => {
    if (!isAuthenticated) {
      // Redirect to register with return URL
      router.push({
        pathname: '/(auth)/register',
        params: {
          returnTo: `/join/${code}`,
          ...utmParams,
        },
      });
      return;
    }

    claimMutation.mutate();
  };

  const handleGoToLogin = () => {
    router.push({
      pathname: '/(auth)/login',
      params: {
        returnTo: `/join/${code}`,
        ...utmParams,
      },
    });
  };

  const handleGoToCommitments = () => {
    router.replace('/(main)/supporting');
  };

  // Format currency
  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (step === 'loading') {
    return (
      <SafeScreen>
        <LoadingSpinner fullScreen message={t('loading')} />
      </SafeScreen>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <SafeScreen>
        <Header title={t('title')} showBack />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-error/10 border border-error rounded-xl p-6 w-full items-center">
            <Text className="text-5xl mb-4">😕</Text>
            <Text className="text-error text-lg font-semibold mb-2">
              {t('errors.title')}
            </Text>
            <Text className="text-neutral-600 text-center mb-6">
              {errorMessage}
            </Text>
            <Button
              title={tCommon('back')}
              onPress={() => router.back()}
              fullWidth
            />
          </View>
        </View>
      </SafeScreen>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <SafeScreen>
        <View className="flex-1 px-6 py-8">
          {/* Success header */}
          <View className="items-center mb-8">
            <View className="bg-success/20 rounded-full w-20 h-20 items-center justify-center mb-4">
              <Text className="text-4xl">🎉</Text>
            </View>
            <Text className="text-2xl font-bold text-neutral-800">
              {t('success.title')}
            </Text>
            <Text className="text-neutral-600 text-center mt-2">
              {t('success.subtitle', { name: context?.inviterName })}
            </Text>
          </View>

          {/* Commitment summary */}
          <Card variant="elevated" className="mb-8">
            <View className="flex-row items-center mb-4">
              <Avatar name={context?.inviterName || ''} size="medium" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-neutral-800">
                  {context?.commitmentName}
                </Text>
                <Text className="text-neutral-500 text-sm">
                  {t('success.supportingAs', { role: t(`roles.${context?.role.toLowerCase()}`) })}
                </Text>
              </View>
            </View>
          </Card>

          {/* CTA */}
          <Button
            title={t('success.viewCommitment')}
            onPress={handleGoToCommitments}
            fullWidth
          />
        </View>
      </SafeScreen>
    );
  }

  // Preview state (main flow)
  return (
    <SafeScreen>
      <Header title={t('title')} showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Inviter section */}
        <View className="items-center mb-6">
          <Avatar
            name={context?.inviterName || ''}
            uri={context?.inviterAvatarUrl}
            size="large"
          />
          <Text className="text-lg font-semibold mt-3 text-center">
            {t('invitedBy', { name: context?.inviterName })}
          </Text>
          <Badge
            label={t(`roles.${context?.role.toLowerCase()}`)}
            variant={getRoleBadgeVariant(context?.role || '')}
            className="mt-2"
          />
        </View>

        {/* Supporter message */}
        {context?.supporterMessage && (
          <Card variant="outlined" className="mb-6 bg-primary-50/50">
            <View className="flex-row">
              <Text className="text-2xl mr-2">💬</Text>
              <Text className="text-neutral-700 italic flex-1">
                "{context.supporterMessage}"
              </Text>
            </View>
          </Card>
        )}

        {/* Commitment details */}
        <Card variant="elevated" className="mb-6">
          <Text className="text-lg font-semibold text-neutral-800 mb-4">
            {context?.commitmentName}
          </Text>

          {/* Duration */}
          <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-neutral-100">
            <Text className="text-neutral-500">{t('duration')}</Text>
            <Text className="font-medium text-neutral-800">
              {formatDate(context?.startDate || '')} - {formatDate(context?.endDate || '')}
            </Text>
          </View>

          {/* Stake amount */}
          <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-neutral-100">
            <Text className="text-neutral-500">{t('stakeAmount')}</Text>
            <Text className="font-semibold text-neutral-800">
              {formatCurrency(context?.stakeAmountCents || 0, context?.stakeCurrency || 'USD')}
            </Text>
          </View>

          {/* Distribution */}
          <View className="mb-3 pb-3 border-b border-neutral-100">
            <Text className="text-neutral-500 mb-2">{t('ifBroken')}</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-lg font-bold text-primary-600">
                  {context?.charityPercent}%
                </Text>
                <Text className="text-xs text-neutral-500">{t('toCharity')}</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-success-600">
                  {context?.supportersPercent}%
                </Text>
                <Text className="text-xs text-neutral-500">{t('toSupporters')}</Text>
              </View>
            </View>
          </View>

          {/* Role description */}
          <View className="bg-neutral-50 rounded-lg p-3">
            <Text className="text-sm text-neutral-600 text-center">
              {t(`roleDescriptions.${context?.role.toLowerCase()}`)}
            </Text>
          </View>
        </Card>

        {/* Link info */}
        {context?.remainingUses !== null && (
          <View className="flex-row items-center justify-center mb-4">
            <Text className="text-sm text-neutral-500">
              {t('remainingUses', { count: context?.remainingUses })}
            </Text>
          </View>
        )}

        {/* Error message */}
        {errorMessage && (
          <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-sm text-center">{errorMessage}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View className="gap-3">
          <Button
            title={isAuthenticated ? t('joinAsSupporter') : t('signUpToJoin')}
            onPress={handleJoin}
            fullWidth
            loading={claimMutation.isPending}
            disabled={claimMutation.isPending}
          />

          {!isAuthenticated && (
            <View className="flex-row justify-center mt-2">
              <Text className="text-neutral-600">{t('alreadyHaveAccount')} </Text>
              <Text
                className="text-primary-500 font-semibold"
                onPress={handleGoToLogin}
              >
                {t('login')}
              </Text>
            </View>
          )}
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
