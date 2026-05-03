import { RecoveryService, MuscleState } from './RecoveryService';
import { NativeHealthService, BioMetrics } from './NativeHealthService';
import { ExercisesDB, ExerciseMetadata } from '@/constants/ExercisesDB';

export interface BioRecommendation {
  readinessScore: number;
  status: 'OPTIMAL' | 'MODERATE' | 'REST_ADVISED';
  primaryAdvise: string;
  suggestedExercises: ExerciseMetadata[];
  bioNotes: string[];
}

export class BioIntelligenceService {
  /**
   * Evaluates the user's total biological state to provide a daily training recommendation.
   */
  static async getDailyRecommendation(): Promise<BioRecommendation> {
    try {
      const muscleStates = await RecoveryService.getMuscleRecoveryState();
      const healthData = await NativeHealthService.fetchLatestMetrics();
      
      // 1. Calculate Readiness Score (0-100)
      // Muscle avg (50%) + HRV (30%) + Sleep (20%)
      const avgMuscleRecovery = muscleStates.reduce((acc, m) => acc + m.recoveryPercentage, 0) / muscleStates.length;
      const hrvScore = this.mapHrvToScore(healthData?.hrv || 70);
      const sleepScore = this.mapSleepToScore(healthData?.sleepHours || 8);
      
      const readinessScore = Math.round(
        (avgMuscleRecovery * 0.5) + (hrvScore * 0.3) + (sleepScore * 0.2)
      );

      // 2. Determine Status and Advice
      let status: BioRecommendation['status'] = 'MODERATE';
      let primaryAdvise = '';
      const bioNotes: string[] = [];

      if (readinessScore > 85) {
        status = 'OPTIMAL';
        primaryAdvise = "Soberanía Hormonal Confirmada. Protocolo de alta intensidad autorizado.";
        bioNotes.push("SNC totalmente recuperado.");
      } else if (readinessScore > 60) {
        status = 'MODERATE';
        primaryAdvise = "Estado Biológico Estable. Recomendamos enfoque en técnica y volumen moderado.";
        if (sleepScore < 70) bioNotes.push("Sueño subóptimo: Vigila los tiempos de reacción.");
      } else {
        status = 'REST_ADVISED';
        primaryAdvise = "Estado de Alerta Catabólica. Sugerimos descanso total o sesión de movilidad ligera.";
        bioNotes.push("Fatiga sistémica detectada. Prioriza la hidratación y el sueño.");
      }

      // 3. Select Suggested Exercises
      // Rules: 
      // - Must have primary muscles > 85% recovered
      // - Limit to 4 suggestions
      const suggestions: ExerciseMetadata[] = [];
      const sortedMuscles = [...muscleStates].sort((a, b) => b.recoveryPercentage - a.recoveryPercentage);
      
      // Get the top 3 recovered muscles
      const topMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
      
      Object.values(ExercisesDB).forEach(ex => {
        if (suggestions.length >= 4) return;
        
        // If the primary muscle is in the top recovered list
        const isOptimal = ex.primaryMuscles.every(mId => {
          const mState = muscleStates.find(ms => ms.id === mId);
          return (mState?.recoveryPercentage || 0) > 85;
        });

        if (isOptimal) suggestions.push(ex);
      });

      return {
        readinessScore,
        status,
        primaryAdvise,
        suggestedExercises: suggestions,
        bioNotes
      };

    } catch (e) {
      console.error("[BioIntelligenceService] Calculation error:", e);
      return {
        readinessScore: 50,
        status: 'MODERATE',
        primaryAdvise: "Analizando integridad biológica...",
        suggestedExercises: [],
        bioNotes: []
      };
    }
  }

  private static mapHrvToScore(hrv: number): number {
    if (hrv > 80) return 100;
    if (hrv > 60) return 80;
    if (hrv > 40) return 50;
    return 20;
  }

  private static mapSleepToScore(hours: number): number {
    if (hours >= 8) return 100;
    if (hours >= 7) return 80;
    if (hours >= 6) return 60;
    return 30;
  }
}
