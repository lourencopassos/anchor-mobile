import React from 'react';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import type { ViewStyle } from 'react-native';

type IconFamily = 'ionicons' | 'material' | 'feather';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type MaterialName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type FeatherName = React.ComponentProps<typeof Feather>['name'];

const SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export interface IconProps {
  name: string;
  size?: keyof typeof SIZES;
  color?: string;
  family?: IconFamily;
  style?: ViewStyle;
}

export function Icon({
  name,
  size = 'md',
  color = '#374151',
  family = 'ionicons',
  style,
}: IconProps) {
  const iconSize = SIZES[size];

  switch (family) {
    case 'material':
      return (
        <MaterialCommunityIcons
          name={name as MaterialName}
          size={iconSize}
          color={color}
          style={style}
        />
      );
    case 'feather':
      return (
        <Feather
          name={name as FeatherName}
          size={iconSize}
          color={color}
          style={style}
        />
      );
    case 'ionicons':
    default:
      return (
        <Ionicons
          name={name as IoniconsName}
          size={iconSize}
          color={color}
          style={style}
        />
      );
  }
}

// Pre-defined icon sets for common use cases
export const ROLE_ICONS = {
  observer: 'eye-outline',
  encourager: 'chatbubble-outline',
  verifier: 'checkmark-circle-outline',
} as const;

export const STATE_ICONS = {
  active: 'checkmark-circle',
  invited: 'mail-outline',
  declined: 'close-circle-outline',
  removed: 'person-remove-outline',
} as const;

export const ACTION_ICONS = {
  add: 'add',
  remove: 'trash-outline',
  edit: 'pencil-outline',
  refresh: 'refresh-outline',
  settings: 'settings-outline',
  notification: 'notifications-outline',
  back: 'chevron-back',
  forward: 'chevron-forward',
  close: 'close',
  check: 'checkmark',
  search: 'search-outline',
  filter: 'filter-outline',
  share: 'share-outline',
} as const;

export const COMMITMENT_ICONS = {
  streak: 'flame',
  calendar: 'calendar-outline',
  checkin: 'checkbox-outline',
  progress: 'trending-up',
  target: 'flag-outline',
  timer: 'time-outline',
} as const;
