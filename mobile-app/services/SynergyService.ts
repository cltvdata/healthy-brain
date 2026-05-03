import { db, auth } from '@/constants/FirebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { BioNotificationService } from './NotificationService';
import { BioEconomy } from '@/constants/BioEconomy';
import { runTransaction } from 'firebase/firestore';
import { SquadMiningService } from './SquadMiningService';

export type SynergyType = 'workout' | 'steps' | 'focus' | 'nutrition' | 'challenge';

export interface Synergy {
  id?: string;
  type: SynergyType;
  userId: string;
  userName: string;
  content: string;
  glows: number;
  glowers?: string[];
  rewardedNtk: number;
  isPrivate?: boolean;
  createdAt: any;
}

export interface BioUser {
  userName?: string;
  communityPrivacy?: boolean;
  synergyLevel?: number;
  glowStats?: {
    lastDate: string;
    count: number;
  };
  ntkBalance?: number;
  photoPrivacy?: 'public' | 'private';
  statsPrivacy?: 'public' | 'private';
}

export class SynergyService {
  static async postAchievement(type: SynergyType, content: string, reward: number) {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as BioUser | undefined;
      const isPrivate = userData?.communityPrivacy === false;

      const synergyData: Synergy = {
        type,
        userId: auth.currentUser.uid,
        userName: userData?.userName || 'Bio-Explorer',
        content,
        glows: 0,
        rewardedNtk: reward,
        isPrivate,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'sinergias'), synergyData);
      
      // If there's a reward, apply it centrally
      if (reward > 0) {
        await this.rewardUser(auth.currentUser.uid, reward, `Recompensa por logro: ${type}`);
      }
      
      await this.broadcastSynergyUpdate();
      
    } catch (e) {
      console.error("[SynergyService] Error posting achievement:", e);
    }
  }

  /**
   * Centralized method to reward users with NTK.
   * Ensures transaction-safe balance updates and logging.
   */
  static async rewardUser(userId: string, amount: number, reason: string) {
    const userRef = doc(db, 'users', userId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return;
        
        const data = userDoc.data() as BioUser;
        let finalAmount = amount;

        // Multiplier Logic (Digital Boosts)
        if (data.activeBoost && data.activeBoost.expiresAt > Date.now()) {
          console.log(`[SynergyService] Active Boost Detected: ${data.activeBoost.title} (${data.activeBoost.multiplier}x)`);
          finalAmount = Math.round(finalAmount * data.activeBoost.multiplier);
        }

        const currentBalance = data.ntkBalance || 0;
        const newBalance = currentBalance + finalAmount;
        
        transaction.update(userRef, { 
          ntkBalance: newBalance 
        });

        // Add to history log
        const logRef = doc(collection(userRef, 'logs'));
        transaction.set(logRef, {
          type: 'reward',
          title: 'RECOMPENSA BIOLÓGICA',
          value: amount,
          unit: 'NTK',
          reason: reason,
          timestamp: serverTimestamp()
        });
      });

      // Sync to squad mining
      await SquadMiningService.syncMemberPoints(userId, amount);
      
      console.log(`[SynergyService] Rewards applied: +${amount} NTK to ${userId} (${reason})`);
    } catch (e) {
      console.error("[SynergyService] Error in rewardUser:", e);
    }
  }

  /**
   * Placeholder for future cross-device or local broadcasts
   */
  static async broadcastSynergyUpdate() {
    console.log("[SynergyService] Broadcasting synergy refresh event.");
    // Implementation: could trigger a local event listener if needed
  }

  static getFeed(callback: (sinergias: Synergy[]) => void) {
    const q = query(
      collection(db, 'sinergias'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const sinergias = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Synergy));
      // Filtramos las privadas en el cliente para redundancia (debería haber reglas de seguridad tmb)
      callback(sinergias.filter(s => !s.isPrivate));
    });
  }

  static async toggleGlow(sinergiaId: string, targetUserId: string) {
    if (!auth.currentUser) return;
    const currentUserId = auth.currentUser.uid;

    // 1. Prevent Self-Glow (Anti-Fraud)
    if (currentUserId === targetUserId) {
      console.warn("[SynergyService] Anti-Fraud: Self-glow blocked.");
      return;
    }

    try {
      const sinergiaRef = doc(db, 'sinergias', sinergiaId);
      const sinergiaSnap = await getDoc(sinergiaRef);
      
      if (!sinergiaSnap.exists()) return;
      const data = sinergiaSnap.data();
      const glowers: string[] = data.glowers || [];

      // 2. Prevent Duplicate Glows (Unique Glower Policy)
      if (glowers.includes(currentUserId)) {
        console.warn("[SynergyService] User already glowed this post.");
        return;
      }

      // 3. Daily Limit Check (Gov Governance)
      const userRef = doc(db, 'users', currentUserId);
      const userSnap = await getDoc(userRef);
      const today = new Date().toISOString().split('T')[0];
      const stats = userSnap.data()?.glowStats || {};
      
      if (stats.lastDate === today && stats.count >= BioEconomy.MAX_DAILY_GLOWS_GIVEN) {
        console.warn("[SynergyService] Daily limit reached.");
        return;
      }

      // Execute Update (The Post itself)
      await updateDoc(sinergiaRef, {
        glows: increment(1),
        glowers: arrayUnion(currentUserId)
      });

      // Update Giver Stats (Limits)
      await updateDoc(userRef, {
        'glowStats.lastDate': today,
        'glowStats.count': stats.lastDate === today ? increment(1) : 1
      });

      // REWARDS: Give NTK to both participants
      await this.rewardUser(currentUserId, BioEconomy.REWARD_LIKE_GIVEN, "Diste un Glow en la comunidad");
      await this.rewardUser(targetUserId, BioEconomy.REWARD_LIKE_RECEIVED, "Recibiste un Glow por tu actividad");

      // Queue In-App Notification
      await BioNotificationService.queueInAppMessage(
        targetUserId, 
        'glow', 
        `Tu comunidad te ha dado un Glow (+1). ¡Has ganado ${BioEconomy.REWARD_LIKE_RECEIVED} NTK!`
      );

      // Notify of interaction sync
      await this.broadcastSynergyUpdate();
    } catch (e) {
      console.error("[SynergyService] Error toggling glow:", e);
    }
  }
}
