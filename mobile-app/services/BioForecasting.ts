export interface BioProjection {
  currentAge: number;
  metabolicAge: number;
  futureBioScore: number;
  longevityFactor: number; // 0.0 to 1.0
  recommendation: string;
}

export class BioForecasting {
  /**
   * Simple Metabolic Age Calculation based on HRV and Activity.
   * Higher HRV + High Steps = Lower Metabolic Age.
   */
  static estimateMetabolicAge(currentAge: number, hrv: number, avgSteps: number): number {
    // Basic heuristic: 
    // - Each +10 HRV (above 50) reduces biological age by 1 year.
    // - Each 2000 steps (above 5000) reduces it by 0.5 year.
    let reduction = 0;
    
    if (hrv > 50) reduction += (hrv - 50) / 10;
    if (avgSteps > 5000) reduction += (avgSteps - 5000) / 4000;
    
    const metabolicAge = currentAge - reduction;
    return Math.max(currentAge * 0.7, parseFloat(metabolicAge.toFixed(1))); // Cap at 70% of chronological age
  }

  /**
   * Project BioScore for 3 months from now.
   */
  static projectFutureBioScore(currentScore: number, hrvTrend: 'up' | 'down' | 'stable'): number {
    const change = hrvTrend === 'up' ? 5 : (hrvTrend === 'down' ? -5 : 0);
    return Math.min(100, Math.max(0, currentScore + change));
  }

  /**
   * Health Recommendation based on projection.
   */
  static getInsight(score: number, ageDiff: number): string {
    if (ageDiff < -3) return "Tu biología está en 'Modo Óptimo'. Estás rejuveneciendo tu sistema celular.";
    if (ageDiff > 2) return "Alerta: Tu edad metabólica supera tu edad cronológica. Prioriza sueño y HRV.";
    return "Estás en equilibrio. Mantén tu ritmo de Bio-Sincronización.";
  }
}
