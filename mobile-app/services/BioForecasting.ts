import { db } from '@/constants/FirebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface BioProjection {
  currentAge: number;
  metabolicAge: number;
  futureBioScore: number;
  longevityFactor: number; // 0.0 to 1.0
  recommendation: string;
  energyProjection: number; // 0-100
  trend: 'OPTIMAL' | 'RECOVERY' | 'STRESS';
}

export class BioForecasting {
  /**
   * Complex trend analysis based on log history.
   */
  static async analyzeTrends(userId: string): Promise<{ hrvTrend: number; consistency: number }> {
    try {
      const logsRef = collection(db, 'users', userId, 'logs');
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const q = query(logsRef, where('timestamp', '>=', fourteenDaysAgo), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);

      let hrvValues: number[] = [];
      let activityLogs = 0;

      snap.forEach(d => {
        const data = d.data();
        if (data.type === 'hrv') hrvValues.push(data.value);
        if (data.type === 'reward') activityLogs++;
      });

      // Calculate simple slope for HRV
      let hrvTrend = 0;
      if (hrvValues.length >= 2) {
        hrvTrend = hrvValues[0] - hrvValues[hrvValues.length - 1];
      }

      return {
        hrvTrend,
        consistency: Math.round((activityLogs / 14) * 100)
      };
    } catch (e) {
      console.error("[BioForecasting] Trend analysis error:", e);
      return { hrvTrend: 0, consistency: 50 };
    }
  }

  static estimateMetabolicAge(currentAge: number, hrv: number, avgSteps: number, hrvTrend: number = 0): number {
    let reduction = 0;

    // Weighted variables
    if (hrv > 50) reduction += (hrv - 50) / 8; // Improved sensitivity
    if (avgSteps > 7000) reduction += (avgSteps - 7000) / 3000;
    if (hrvTrend > 5) reduction += 1.5; // Bonus for positive recovery trend
    if (hrvTrend < -5) reduction -= 1.0; // Penalty for chronic stress

    const metabolicAge = currentAge - reduction;
    return Math.max(currentAge * 0.7, parseFloat(metabolicAge.toFixed(1)));
  }

  static projectFutureBioScore(currentScore: number, hrvTrend: number): number {
    const change = hrvTrend > 2 ? 8 : (hrvTrend < -2 ? -8 : 1);
    return Math.min(100, Math.max(0, currentScore + change));
  }

  static getInsight(score: number, ageDiff: number, trend: number): string {
    if (trend > 5) return "Tu capacidad de regeneración es ALFA. Proyectamos un día de alto enfoque cognitivo.";
    if (trend < -5) return "Advertencia de Estrés: Tu sistema nervioso está agotado. Reduce la carga de entrenamiento hoy.";
    if (ageDiff < -3) return "Longevidad en curso. Tu edad metabólica es la de un atleta de élite.";
    return "Estás en equilibrio homeostático. Mantén el protocolo de sincronización.";
  }

  /**
   * Projects the biological state to the year 2050.
   */
  static project2050(currentAge: number, bioScore: number, hrv: number) {
    const yearsUntil2050 = 2050 - new Date().getFullYear();
    const ageIn2050 = currentAge + yearsUntil2050;

    // Probability of "Sovereign Longevity"
    const probability = Math.min(95, Math.round((bioScore * 0.6) + (hrv * 0.4)));

    // Narrative generation
    let narrative = "";
    if (probability > 80) narrative = `En 2050, a tus ${ageIn2050} años, proyectamos que conservarás una plasticidad neuronal del 90%. Tu "Digital Twin" muestra una integridad celular superior.`;
    else if (probability > 50) narrative = `En 2050, con ${ageIn2050} años, tu estado será estable pero con degradación mitocondrial moderada. Mantener el protocolo NTK es crítico ahora.`;
    else narrative = `A los ${ageIn2050} años (en 2050), el sistema predice riesgos crónicos si no se revierte la tendencia actual de HRV/Estrés.`;

    return {
      ageIn2050,
      probability,
      narrative
    };
  }
}
