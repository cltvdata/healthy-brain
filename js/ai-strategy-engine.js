// === AI STRATEGY ENGINE ===
// Context-Aware Recommendations for Next Days

class AIStrategyEngine {
  constructor() {
    this.analytics = window.bioAnalytics;
    this.strategies = this.loadStrategies();
  }

  loadStrategies() {
    return {
      weightLoss: { name: 'Pérdida de peso', focus: 'déficit calórico + cardio' },
      muscleGain: { name: 'Ganancia muscular', focus: 'surplus calórico + hypertrophy' },
      maintenance: { name: 'Mantenimiento', focus: 'balance + consistencia' },
      performance: { name: 'Rendimiento', focus: 'intensity + recuperación' },
      recovery: { name: 'Recuperación', focus: 'descanso + sueño + nutrición' },
      stress: { name: 'Gestión estrés', focus: 'meditación + respiración + descanso' }
    };
  }

  // Main strategy recommendation
  getRecommendedStrategy() {
    const scores = {
      nutrition: this.analytics.data.nutrition.score || 0,
      sleep: this.analytics.data.sleep.score || 0,
      exercise: this.analytics.data.exercise.score || 0,
      stress: this.analytics.data.stress.level || 50
    };

    // Decision tree for strategy
    if (scores.stress > 75) return this.strategies.stress;
    if (scores.sleep < 40) return this.strategies.recovery;
    if (scores.nutrition < 40 && scores.exercise > 60) return this.strategies.recovery;
    if (scores.exercise < 30) return this.strategies.performance;
    if (scores.nutrition > 70 && scores.sleep > 70 && scores.exercise > 60) return this.strategies.muscleGain;
    return this.strategies.maintenance;
  }

  // Generate tomorrow's plan
  generateTomorrowPlan() {
    const today = this.analytics.generateDailyStrategy();
    const strategy = this.getRecommendedStrategy();

    return {
      strategy: strategy,
      dayType: this.calculateNextDayType(today),
      schedule: this.generateSchedule(today, strategy),
      nutrition: this.calculateNextDayNutrition(today),
      exercises: this.suggestTomorrowExercises(today),
      recovery: this.suggestTomorrowRecovery(today),
      checkpoints: this.generateCheckpoints()
    };
  }

  calculateNextDayType(today) {
    const { dayType } = today;

    const transitions = {
      'intense': 'moderate',
      'moderate': 'light',
      'light': 'moderate',
      'rest': 'moderate',
      'recovery': 'light'
    };

    return transitions[dayType] || 'moderate';
  }

  generateSchedule(today, strategy) {
    const schedule = [];
    const hour = new Date().getHours();

    // Morning routine (6-9 AM)
    schedule.push({
      time: '6:00 - 7:00',
      activity: 'Despertar + hidratación + estiramiento ligero',
      priority: today.stress > 60 ? 'high' : 'medium'
    });

    if (strategy.focus.includes('cardio')) {
      schedule.push({
        time: '7:00 - 8:00',
        activity: 'Cardio en ayunas (opcional)',
        priority: 'medium'
      });
    }

    // Breakfast
    schedule.push({
      time: '8:00 - 9:00',
      activity: 'Desayuno alto en proteína + carbs complejos',
      priority: 'high'
    });

    // Mid-morning
    if (strategy.focus.includes('surplus')) {
      schedule.push({
        time: '10:30 - 11:00',
        activity: 'Snack proteico',
        priority: 'medium'
      });
    }

    // Lunch
    schedule.push({
      time: '13:00 - 14:00',
      activity: 'Almuerzo - proteína + vegetables + carbs',
      priority: 'high'
    });

    // Training window
    if (strategy.focus.includes('intensity')) {
      schedule.push({
        time: '17:00 - 19:00',
        activity: 'Entrenamiento de fuerza',
        priority: 'high'
      });
    } else if (strategy.focus.includes('cardio')) {
      schedule.push({
        time: '18:00 - 19:00',
        activity: 'Cardio moderado',
        priority: 'medium'
      });
    }

    // Dinner
    schedule.push({
      time: '20:00 - 21:00',
      activity: 'Cena ligera - proteína + grasas saludables',
      priority: 'high'
    });

    // Evening
    if (today.stress > 50) {
      schedule.push({
        time: '21:30 - 22:00',
        activity: 'Meditación o respiración 4-7-8',
        priority: 'high'
      });
    }

    schedule.push({
      time: '22:30',
      activity: 'Sueño - objetivo 7-8 horas',
      priority: 'high'
    });

    return schedule;
  }

  calculateNextDayNutrition(today) {
    const target = today.targetMacros;
    const strategy = this.getRecommendedStrategy();

    if (strategy === this.strategies.weightLoss) {
      return {
        ...target,
        calories: Math.round(target.calories * 0.85),
        distribution: { protein: '40%', carbs: '30%', fat: '30%' }
      };
    }

    if (strategy === this.strategies.muscleGain) {
      return {
        ...target,
        calories: Math.round(target.calories * 1.15),
        distribution: { protein: '30%', carbs: '45%', fat: '25%' }
      };
    }

    return {
      ...target,
      distribution: { protein: '30%', carbs: '40%', fat: '30%' }
    };
  }

