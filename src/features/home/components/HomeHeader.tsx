import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Icon } from '@shared/components/ui/Icon';
import { haptics } from '@/shared/utils/haptics.utils';
import { Avatar } from '@shared/components/ui/Avatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HomeHeaderProps {
  firstName: string;
  lastName: string;
  greeting: string;
  unreadCount: number;
  avatarUrl?: string;
}

export function HomeHeader({
  firstName,
  lastName,
  greeting,
  unreadCount,
  avatarUrl,
}: HomeHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation('home');
  const bellScale = useSharedValue(1);
  const bellRotation = useSharedValue(0);

  // Animate bell when there are unread notifications
  React.useEffect(() => {
    if (unreadCount > 0) {
      bellRotation.value = withDelay(
        500,
        withRepeat(
          withSequence(
            withSpring(15, { damping: 2 }),
            withSpring(-15, { damping: 2 }),
            withSpring(0, { damping: 5 })
          ),
          3,
          false
        )
      );
    }
  }, [unreadCount, bellRotation]);

  const handleNotificationPress = () => {
    haptics.light();
    bellScale.value = withSpring(0.9, { damping: 15 });
    setTimeout(() => {
      bellScale.value = withSpring(1, { damping: 15 });
    }, 100);
    router.push('/(main)/notifications');
  };

  const bellAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scale: bellScale.value },
        { rotateZ: bellRotation.value + 'deg' },
      ],
    };
  });

  const handleAvatarPress = () => {
    haptics.light();
    router.push('/(main)/profile');
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleAvatarPress} style={styles.leftSection}>
        <Avatar
          name={`${firstName} ${lastName}`.trim() || 'User'}
          source={avatarUrl}
          size="md"
        />
        <View style={styles.greetingSection}>
          <Text style={styles.greeting} className="text-neutral-500 dark:text-neutral-400">
            {t(greeting)}
          </Text>
          <Text style={styles.name} className="text-neutral-900 dark:text-white">
            {firstName}
          </Text>
        </View>
      </Pressable>

      <AnimatedPressable
        onPress={handleNotificationPress}
        style={[styles.notificationButton, bellAnimatedStyle]}
        className="bg-neutral-100 dark:bg-neutral-800"
      >
        <Icon
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size="md"
          color={unreadCount > 0 ? '#4CAF50' : '#6B7280'}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingSection: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '400',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
