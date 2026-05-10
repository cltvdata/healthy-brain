import { db } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { SynergyService } from './SynergyService';

export class TorneoService {
  /**
   * Advances the tournament round by evaluating scores in brackets.
   */
  static async advanceTournament(tournamentId: string) {
    const tourneyRef = doc(db, 'tournaments', tournamentId);
    
    try {
      let winnerToReward: string | null = null;
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(tourneyRef);
        if (!snap.exists()) return;

        const data = snap.data();
        const { status, brackets } = data;

        if (status !== 'active') return;

        // Round 1 -> Round 2 (Cuartos -> Semis)
        if (brackets.round1.length === 8 && (brackets.round2?.length || 0) === 0) {
          const round2 = [];
          for (let i = 0; i < 8; i += 2) {
            const p1 = brackets.round1[i];
            const p2 = brackets.round1[i+1];
            // If scores are 0, we can't really advance fairly, but for simulation we just pick p1
            const winner = (p1.score >= p2.score) ? p1 : p2;
            round2.push({ id: winner.id, score: 0 }); 
          }
          transaction.update(tourneyRef, { 'brackets.round2': round2 });
          return;
        }

        // Round 2 -> Final (Semis -> Final)
        if (brackets.round2.length === 4 && (brackets.final?.length || 0) === 0) {
          const final = [];
          for (let i = 0; i < 4; i += 2) {
            const p1 = brackets.round2[i];
            const p2 = brackets.round2[i+1];
            const winner = (p1.score >= p2.score) ? p1 : p2;
            final.push({ id: winner.id, score: 0 });
          }
          transaction.update(tourneyRef, { 'brackets.final': final });
          return;
        }

        // Final Resolution
        if (brackets.final.length === 2 && status === 'active') {
          const p1 = brackets.final[0];
          const p2 = brackets.final[1];
          const winner = (p1.score >= p2.score) ? p1.id : p2.id;

          transaction.update(tourneyRef, { 
            status: 'completed',
            winnerId: winner,
            completedAt: serverTimestamp()
          });

          winnerToReward = winner;
        }
      });

      if (winnerToReward) {
        await SynergyService.rewardUser(winnerToReward, 1280, "Campeón del Bio-Grand Prix");
      }
    } catch (e) {
      console.error("[TorneoService] Error advancing tournament:", e);
    }
  }

  /**
   * Refreshes scores for all active participants to simulate daily activity.
   */
  static async refreshScores(tournamentId: string) {
    const tourneyRef = doc(db, 'tournaments', tournamentId);
    const snap = await getDoc(tourneyRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const brackets = { ...data.brackets };
    
    // Helper to randomize scores for a round
    const randomize = (round: any[]) => {
      return round.map(p => ({
        ...p,
        score: Math.floor(Math.random() * 40) + 50 // Simulate HRV between 50 and 90
      }));
    };

    if (brackets.final && brackets.final.length > 0) {
      brackets.final = randomize(brackets.final);
    } else if (brackets.round2 && brackets.round2.length > 0) {
      brackets.round2 = randomize(brackets.round2);
    } else if (brackets.round1 && brackets.round1.length > 0) {
      brackets.round1 = randomize(brackets.round1);
    }

    await updateDoc(tourneyRef, { brackets });
  }

  /**
   * Enrolls a user into a tournament, handling the entry fee and auto-filling bots if necessary.
   */
  static async enrollUser(userId: string, tournamentId: string, entryFee: number) {
    const userRef = doc(db, 'users', userId);
    const tourneyRef = doc(db, 'tournaments', tournamentId);
    const burnRef = doc(db, 'economy', 'burn_stats');

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const tourneySnap = await transaction.get(tourneyRef);

      if (!userSnap.exists() || !tourneySnap.exists()) throw new Error("Error de datos");
      const balance = userSnap.data().ntkBalance || 0;
      const currentParticipants = tourneySnap.data().participants || [];

      if (balance < entryFee) throw new Error(`NTK insuficiente (Costo: ${entryFee})`);
      if (currentParticipants.length >= 8) throw new Error("Torneo lleno");

      const burnAmount = entryFee * 0.20;

      transaction.update(userRef, { ntkBalance: increment(-entryFee) });
      transaction.set(burnRef, { totalBurned: increment(burnAmount) }, { merge: true });

      if (currentParticipants.length === 0) {
          const bots = ['BioBot_Alpha', 'BioBot_Beta', 'BioBot_Gamma', 'BioBot_Delta', 'BioBot_Epsilon', 'BioBot_Zeta', 'BioBot_Eta'];
          const allParticipants = [userId, ...bots];
          
          transaction.update(tourneyRef, { 
            participants: allParticipants,
            status: 'active',
            startedAt: serverTimestamp(),
            'brackets.round1': allParticipants.map(id => ({ 
              id, 
              score: Math.floor(Math.random() * 30) + 50 
            }))
          });
      } else {
          transaction.update(tourneyRef, { 
            participants: [...currentParticipants, userId] 
          });
      }
    });
  }
}
