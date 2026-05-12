// === COMPREHENSIVE BIO-ANALYTICS ENGINE ===
// Progress + Statistics + AI Strategy + Context-Aware Recommendations

class BioAnalyticsEngine {
  constructor() {
    this.data = this.loadAllData();
    this.contextWeights = this.initializeContextWeights();
  }

  loadAllData() {
    return {
      nutrition: this.loadNutritionData(),
      sleep: this.loadSleepData(),
      exercise: this.loadExerciseData(),
      stress: this.loadStressData(),
      biometrics: this.loadBiometricsData(),
      mood: this.loadMoodData()
    };
  }

  loadNutritionData() {
    const stored = localStorage.getItem('hb_macros_data');
    if (!stored) return this.getDefaultNutrition();
    const data = JSON.parse(stored);
    return this.processNutritionTimeSeries(data);
  }

  loadSleepData() {
    const stored = localStorage.getItem('hb_sleep_data');
    if (!stored) return this.getDefaultSleep();
    const data = JSON.parse(stored);
    return this.processSleepTimeSeries(data);
  }

  loadExerciseData() {
    const history = localStorage.getItem('hb_workout_history');
    if (!history) return this.getDefaultExercise();
    const data = JSON.parse(history);
    return this.processExerciseTimeSeries(data);
  }

  loadStressData() {
    const stored = localStorage.getItem('hb_stress_data');
    if (!stored) return this.getDefaultStress();
    return JSON.parse(stored);
  }

  loadBiometricsData() {
    return {
      hrv: parseFloat(localStorage.getItem('hb_last_hrv') || 50),
      cortisol: parseFloat(localStorage.getItem('hb_last_cortisol') || 50),
      heartRate: parseFloat(localStorage.getItem('hb_last_hr') || 70),
      steps: parseInt(localStorage.getItem('hb_last_steps') || 5000)
    };
  }

  loadMoodData() {
    const stored = localStorage.getItem('hb_mood_data');
    return stored ? JSON.parse(stored) : { current: 'neutral', history: [] };
  }

