const POMELLI_PALETTE = {
  bioTech: {
    primary: '#0a0a0a',
    surface: '#121212',
    accent: {
      energy: '#ff8a00',
      calm: '#00d1ff',
      growth: '#13ec5b',
      warning: '#ff3366'
    },
    glassmorphism: {
      background: 'rgba(25, 25, 25, 0.7)',
      blur: '12px',
      border: 'rgba(255, 255, 255, 0.08)'
    }
  },
  dawn: {
    primary: '#1a1a2e',
    accent: { energy: '#f39c12', calm: '#74b9ff' }
  },
  noon: {
    primary: '#16213e',
    accent: { energy: '#e74c3c', calm: '#3498db' }
  },
  dusk: {
    primary: '#0f0f23',
    accent: { energy: '#9b59b6', calm: '#1abc9c' }
  },
  night: {
    primary: '#050510',
    accent: { energy: '#2c3e50', calm: '#34495e' }
  }
};

const STITCH_CONTEXT_TRIGGERS = {
  time: (hour) => {
    if (hour >= 5 && hour < 12) return 'dawn';
    if (hour >= 12 && hour < 17) return 'noon';
    if (hour >= 17 && hour < 21) return 'dusk';
    return 'night';
  },
  biometric: (hrv, cortisol) => {
    if (hrv < 25 && cortisol > 80) return 'stressed';
    if (hrv > 60 && cortisol < 40) return 'balanced';
    return 'neutral';
  },
  activity: (inactivity) => {
    if (inactivity > 120) return 'sedentary';
    if (inactivity > 60) return 'idle';
    return 'active';
  }
};

class StitchAdapter {
  constructor() {
    this.currentContext = {};
    this.transitionDuration = 300;
  }

  getContextState() {
    const hour = new Date().getHours();
    const hrv = window.appState?.hrv || 50;
    const cortisol = window.appState?.cortisol || 50;
    const inactivity = window.appState?.inactivityMinutes || 0;

    return {
      timeOfDay: STITCH_CONTEXT_TRIGGERS.time(hour),
      biometricState: STITCH_CONTEXT_TRIGGERS.biometric(hrv, cortisol),
      activityState: STITCH_CONTEXT_TRIGGERS.activity(inactivity),
      hour,
      hrv,
      cortisol
    };
  }

  applyContext(context) {
    this.currentContext = context;
    this.applyPalette(context.timeOfDay);
    this.applyLayoutChanges(context);
    this.triggerHapticTransition(context);
  }

  applyPalette(timeOfDay) {
    const theme = POMELLI_PALETTE[timeOfDay];
    if (!theme) return;

    document.documentElement.style.setProperty('--bg-primary', theme.primary);
    
    if (theme.accent) {
      document.documentElement.style.setProperty('--accent-energy', theme.accent.energy);
      document.documentElement.style.setProperty('--accent-calm', theme.accent.calm);
    }

    this.applyGlassmorphism(POMELLI_PALETTE.bioTech.glassmorphism);
    console.log(`[Stitch] Applied ${timeOfDay} palette`);
  }

  applyGlassmorphism(config) {
    document.documentElement.style.setProperty('--glass-bg', config.background);
    document.documentElement.style.setProperty('--glass-blur', config.blur);
    document.documentElement.style.setProperty('--glass-border', config.border);
  }

  applyLayoutChanges(context) {
    const container = document.querySelector('.app-container');
    if (!container) return;

    if (context.biometricState === 'stressed') {
      container.classList.add('calm-mode');
      this.simplifyInterface();
    } else {
      container.classList.remove('calm-mode');
      this.expandInterface();
    }

    if (context.timeOfDay === 'night') {
      this.reduceContrast();
      this.enableLowBrightness();
    }
  }

  simplifyInterface() {
    document.querySelectorAll('.secondary-action').forEach(el => {
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';
    });
    console.log('[Stitch] Interface simplified for stress state');
  }

  expandInterface() {
    document.querySelectorAll('.secondary-action').forEach(el => {
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
  }

  reduceContrast() {
    document.body.classList.add('low-contrast');
  }

  enableLowBrightness() {
    document.documentElement.style.setProperty('--brightness', '0.7');
  }

  triggerHapticTransition(context) {
    if (window.HapticEngine) {
      if (context.biometricState === 'stressed') {
        window.HapticEngine.trigger('stress');
      } else if (context.timeOfDay === 'night') {
        window.HapticEngine.trigger('sleepPrep');
      }
    }
  }

  adaptiveCardVisibility(data) {
    const relevanceScore = this.calculateRelevance(data);
    return {
      visible: relevanceScore > 0.4,
      position: this.determinePosition(relevance),
      animation: relevanceScore > 0.7 ? 'fade-in' : 'slide-up'
    };
  }

  calculateRelevance(data) {
    const context = this.getContextState();
    let score = 0;
    
    if (data.type === 'nutrition' && context.activityState !== 'active') score += 0.3;
    if (data.type === 'meditation' && context.biometricState === 'stressed') score += 0.5;
    if (data.type === 'exercise' && context.activityState === 'sedentary') score += 0.5;
    
    return Math.min(score, 1.0);
  }
}

const stitchAdapter = new StitchAdapter();

window.StitchAdapter = stitchAdapter;