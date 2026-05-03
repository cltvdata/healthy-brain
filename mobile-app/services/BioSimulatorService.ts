import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

export const BioSimulatorService = {
  /**
   * Injects a "Bio-Elite" state for testing.
   * Sets steps to 25k, HRV to 95, and adds 1000 NTK.
   */
  async injectEliteStatus() {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Impacto táctico de inicio
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await updateDoc(userRef, {
        steps: 25000,
        hrv: 95,
        bioScore: 98,
        ntkBalance: increment(1000),
        lastSimulatedAt: serverTimestamp(),
        'todaysMacros.protein': 120,
        'todaysMacros.carbs': 150,
        'todaysMacros.fats': 60,
      });

      console.log("SIMULATOR: Elite Status Injected.");
      return true;
    } catch (e) {
      console.error("SIMULATOR ERROR:", e);
      return false;
    }
  },

  /**
   * Simulates a "Vagal Crash" for testing alerts.
   */
  async injectStressedStatus() {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      await updateDoc(userRef, {
        hrv: 25,
        bioScore: 40,
        lastSimulatedAt: serverTimestamp(),
      });

      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Cleans simulation data back to baseline.
   */
  async resetBaseline() {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      steps: 0,
      hrv: 60,
      bioScore: 80,
      'todaysMacros.protein': 0,
      'todaysMacros.carbs': 0,
      'todaysMacros.fats': 0,
    });
  }
};
