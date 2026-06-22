import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Share,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';
import {
  useInvitationLinks,
  useGenerateInvitationLink,
  useDeactivateInvitationLink,
  useAssignCustodian,
  getShareableUrl,
} from '@/features/commitments/hooks';
import { supporterRoleKey } from '@/i18n/keyHelpers';
import { SupporterRole, InvitationLinkType } from '@api/types';
import type { InvitationLink } from '@api/types';

const ROLE_OPTIONS: SupporterRole[] = [
  SupporterRole.VERIFIER,
  SupporterRole.ENCOURAGER,
  SupporterRole.OBSERVER,
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Invite screen: generate a shareable link to bring people into a commitment.
 * Route: /(main)/commitments/[id]/invite
 *
 * Two modes (via the `mode` param):
 *  - default / 'supporter' — generate supporter invite links
 *  - 'custodian' — assign the money-holder by email, or share a custodian link
 */
export default function InviteScreen() {
  useHideTabBar();
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const router = useRouter();
  const { t } = useTranslation('commitments');

  const isCustodianMode = mode === 'custodian';

  return (
    <SafeScreen>
      <Header
        title={isCustodianMode ? t('invite.custodian.title') : t('invite.title')}
        showBack
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isCustodianMode ? (
          <CustodianInvite commitmentId={id} onAssigned={() => router.back()} />
        ) : (
          <SupporterInvite commitmentId={id} />
        )}
      </ScrollView>
    </SafeScreen>
  );
}

