import { Tabs, Redirect } from 'expo-router';
import { useAuthStore, selectIsAuthenticated } from '@features/auth/stores/auth.store';
import { CustomTabBar } from '@/shared/components/navigation/CustomTabBar';
import { TabBarVisibilityProvider } from '@/shared/contexts/TabBarVisibilityContext';

export default function MainLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // Auth guard: redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <TabBarVisibilityProvider>
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ── Visible tabs (2) ─────────────────────────────────── */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="commitments" />

      {/* ── Hidden routes (navigable via header avatar, bell, etc.) ── */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="supporting" options={{ href: null }} />
      <Tabs.Screen name="custodian" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
    </TabBarVisibilityProvider>
  );
}
