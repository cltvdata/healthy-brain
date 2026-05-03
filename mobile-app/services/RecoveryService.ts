import { db, auth } from '@/constants/FirebaseConfig';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { ExercisesDB } from '@/constants/ExercisesDB';
import { NativeHealthService } from './NativeHealthService';

export interface MuscleState {
  id: string;
  name: string;
  recoveryPercentage: number;
  timeRemainingH: number;
  status: 'recovered' | 'recovering' | 'fatigued';
}

export const MUSCLE_GROUPS = [
  { id: 'chest_upper', name: 'Pectoral Superior' },
  { id: 'chest_lower', name: 'Pectoral Inferior' },
  { id: 'back_lats', name: 'Dorsal Ancho' },
  { id: 'back_lower', name: 'Espalda Baja' },
  { id: 'shoulders_front', name: 'Hombro Frontal' },
  { id: 'shoulders_side', name: 'Hombro Lateral' },
  { id: 'shoulders_rear', name: 'Hombro Posterior' },
  { id: 'quads', name: 'Cuádriceps' },
  { id: 'hamstrings', name: 'Isquiotibiales' },
  { id: 'glutes', name: 'Glúteos' },
  { id: 'calves', name: 'Pantorrillas' },
  { id: 'biceps', name: 'Bíceps' },
  { id: 'triceps', name: 'Tríceps' },
  { id: 'abs', name: 'Abdominales' },
  { id: 'forearms', name: 'Antebrazos' }
];

const BASE_RECOVERY_H = 48;

export class RecoveryService {
  /**
   * Calculates the current state of all muscle groups based on the last 7 days of logs.
   */
  static async getMuscleRecoveryState(): Promise<MuscleState[]> {
    if (!auth.currentUser) return MUSCLE_GROUPS.map(m => this.getInitialState(m));
    const userId = auth.currentUser.uid;

    try {
      // 1. Fetch recent workout logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const logsRef = collection(db, 'users', userId, 'logs');
      const q = query(
        logsRef,
        where('type', '==', 'workout'),
        where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const workouts = snapshot.docs.map(doc => doc.data());

      // 2. Fetch Health Context (Sleep/Stress)
      const healthData = await NativeHealthService.fetchLatestMetrics();
      const sleepFactor = this.calculateSleepFactor(healthData?.sleepHours || 8);
      const stressFactor = this.calculateStressFactor(healthData?.hrv || 70);

      // 3. Process Fatigue per Muscle
      const fatigueMap: Record<string, { lastWork: number; totalLoad: number }> = {};
      
      workouts.forEach(workout => {
        const timestamp = workout.timestamp?.toDate().getTime() || Date.now();
        const exercises = workout.exercises || [];
        
        exercises.forEach((ex: any) => {
          const meta = ExercisesDB[ex.name];
          if (!meta) return;

          const load = this.calculateExerciseLoad(ex);
          const affectedMuscles = [...meta.primaryMuscles, ...meta.secondaryMuscles];

          affectedMuscles.forEach(mId => {
            if (!fatigueMap[mId] || fatigueMap[mId].lastWork < timestamp) {
              fatigueMap[mId] = { 
                lastWork: timestamp, 
                totalLoad: (fatigueMap[mId]?.totalLoad || 0) + load 
              };
            }
          });
        });
      });

      // 4. Generate Final States with Decay
      const now = Date.now();
      return MUSCLE_GROUPS.map(muscle => {
        const data = fatigueMap[muscle.id];
        if (!data) return this.getInitialState(muscle);

        const hoursSince = (now - data.lastWork) / (1000 * 60 * 60);
        const recoveryAdjustedH = BASE_RECOVERY_H * sleepFactor * stressFactor;
        
        // Linear Recovery Calculation
        let recoveryProgress = hoursSince / recoveryAdjustedH;
        if (recoveryProgress > 1) recoveryProgress = 1;

        const percentage = Math.round(recoveryProgress * 100);
        const remainingH = Math.max(0, recoveryAdjustedH - hoursSince);

        return {
          id: muscle.id,
          name: muscle.name,
          recoveryPercentage: percentage,
          timeRemainingH: Math.round(remainingH),
          status: percentage === 100 ? 'recovered' : percentage > 60 ? 'recovering' : 'fatigued'
        };
      });

    } catch (e) {
      console.error("[RecoveryService] Error calculating recovery:", e);
      return MUSCLE_GROUPS.map(m => this.getInitialState(m));
    }
  }

  private static getInitialState(muscle: { id: string; name: string }): MuscleState {
    return {
      id: muscle.id,
      name: muscle.name,
      recoveryPercentage: 100,
      timeRemainingH: 0,
      status: 'recovered'
    };
  }

  private static calculateExerciseLoad(ex: any): number {
    // Volume = Sets * Reps * RPE (if available) * Weight
    // We normalize this to a "Fatigue Score"
    let totalVolume = 0;
    ex.sets?.forEach((s: any) => {
      const reps = parseInt(s.reps) || 0;
      const rpe = parseInt(s.rpe) || 7;
      totalVolume += reps * (rpe / 10);
    });
    return totalVolume;
  }

  private static calculateSleepFactor(hours: number): number {
    if (hours >= 8) return 0.9;  // 10% faster recovery
    if (hours >= 7) return 1.0;  // Normal
    if (hours >= 6) return 1.25; // 25% slower
    return 1.5;                  // 50% slower
  }

  private static calculateStressFactor(hrv: number): number {
    // HRV below 50 indicates high stress for most active adults
    if (hrv > 80) return 0.9;
    if (hrv > 60) return 1.0;
    if (hrv > 40) return 1.2;
    return 1.4;
  }
}
