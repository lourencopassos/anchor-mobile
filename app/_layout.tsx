import { useCallback, useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import '../global.css';

import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

/**
 * Extract invitation token from deep link URL.
 * Handles both custom scheme (anchor://invite/TOKEN) and
 * universal links (https://anchor.app/invite/TOKEN)
 */
function extractInvitationToken(url: string): string | null {
  try {
    // Handle custom scheme: anchor://invite/TOKEN or anchor://claim?token=TOKEN
    if (url.startsWith('anchor://')) {
      const parsed = Linking.parse(url);
      if (parsed.path?.startsWith('invite/')) {
        return parsed.path.replace('invite/', '');
      }
      if (parsed.queryParams?.token) {
        return parsed.queryParams.token as string;
      }
    }

    // Handle universal links: https://anchor.app/invite/TOKEN
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/^\/invite\/(.+)$/);
    if (pathMatch) {
      return pathMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Component to handle deep links for invitation flow.
 * Must be inside providers to access router.
 */
function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle URL that opened the app (cold start)
    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const token = extractInvitationToken(initialUrl);
        if (token) {
          // Navigate to claim flow with token
          router.replace(`/(auth)/claim?token=${token}`);
        }
      }
    };

    handleInitialUrl();

    // Handle URLs while app is open (warm start)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const token = extractInvitationToken(url);
      if (token) {
        router.replace(`/(auth)/claim?token=${token}`);
      }
    });

    return () => subscription.remove();
  }, [router]);

  return null;
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    // Fraunces - Display font (elegant serif)
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    // Alias for Tailwind
    Fraunces: Fraunces_400Regular,
    'Fraunces-Medium': Fraunces_500Medium,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
    'Fraunces-Bold': Fraunces_700Bold,
    // Plus Jakarta Sans - Body font (geometric sans)
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    // Alias for Tailwind
    PlusJakartaSans: PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (fontError) {
        console.warn('Font loading error:', fontError);
      }
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Fallback: If fonts take too long, show app anyway (for web compatibility)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!appIsReady) {
        console.warn('Font loading timeout, proceeding without custom fonts');
        setAppIsReady(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [appIsReady]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Show loading screen while fonts load
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <NotificationProvider>
                  <DeepLinkHandler />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(main)" />
                  </Stack>
                  <StatusBar style="auto" />
                </NotificationProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D5A4A', // Match splash screen to prevent color flash
  },
});
