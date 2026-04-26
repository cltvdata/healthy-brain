import { db, auth } from '@/constants/FirebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { BioNotificationService } from './NotificationService';

export type SynergyType = 'workout' | 'steps' | 'focus' | 'nutrition';

export interface Synergy {
  id?: string;
  type: SynergyType;
  userId: string;
  userName: string;
  content: string;
  glows: number;
  rewardedNtk: number;
  isPrivate?: boolean;
  createdAt: any;
}

export class SynergyService {
  static async postAchievement(type: SynergyType, content: string, reward: number) {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const isPrivate = userSnap.exists() ? userSnap.data().compartirSinergias === false : false;

      const synergyData: Synergy = {
        type,
        userId: auth.currentUser.uid,
        userName: userSnap.exists() ? userSnap.data().userName || 'Bio-Explorer' : 'Bio-Explorer',
        content,
        glows: 0,
        rewardedNtk: reward,
        isPrivate,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'sinergias'), synergyData);
      
    } catch (e) {
      console.error("[SynergyService] Error posting achievement:", e);
    }
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
    try {
      const sinergiaRef = doc(db, 'sinergias', sinergiaId);
      await updateDoc(sinergiaRef, {
        glows: increment(1)
      });

      // Queue In-App Notification for the owner if it's not the current user
      if (auth.currentUser && targetUserId !== auth.currentUser.uid) {
        await BioNotificationService.queueInAppMessage(
          targetUserId, 
          'glow', 
          `Tu comunidad te ha dado un Glow (+1) por tu actividad biológica reciente.`
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
}
