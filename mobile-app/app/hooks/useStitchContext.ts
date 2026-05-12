import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';

const POMELLI_PALETTE = {
  bioTech: {
    primary: '#0a0a0a',
    surface: '#121212',
    energy: '#ff8a00',
    calm: '#00d1ff',
    growth: '#13ec5b'
  },
  dawn: { primary: '#1a1a2e', accent: '#f39c12', calm: '#74b9ff' },
  noon: { primary: '#16213e', accent: '#e74c3c', calm: '#3498db' },
  dusk: { primary: '#0f0f23', accent: '#9b59b6', calm: '#1abc9c' },
  night: { primary: '#050510', accent: '#2c3e50', calm: '#34495e' }
};

export interface StitchContext {
  timeOfDay: 'dawn' | 'noon' | 'dusk' | 'night';
  biometricState: 'stressed' | 'balanced' | 'neutral';
  activityState: 'sedentary' | 'idle' | 'active';
  palette: typeof POMELLI_PALETTE.bioTech;
  hrv: number;
  cortisol: number;
  hour: number;
}

export function useStitchContext() {
  const systemColorScheme = useColorScheme();
  const [context, setContext] = useState<StitchContext>({
    timeOfDay: getTimeOfDay(new Date().getHours()),
    biometricState: 'balanced',
    activityState: 'active',
    palette: POMELLI_PALETTE.bioTech,
    hrv: 50,
    cortisol: 50,
    hour: new Date().getHours()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      updateContext();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeOfDay = (hour: number) => {
    if (hour >= 5 && hour < 12) return 'dawn';
    if (hour >= 12 && hour < 17) return 'noon';
    if (hour >= 17 && hour < 21) return 'dusk';
    return 'night';
  };

  const updateContext = () => {
    const hour = new Date().getHours();
    setContext(prev => ({
      ...prev,
      timeOfDay: getTimeOfDay(hour),
      hour,
      palette: POMELLI_PALETTE[getTimeOfDay(hour)] as any
    }));
  };

  const updateBiometrics = useCallback((hrv: number, cortisol: number) => {
    setContext(prev => {
      let biometricState: StitchContext['biometricState'] = 'neutral';
      if (hrv < 25 && cortisol > 80) biometricState = 'stressed';
      else if (hrv > 60 && cortisol < 40) biometricState = 'balanced';
      
      return { ...prev, hrv, cortisol, biometricState };
    });
  }, []);

  const updateActivity = useCallback((inactivityMinutes: number) => {
    setContext(prev => {
      let activityState: StitchContext['activityState'] = 'active';
      if (inactivityMinutes > 120) activityState = 'sedentary';
      else if (inactivityMinutes > 60) activityState = 'idle';
      
      return { ...prev, activityState };
    });
  }, []);

  const getTheme = () => {
    const timePalette = POMELLI_PALETTE[context.timeOfDay];
    return {
      dark: true,
      colors: {
        primary: timePalette.accent,
        background: timePalette.primary,
        card: POMELLI_PALETTE.bioTech.surface,
        text: '#ffffff',
        border: 'rgba(255,255,255,0.1)',
        notification: POMELLI_PALETTE.bioTech.energy
      }
    };
  };

  return {
    context,
    updateBiometrics,
    updateActivity,
    getTheme,
    palette: POMELLI_PALETTE
  };
}