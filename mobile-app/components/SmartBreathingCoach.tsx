import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppColors } from '@/constants/AppStyles';

// Pomelli DNA
const THEME_COLOR_BREATH = AppColors.primaryNeonBlue;
const THEME_COLOR_SLEEP = '#a855f7'; // Purple Noir para ondas Delta

const aiBreathingProtocol = {
  inhaleTime: 4000,
  holdTime: 7000,
  exhaleTime: 8000, 
};

const aiSleepProtocol = {
  pulseTime: 6000, // Onda lenta y profunda
  restTime: 4000,
};

export const SmartBreathingCoach = ({ isActive, mode = 'breath' }: { isActive: boolean, mode?: 'breath' | 'sleep' }) => {
  const [phase, setPhase] = useState<string>(mode === 'breath' ? 'Prepara tu respiración' : 'Cierra los ojos');
  const [pulseAnim] = useState(new Animated.Value(1)); 
  const [flashAnim] = useState(new Animated.Value(0));

  const activeColor = mode === 'breath' ? THEME_COLOR_BREATH : THEME_COLOR_SLEEP;

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS === 'web') {
      // Visual fallback for web
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Haptics.impactAsync(style);
    }
  };

  useEffect(() => {
    let active = isActive;

    const runBreathingCycle = async () => {
      if (!active) return;
      
      while (active) {
        // --- INHALE ---
        setPhase('Inhala');
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: aiBreathingProtocol.inhaleTime,
          useNativeDriver: true,
        }).start();

        for (let i = 0; i < 4; i++) {
          if (!active) break;
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          await new Promise(r => setTimeout(r, aiBreathingProtocol.inhaleTime / 4));
        }

        if (!active) break;

        // --- HOLD ---
        setPhase('Sostén');
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: aiBreathingProtocol.holdTime,
          useNativeDriver: true,
        }).start();

        await new Promise(r => setTimeout(r, aiBreathingProtocol.holdTime));

        if (!active) break;

        // --- EXHALE ---
        setPhase('Exhala');
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: aiBreathingProtocol.exhaleTime,
          useNativeDriver: true,
        }).start();

        for (let i = 0; i < 4; i++) {
          if (!active) break;
          triggerHaptic(Haptics.ImpactFeedbackStyle.Soft);
          await new Promise(r => setTimeout(r, aiBreathingProtocol.exhaleTime / 4));
        }
      }
    };

    const runSleepCycle = async () => {
      if (!active) return;
      
      while (active) {
        setPhase('Ondas Delta');
        Animated.timing(pulseAnim, {
          toValue: 1.8,
          duration: aiSleepProtocol.pulseTime,
          useNativeDriver: true,
        }).start();

        // Haptic simulación ondas delta (1 pulso suave y extendido)
        triggerHaptic(Haptics.ImpactFeedbackStyle.Soft);
        await new Promise(r => setTimeout(r, 1000));
        if (!active) break;
        triggerHaptic(Haptics.ImpactFeedbackStyle.Soft);
        await new Promise(r => setTimeout(r, aiSleepProtocol.pulseTime - 1000));

        if (!active) break;

        setPhase('Descansa');
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: aiSleepProtocol.restTime,
          useNativeDriver: true,
        }).start();

        await new Promise(r => setTimeout(r, aiSleepProtocol.restTime));
      }
    };

    if (isActive) {
      if (mode === 'breath') {
        runBreathingCycle();
      } else {
        runSleepCycle();
      }
    } else {
      setPhase('Pausado');
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    return () => { active = false; };
  }, [isActive, mode]);

  return (
    <View style={styles.container}>
      {/* Fallback Flash Animation para Web */}
      <Animated.View style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: activeColor,
          opacity: flashAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.15]
          }),
          borderRadius: 125,
          transform: [{ scale: 1.5 }]
        }
      ]} />

      {/* Stitch Design: Organic glowing core con color dinámico */}
      <Animated.View style={[
        styles.glowCore, 
        { 
          transform: [{ scale: pulseAnim }],
          backgroundColor: mode === 'breath' ? 'rgba(0, 209, 255, 0.1)' : 'rgba(168, 85, 247, 0.1)',
          borderColor: mode === 'breath' ? 'rgba(0, 209, 255, 0.4)' : 'rgba(168, 85, 247, 0.4)',
          shadowColor: activeColor
        }
      ]} />
      
      <View style={styles.centerTextContainer}>
        <Text style={styles.phaseText}>{phase}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    height: 250,
    backgroundColor: 'transparent', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  glowCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
    position: 'absolute'
  },
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: { 
    color: '#ffffff', 
    fontFamily: 'Inter', 
    fontSize: 22, 
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  }
});
