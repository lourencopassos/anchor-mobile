import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/shared/components/layout/SafeScreen';
import { NotificationList } from '@/features/notifications/components';
import { useHideTabBar } from '@/shared/contexts/TabBarVisibilityContext';

export default function NotificationsScreen() {
  useHideTabBar();
  const { t } = useTranslation('notifications');

  return (
    <SafeScreen edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-neutral-900">
          {t('title')}
        </Text>
      </View>

      <NotificationList />
    </SafeScreen>
  );
}
