import { auth, db } from '@/constants/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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
      
      const data = snap.data();
      const hrv = data.hrv || 50;
      
      return {
        userName: data.userName || 'Bio-Explorer',
        bioScore: data.bioScore || 0,
        metabolicAge: data.metabolicAge || (data.age || 30),
        totalNtk: data.ntkBalance || 0,
        resilienceLevel: hrv > 70 ? 'Alfa' : (hrv > 50 ? 'Beta' : 'Estable'),
        activityConsistency: data.steps > 8000 ? 95 : 70,
        certDate: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static getPillarGrade(pillar: 'resilience' | 'activity' | 'nutrition'): string {
    // In production, analyze real history datasets
    return 'A+';
  }
}
