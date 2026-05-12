import { db, auth, storage } from '@/constants/FirebaseConfig';
import { doc, updateDoc, increment, getDoc, collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface BioTwinProgress {
  id?: string;
  date: Date;
  photoUrl: string;
  weight?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  bioScore?: number;
  notes?: string;
}

export interface BioTwinStats {
  totalPhotos: number;
  daysSinceStart: number;
  currentStreak: number;
  totalWeightChange?: number;
  lastUpdate: Date | null;
  achievements: string[];
}

export class BioTwinService {
  static async uploadAndCreateTwin(photoUri: string, additionalData?: {
    weight?: number;
    measurements?: BioTwinProgress['measurements'];
    notes?: string;
  }): Promise<string | null> {
    if (!auth.currentUser) return null;

    try {
      const userId = auth.currentUser.uid;
      
      // Subir imagen a Firebase Storage
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `bio_twins/${userId}/${Date.now()}.jpg`);
      
      await uploadBytes(storageRef, blob);
      const photoUrl = await getDownloadURL(storageRef);

      // Guardar registro en Firestore
      const twinRef = await addDoc(collection(db, 'users', userId, 'bio_twin_progress'), {
        photoUrl,
        date: serverTimestamp(),
        weight: additionalData?.weight || null,
        measurements: additionalData?.measurements || null,
        notes: additionalData?.notes || null,
        bioScore: null,
        createdAt: serverTimestamp()
      });

      // Actualizar usuario con foto actual
      await updateDoc(doc(db, 'users', userId), {
        latestTwinPhoto: photoUrl,
        twinGenerated: true,
        twinLastUpdate: serverTimestamp(),
        twinCount: increment(1)
      });

      // Verificar logros de Gemelo IA
      await this.checkTwinAchievements();

      return twinRef.id;
    } catch (error) {
      console.error("Error uploading twin:", error);
      return null;
    }
  }

  static async updateTwinWithNewPhoto(photoUri: string, newData?: {
    weight?: number;
    measurements?: BioTwinProgress['measurements'];
    notes?: string;
  }): Promise<boolean> {
    if (!auth.currentUser) return false;

    try {
      const userId = auth.currentUser.uid;
      
      // Subir nueva imagen
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `bio_twins/${userId}/${Date.now()}.jpg`);
      
      await uploadBytes(storageRef, blob);
      const photoUrl = await getDownloadURL(storageRef);

      // Guardar nuevo registro
      await addDoc(collection(db, 'users', userId, 'bio_twin_progress'), {
        photoUrl,
        date: serverTimestamp(),
        weight: newData?.weight || null,
        measurements: newData?.measurements || null,
        notes: newData?.notes || null,
        bioScore: null,
        createdAt: serverTimestamp()
      });

      // Actualizar latest photo
      await updateDoc(doc(db, 'users', userId), {
        latestTwinPhoto: photoUrl,
        twinLastUpdate: serverTimestamp(),
        twinCount: increment(1)
      });

      // Verificar logros
      await this.checkTwinAchievements();

      return true;
    } catch (error) {
      console.error("Error updating twin:", error);
      return false;
    }
  }

  static async getTwinHistory(limitCount: number = 10): Promise<BioTwinProgress[]> {
    if (!auth.currentUser) return [];

    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'users', userId, 'bio_twin_progress'),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      // Esta función requeriría implementación de Firestore para devolver los datos
      // Por ahora retornamos array vacío
      return [];
    } catch (error) {
      console.error("Error getting twin history:", error);
      return [];
    }
  }

  static async getTwinStats(): Promise<BioTwinStats> {
    if (!auth.currentUser) {
      return { totalPhotos: 0, daysSinceStart: 0, currentStreak: 0, lastUpdate: null, achievements: [] };
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const data = userDoc.data();

      const firstTwinDate = data?.firstTwinDate?.toDate();
      const daysSinceStart = firstTwinDate 
        ? Math.floor((Date.now() - firstTwinDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        totalPhotos: data?.twinCount || 0,
        daysSinceStart,
        currentStreak: data?.twinStreak || 0,
        totalWeightChange: data?.totalWeightChange,
        lastUpdate: data?.twinLastUpdate?.toDate() || null,
        achievements: data?.twinAchievements || []
      };
    } catch (error) {
      console.error("Error getting twin stats:", error);
      return { totalPhotos: 0, daysSinceStart: 0, currentStreak: 0, lastUpdate: null, achievements: [] };
    }
  }

  static async checkTwinAchievements() {
    if (!auth.currentUser) return;

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const twinCount = userDoc.data()?.twinCount || 0;
    const achievements = userDoc.data()?.twinAchievements || [];

    const twinAchievements = [
      { id: 'twin_first', required: 1, reward: 50, title: 'Primer Escaneo', desc: 'Tu gemelo ha nacido' },
      { id: 'twin_5', required: 5, reward: 100, title: 'Seguimiento Inicial', desc: '5 fotos de evolución' },
      { id: 'twin_10', required: 10, reward: 200, title: 'Documentación Serial', desc: '10 fotos de evolución' },
      { id: 'twin_30', required: 30, reward: 500, title: 'Compromiso Total', desc: '30 días documentando tu cambio' },
    ];

    for (const ach of twinAchievements) {
      if (twinCount >= ach.required && !achievements.includes(ach.id)) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          twinAchievements: [...achievements, ach.id],
          ntkBalance: increment(ach.reward)
        });
      }
    }
  }

  static generateEvolutionInsight(stats: BioTwinStats): string {
    if (stats.totalPhotos === 0) {
      return "📸 Sube tu primera foto del Gemelo IA para comenzar a trackear tu evolución física.";
    }
    
    if (stats.totalPhotos < 3) {
      return "🌱 Has iniciado tu viaje. Continúa subiendo fotos semanalmente para ver tendencias.";
    }
    
    if (stats.daysSinceStart > 30 && stats.totalPhotos > 15) {
      return "🔥 ¡Excelente documentación! Tienes suficientes datos para analizar tu transformación física.";
    }
    
    return `📊 Llevas ${stats.totalPhotos} fotos en ${stats.daysSinceStart} días. Mantén la consistencia para mejores análisis.`;
  }

  static getNextMilestone(currentPhotos: number): { target: number, reward: number, title: string } {
    const milestones = [
      { target: 1, reward: 50, title: 'Primer Gemelo' },
      { target: 5, reward: 100, title: 'Seguimiento Semanal' },
      { target: 10, reward: 200, title: 'Documentación Completa' },
      { target: 30, reward: 500, title: 'Transformación Total' },
    ];

    for (const milestone of milestones) {
      if (currentPhotos < milestone.target) {
        return milestone;
      }
    }

    return { target: 30, reward: 500, title: 'Transformación Total' };
  }
}