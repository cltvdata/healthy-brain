import { auth, db } from '@/constants/FirebaseConfig';
import { auth, db } from '@/constants/FirebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export interface BioReport {
  userName: string;
  bioScore: number;
  metabolicAge: number;
  totalNtk: number;
  resilienceLevel: 'Alfa' | 'Beta' | 'Estable';
  activityConsistency: number; // 0-100
  certDate: string;
}

export class ReportGenerator {
  static async sysnthesizeUserStatus(): Promise<BioReport | null> {
    if (!auth.currentUser) return null;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) return null;
      
      const userData = snap.data();
      const hrv = userData.hrv || 50;

      // Calculate Real Consistency from Logs (Last 7 Days)
      const logsRef = collection(userRef, 'logs');
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const q = query(logsRef, where('timestamp', '>=', sevenDaysAgo), orderBy('timestamp', 'desc'));
      const logsSnap = await getDocs(q);
      
      const activeDays = new Set();
      logsSnap.forEach(doc => {
        const ts = doc.data().timestamp;
        if (ts) activeDays.add(new Date(ts.seconds * 1000).toDateString());
      });

      const consistency = Math.round((activeDays.size / 7) * 100);
      const bioScore = Math.min(100, Math.round((hrv * 0.6) + (consistency * 0.4)));
      
      return {
        userName: userData.userName || 'Bio-Explorer',
        bioScore: bioScore,
        metabolicAge: userData.metabolicAge || (userData.age || 30),
        totalNtk: userData.ntkBalance || 0,
        resilienceLevel: hrv > 70 ? 'Alfa' : (hrv > 50 ? 'Beta' : 'Estable'),
        activityConsistency: consistency,
        certDate: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    } catch (e) {
      console.error("[ReportGenerator] Error synthesizing status:", e);
      return null;
    }
  }

  static getPillarGrade(pillar: 'resilience' | 'activity' | 'nutrition'): string {
    // In production, analyze real history datasets
    return 'A+';
  }
}
