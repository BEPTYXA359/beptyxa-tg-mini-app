import {
  hapticFeedbackImpactOccurred,
  hapticFeedbackNotificationOccurred,
  hapticFeedbackSelectionChanged,
  isHapticFeedbackSupported,
} from '@telegram-apps/sdk-react';

const supported = (): boolean => {
  try {
    return isHapticFeedbackSupported();
  } catch {
    return false;
  }
};

export const haptic = {
  impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    if (supported()) hapticFeedbackImpactOccurred(style);
  },
  notify(type: 'success' | 'warning' | 'error'): void {
    if (supported()) hapticFeedbackNotificationOccurred(type);
  },
  selection(): void {
    if (supported()) hapticFeedbackSelectionChanged();
  },
};
