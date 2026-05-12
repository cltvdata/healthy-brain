const MOCK_USER_DATA = {
  biometric: {
    hrv: 28,
    cortisol: 85,
    restingHeartRate: 72,
    sleepScore: 65,
    steps: 2100,
    calories: 1850
  },
  activity: {
    inactivityMinutes: 145,
    lastWorkout: '2026-05-09T18:30:00',
    workoutFrequency: 3
  },
  nutrition: {
    caloriesConsumed: 1200,
    caloriesTarget: 2200,
    protein: 85,
    carbs: 150,
    fat: 45,
    water: 1.2
  },
  context: {
    hour: 21,
    dayOfWeek: 6,
    stressLevel: 'high',
    mood: 'anxious'
  }
};

const MOCK_NOTEBOOKS = {
  medical: {
    id: 'nb_medical_001',
    type: 'medical',
    weight: 1.0,
    data: {
      conditions: ['ansiedad moderada'],
      medications: [],
      restrictions: [],
      recommendation: 'Evitar cafeína después de las 18:00. Preferir actividades de baja intensidad antes de dormir.'
    }
  },
  nutrition: {
    id: 'nb_nutrition_001',
    type: 'nutrition',
    weight: 0.85,
    data: {
      diet: 'mediterránea',
      supplements: ['magnesio 400mg', 'omega-3'],
      mealsToday: 3,
      lastMeal: '2026-05-10T14:00:00',
      recommendation: 'Cena ligera antes de las 20:30. Evitar carbohidratos refinados.'
    }
  },
  fitness: {
    id: 'nb_fitness_001',
    type: 'fitness',
    weight: 0.7,
    data: {
      trainingDays: ['lunes', 'miercoles', 'viernes'],
      currentProgram: 'fuerzaypertrofia',
      lastSession: '2026-05-09',
      recommendation: 'Hoy es día de descanso activo. 10 min de estiramientos suaves recomendados.'
    }
  },
  sleep: {
    id: 'nb_sleep_001',
    type: 'sleep',
    weight: 0.75,
    data: {
      avgSleepDuration: 6.5,
      bedTime: '23:30',
      wakeTime: '06:00',
      sleepQuality: 'fair',
      recommendation: 'Establecer rutina de desconexión 30 min antes. Evitar pantallas.'
    }
  }
};

class MockDataEngine {
  constructor() {
    this.data = MOCK_USER_DATA;
    this.notebooks = MOCK_NOTEBOOKS;
    this.injectIntoSystem();
  }

  injectIntoSystem() {
    if (window.NotebookLMProcessor) {
      Object.values(this.notebooks).forEach(nb => {
        window.NotebookLMProcessor.ingestSource(nb.id, nb.data);
      });
      console.log('[MockData] Notebooks loaded into NotebookLM');
    }

    this.simulateBiometricUpdates();
  }

  simulateBiometricUpdates() {
    window.appState = {
      hrv: this.data.biometric.hrv,
      cortisol: this.data.biometric.cortisol,
      inactivityMinutes: this.data.activity.inactivityMinutes,
      steps: this.data.biometric.steps,
      caloriesRemaining: this.data.nutrition.caloriesTarget - this.data.nutrition.caloriesConsumed,
      hour: this.data.context.hour,
      focusMode: false
    };
    console.log('[MockData] appState initialized');
  }

  getScenario(scenarioName) {
    const scenarios = {
      stressed: {
        hrv: 25,
        cortisol: 90,
        inactivityMinutes: 30,
        hour: 14
      },
      sedentary: {
        hrv: 55,
        cortisol: 45,
        inactivityMinutes: 180,
        hour: 16
      },
      sleepPrep: {
        hrv: 40,
        cortisol: 35,
        inactivityMinutes: 45,
        hour: 21
      },
      balanced: {
        hrv: 65,
        cortisol: 30,
        inactivityMinutes: 20,
        hour: 10
      }
    };

    return scenarios[scenarioName] || scenarios.balanced;
  }

  applyScenario(scenarioName) {
    const scenario = this.getScenario(scenarioName);
    window.appState = { ...window.appState, ...scenario };
    
    if (window.StitchAdapter) {
      window.StitchAdapter.applyContext(window.StitchAdapter.getContextState());
    }
    
    console.log(`[MockData] Applied scenario: ${scenarioName}`, scenario);
    return scenario;
  }

  triggerMicroIntervention() {
    if (!window.NotebookLMProcessor) return null;

    const intervention = window.NotebookLMProcessor.generateMicroIntervention({
      prompt: 'Necesito una micro-intervención de 10 minutos para mejorar mi bienestar',
      priority: [],
      state: this.determineState()
    });

    if (window.HapticEngine && intervention.hapticPattern) {
      window.HapticEngine.trigger(intervention.hapticPattern);
    }

    console.log('[MockData] Micro-intervention:', intervention);
    
    this.displayIntervention(intervention);
    return intervention;
  }

  displayIntervention(intervention) {
    const resultDiv = document.getElementById('interventionResult');
    if (resultDiv) {
      resultDiv.innerHTML = `
        <strong>${intervention.type}</strong> (${intervention.duration})<br>
        ${intervention.content?.recommendation || 'Generando...'}<br>
        <span style="color:#13ec5b">Haptic: ${intervention.hapticPattern}</span>
      `;
      resultDiv.classList.add('show');
    }
  }

  determineState() {
    if (this.data.biometric.cortisol > 70 || this.data.biometric.hrv < 30) return 'stress';
    if (this.data.activity.inactivityMinutes > 120) return 'sedentary';
    if (this.data.context.hour >= 21) return 'sleepPrep';
    return 'focus';
  }

  getDebugInfo() {
    return {
      currentState: window.appState,
      notebooksLoaded: Object.keys(this.notebooks).length,
      currentScenario: this.determineState()
    };
  }
}

window.mockDataEngine = new MockDataEngine();

window.testScenarios = {
  stressed: () => window.mockDataEngine.applyScenario('stressed'),
  sedentary: () => window.mockDataEngine.applyScenario('sedentary'),
  sleepPrep: () => window.mockDataEngine.applyScenario('sleepPrep'),
  balanced: () => window.mockDataEngine.applyScenario('balanced'),
  trigger: () => window.mockDataEngine.triggerMicroIntervention()
};

console.log('[MockData] Available: window.testScenarios.stressed(), .sedentary(), .sleepPrep(), .balanced(), .trigger()');