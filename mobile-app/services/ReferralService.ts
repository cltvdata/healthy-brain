import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment, runTransaction, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { BioEconomy } from '@/constants/BioEconomy';
import { SynergyService } from './SynergyService';

export interface ReferralStats {
  totalReferrals: number;
  activeSovereigns: number;
  availableCredits: number;
}

export class ReferralService {
  /**
   * Processes a successful purchase from a referred user.
   * Grants the inviter a discount credit.
   */
  static async processSaleCommission(referredUserId: string) {
    try {
      const userRef = doc(db, 'users', referredUserId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const inviterId = data.referredBy;

      if (inviterId) {
        const inviterRef = doc(db, 'users', inviterId);
        await updateDoc(inviterRef, {
          referralCredits: increment(BioEconomy.REFERRAL_CREDIT_USD),
          activeSovereigns: increment(1)
        });

        // Notify inviter via Synergy
        SynergyService.postAchievement(
          'discovery',
          `¡Tu legado se expande! Un amigo ha alcanzado la Soberanía. Has ganado $${BioEconomy.REFERRAL_CREDIT_USD} de crédito para tu próximo pago. 🛡️✨`,
          50 // Bonus NTK for the news
        );
      }
    } catch (e) {
      console.error("[ReferralService] Failed to process commission:", e);
    }
  }

  /**
   * Returns current referral status for a user.
   */
  static async getReferralStats(userId: string): Promise<ReferralStats> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { totalReferrals: 0, activeSovereigns: 0, availableCredits: 0 };
    
    const data = snap.data();
    return {
      totalReferrals: data.totalReferrals || 0,
      activeSovereigns: data.activeSovereigns || 0,
      availableCredits: data.referralCredits || 0
    };
  }

  /**
   * Validates and applies a referral code for a new user.
   */
  static async applyReferral(newUserId: string, code: string) {
    if (!code) return false;

    try {
      const q = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase().trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) return false;

      const inviterDoc = snap.docs[0];
      if (inviterDoc.id === newUserId) return false; // Self-referral protection

      // [FRAUD-PROTECTION] Check if user is already referred
      const newUserRef = doc(db, 'users', newUserId);
      const newUserSnap = await getDoc(newUserRef);
      if (newUserSnap.exists() && newUserSnap.data().referredBy) {
        return false; // Already referred, cannot claim again
      }

      await runTransaction(db, async (transaction) => {
        const newUserRef = doc(db, 'users', newUserId);
        const inviterRef = doc(db, 'users', inviterDoc.id);

        transaction.update(newUserRef, {
          referredBy: inviterDoc.id,
          ntkBalance: increment(BioEconomy.INVITED_BONUS_FIXED)
        });

        transaction.update(inviterRef, {
          ntkBalance: increment(BioEconomy.REFERRAL_BONUS_FIXED),
          totalReferrals: increment(1)
        });
      });

      return true;
    } catch (e) {
      console.error("[ReferralService] Error applying referral:", e);
      return false;
    }
  }
}
