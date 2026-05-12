const HAPTIC_PATTERNS = {
  sedentary: {
    name: 'Sedentarismo',
    pattern: 'pulse',
    duration: 500,
    interval: 0,
    intensity: 'high',
    repeat: 3,
    triggerCondition: (ctx) => ctx.inactivityMinutes >= 120
  },
  stress: {
    name: 'Estrés / Respiración',
    pattern: 'rhythmic',
    duration: 5000,
    interval: 5000,
    intensity: 'medium',
    repeat: 6,
    triggerCondition: (ctx) => ctx.cortisolLevel > 70 || ctx.hrv < 30
  },
  sleepPrep: {
    name: 'Preparación para sueño',
    pattern: 'lowFreq',
    duration: 2000,
    interval: 6000,
    intensity: 'low',
    repeat: 4,
    triggerCondition: (ctx) => ctx.hour >= 21 && ctx.hour <= 22
  },
  meditationStart: {
    name: 'Inicio de meditación',
    pattern: 'gentle',
    duration: 300,
    interval: 200,
    intensity: 'low',
    repeat: 3,
    triggerCondition: (ctx) => ctx.meditationActive === true
  },
  mealReminder: {
    name: 'Recordatorio de comida',
    pattern: 'doublePulse',
    duration: 200,
    interval: 150,
    intensity: 'medium',
    repeat: 2,
    triggerCondition: (ctx) => ctx.timeSinceMeal >= 180
  },
  achievement: {
    name: 'Logro completado',
    pattern: 'celebration',
    duration: 100,
    interval: 100,
    intensity: 'high',
    repeat: 3,
    triggerCondition: (ctx) => ctx.xpGained > 0
  },
  focusMode: {
    name: 'Modo enfoque activado',
    pattern: 'subtle',
    duration: 150,
    interval: 0,
    intensity: 'low',
    repeat: 1,
    triggerCondition: (ctx) => ctx.focusMode === true
  }
};

class HapticEngine {
  constructor() {
    this.isSupported = false;
    this.vibrationPatterns = HAPTIC_PATTERNS;
    this.initialize();
  }

  async initialize() {
    if ('vibrate' in navigator) {
      this.isSupported = true;
      console.log('[Haptic] Engine initialized - vibration API available');
    } else if (navigator.platform.includes('iOS') || navigator.platform.includes('Android')) {
      this.isSupported = true;
      console.log('[Haptic] Engine initialized - mobile device detected');
    }
  }

  trigger(patternName, customDuration = null) {
    if (!this.isSupported) {
      console.log(`[Haptic] ${patternName} triggered (visual feedback only)`);
      this.visualFallback(patternName);
      return;
    }

    const pattern = this.vibrationPatterns[patternName];
    if (!pattern) {
      console.warn(`[Haptic] Pattern "${patternName}" not found`);
      return;
    }

    const duration = customDuration || pattern.duration;
    const finalPattern = this.buildPattern(pattern, duration);

    navigator.vibrate(finalPattern);
    console.log(`[Haptic] ${pattern.name} - ${pattern.pattern} pattern triggered`);
    
    this.visualFallback(patternName);
  }

  buildPattern(pattern, duration) {
    if (pattern.repeat === 1) {
      return [duration];
    }
    
    const pauses = pattern.interval || 200;
    const sequence = [];
    
    for (let i = 0; i < pattern.repeat; i++) {
      sequence.push(duration);
      if (i < pattern.repeat - 1) {
        sequence.push(pauses);
      }
    }
    
    return sequence;
  }

  visualFallback(patternName) {
    const event = new CustomEvent('hapticFeedback', {
      detail: { pattern: patternName, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  checkTriggers(context) {
    for (const [name, pattern] of Object.entries(this.vibrationPatterns)) {
      if (pattern.triggerCondition(context)) {
        this.trigger(name);
        return true;
      }
    }
    return false;
  }

  mapIntensityToAmplitude(intensity) {
    const map = {
      low: 0.3,
      medium: 0.6,
      high: 1.0
    };
    return map[intensity] || 0.5;
  }
}

const hapticEngine = new HapticEngine();

window.HapticEngine = hapticEngine;