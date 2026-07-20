import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Tactile Haptic Feedback Utility for SplitShare (#08110F).
 * Provides light impact on button press, selection feedback on focus change,
 * and notification feedback on form validation errors.
 */
export const hapticFeedback = {
  /** Light impact trigger for button taps and interactive elements */
  lightImpact: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  },

  /** Medium impact trigger for primary CTAs */
  mediumImpact: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  },

  /** Selection trigger for input focus */
  selection: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  },

  /** Error vibration trigger for form validation errors */
  error: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }
  },

  /** Success vibration trigger for form submission success */
  success: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  },
};