  suggestTomorrowExercises(today) {
    const { dayType } = this.calculateNextDayType(today);
    const muscleGroups = this.analytics.data.exercise.muscleGroups || {};
    
    const suggestions = [];

    if (dayType === 'intense') {
      suggestions.push(
        { type: 'strength', name: 'Press de Banca', sets: 4, reps: '8-10', rest: '120s' },
        { type: 'strength', name: 'Sentadilla', sets: 4, reps: '8-10', rest: '120s' },
        { type: 'strength', name: 'Remo con Barra', sets: 3, reps: '10', rest: '90s' }
      );
    } else if (dayType === 'moderate') {
      suggestions.push(
        { type: 'strength', name: 'Press de Banca', sets: 3, reps: '10-12', rest: '90s' },
        { type: 'strength', name: 'Remo Unilateral', sets: 3, reps: '12', rest: '60s' },
        { type: 'accessory', name: 'Curl + Tríceps', sets: 3, reps: '12', rest: '60s' }
      );
    } else {
      suggestions.push(
        { type: 'mobility', name: 'Estiramientos dinámicos', duration: '20 min' },
        { type: 'cardio', name: 'Caminata suave', duration: '30 min' },
        { type: 'breathing', name: 'Box Breathing', duration: '10 min' }
      );
    }

    // Check for muscle balance
    if (!muscleGroups.pectorales && dayType !== 'light') {
      suggestions.unshift({ type: 'note', text: '💡 Considera entrenar pectorales hoy' });
    }

    return suggestions;
  }

  suggestTomorrowRecovery(today) {
    const recovery = [];

    if (today.stress > 60) {
      recovery.push({ time: '6:30', activity: 'Meditación guiada - 10 min', type: 'mental' });
      recovery.push({ time: '21:00', activity: 'Baño caliente + estiramientos', type: 'physical' });
    }

    if (today.sleep < 60) {
      recovery.push({ time: '22:00', activity: 'No screens - lectura o música suave', type: 'sleep' });
      recovery.push({ time: '22:30', activity: 'Magnesium + sueño', type: 'sleep' });
    }

    if (today.nutrition < 60) {
      recovery.push({ time: '8:00', activity: 'Desayuno completo - prioriza proteína', type: 'nutrition' });
      recovery.push({ time: '全天', activity: 'Hidratación - 3L agua mínimo', type: 'nutrition' });
    }

    return recovery;
  }

  generateCheckpoints() {
    return [
      { time: '10:00', metric: 'energy', question: '¿Cómo te sientes energéticamente?', type: 'mood' },
      { time: '14:00', metric: 'nutrition', question: '¿Has cumplido las comidas?', type: 'tracking' },
      { time: '19:00', metric: 'workout', question: '¿Completaste el entrenamiento?', type: 'tracking' },
      { time: '21:00', metric: 'stress', question: '¿Nivel de estrés actual?', type: 'mood' },
      { time: '23:00', metric: 'sleep', question: '¿A qué hora te acuestas?', type: 'tracking' }
    ];
  }

  // Adaptive learning based on user responses
  learnFromFeedback(checkpoint, response) {
    const learningKey = `hb_strategy_feedback_${checkpoint}`;
    const history = JSON.parse(localStorage.getItem(learningKey) || '[]');
    history.push({ response, timestamp: Date.now() });
    
    // Keep last 30 entries
    if (history.length > 30) history.shift();
    localStorage.setItem(learningKey, JSON.stringify(history));
    
    console.log('[AIStrategy] Feedback learned:', checkpoint, response);
  }

  // Optimize based on historical performance
  optimizeStrategy() {
    const insights = this.analytics.getAIInsights();
    const today = this.analytics.generateDailyStrategy();
    
    const optimizations = [];

    insights.forEach(insight => {
      if (insight.category === 'warning') {
        optimizations.push({ type: 'avoid', text: insight.text });
      } else if (insight.category === 'action') {
        optimizations.push({ type: 'add', text: insight.text });
      }
    });

    return {
      applyToTomorrow: optimizations,
      confidence: this.calculateOptimizationConfidence()
    };
  }

  calculateOptimizationConfidence() {
    const dataPoints = 
      (this.analytics.data.nutrition.trends?.length || 0) +
      (this.analytics.data.sleep.trends?.length || 0) +
      (this.analytics.data.exercise.weekly?.sessions || 0);

    if (dataPoints > 20) return 'high';
    if (dataPoints > 10) return 'medium';
    return 'low';
  }

  // Weekly rotation
  getWeeklyRotation() {
    return [
      { day: 'Lunes', type: 'intense', focus: 'Pecho + Tríceps' },
      { day: 'Martes', type: 'intense', focus: 'Espalda + Bíceps' },
      { day: 'Miércoles', type: 'moderate', focus: 'Piernas' },
      { day: 'Jueves', type: 'light', focus: 'Cardio + Core' },
      { day: 'Viernes', type: 'intense', focus: 'Hombros' },
      { day: 'Sábado', type: 'moderate', focus: 'Full Body' },
      { day: 'Domingo', type: 'recovery', focus: 'Descanso activo' }
    ];
  }
}

window.aiStrategy = new AIStrategyEngine();
console.log('[AIStrategy] Engine loaded - AI-powered recommendations ready');