  getDefaultNutrition() {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, fiber: 0, trends: [] };
  }

  getDefaultSleep() {
    return { hours: 0, quality: 0, deepSleep: 0, remSleep: 0, trends: [] };
  }

  getDefaultExercise() {
    return { sessions: 0, volume: 0, frequency: 0, muscleGroups: {}, trends: [] };
  }

  getDefaultStress() {
    return { level: 50, triggers: [], coping: [] };
  }

  processNutritionTimeSeries(data) {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const weekData = data.filter(d => d.timestamp > weekAgo);
    const monthData = data.filter(d => d.timestamp > monthAgo);

    return {
      current: data[data.length - 1] || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      weekly: this.calculateAverages(weekData),
      monthly: this.calculateAverages(monthData),
      trends: this.calculateTrends(weekData),
      score: this.calculateNutritionScore(data[data.length - 1] || {})
    };
  }

  processSleepTimeSeries(data) {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weekData = data.filter(d => d.timestamp > weekAgo);

    return {
      current: data[data.length - 1] || { hours: 0, quality: 0 },
      weekly: this.calculateAverages(weekData),
      trends: this.calculateTrends(weekData),
      score: this.calculateSleepScore(data[data.length - 1] || {})
    };
  }

  processExerciseTimeSeries(data) {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weekData = data.filter(w => w.startTime > weekAgo);

    const muscleGroups = {};
    weekData.forEach(w => {
      w.exercises?.forEach(e => {
        const group = this.getMuscleGroup(e.exercise?.name || '');
        muscleGroups[group] = (muscleGroups[group] || 0) + 1;
      });
    });

    return {
      current: data[data.length - 1] || {},
      weekly: {
        sessions: weekData.length,
        volume: weekData.reduce((a, w) => a + (w.totalSets || 0), 0),
        duration: weekData.reduce((a, w) => a + (w.duration || 0), 0)
      },
      muscleGroups,
      trends: this.calculateTrends(weekData),
      score: this.calculateExerciseScore(weekData.length)
    };
  }

  calculateAverages(data) {
    if (!data || data.length === 0) return {};
    const sum = data.reduce((acc, d) => ({
      calories: acc.calories + (d.calories || 0),
      protein: acc.protein + (d.protein || 0),
      carbs: acc.carbs + (d.carbs || 0),
      fat: acc.fat + (d.fat || 0),
      hours: acc.hours + (d.hours || 0),
      quality: acc.quality + (d.quality || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, hours: 0, quality: 0 });

    const count = data.length;
    return {
      calories: Math.round(sum.calories / count),
      protein: Math.round(sum.protein / count),
      carbs: Math.round(sum.carbs / count),
      fat: Math.round(sum.fat / count),
      hours: Math.round(sum.hours / count * 10) / 10,
      quality: Math.round(sum.quality / count)
    };
  }

  calculateTrends(data) {
    if (data.length < 3) return 'stable';
    const first = data.slice(0, Math.floor(data.length / 2));
    const second = data.slice(Math.floor(data.length / 2));
    const firstAvg = this.calculateAverages(first).calories || 0;
    const secondAvg = this.calculateAverages(second).calories || 0;
    if (secondAvg > firstAvg * 1.1) return 'improving';
    if (secondAvg < firstAvg * 0.9) return 'declining';
    return 'stable';
  }

  calculateNutritionScore(current) {
    let score = 0;
    const proteinGoal = (current.weight || 70) * 1.8;
    const fiberGoal = 25;

    if (current.protein >= proteinGoal * 0.9) score += 25;
    else if (current.protein >= proteinGoal * 0.7) score += 15;

    if (current.fiber >= fiberGoal * 0.9) score += 25;
    else if (current.fiber >= fiberGoal * 0.7) score += 15;

    if (current.calories <= current.targetCalories * 1.1) score += 25;
    else score += 10;

    if (current.water >= 2) score += 25;
    else if (current.water >= 1.5) score += 15;

    return Math.min(100, score);
  }

  calculateSleepScore(current) {
    let score = 0;
    if (current.hours >= 7 && current.hours <= 9) score += 40;
    else if (current.hours >= 6) score += 25;

    if (current.quality >= 80) score += 35;
    else if (current.quality >= 60) score += 20;

    if (current.deepSleep >= 20) score += 25;
    else if (current.deepSleep >= 15) score += 15;

    return Math.min(100, score);
  }

  calculateExerciseScore(sessionsThisWeek) {
    let score = 0;
    if (sessionsThisWeek >= 4) score = 100;
    else if (sessionsThisWeek >= 3) score = 80;
    else if (sessionsThisWeek >= 2) score = 60;
    else if (sessionsThisWeek >= 1) score = 40;
    else score = 20;
    return score;
  }

  getMuscleGroup(exerciseName) {
    const mapping = {
      pectorales: ['press', 'banca', 'apertura', 'flexiones', 'fondos'],
      espalda: ['remo', 'dominadas', 'jalon', 'pull', 'row'],
      cuadriceps: ['sentadilla', 'prensa', 'hack', 'lunges', 'front'],
      gluteos: ['hip thrust', 'glute', 'step'],
      isquiotibiales: ['curl', 'romano', 'stiff', 'good morning'],
      biceps: ['curl', 'predicador'],
      triceps: ['extension', 'patada', 'dips', 'skull'],
      abdominales: ['crunch', 'planch', 'leg raise', 'ab wheel']
    };

    const lower = exerciseName.toLowerCase();
    for (const [group, keywords] of Object.entries(mapping)) {
      if (keywords.some(k => lower.includes(k))) return group;
    }
    return 'other';
  }

  initializeContextWeights() {
    return {
      nutrition: 0.25,
      sleep: 0.25,
      exercise: 0.25,
      stress: 0.15,
      biometrics: 0.10
    };
  }

  calculateOverallScore() {
    const scores = {
      nutrition: this.data.nutrition.score || 0,
      sleep: this.data.sleep.score || 0,
      exercise: this.data.exercise.score || 0,
      stress: 100 - (this.data.stress.level || 50),
      biometrics: this.calculateBiometricScore()
    };

    const weighted = Object.entries(scores).reduce((acc, [key, score]) => {
      return acc + score * (this.contextWeights[key] || 0);
    }, 0);

    return Math.round(weighted);
  }

  calculateBiometricScore() {
    const { hrv, cortisol, heartRate } = this.data.biometrics;
    let score = 0;
    if (hrv >= 50) score += 35;
    else if (hrv >= 35) score += 20;
    if (cortisol <= 50) score += 35;
    else if (cortisol <= 70) score += 20;
    if (heartRate <= 70) score += 30;
    else if (heartRate <= 80) score += 20;
    return score;
  }

  // Generate daily strategy based on all data
  generateDailyStrategy() {
    const scores = {
      nutrition: this.data.nutrition.score || 0,
      sleep: this.data.sleep.score || 0,
      exercise: this.data.exercise.score || 0,
      stress: this.data.stress.level || 50
    };

    const strategy = {
      dayType: this.determineDayType(scores),
      focus: this.determineFocus(scores),
      recommendations: [],
      warnings: [],
      targetMacros: this.calculateTargetMacros(scores),
      suggestedExercises: this.suggestExercises(scores),
      suggestedRecovery: this.suggestRecovery(scores),
      stressProtocol: this.getStressProtocol(scores.stress)
    };

    strategy.recommendations = this.generateRecommendations(scores);
    strategy.warnings = this.generateWarnings(scores);

    return strategy;
  }

  determineDayType(scores) {
    const avgEnergy = (scores.nutrition + scores.sleep + scores.exercise) / 3;
    if (scores.stress > 70) return 'recovery';
    if (scores.sleep < 50) return 'rest';
    if (avgEnergy < 40) return 'light';
    if (avgEnergy > 70) return 'intense';
    return 'moderate';
  }

  determineFocus(scores) {
    if (scores.nutrition < 50) return 'nutrition';
    if (scores.sleep < 50) return 'recovery';
    if (scores.exercise < 40) return 'training';
    if (scores.stress > 60) return 'stress';
    return 'maintenance';
  }

  calculateTargetMacros(scores) {
    const baseCalories = 2000;
    const activityMultiplier = scores.exercise > 60 ? 1.2 : scores.exercise > 40 ? 1.1 : 1.0;
    const stressMultiplier = scores.stress > 60 ? 0.9 : 1.0;
    const calories = Math.round(baseCalories * activityMultiplier * stressMultiplier);

    return {
      calories,
      protein: Math.round(calories * 0.3 / 4),
      carbs: Math.round(calories * 0.4 / 4),
      fat: Math.round(calories * 0.3 / 9)
    };
  }

  suggestExercises(scores) {
    if (scores.stress > 70) {
      return ['yoga', 'stretching', 'light-walk'];
    }
    if (scores.sleep < 50) {
      return ['mild-cardio', 'mobility'];
    }
    if (scores.exercise < 40) {
      return ['full-body', 'strength'];
    }
    return ['push', 'pull', 'legs'];
  }

  suggestRecovery(scores) {
    const recovery = [];
    if (scores.sleep < 60) recovery.push('early-sleep', 'no-screens');
    if (scores.stress > 50) recovery.push('meditation', 'breathing');
    if (scores.nutrition < 60) recovery.push('hydration', 'protein');
    return recovery;
  }

  getStressProtocol(stressLevel) {
    if (stressLevel > 80) return { type: 'deep-rest', duration: 20, exercises: ['box-breathing', '4-7-8'] };
    if (stressLevel > 60) return { type: 'moderate', duration: 15, exercises: ['meditation', 'walk'] };
    return { type: 'maintenance', duration: 10, exercises: ['breathing'] };
  }

  generateRecommendations(scores) {
    const recs = [];

    if (scores.nutrition < 60) {
      recs.push({ type: 'nutrition', priority: 'high', text: 'Aumenta proteína a 1.8g/kg peso corporal' });
    }
    if (scores.sleep < 60) {
      recs.push({ type: 'sleep', priority: 'high', text: 'Duerme antes de las 23:00, evita pantallas 1h antes' });
    }
    if (scores.exercise < 50) {
      recs.push({ type: 'exercise', priority: 'medium', text: 'Programa 3-4 sesiones de fuerza esta semana' });
    }
    if (scores.stress > 60) {
      recs.push({ type: 'stress', priority: 'high', text: 'Practica respiración 4-7-8 antes de dormir' });
    }

    return recs;
  }

  generateWarnings(scores) {
    const warnings = [];

    if (scores.sleep < 30) {
      warnings.push({ type: 'critical', text: 'Tu sueño está severamente comprometido. Prioriza descanso.' });
    }
    if (scores.nutrition < 30) {
      warnings.push({ type: 'critical', text: 'Nutrición insuficiente. Come al menos 3 comidas hoy.' });
    }
    if (scores.stress > 80) {
      warnings.push({ type: 'critical', text: 'Nivel de estrés crítico. Toma un descanso inmediato.' });
    }

    return warnings;
  }

  // Get week forecast
  getWeekForecast() {
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        ...this.generateDailyStrategy()
      });
    }
    return forecast;
  }

  // AI-powered insights
  getAIInsights() {
    const insights = [];

    // Analyze patterns
    const sleepTrend = this.data.sleep.trends;
    const exerciseTrend = this.data.exercise.trends;
    const nutritionTrend = this.data.nutrition.trends;

    if (sleepTrend === 'declining' && exerciseTrend === 'improving') {
      insights.push({
        category: 'warning',
        title: 'Sobreentrenamiento detectado',
        text: 'Duermes menos mientras entrenas más. Reduce intensidad y prioriza recuperación.'
      });
    }

    if (nutritionTrend === 'declining' && sleepTrend === 'improving') {
      insights.push({
        category: 'opportunity',
        title: 'Mejora tu nutrición',
        text: 'Tu sueño mejora pero tu nutrición baja. Aumenta proteína para optimizar recuperación.'
      });
    }

    // Compare to goals
    const avgSleep = this.data.sleep.weekly?.hours || 0;
    if (avgSleep < 7) {
      insights.push({
        category: 'action',
        title: 'Déficit de sueño',
        text: `Duermes ${avgSleep}h promedio. Objetivo: 7-9h. Considera acostarte 1h más temprano.`
      });
    }

    const weeklySessions = this.data.exercise.weekly?.sessions || 0;
    if (weeklySessions < 3) {
      insights.push({
        category: 'action',
        title: 'Entrenamiento insuficiente',
        text: `Solo ${weeklySessions} sesiones esta semana. Añade al menos 1 más para mantener progresión.`
      });
    }

    // Muscle balance
    const muscleGroups = this.data.exercise.muscleGroups;
    const missingGroups = ['pectorales', 'espalda', 'piernas'].filter(g => !muscleGroups[g]);
    if (missingGroups.length > 1) {
      insights.push({
        category: 'balance',
        title: 'Desequilibrio muscular',
        text: `Grupos faltantes: ${missingGroups.join(', ')}. Añade estos en tu próxima rutina.`
      });
    }

    return insights;
  }
}

window.bioAnalytics = new BioAnalyticsEngine();
console.log('[BioAnalytics] Engine loaded - comprehensive tracking ready');