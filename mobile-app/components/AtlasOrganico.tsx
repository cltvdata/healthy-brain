import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet, Image } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';

// 3D Assets generated in Phase 12
const ASSETS = {
  brain: require('../assets/anatomy/brain.png'),
  respiratory: require('../assets/anatomy/respiratory.png'),
  torso: require('../assets/anatomy/torso.png'),
};

type Layer = 'skeletal' | 'muscular' | 'organs' | 'brain' | 'respiratory';

export default function AtlasOrganico() {
  const [activeLayer, setActiveLayer] = useState<Layer>('muscular');
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 3000,
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
  }, []);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
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
         <View style={styles.anatomyFrame}>
            {activeLayer === 'skeletal' && (
              <Ionicons name="skull" size={120} color="rgba(255,255,255,0.7)" style={styles.anatomyIcon} />
            )}
            {activeLayer === 'muscular' && (
              <Ionicons name="body" size={140} color={AppColors.primaryOrange} style={styles.anatomyIcon} />
            )}
            {activeLayer === 'organs' && (
              <Ionicons name="heart" size={100} color="#ff3b30" style={styles.anatomyIcon} />
            )}

            {/* Scanning Line Overlay */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
               <View style={styles.scanGlow} />
            </Animated.View>
         </View>

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
  }
});