// ---------------------------------------------------------------------------
// Shared: a generated-link card with copy / share / deactivate
// ---------------------------------------------------------------------------
function LinkCard({
  link,
  commitmentId,
  showRole,
}: {
  link: InvitationLink;
  commitmentId: string | undefined;
  showRole: boolean;
}) {
  const { t } = useTranslation('commitments');
  const { deactivateLink, isDeactivating } = useDeactivateInvitationLink(commitmentId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(getShareableUrl(link));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('invite.shareMessage', { url: getShareableUrl(link) }),
        url: getShareableUrl(link),
      });
    } catch {
      // dismissed — no-op
    }
  };

  return (
    <Card variant="outlined">
      <View className="flex-row items-center justify-between mb-2">
        {showRole ? (
          <Badge label={t(`invite.roles.${supporterRoleKey(link.role)}`)} variant="info" />
        ) : (
          <Badge label="🏦" variant="warning" />
        )}
        <Text className="text-xs text-neutral-400">
          {link.maxUses === null
            ? t('invite.usesUnlimited', { count: link.currentUses })
            : t('invite.usesLimited', { current: link.currentUses, max: link.maxUses })}
        </Text>
      </View>

      <Text className="text-xs text-neutral-600 mb-3" numberOfLines={1}>
        {getShareableUrl(link)}
      </Text>

      <View className="flex-row gap-2">
        <Button
          title={copied ? t('invite.copied') : t('invite.copy')}
          variant="outline"
          size="sm"
          onPress={handleCopy}
          className="flex-1"
        />
        <Button title={t('invite.share')} size="sm" onPress={handleShare} className="flex-1" />
      </View>

      <Pressable
        onPress={() => deactivateLink(link.id).catch(() => {})}
        disabled={isDeactivating}
        className="mt-2 items-center"
      >
        <Text className="text-xs text-error">{t('invite.deactivate')}</Text>
      </Pressable>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Supporter invite
// ---------------------------------------------------------------------------
function SupporterInvite({ commitmentId }: { commitmentId: string | undefined }) {
  const { t } = useTranslation('commitments');
  const [role, setRole] = useState<SupporterRole>(SupporterRole.VERIFIER);

  const { data: links, isLoading } = useInvitationLinks(commitmentId);
  const { generateLink, isGenerating } = useGenerateInvitationLink(commitmentId);

  const activeLinks = (links ?? []).filter(
    (l) => l.isActive && l.linkType !== InvitationLinkType.CUSTODIAN,
  );

  return (
    <>
      <Text className="text-neutral-600 mb-4">{t('invite.subtitle')}</Text>

      <Text className="text-sm font-semibold text-neutral-800 mb-2">
        {t('invite.roleLabel')}
      </Text>
      <View className="flex-row gap-2 mb-2">
        {ROLE_OPTIONS.map((option) => {
          const selected = role === option;
          return (
            <Pressable
              key={option}
              onPress={() => setRole(option)}
              className={`flex-1 rounded-lg border px-3 py-2 items-center ${
                selected ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? 'text-primary-700' : 'text-neutral-700'
                }`}
              >
                {t(`invite.roles.${supporterRoleKey(option)}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="text-xs text-neutral-500 mb-5">
        {t(`invite.roleDescriptions.${supporterRoleKey(role)}`)}
      </Text>

      <Button
        title={t('invite.generate')}
        onPress={() => generateLink({ role }).catch(() => {})}
        loading={isGenerating}
        fullWidth
      />

      <View className="mt-8">
        <Text className="text-lg font-semibold text-neutral-900 mb-3">
          {t('invite.activeLinks')}
        </Text>
        {isLoading ? (
          <ActivityIndicator color="#4CAF50" />
        ) : activeLinks.length === 0 ? (
          <Text className="text-neutral-500 text-sm">{t('invite.noLinks')}</Text>
        ) : (
          <View className="gap-3">
            {activeLinks.map((link) => (
              <LinkCard key={link.id} link={link} commitmentId={commitmentId} showRole />
            ))}
          </View>
        )}
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Custodian invite (assign by email or share a custodian link)
// ---------------------------------------------------------------------------
function CustodianInvite({
  commitmentId,
  onAssigned,
}: {
  commitmentId: string | undefined;
  onAssigned: () => void;
}) {
  const { t } = useTranslation('commitments');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const { assignCustodian, isAssigning } = useAssignCustodian(commitmentId);
  const { data: links, isLoading } = useInvitationLinks(commitmentId);
  const { generateLink, isGenerating } = useGenerateInvitationLink(commitmentId);

  const custodianLinks = (links ?? []).filter(
    (l) => l.isActive && l.linkType === InvitationLinkType.CUSTODIAN,
  );

  const handleAssign = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(t('invite.custodian.invalidEmail'));
      return;
    }
    setEmailError(null);
    try {
      await assignCustodian(trimmed);
      onAssigned();
    } catch {
      setEmailError(t('invite.custodian.assignError'));
    }
  };

  const handleGenerate = () => {
    // Role is irrelevant for custodian links; send a placeholder.
    generateLink({ role: SupporterRole.OBSERVER, linkType: InvitationLinkType.CUSTODIAN }).catch(
      () => {},
    );
  };

  return (
    <>
      <Text className="text-neutral-600 mb-5">{t('invite.custodian.subtitle')}</Text>

      {/* Assign by email */}
      <Text className="text-sm font-semibold text-neutral-800 mb-2">
        {t('invite.custodian.emailLabel')}
      </Text>
      <Input
        placeholder={t('invite.custodian.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setEmailError(null);
        }}
        editable={!isAssigning}
      />
      {emailError && <Text className="text-error text-sm mt-1">{emailError}</Text>}
      <Button
        title={t('invite.custodian.assign')}
        onPress={handleAssign}
        loading={isAssigning}
        fullWidth
        className="mt-3"
      />

      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-neutral-200" />
        <Text className="text-xs text-neutral-400 mx-3">
          {t('invite.custodian.orShareLink')}
        </Text>
        <View className="flex-1 h-px bg-neutral-200" />
      </View>

      {/* Share a custodian link */}
      <Text className="text-xs text-neutral-500 mb-3">
        {t('invite.custodian.linkExplainer')}
      </Text>

      {custodianLinks.length === 0 ? (
        <Button
          title={t('invite.custodian.generateLink')}
          variant="outline"
          onPress={handleGenerate}
          loading={isGenerating}
          fullWidth
        />
      ) : (
        <View className="gap-3">
          {isLoading && <ActivityIndicator color="#4CAF50" />}
          {custodianLinks.map((link) => (
            <LinkCard key={link.id} link={link} commitmentId={commitmentId} showRole={false} />
          ))}
        </View>
      )}
    </>
  );
}
