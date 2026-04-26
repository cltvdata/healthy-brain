import * as Haptics from 'expo-haptics';
import { Pedometer } from 'expo-sensors';

export class BioSensorService {
  private static isHapticsAvailable = true;
  private static isPedometerAvailable = true;

  /**
   * Safe Haptic Feedback wrapper.
   */
  static async triggerHaptic(type: 'success' | 'warning' | 'error' | 'selection' = 'selection') {
    if (!this.isHapticsAvailable) return;
    
    try {
      switch(type) {
        case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
        case 'warning': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
        case 'error': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
        default: await Haptics.selectionAsync(); break;
      }
    } catch (e) {
      this.isHapticsAvailable = false;
      console.warn("[BioSensorService] Haptics not available:", e);
    }
  }

  /**
   * Safe Pedometer subscription with fallback.
   */
  static subscribeToSteps(callback: (steps: number) => void) {
    try {
      return Pedometer.watchStepCount(result => {
        callback(result.steps);
      });
    } catch (e) {
      this.isPedometerAvailable = false;
      console.warn("[BioSensorService] Pedometer not available, using simulation.");
      // Simulación de pasos para testing/web
      const interval = setInterval(() => {
        callback(Math.floor(Math.random() * 5));
      }, 5000);
      return { remove: () => clearInterval(interval) };
    }
  }

  static async isHardwareReady(): Promise<boolean> {
    const pedo = await Pedometer.isAvailableAsync();
    return pedo;
  }
}
