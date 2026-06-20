import React, { useEffect } from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { haptics } from '@/shared/utils/haptics.utils';
import { useTabBarVisibility } from '@/shared/contexts/TabBarVisibilityContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Only 2 tabs: Home and Commitments
// Profile is accessed via the avatar in the header, notifications via the bell icon
const TAB_CONFIG: Record<string, { outline: string; filled: string; labelKey: string }> = {
  index: { outline: 'home-outline', filled: 'home', labelKey: 'tabs.home' },
  commitments: { outline: 'flag-outline', filled: 'flag', labelKey: 'tabs.goals' },
};

const COLORS = {
  active: '#2D5A4A',
  inactive: '#A8A29E',
  activeBackground: 'rgba(45, 90, 74, 0.10)',
  barBackground: 'rgba(255, 255, 255, 0.92)',
  barBorder: 'rgba(45, 90, 74, 0.06)',
};

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

function TabItem({ routeName, isFocused, onPress, onLongPress, label }: TabItemProps) {
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
  }, [isFocused, activeProgress]);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
    transform: [{ scale: interpolate(activeProgress.value, [0, 1], [0.8, 1]) }],
  }));

  const config = TAB_CONFIG[routeName] || TAB_CONFIG.index;
  const iconName = isFocused ? config.filled : config.outline;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabItem, containerStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      {/* Active pill background */}
      <Animated.View style={[styles.activePill, pillStyle]} />

      {/* Icon */}
      <Ionicons
        name={iconName as any}
        size={22}
        color={isFocused ? COLORS.active : COLORS.inactive}
      />

      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: isFocused ? COLORS.active : COLORS.inactive },
          isFocused && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');

  // PRIMARY: Context-based visibility (screens call useHideTabBar())
  const { isTabBarVisible } = useTabBarVisibility();

  // FALLBACK: Navigation state check (catches screens that forgot useHideTabBar)
  const focusedRoute = state.routes[state.index];
  const nestedState = focusedRoute.state;
  const isOnHiddenTab = !(focusedRoute.name in TAB_CONFIG);
  const isOnChildRoute =
    isOnHiddenTab ||
    (nestedState != null && nestedState.index != null && nestedState.index > 0);

  // Hide if EITHER signal says hide
  const shouldHide = !isTabBarVisible || isOnChildRoute;

  const translateY = useSharedValue(shouldHide ? 100 : 0);

  useEffect(() => {
    translateY.value = withSpring(shouldHide ? 100 : 0, SPRING_CONFIG);
  }, [shouldHide, translateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [0, 100], [1, 0]),
    pointerEvents: translateY.value > 50 ? 'none' as const : 'auto' as const,
  }));

  // Only render tabs that have a config entry (index + commitments)
  const visibleRoutes = state.routes.filter((route) => route.name in TAB_CONFIG);

  const bottomPadding = Math.max(insets.bottom - 8, 8);

  return (
    <Animated.View style={[styles.container, { paddingBottom: bottomPadding }, animatedContainerStyle]}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const config = TAB_CONFIG[route.name];
          const label = config ? t(config.labelKey as any) : (options.title ?? route.name);

          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              label={label}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.barBackground,
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.barBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#2D5A4A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.activeBackground,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 2,
  },
  labelActive: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
