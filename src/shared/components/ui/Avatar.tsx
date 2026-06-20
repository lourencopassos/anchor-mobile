import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Icon } from './Icon';

const SIZES = {
  xs: { container: 24, text: 10, badge: 10, badgeIcon: 8 },
  sm: { container: 32, text: 12, badge: 14, badgeIcon: 10 },
  md: { container: 40, text: 14, badge: 16, badgeIcon: 12 },
  lg: { container: 48, text: 16, badge: 18, badgeIcon: 14 },
  xl: { container: 64, text: 20, badge: 22, badgeIcon: 16 },
} as const;

const COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF5722', // Deep Orange
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#009688', // Teal
];

function getColorFromName(name: string): string {
  const hash = name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return COLORS[hash % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarBadge {
  icon: string;
  color: string;
  backgroundColor?: string;
}

export interface AvatarProps {
  source?: string;
  name?: string;
  size?: keyof typeof SIZES;
  badge?: AvatarBadge;
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

export function Avatar({
  source,
  name = 'User',
  size = 'md',
  badge,
  status,
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimensions = SIZES[size];
  const backgroundColor = getColorFromName(name);
  const initials = getInitials(name);
  const showImage = source && !imageError;

  return (
    <View
      className={className}
      style={[styles.container, { width: dimensions.container, height: dimensions.container }]}
    >
      {showImage ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            { width: dimensions.container, height: dimensions.container, borderRadius: dimensions.container / 2 },
          ]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimensions.container,
              height: dimensions.container,
              borderRadius: dimensions.container / 2,
              backgroundColor,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: dimensions.text }]}>
            {initials}
          </Text>
        </View>
      )}

      {badge && (
        <View
          style={[
            styles.badge,
            {
              width: dimensions.badge,
              height: dimensions.badge,
              borderRadius: dimensions.badge / 2,
              backgroundColor: badge.backgroundColor || '#FFFFFF',
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Icon
            name={badge.icon}
            size="xs"
            color={badge.color}
          />
        </View>
      )}

      {status && (
        <View
          style={[
            styles.status,
            {
              width: dimensions.badge * 0.6,
              height: dimensions.badge * 0.6,
              borderRadius: dimensions.badge * 0.3,
              backgroundColor:
                status === 'online' ? '#10B981' :
                status === 'away' ? '#F59E0B' :
                '#9CA3AF',
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  status: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
