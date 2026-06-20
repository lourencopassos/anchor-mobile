// ============================================================================
// DEVICE REGISTRATION TYPES
// ============================================================================

/**
 * Device platforms for push notifications.
 */
export enum DevicePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

/**
 * Push notification provider types.
 */
export enum PushProviderType {
  FCM = 'fcm',
  APNS = 'apns',
  NOOP = 'noop',
}

/**
 * Registration status after device registration.
 */
export type DeviceRegistrationStatus = 'registered' | 'updated' | 'reactivated';

/**
 * Request body for registering a device.
 */
export interface RegisterDeviceRequest {
  pushToken: string;
  platform: DevicePlatform;
  provider?: PushProviderType;
  deviceFingerprint?: string;
  appVersion?: string;
  osVersion?: string;
  locale?: string;
  timezone?: string;
}

/**
 * Response from device registration.
 */
export interface RegisterDeviceResponse {
  id: string;
  status: DeviceRegistrationStatus;
}

/**
 * Device information (safe fields only - no raw token).
 */
export interface DeviceInfo {
  id: string;
  platform: DevicePlatform;
  provider: PushProviderType;
  appVersion?: string;
  osVersion?: string;
  locale?: string;
  timezone?: string;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Response from listing devices.
 */
export interface DeviceListResponse {
  devices: DeviceInfo[];
}
