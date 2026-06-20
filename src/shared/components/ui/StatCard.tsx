import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from './Icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'highlighted' | 'compact';
  onPress?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = '#4CAF50',
  trend,
  variant = 'default',
  onPress,
  className = '',
}: StatCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return { icon: 'trending-up', color: '#10B981' };
      case 'down':
        return { icon: 'trending-down', color: '#EF4444' };
      default:
        return { icon: 'remove', color: '#9CA3AF' };
    }
  };

  const trendInfo = getTrendIcon();

  const isCompact = variant === 'compact';
  const isHighlighted = variant === 'highlighted';

  const content = (
    <View
      style={[
        styles.container,
        isHighlighted && styles.highlighted,
        isCompact && styles.compact,
      ]}
      className={`bg-white dark:bg-neutral-800 ${className}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={isCompact ? 'sm' : 'md'} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.value, isCompact && styles.valueCompact]}
          className="text-neutral-900 dark:text-white"
          numberOfLines={1}
        >
          {value}
        </Text>
        <View style={styles.labelRow}>
          <Text
            style={[styles.label, isCompact && styles.labelCompact]}
            className="text-neutral-500 dark:text-neutral-400"
            numberOfLines={1}
          >
            {label}
          </Text>
          {trend && trendInfo && (
            <View style={styles.trendContainer}>
              <Icon name={trendInfo.icon} size="xs" color={trendInfo.color} />
              <Text style={[styles.trendValue, { color: trendInfo.color }]}>
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

// Horizontal row of stat cards
export function StatsRow({
  stats,
  className = '',
}: {
  stats: Array<Omit<StatCardProps, 'variant'>>;
  className?: string;
}) {
  return (
    <View className={`flex-row gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <StatCard {...stat} variant="compact" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  compact: {
    padding: 12,
    borderRadius: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  valueCompact: {
    fontSize: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    flex: 1,
  },
  labelCompact: {
    fontSize: 11,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  statItem: {
    flex: 1,
  },
});
