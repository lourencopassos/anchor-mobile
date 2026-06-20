import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { registerDevice } from '@api/endpoints/devices.api';
import {
  DevicePlatform,
  PushProviderType,
  type RegisterDeviceRequest,
} from '@api/types';
import {
  useAuthStore,
  selectIsAuthenticated,
  selectIsHydrated,
} from '@features/auth/stores/auth.store';
import * as Localization from 'expo-localization';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextValue {
  expoPushToken: string | null;
  deviceId: string | null;
  notification: Notifications.Notification | null;
  registerForPushNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  expoPushToken: null,
  deviceId: null,
  notification: null,
  registerForPushNotifications: async () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { t } = useTranslation('notifications');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);

  // Track if we've already registered to prevent duplicate registrations
  const hasRegistered = useRef(false);

  /**
   * Register for push notifications.
   * - Requests permission
   * - Gets push token
   * - Registers with backend
   */
  const registerForPushNotifications = useCallback(async () => {
    // Only proceed on physical devices
    if (!Device.isDevice) {
      console.log('[Push] Running on simulator/emulator - skipping registration');
      return;
    }

    try {
      // Check/request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Push] Permission not granted');
        return;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      const token = tokenData.data;

      console.log('[Push] Got token:', token.substring(0, 20) + '...');
      setExpoPushToken(token);

      // Determine platform
      const platform: DevicePlatform =
        Platform.OS === 'ios' ? DevicePlatform.IOS : DevicePlatform.ANDROID;

      // Gather device metadata
      const request: RegisterDeviceRequest = {
        pushToken: token,
        platform,
        provider: PushProviderType.FCM, // Expo uses FCM under the hood
        appVersion: Constants.expoConfig?.version || undefined,
        osVersion: `${Platform.OS} ${Platform.Version}`,
        locale: Localization.locale,
        timezone: Localization.timezone,
      };

      // Register with backend
      const response = await registerDevice(request);
      setDeviceId(response.id);
      console.log('[Push] Device registered:', response.id, response.status);

      // Configure Android channel (required for Android 8+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('[Push] Registration failed:', error);
      // Don't show alert - registration failure shouldn't block app usage
    }
  }, []);

  // Register for push notifications when authenticated
  useEffect(() => {
    // Wait for hydration and authentication
    if (!isHydrated || !isAuthenticated) {
      return;
    }

    // Prevent duplicate registration
    if (hasRegistered.current) {
      return;
    }

    hasRegistered.current = true;
    registerForPushNotifications();
  }, [isHydrated, isAuthenticated, registerForPushNotifications]);

  // Reset registration flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasRegistered.current = false;
      setExpoPushToken(null);
      setDeviceId(null);
    }
  }, [isAuthenticated]);

  // Listen for incoming notifications
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    // Listen for notification responses (when user taps)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Extract notification data
        const data = response.notification.request.content.data;
        console.log('[Push] Notification tapped:', data);

        // TODO: Handle notification tap - navigate to relevant screen based on data.type
        // Example: if (data.type === 'COMMITMENT_ACTIVATED') { navigate to commitment }
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const value: NotificationContextValue = {
    expoPushToken,
    deviceId,
    notification,
    registerForPushNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
