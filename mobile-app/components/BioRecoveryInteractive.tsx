import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { MuscleState } from '@/services/RecoveryService';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  muscleStates: MuscleState[];
  size?: number;
}

export default function BioRecoveryInteractive({ muscleStates, size = 300 }: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleState | null>(null);

  useEffect(() => {
    // Continuous rotation for 3D effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusColor = (percentage: number) => {
    if (percentage > 85) return AppColors.primaryBioGreen; // Optimal
    if (percentage > 50) return AppColors.primaryOrange;   // Recovering
    return '#ff4444'; // Fatigued
  };

  const getMuscleCoordinates = (id: string) => {
    const coords: Record<string, { top: string, left: string }> = {
      'chest_upper': { top: '25%', left: '45%' },
      'chest_lower': { top: '30%', left: '45%' },
      'back_lats': { top: '35%', left: '20%' },
      'back_lower': { top: '45%', left: '45%' },
      'shoulders_front': { top: '25%', left: '30%' },
      'shoulders_side': { top: '25%', left: '20%' },
      'shoulders_rear': { top: '25%', left: '70%' },
      'quads': { top: '60%', left: '45%' },
      'hamstrings': { top: '65%', left: '45%' },
      'glutes': { top: '55%', left: '45%' },
      'calves': { top: '80%', left: '45%' },
      'biceps': { top: '35%', left: '30%' },
      'triceps': { top: '35%', left: '70%' },
      'abs': { top: '40%', left: '45%' },
      'forearms': { top: '45%', left: '20%' }
    };
    return coords[id] || { top: '50%', left: '50%' };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Pulse Glow */}
      <View style={[styles.glow, { backgroundColor: selectedMuscle ? getStatusColor(selectedMuscle.recoveryPercentage) : AppColors.primaryNeonBlue }]} />

      {/* Rotating Wireframe Avatar */}
      <Animated.View style={{ transform: [{ rotateY: spin }] }}>
         <Image 
           source={require('../assets/anatomy/torso.jpg')} 
           style={{ width: size, height: size, resizeMode: 'contain', opacity: 0.8 }}
         />
      </Animated.View>

      {/* Interactive Overlays (Simulated hotspots) */}
      <View style={StyleSheet.absoluteFill}>
          {muscleStates.map(m => {
            const coords = getMuscleCoordinates(m.id);
            if (!coords) return null;
            return (
              <TouchableOpacity 
                key={m.id}
                style={[styles.hotspot, { top: coords.top, left: coords.left }]}
                onPress={() => setSelectedMuscle(m)}
              >
                <View style={[styles.dot, { backgroundColor: getStatusColor(m.recoveryPercentage) }]} />
              </TouchableOpacity>
            );
          })}
      </View>

      {/* Legend / Selected Detail Overlay */}
      {selectedMuscle && (
        <View style={styles.detailPopup}>
          <Text style={styles.detailTitle}>{selectedMuscle.name.toUpperCase()}</Text>
          <View style={AppStyles.rowBetween}>
            <Text style={styles.detailValue}>{selectedMuscle.recoveryPercentage}% RECUPERADO</Text>
            <Text style={styles.detailTime}>{selectedMuscle.timeRemainingH}H RESTANTE</Text>
          </View>
          <View style={[styles.progressBar, { width: `${selectedMuscle.recoveryPercentage}%`, backgroundColor: getStatusColor(selectedMuscle.recoveryPercentage) }]} />
          <TouchableOpacity onPress={() => setSelectedMuscle(null)} style={styles.closeBtn}>
             <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* HUD Scanlines */}
      <View style={styles.scanlines} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    opacity: 0.1,
  },
  hotspot: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  detailPopup: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 15,
    borderRadius: 15,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 5,
  },
  detailValue: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailTime: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 3,
    marginTop: 10,
    borderRadius: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: 'rgba(0,255,255,0.03)',
  }
});
