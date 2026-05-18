import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type WellnessTechnique = 
  | 'box_breathing'
  | '478_breathing'
  | 'coherent_breathing'
  | 'vagal_breathing'
  | 'body_scan'
  | 'mindfulness'
  | 'sleep_meditation'
  | 'stress_relief'
  | 'energy_boost';

export interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  color: string;
}

export interface WellnessSession {
  id: string;
  technique: WellnessTechnique;
  duration: number; // seconds
  completed: boolean;
  stressBefore: number;
  stressAfter?: number;
}

export const BREATHING_PATTERNS: Record<WellnessTechnique, BreathingPattern> = {
  box_breathing: {
    name: 'Respiración Cuadrada',
    description: '4-4-4-4 | Equilibra el sistema nervioso',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 6,
    color: '#00d1ff'
  },
  '478_breathing': {
    name: 'Técnica 4-7-8',
    description: '4-7-8 | Reduce ansiedad y帮助你 dormir',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
    color: '#13ec5b'
  },
  coherent_breathing: {
    name: 'Coherencia Cardíaca',
    description: '5-5 | Optimiza variabilidad cardíaca',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    cycles: 12,
    color: '#a855f7'
  },
  vagal_breathing: {
    name: 'Respiración Vagal',
    description: '4-7-8 lento | Activa nervio vago',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 2,
    cycles: 5,
    color: '#ff6b35'
  },
  body_scan: {
    name: 'Escaneo Corporal',
    description: 'Relaja cada parte del cuerpo',
    inhale: 4,
    hold1: 4,
    exhale: 6,
    hold2: 0,
    cycles: 8,
    color: '#ffd700'
  },
  mindfulness: {
    name: 'Mindfulness Guiado',
    description: 'Conciencia del momento presente',
    inhale: 4,
    hold1: 2,
    exhale: 4,
    hold2: 2,
    cycles: 10,
    color: '#3b82f6'
  },
  sleep_meditation: {
    name: 'Meditación para Dormir',
    description: 'Ondas cerebrales alfa-theta',
    inhale: 4,
    hold1: 4,
    exhale: 6,
    hold2: 2,
    cycles: 15,
    color: '#8b5cf6'
  },
  stress_relief: {
    name: 'Alivio del Estrés',
    description: 'Técnica de descarga rápida',
    inhale: 3,
    hold1: 3,
    exhale: 6,
    hold2: 0,
    cycles: 8,
    color: '#ef4444'
  },
  energy_boost: {
    name: 'Impulso de Energía',
    description: 'Respiración energizante',
    inhale: 2,
    hold1: 0,
    exhale: 2,
    hold2: 0,
    cycles: 20,
    color: '#f59e0b'
  }
};

export class BioWellnessService {
  private static soundObject: Audio.Sound | null = null;
  private static isPlaying: boolean = false;

  /**
   * Detectar nivel de estrés basado en HRV
   */
  static detectStressLevel(hrv: number): { level: 'low' | 'medium' | 'high' | 'critical', score: number, recommendation: WellnessTechnique } {
    if (hrv >= 80) {
      return { 
        level: 'low', 
        score: Math.round((hrv - 80) / 2),
        recommendation: 'energy_boost'
      };
    } else if (hrv >= 60) {
      return { 
        level: 'medium', 
        score: Math.round(50 - (hrv - 60) / 2),
        recommendation: 'coherent_breathing'
      };
    } else if (hrv >= 40) {
      return { 
        level: 'high', 
        score: Math.round(75 - (hrv - 40)),
        recommendation: '478_breathing'
      };
    } else {
      return { 
        level: 'critical', 
        score: 100,
        recommendation: 'vagal_breathing'
      };
    }
  }

