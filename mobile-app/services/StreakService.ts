import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment, runTransaction, serverTimestamp, collection } from 'firebase/firestore';
import { BioEconomy } from '@/constants/BioEconomy';
import { SynergyService } from './SynergyService';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  bioShields: number;
  lastScoreDate: string | null; // YYYY-MM-DD
  isProtected?: boolean;
  needsProtection?: boolean;
}

export class StreakService {
  /**
   * Processes the daily score to update streaks.
   * Returns a recommendation if the racha is in danger.
   */
  static async processDailyScore(userId: string, score: number): Promise<StreakState | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;

    const data = userSnap.data() as StreakState;
    const today = new Date().toISOString().split('T')[0];
    
    const currentStreak = data.currentStreak || 0;
    
    // If already processed today and has active shield, preserve it
    if (data.lastScoreDate === today) {
      if (data.isProtected) return data;
      return data;
    }

    if (score >= BioEconomy.STREAK_TARGET_SCORE) {
      const newStreak = currentStreak + 1;
      const updates: any = {
        currentStreak: newStreak,
        lastScoreDate: today,
      };

      if (newStreak > (data.longestStreak || 0)) {
        updates.longestStreak = newStreak;
      }

      if (newStreak % BioEconomy.STREAK_REWARD_SHIELD_DAYS === 0) {
        updates.bioShields = (data.bioShields || 0) + 1;
        SynergyService.postAchievement(
          'nutrition',
          `¡Racha de ${newStreak} días! Has ganado un Bio-Escudo protector de regalo. 🛡️`,
          100
        );
      }

      const finalState = { ...data, ...updates };
      await updateDoc(userRef, updates as any);
      return finalState;
    }

    // Score is low. Determine if it needs protection or will break.
    return {
      ...data,
      currentStreak,
      needsProtection: score < 60 && currentStreak > 0 && data.lastScoreDate !== today
    };
  }

  static async purchaseShield(userId: string) {
    const userRef = doc(db, 'users', userId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return;

        const data = userDoc.data();
        const balance = data.ntkBalance || 0;

        if (balance < BioEconomy.COST_BIO_SHIELD) {
          throw new Error('Saldo insuficiente');
        }

        transaction.update(userRef, {
          ntkBalance: balance - BioEconomy.COST_BIO_SHIELD,
          bioShields: (data.bioShields || 0) + 1
        });

        // Log transaction
        const logRef = doc(collection(userRef, 'logs'));
        transaction.set(logRef, {
          type: 'purchase',
          title: 'BIO-ESCUDO ADQUIRIDO',
          value: -BioEconomy.COST_BIO_SHIELD,
          unit: 'NTK',
          reason: 'Protección de legado biológico',
          timestamp: serverTimestamp()
        });
      });
      return true;
    } catch (e) {
      console.error("[StreakService] Purchase failed:", e);
      return false;
    }
  }

  static async useShield(userId: string) {
    const userRef = doc(db, 'users', userId);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      if (!data || (data.bioShields || 0) <= 0) return false;

      await updateDoc(userRef, {
        bioShields: increment(-1),
        isProtected: true,
        lastScoreDate: today // Mark as processed for today
      });

      SynergyService.postAchievement(
        'focus',
        `Bio-Escudo activado. El legado biológico se mantiene intacto hoy. 🛡️✨`,
        0
      );
      
      return true;
    } catch (e) {
      console.error("[StreakService] Shield use failed:", e);
      return false;
    }
  }
}
