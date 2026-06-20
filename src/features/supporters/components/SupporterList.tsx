import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Supporter } from '@api/types';
import { SupporterRole, SupporterRelationshipState } from '@api/types';
import { Card } from '@shared/components/ui/Card';
import { Avatar } from '@shared/components/ui/Avatar';
import { Icon, ROLE_ICONS, STATE_ICONS } from '@shared/components/ui/Icon';
import { IconButton } from '@shared/components/ui/IconButton';

interface SupporterListProps {
  supporters: Supporter[];
  onSupporterPress?: (supporter: Supporter) => void;
  onRemove?: (supporter: Supporter) => void;
  onResendInvite?: (supporter: Supporter) => void;
  isOwner?: boolean;
}

const ROLE_COLORS = {
  [SupporterRole.OBSERVER]: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
    icon: ROLE_ICONS.observer,
  },
  [SupporterRole.ENCOURAGER]: {
    bg: '#D1FAE5',
    text: '#047857',
    icon: ROLE_ICONS.encourager,
  },
  [SupporterRole.VERIFIER]: {
    bg: '#EDE9FE',
    text: '#6D28D9',
    icon: ROLE_ICONS.verifier,
  },
} as const;

const STATE_STYLES = {
  [SupporterRelationshipState.INVITED]: {
    bg: '#FEF3C7',
    text: '#B45309',
    icon: STATE_ICONS.invited,
  },
  [SupporterRelationshipState.ACTIVE]: {
    bg: '#D1FAE5',
    text: '#047857',
    icon: STATE_ICONS.active,
  },
  [SupporterRelationshipState.DECLINED]: {
    bg: '#F3F4F6',
    text: '#4B5563',
    icon: STATE_ICONS.declined,
  },
  [SupporterRelationshipState.REMOVED]: {
    bg: '#FEE2E2',
    text: '#B91C1C',
    icon: STATE_ICONS.removed,
  },
} as const;

interface SupporterItemProps {
  supporter: Supporter;
  onPress?: () => void;
  onRemove?: () => void;
  onResendInvite?: () => void;
  isOwner?: boolean;
}

function SupporterItem({
  supporter,
  onPress,
  onRemove,
  onResendInvite,
  isOwner,
}: SupporterItemProps) {
  const { t } = useTranslation('supporters');
  const { t: tCommon } = useTranslation('common');
  const roleStyle = ROLE_COLORS[supporter.role];
  const stateStyle = STATE_STYLES[supporter.state];

  const stateKey = supporter.state.toLowerCase() as
    | 'invited'
    | 'active'
    | 'declined'
    | 'removed';

  const roleKey = supporter.role.toLowerCase() as 'observer' | 'encourager' | 'verifier';

  const displayLabel =
    supporter.displayName ||
    supporter.email ||
    supporter.phone ||
    tCommon('unknownUser');

  const canResend =
    isOwner &&
    (supporter.state === SupporterRelationshipState.INVITED ||
      supporter.state === SupporterRelationshipState.DECLINED);

  const canRemove =
    isOwner && supporter.state === SupporterRelationshipState.ACTIVE;

  return (
    <Card variant="outlined" className="mb-3" onPress={onPress}>
      <View style={styles.itemContainer}>
        <View style={styles.leftSection}>
          <Avatar
            name={displayLabel}
            source={supporter.avatarUrl}
            size="md"
            badge={{
              icon: roleStyle.icon,
              color: roleStyle.text,
              backgroundColor: roleStyle.bg,
            }}
          />

          <View style={styles.infoSection}>
            <Text style={styles.displayName} className="text-neutral-900 dark:text-white">
              {displayLabel}
            </Text>

            {supporter.displayName && (supporter.email || supporter.phone) && (
              <Text style={styles.secondaryInfo} className="text-neutral-500">
                {supporter.email || supporter.phone}
              </Text>
            )}

            <View style={styles.badgesRow}>
              {/* State badge */}
              <View style={[styles.badge, { backgroundColor: stateStyle.bg }]}>
                <Icon name={stateStyle.icon} size="xs" color={stateStyle.text} />
                <Text style={[styles.badgeText, { color: stateStyle.text }]}>
                  {t(`state.${stateKey}`)}
                </Text>
              </View>

              {/* Role badge */}
              <View style={[styles.badge, { backgroundColor: roleStyle.bg }]}>
                <Icon name={roleStyle.icon} size="xs" color={roleStyle.text} />
                <Text style={[styles.badgeText, { color: roleStyle.text }]}>
                  {t(`role.${roleKey}`)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          {canResend && onResendInvite && (
            <IconButton
              icon="refresh-outline"
              onPress={onResendInvite}
              variant="ghost"
              size="md"
              color="#4CAF50"
              accessibilityLabel={t('resend')}
            />
          )}

          {canRemove && onRemove && (
            <IconButton
              icon="trash-outline"
              onPress={onRemove}
              variant="danger"
              size="md"
              accessibilityLabel={t('remove')}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

export function SupporterList({
  supporters,
  onSupporterPress,
  onRemove,
  onResendInvite,
  isOwner = false,
}: SupporterListProps) {
  const { t } = useTranslation('supporters');

  if (supporters.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Icon name="people-outline" size="xl" color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle} className="text-neutral-600 dark:text-neutral-400">
          {t('noSupporters')}
        </Text>
        <Text style={styles.emptySubtitle} className="text-neutral-400 dark:text-neutral-500">
          {t('inviteFirst')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {supporters.map((supporter) => (
        <SupporterItem
          key={supporter.id}
          supporter={supporter}
          onPress={onSupporterPress ? () => onSupporterPress(supporter) : undefined}
          onRemove={onRemove ? () => onRemove(supporter) : undefined}
          onResendInvite={onResendInvite ? () => onResendInvite(supporter) : undefined}
          isOwner={isOwner}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoSection: {
    marginLeft: 12,
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryInfo: {
    fontSize: 12,
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
