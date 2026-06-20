import * as Haptics from 'expo-haptics';

/**
 * Haptics utility for native platforms (iOS/Android)
 * For web, the .web.ts file is used instead (empty stubs)
 */

export const haptics = {
  /**
   * Trigger a light impact feedback
   */
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Trigger a medium impact feedback
   */
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Trigger a heavy impact feedback
   */
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Trigger a selection feedback (soft tap)
   */
  selection: () => {
    Haptics.selectionAsync();
  },

  /**
   * Trigger a success notification feedback
   */
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Trigger a warning notification feedback
   */
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Trigger an error notification feedback
   */
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};

export default haptics;
