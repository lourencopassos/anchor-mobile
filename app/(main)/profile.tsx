import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Icon } from '@/shared/components/ui/Icon';
import { useLanguage } from '@/shared/hooks/useLanguage';
import { useAuthStore, selectUser } from '@/features/auth/stores/auth.store';
import { clearTokens } from '@/features/auth/services/token.service';
import { useUnreadCount } from '@/features/notifications/hooks';
import { usePendingCount } from '@/features/custodian/hooks';
import { haptics } from '@/shared/utils/haptics.utils';
import * as authApi from '@/api/endpoints/auth.api';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

const COLORS = {
  primary: '#2D5A4A',
  primaryLight: 'rgba(45, 90, 74, 0.08)',
  accent: '#D4A574',
  accentLight: 'rgba(212, 165, 116, 0.10)',
  copper: '#B87333',
  copperLight: 'rgba(184, 115, 51, 0.10)',
  teal: '#4A7C8C',
  tealLight: 'rgba(74, 124, 140, 0.10)',
  danger: '#B54548',
  dangerLight: 'rgba(181, 69, 72, 0.08)',
  neutral900: '#1C1917',
  neutral700: '#44403C',
  neutral500: '#78716C',
  neutral300: '#D6D3D1',
  neutral200: '#E7E5E4',
  neutral100: '#F5F5F4',
  white: '#FFFFFF',
};

export default function ProfileScreen() {
  useHideTabBar();
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const router = useRouter();

  const user = useAuthStore(selectUser);
  const logout = useAuthStore((state) => state.logout);
  const { currentLanguage, toggleLanguage } = useLanguage();

  const unreadNotifications = useUnreadCount();
  const pendingCustodian = usePendingCount();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Backend logout failed:', error);
    }
    await clearTokens();
    logout();
    router.replace('/(auth)/login');
  };

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'User';

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.profileHeader}>
          <Avatar name={fullName} size="xl" />
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </Animated.View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {/* Notifications */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <MenuRow
              icon="notifications-outline"
              iconBackground={COLORS.tealLight}
              iconColor={COLORS.teal}
              label={tCommon('notifications')}
              badge={unreadNotifications > 0 ? unreadNotifications : undefined}
              onPress={() => router.push('/(main)/notifications')}
            />
          </Animated.View>

          {/* Wallet / Custodian */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <MenuRow
              icon="wallet-outline"
              iconBackground={COLORS.copperLight}
              iconColor={COLORS.copper}
              label={tCommon('wallet')}
              badge={pendingCustodian > 0 ? pendingCustodian : undefined}
              onPress={() => router.push('/(main)/custodian')}
            />
          </Animated.View>

          <View style={styles.divider} />

          {/* Settings */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <MenuRow
              icon="settings-outline"
              iconBackground={COLORS.primaryLight}
              iconColor={COLORS.primary}
              label={tCommon('settings')}
              subtitle={tCommon('settingsDescription')}
              onPress={() => router.push('/(main)/settings')}
            />
          </Animated.View>

          {/* Language */}
          <Animated.View entering={FadeInDown.delay(250)}>
            <MenuRow
              icon="language-outline"
              iconBackground={COLORS.accentLight}
              iconColor={COLORS.accent}
              label={tCommon('language')}
              subtitle={currentLanguage === 'en' ? tCommon('english') : tCommon('portuguese')}
              onPress={() => {
                haptics.light();
                toggleLanguage();
              }}
              trailing={
                <View style={styles.languageChip}>
                  <Text style={styles.languageChipText}>
                    {currentLanguage === 'en' ? 'EN' : 'PT'}
                  </Text>
                </View>
              }
            />
          </Animated.View>
        </View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.logoutSection}>
          <MenuRow
            icon="log-out-outline"
            iconBackground={COLORS.dangerLight}
            iconColor={COLORS.danger}
            label={tAuth('logout')}
            labelColor={COLORS.danger}
            onPress={handleLogout}
            showChevron={false}
            loading={isLoggingOut}
          />
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}

// ── Menu Row Component ─────────────────────────────────────────────────────
function MenuRow({
  icon,
  iconBackground,
  iconColor,
  label,
  labelColor,
  subtitle,
  badge,
  trailing,
  showChevron = true,
  loading,
  onPress,
}: {
  icon: string;
  iconBackground: string;
  iconColor: string;
  label: string;
  labelColor?: string;
  subtitle?: string;
  badge?: number;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.menuRow, animatedStyle]}
      disabled={loading}
    >
      {/* Icon */}
      <View style={[styles.menuIcon, { backgroundColor: iconBackground }]}>
        <Icon name={icon} size="md" color={iconColor} />
      </View>

      {/* Label + Subtitle */}
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, labelColor ? { color: labelColor } : undefined]}>
          {label}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>

      {/* Trailing: badge, custom element, or chevron */}
      {badge != null && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
      {trailing}
      {showChevron && (
        <Icon name="chevron-forward" size="sm" color={COLORS.neutral300} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120, // Extra space for floating tab bar
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 28,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Fraunces_600SemiBold',
    color: COLORS.neutral900,
    marginTop: 16,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.neutral500,
    marginTop: 4,
  },

  // Menu Section
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral200,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral100,
    marginHorizontal: 16,
  },

  // Menu Row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.neutral900,
  },
  menuSubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.neutral500,
    marginTop: 2,
  },
  menuBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 4,
  },
  menuBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Language chip
  languageChip: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  languageChipText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: COLORS.accent,
  },

  // Logout
  logoutSection: {
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral200,
    overflow: 'hidden',
  },
});
