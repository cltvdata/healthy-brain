import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet, Image } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';

// 3D Assets generated in Phase 12
const ASSETS = {
  brain: require('../assets/anatomy/brain.jpg'),
  respiratory: require('../assets/anatomy/respiratory.jpg'),
  torso: require('../assets/anatomy/torso.jpg'),
};

type Layer = 'skeletal' | 'muscular' | 'organs' | 'brain' | 'respiratory';

interface AtlasOrganicoProps {
  score?: number;
  hrv?: number;
}

export default function AtlasOrganico({ score = 85, hrv = 60 }: AtlasOrganicoProps) {
  const [activeLayer, setActiveLayer] = useState<Layer>('muscular');
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate dynamic colors
  const getStatusColor = () => {
    if (hrv > 75) return AppColors.primaryBioGreen; // Optimal
    if (hrv > 55) return AppColors.primaryNeonBlue; // Good / Stable
    if (hrv > 40) return AppColors.primaryOrange;   // Recovering
    return '#FF4D4D';                               // Fatigue / Red
  };

  const statusColor = getStatusColor();
  const scanDuration = 4000 - (score * 20); // Faster scan with higher score

  useEffect(() => {
    // Scan Line Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: scanDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Soft Pulse Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [score, hrv]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, height: 350 }]}>
      <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
         <View style={AppStyles.rowCentered}>
            <Ionicons name="body" size={22} color={AppColors.primaryBioGreen} style={{ marginRight: 10 }} />
            <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Atlas Anatómico 3D</Text>
         </View>
         <View style={{ backgroundColor: 'rgba(19, 236, 91, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>LIVE SYNC</Text>
         </View>
      </View>

      {/* Interactive Anatomy Preview Area */}
      <View style={styles.anatomyContainer}>
         {/* Anatomy Layers Simulation */}
            {/* Anatomy Layers Simulation */}
            <Animated.View style={[styles.anatomyFrame, { transform: [{ scale: pulseAnim }] }]}>
               {activeLayer === 'skeletal' && (
                  <View style={StyleSheet.absoluteFill}>
                    <Image 
                      source={ASSETS.torso} 
                      style={[styles.image, { opacity: 0.3 }]} 
                    />
                    <View style={styles.skeletalOverlay}>
                      <Ionicons name="skull" size={140} color={statusColor} style={{ opacity: 0.7 }} />
                      <Text style={styles.layerOverlayText}>ESTRUCTURA ÓSEA</Text>
                    </View>
                  </View>
               )}
               {activeLayer === 'muscular' && (
                  <Image source={ASSETS.torso} style={[styles.image, { opacity: 0.9 }]} />
               )}
               {activeLayer === 'organs' && (
                  <View style={StyleSheet.absoluteFill}>
                    <Image 
                      source={ASSETS.respiratory} 
                      style={[styles.image, { opacity: 0.85 }]} 
                    />
                    <View style={styles.organOverlay}>
                       <Ionicons name="medical" size={100} color={statusColor} style={{ opacity: 0.5 }} />
                       <Text style={styles.layerOverlayText}>SISTEMA VITAL</Text>
                    </View>
                  </View>
               )}
               {activeLayer === 'brain' && (
                  <Image source={ASSETS.brain} style={[styles.image, { opacity: 0.9 }]} />
               )}

               {/* Scanning Line Overlay */}
               <Animated.View style={[styles.scanLine, { transform: [{ translateY }], backgroundColor: statusColor }]}>
                  <View style={[styles.scanGlow, { backgroundColor: statusColor + '20' }]} />
               </Animated.View>
            </Animated.View>

         {/* Layer Controls */}
         <View style={styles.controls}>
            <TouchableOpacity 
              onPress={() => setActiveLayer('skeletal')}
              style={[styles.controlBtn, activeLayer === 'skeletal' && styles.activeBtn]}
            >
               <Ionicons name="skull-outline" size={18} color={activeLayer === 'skeletal' ? 'black' : 'white'} />
               <Text style={[styles.controlText, { color: activeLayer === 'skeletal' ? 'black' : 'white' }]}>Esqueleto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setActiveLayer('muscular')}
              style={[styles.controlBtn, activeLayer === 'muscular' && styles.activeBtn]}
            >
               <Ionicons name="barbell" size={18} color={activeLayer === 'muscular' ? 'black' : 'white'} />
               <Text style={[styles.controlText, { color: activeLayer === 'muscular' ? 'black' : 'white' }]}>Muscular</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveLayer('organs')}
              style={[styles.controlBtn, activeLayer === 'organs' && styles.activeBtn]}
            >
               <Ionicons name="medical" size={18} color={activeLayer === 'organs' ? 'black' : 'white'} />
               <Text style={[styles.controlText, { color: activeLayer === 'organs' ? 'black' : 'white' }]}>Órganos</Text>
            </TouchableOpacity>
         </View>
      </View>

      <Text style={[AppStyles.textGray, { fontSize: 11, marginTop: 15, fontStyle: 'italic', textAlign: 'center' }]}>
         Pulsa una capa para profundizar en tu composición biológica actual.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  anatomyContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 15,
  },
  anatomyFrame: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  anatomyIcon: {
    opacity: 0.8,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: AppColors.primaryBioGreen,
    zIndex: 10,
  },
  scanGlow: {
    height: 40,
    width: '100%',
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    marginTop: -20,
  },
  controls: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  activeBtn: {
    backgroundColor: AppColors.primaryBioGreen,
  },
  controlText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  skeletalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  organOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  layerOverlayText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5
  }
});
