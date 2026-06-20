import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

export default function Index() {
  const { isReady, isAuthenticated } = useAuth();

  // Show loading while checking auth state
  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
