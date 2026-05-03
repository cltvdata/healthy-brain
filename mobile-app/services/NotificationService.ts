import { AppState, AppStateStatus } from 'react-native';
import { BioBannerRef } from '@/components/BioBanner';
import { db } from '@/constants/FirebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp, writeBatch, orderBy, limit, getDoc } from 'firebase/firestore';
import { BioForecasting } from './BioForecasting';

export interface BioNotification {
  id?: string;
  userId: string;
  type: 'info' | 'warning' | 'reward' | 'glow' | 'mentor';
  message: string;
  read: boolean;
  createdAt: any;
}

export class BioNotificationService {
  private static bannerRef: BioBannerRef | null = null;
  private static currentAppState: AppStateStatus = AppState.currentState;

  static init() {
    AppState.addEventListener('change', nextAppState => {
      this.currentAppState = nextAppState;
      console.log(`[BioNotificationService] AppState changed to: ${nextAppState}`);
    });
  }

  static setBannerRef(ref: BioBannerRef | null) {
    this.bannerRef = ref;
  }

  /**
   * Generic trigger for the subtle banner.
   */
  static notify(message: string, type: 'info' | 'warning' | 'reward' = 'info') {
    // Non-Intrusive Logic: Only show banner if app is active
    if (this.currentAppState === 'active' && this.bannerRef) {
      this.bannerRef.show(message, type);
    } else {
      console.log("[BioNotificationService] Silent Delivery (Background):", message);
      // Critical warnings might still want to trigger a push, but we queue for Bio-Briefing by default
    }
  }

  /**
   * Complex context analysis for bio-alerts.
   */
  static analyzeBioContext(hrv: number, score: number, ntk: number) {
    // Priority 1: Health Warning
    if (hrv < 40) {
      this.notify("HRV Crítico: Tu sistema está bajo estrés. ¡Inicia Sesión de Enfoque!", "warning");
      return;
    }

    // Priority 2: Gamification / NTK
    if (ntk > 100 && Math.random() > 0.8) {
      this.notify("Tienes tokens acumulados. ¿Quieres desbloquear un Bio-Hito?", "reward");
      return;
    }

    // Priority 3: Random Bio-Tip
    const tips = [
      "La luz azul reduce tu melatonina. Activa el modo Bio-Shield.",
      "Mañana será un día de alto rendimiento según tu histórico de HRV.",
      "Has mantenido una sinergia perfecta los últimos 3 días."
    ];
    if (Math.random() > 0.95) {
      this.notify(tips[Math.floor(Math.random() * tips.length)], "info");
    }
  }

  static notifyGlobalRanking(rank: number) {
    this.notify(`¡Escalaste posiciones! Ahora eres el #${rank} en la Liga Bio-Elite. 🏆`, "reward");
  }

  // --- New Methods for BioBriefing & Synergy ---

  static async getUnreadForBriefing(userId: string): Promise<BioNotification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BioNotification));
    } catch (e) {
      console.error("[BioNotificationService] Error fetching unread:", e);
      return [];
    }
  }

  static async markAllAsRead(userId: string, ids: string[]) {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const ref = doc(db, 'notifications', id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error("[BioNotificationService] Error marking as read:", e);
    }
  }

  static async queueInAppMessage(userId: string, type: BioNotification['type'], message: string) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        message,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("[BioNotificationService] Error queuing message:", e);
    }
  }

  /**
   * Generates a proactive briefing based on predictive data.
   */
  static async generateMorningBriefing(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const trends = await BioForecasting.analyzeTrends(userId);
      const insight = BioForecasting.getInsight(
        userData.bioScore || 50,
        (userData.metabolicAge || 30) - (userData.age || 30),
        trends.hrvTrend
      );

      const briefing = `☀️ BIO-BRIEFING: Tu HRV ha mostrado una tendencia de ${trends.hrvTrend > 0 ? 'mejora' : 'descenso'} (${trends.hrvTrend}). ${insight}`;
      
      await this.queueInAppMessage(userId, 'mentor', briefing);
      this.notify("Tu Bio-Briefing matutino está listo.", "info");
      
    } catch (e) {
      console.error("[BioNotificationService] Error generating briefing:", e);
    }
  }
}