  /**
   * Obtener recomendación basada en el momento del día
   */
  static getRecommendationByTime(): { technique: WellnessTechnique, title: string, description: string } {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 10) {
      return { 
        technique: 'energy_boost', 
        title: '🌅 Morning Boost', 
        description: 'Despierta tu cuerpo con respiración energizante' 
      };
    } else if (hour >= 10 && hour < 14) {
      return { 
        technique: 'coherent_breathing', 
        title: '⚡ Enfoque Cardíaco', 
        description: 'Optimiza tu HRV para máximo rendimiento' 
      };
    } else if (hour >= 14 && hour < 18) {
      return { 
        technique: 'box_breathing', 
        title: '🧠 Reset Mental', 
        description: 'Recarga y limpia la mente' 
      };
    } else if (hour >= 18 && hour < 21) {
      return { 
        technique: 'stress_relief', 
        title: '🌅 Transición Tarde', 
        description: 'Libera la tensión del día' 
      };
    } else {
      return { 
        technique: 'sleep_meditation', 
        title: '🌙 Sueño Reparador', 
        description: 'Prepara tu cuerpo para descansar' 
      };
    }
  }

  /**
   * Reproducir sonido relajante
   */
  static async playSound(soundName: 'harmonicas' | 'deep_sleep' | 'alpha_flow' | 'nature' | 'white_noise'): Promise<boolean> {
    try {
      // Detener cualquier sonido anterior
      await this.stopSound();

      // Configurar audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Map sounds to files (commented out until physical assets are present in assets/)
      const soundFiles: Record<string, any> = {
        // harmonicas: require('../assets/Harmonic_Frequencies_DEFAULT_MusicGPT.mp3'),
        // deep_sleep: require('../assets/Deep_Sleep_Transition_DEFAULT_MusicGPT.mp3'),
        // alpha_flow: require('../assets/Alpha_Flow_Pulse.mp3'),
      };

      const soundSource = soundFiles[soundName];
      
      if (soundSource) {
        const { sound } = await Audio.Sound.createAsync(soundSource, {
          isLooping: true,
          volume: 0.7,
        });
        this.soundObject = sound;
        this.isPlaying = true;
        await sound.playAsync();
        return true;
      }
      
      return false;
    } catch (error) {
      console.log("[BioWellness] Sound error, using haptics only:", error);
      return false;
    }
  }

  /**
   * Detener sonido
   */
  static async stopSound(): Promise<void> {
    try {
      if (this.soundObject) {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
        this.soundObject = null;
      }
      this.isPlaying = false;
    } catch (error) {
      console.error("[BioWellness] Error stopping sound:", error);
    }
  }

  /**
   * Vibración háptica según fase de respiración
   */
  static triggerBreathHaptic(phase: 'inhale' | 'hold' | 'exhale' | 'rest'): void {
    try {
      switch (phase) {
        case 'inhale':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'hold':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'exhale':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'rest':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      console.log("[BioWellness] Haptic error:", error);
    }
  }

  /**
   * Vibración de notificación de estrés detectado
   */
  static triggerStressAlert(): void {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }, 500);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }, 1000);
    } catch (error) {
      console.log("[BioWellness] Alert haptic error:", error);
    }
  }

  /**
   * Vibración de sesión completada
   */
  static triggerCompletion(): void {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log("[BioWellness] Completion haptic error:", error);
    }
  }

  /**
   * Calcular tiempo total de una sesión
   */
  static calculateSessionTime(technique: WellnessTechnique): number {
    const pattern = BREATHING_PATTERNS[technique];
    const cycleTime = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;
    return cycleTime * pattern.cycles;
  }

  /**
   * Obtener técnica recomendada segúnHRV y hora del día
   */
  static getOptimalTechnique(hrv?: number): { technique: WellnessTechnique, reason: string } {
    // Si hay HRV, usar detección de estrés
    if (hrv !== undefined && hrv !== null) {
      const stress = this.detectStressLevel(hrv);
      return { 
        technique: stress.recommendation, 
        reason: `Tu HRV de ${hrv} indica nivel de estrés ${stress.level}. ${BREATHING_PATTERNS[stress.recommendation].name} es ideal para ti.` 
      };
    }
    
    // Sinon, usar hora del día
    const byTime = this.getRecommendationByTime();
    return { 
      technique: byTime.technique, 
      reason: byTime.description 
    };
  }
}