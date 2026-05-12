import * as Haptics from 'expo-haptics';

export const HAPTIC_PATTERNS = {
  sedentary: {
    type: Haptics.ImpactFeedbackStyle.Heavy,
    repeat: 3,
    delay: 500
  },
  stress: {
    type: Haptics.ImpactFeedbackStyle.Medium,
    repeat: 6,
    delay: 1000
  },
  sleepPrep: {
    type: Haptics.ImpactFeedbackStyle.Light,
    repeat: 4,
    delay: 2000
  },
  meditationStart: {
    type: Haptics.ImpactFeedbackStyle.Light,
    repeat: 3,
    delay: 300
  },
  mealReminder: {
    type: Haptics.NotificationFeedbackType.Success,
    repeat: 2,
    delay: 200
  },
  achievement: {
    type: Haptics.NotificationFeedbackType.Success,
    repeat: 3,
    delay: 100
  },
  focusMode: {
    type: Haptics.ImpactFeedbackStyle.Light,
    repeat: 1,
    delay: 0
  }
};

export function useHaptics() {
  const trigger = async (patternName: keyof typeof HAPTIC_PATTERNS) => {
    const pattern = HAPTIC_PATTERNS[patternName];
    if (!pattern) return;

    for (let i = 0; i < pattern.repeat; i++) {
      await Haptics.impactAsync(pattern.type);
      if (pattern.delay > 0 && i < pattern.repeat - 1) {
        await new Promise(r => setTimeout(r, pattern.delay));
      }
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error') => {
    const feedbackType = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error
    };
    await Haptics.notificationAsync(feedbackType[type]);
  };

  return { trigger, notification };
}