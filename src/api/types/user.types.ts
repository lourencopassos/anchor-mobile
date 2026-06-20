/**
 * User Types for Mobile API
 *
 * Mirrors backend user types from:
 * anchor/src/domain/user/types/user.types.ts
 */

/**
 * User lifecycle states.
 */
export type UserState = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

/**
 * Quiet hours configuration for notifications.
 */
export interface QuietHoursConfig {
  /** Whether quiet hours are enabled */
  enabled: boolean;
  /** Start time in HH:mm format (e.g., "22:00") */
  start: string;
  /** End time in HH:mm format (e.g., "08:00") */
  end: string;
  /** User's timezone (e.g., "America/New_York") */
  timezone: string;
}

/**
 * Notification preferences for a user profile.
 */
export interface NotificationPreferences {
  /** Email notifications enabled */
  emailEnabled?: boolean;
  /** SMS notifications enabled */
  smsEnabled?: boolean;
  /** Push notifications enabled */
  pushEnabled?: boolean;
  /** In-app notifications enabled */
  inAppEnabled?: boolean;
  /** Notification frequency: immediate, daily, weekly */
  frequency?: 'immediate' | 'daily' | 'weekly';
  /** Quiet hours configuration - no notifications during this period */
  quietHours?: QuietHoursConfig;

  // Check-in reminder preferences (Commitment Templates feature)
  /** Check-in reminder notifications enabled (defaults to true) */
  checkInRemindersEnabled?: boolean;
  /** Custom reminder lead time override in minutes (overrides commitment-level setting) */
  reminderLeadTimeOverride?: number;
}

/**
 * User profile response.
 */
export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  state: UserState;
  displayName: string | null;
  avatarUrl: string | null;
  timezone: string;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update user profile request.
 */
export interface UpdateUserProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  timezone?: string;
  notificationPreferences?: Partial<NotificationPreferences>;
}
