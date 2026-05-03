import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment, collection, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';
import { BioEconomy } from '@/constants/BioEconomy';
import { BioForecasting } from './BioForecasting';

export class SquadMiningService {
  /**
   * Syncs individual NTK rewards to the user's squad total.
   */
  static async syncMemberPoints(userId: string, points: number) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const squadId = userSnap.data()?.squadId;

      if (!squadId) return;

      const squadRef = doc(db, 'squads', squadId);
      await updateDoc(squadRef, {
        totalPoints: increment(points)
      });

      console.log(`[SquadMining] Synced ${points} NTK to Squad ${squadId}`);
    } catch (e) {
      console.error("[SquadMining] Error syncing points:", e);
    }
  }

  /**
   * Recalculates the average HRV of a squad based on member data.
   */
  static async calculateSquadHrv(squadId: string) {
    try {
      const squadRef = doc(db, 'squads', squadId);
      const squadSnap = await getDoc(squadRef);
      if (!squadSnap.exists()) return;

      const members: string[] = squadSnap.data().members || [];
      if (members.length === 0) return;

      // Optimization: Fetch all members in one query (max 30 per 'in' clause)
      // For very large squads, this would need chunking
      const membersToFetch = members.slice(0, 30);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', membersToFetch));
      const querySnap = await getDocs(q);

      let totalHrv = 0;
      let count = 0;

      querySnap.forEach((mSnap) => {
        totalHrv += mSnap.data().hrv || 50;
        count++;
      });

      const avgHrv = count > 0 ? Math.round(totalHrv / count) : 0;
      await updateDoc(squadRef, { avgHrv });

    } catch (e) {
      console.error("[SquadMining] Error calculating HRV:", e);
    }
  }

  /**
   * Recalculates the biological trend and caches it for the global ranking.
   */
  static async refreshUserTrend(userId: string) {
    try {
      const trends = await BioForecasting.analyzeTrends(userId);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        currentTrend: trends.hrvTrend
      });
      console.log(`[SquadMining] Trend refreshed for ${userId}: ${trends.hrvTrend}`);
    } catch (e) {
      console.error("[SquadMining] Trend refresh error:", e);
    }
  }
}
