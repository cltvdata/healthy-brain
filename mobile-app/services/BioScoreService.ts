import { BioMetrics } from './NativeHealthService';

export interface BioImpactReport {
  score: number;
  recoveryStatus: 'Optimal' | 'Stable' | 'Recovering' | 'Critical';
  recommendation: string;
  breakdown: {
    sleep: number;
    activity: number;
    hrv: number;
  };
}

export class BioScoreService {
  /**
   * Calculates the overall Biological Soberignty Score.
   * Formula: 40% Sleep + 30% HRV + 30% Activity
   */
  static calculateScore(metrics: BioMetrics, stepGoal: number = 8000): BioImpactReport {
    // 1. Sleep Score (40%)
    // Ideal: > 7 hours total AND > 20% Deep Sleep
    const sleepQuantityScore = Math.min((metrics.sleepHours / 7) * 100, 100);
    const deepRatio = metrics.sleepStages.deepMinutes / (metrics.sleepHours * 60 || 1);
    const sleepQualityScore = Math.min((deepRatio / 0.2) * 100, 100);
    const totalSleepScore = (sleepQuantityScore * 0.4) + (sleepQualityScore * 0.6);

    // 2. HRV Score (30%)
    // Normalizing HRV (Assuming 80+ is peak for CNS)
    const hrvScore = Math.min((metrics.hrv / 80) * 100, 100);

    // 3. Activity Score (30%)
    const activityScore = Math.min((metrics.steps / stepGoal) * 100, 100);

    // Weighted Final Score
    const finalScore = Math.round(
      (totalSleepScore * 0.4) + 
      (hrvScore * 0.3) + 
      (activityScore * 0.3)
    );

    // CNS Recovery Logic
    let status: BioImpactReport['recoveryStatus'] = 'Optimal';
    let recommendation = "Tu sistema nervioso está listo para máximo rendimiento.";

    if (finalScore < 85) {
      status = 'Stable';
      recommendation = "Buen balance. Mantente hidratado para sostener la energía.";
    }
    if (finalScore < 70 || metrics.hrv < 50) {
      status = 'Recovering';
      recommendation = "Carga CNS detectada. Reduce la intensidad del entrenamiento.";
    }
    if (finalScore < 50 || metrics.sleepHours < 5) {
      status = 'Critical';
      recommendation = "Prioridad: REGENERACIÓN. Evita cafeína y prioriza descanso profundo.";
    }

    return {
      score: finalScore,
      recoveryStatus: status,
      recommendation,
      breakdown: {
        sleep: Math.round(totalSleepScore),
        activity: Math.round(activityScore),
        hrv: Math.round(hrvScore)
      }
    };
  /**
   * Identifies biological risks by analyzing current trends vs 7-day baseline.
   */
  static detectBiometricRisks(current: BioMetrics, history: BioMetrics[]) {
    if (history.length < 3) return null;

    const avgHrv = history.reduce((sum, h) => sum + h.hrv, 0) / history.length;
    const avgDeepSleep = history.reduce((sum, h) => sum + h.sleepStages.deepMinutes, 0) / history.length;

    const risks = [];

    // CNS Fatigue Filter (HRV < 85% of baseline)
    if (current.hrv < avgHrv * 0.85) {
      risks.push({
        type: 'CNS_FATIGUE',
        severity: 'high',
        message: 'Tu Sistema Nervioso Central muestra signos de fatiga acumulada.',
        recommendation: 'Inicia protocolo de respiración vagal y reduce intensidad física hoy.'
      });
    }

    // Regeneration Deficit (Deep Sleep < 70% of baseline)
    if (current.sleepStages.deepMinutes < avgDeepSleep * 0.7) {
      risks.push({
        type: 'RECOV_DEFICIT',
        severity: 'medium',
        message: 'Déficit severo de sueño regenerativo detectado.',
        recommendation: 'Prioriza la higiene del sueño y evita el uso de pantallas azules 2h antes de dormir.'
      });
    }

    return risks.length > 0 ? risks : null;
  }

  /**
   * Calculates stability based on variance across 7 days.
   */
  static calculateWeeklyStability(history: BioMetrics[]) {
    if (history.length < 5) return null;

    const scores = history.map(h => this.calculateScore(h).score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Standard Deviation formula
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Stability Index (100 is perfect stability)
    const stability = Math.max(0, 100 - (stdDev * 2)); // Multiplying by 2 to penalize volatility more
    
    let grade = 'C';
    let reward = 0;

    if (stability > 92) {
      grade = 'S';
      reward = 250;
    } else if (stability > 85) {
      grade = 'A';
      reward = 100;
    } else if (stability > 75) {
      grade = 'B';
      reward = 25;
    }

    return {
      stability: Math.round(stability),
      grade,
      reward,
      avgScore: Math.round(avg)
    };
  }

  /**
   * Generates a personalized insight based on progress vs the 7-day history.
   */
  static generatePersonalInsight(current: BioMetrics, history: BioMetrics[]) {
    if (history.length < 3) return "Bienvenido. Sincroniza 3 días para un análisis comparativo profundo.";

    const avgHrv = history.reduce((sum, h) => sum + h.hrv, 0) / history.length;
    const avgSleep = history.reduce((sum, h) => sum + h.sleepHours, 0) / history.length;

    // HRV Improvement
    if (current.hrv > avgHrv * 1.1) {
      return `¡Progreso Notable! Tu HRV (${current.hrv}) es un ${Math.round((current.hrv/avgHrv-1)*100)}% superior a tu media. Tu sistema nervioso está en un estado de resiliencia excepcional hoy.`;
    }

    // Sleep Improvement
    if (current.sleepHours > avgSleep + 1) {
      return `Optimización de Sueño: Has dormido ${Math.round(current.sleepHours - avgSleep)}h más que tu promedio. Aprovecha este extra de energía cognitiva para tareas complejas.`;
    }

    // High Stability
    const stability = this.calculateWeeklyStability(history);
    if (stability && stability.stability > 90) {
      return `Maestría en Constancia: Tu Bio-Score se mantiene sumamente estable. Estás construyendo una base de longevidad sólida como una roca.`;
    }

    return "Tu balance biológico es estable. Mantén tus protocolos de hidratación y luz solar para sostener este nivel.";
  }

  /**
   * Defines a personalized daily challenge based on current deficits.
   */
  static getDailyChallenge(report: BioImpactReport) {
    if (report.breakdown.sleep < 60) {
      return {
        id: 'CHALLENGE_SLEEP',
        title: 'Reto de Higiene Profunda',
        task: 'Sin pantallas 30 min antes de dormir.',
        reward: 50
      };
    }
    if (report.breakdown.hrv < 60) {
      return {
        id: 'CHALLENGE_HRV',
        title: 'Reset Sistema Nervioso',
        task: 'Completa 5 min de Coherencia Cardíaca.',
        reward: 50
      };
    }
    if (report.breakdown.activity < 70) {
      return {
        id: 'CHALLENGE_MOVE',
        title: 'Chute Metabólico',
        task: 'Caminata rápida de 15 min tras la comida.',
        reward: 50
      };
    }

    return {
      id: 'CHALLENGE_MAINTAIN',
      title: 'Mantenimiento Elite',
      task: 'Finaliza el día con una ducha de contraste.',
      reward: 75
    };
  }
}
