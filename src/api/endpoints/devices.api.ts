import apiClient from '../client';
import type {
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  DeviceListResponse,
} from '../types';

/**
 * Register device for push notifications.
 * Idempotent by (provider, pushTokenHash).
 */
export async function registerDevice(
  request: RegisterDeviceRequest
): Promise<RegisterDeviceResponse> {
  const response = await apiClient.post<RegisterDeviceResponse>(
    '/devices/register',
    request
  );
  return response.data;
}

/**
 * Revoke device registration.
 * Only the owner can revoke their device.
 */
export async function revokeDevice(id: string): Promise<void> {
  await apiClient.delete(`/devices/${id}`);
}

/**
 * List active device registrations for current user.
 * Note: Never includes raw push token for security.
 */
export async function listDevices(): Promise<DeviceListResponse> {
  const response = await apiClient.get<DeviceListResponse>('/devices');
  return response.data;
}
