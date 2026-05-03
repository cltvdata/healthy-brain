import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';

interface Props {
  size?: number;
  glowColor?: string;
  intensity?: 'high' | 'normal' | 'low';
}

export default function BioAvatar3D({ size = 200, glowColor = AppColors.primaryNeonBlue, intensity = 'normal' }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow Background */}
      <Animated.View 
        style={[
          styles.glow, 
          { 
            backgroundColor: glowColor, 
            transform: [{ scale: pulseAnim }],
            opacity: intensity === 'high' ? 0.3 : 0.15 
          }
        ]} 
      />

      {/* Hero Image (The 3D Wireframe) */}
      <Animated.View style={{ transform: [{ rotateY: spin }] }}>
         <Image 
           source={require('../../bio_avatar_wireframe_3d_1776564940890.png')} 
           style={{ width: size, height: size, resizeMode: 'contain' }}
         />
      </Animated.View>

      {/* scanlines overlay */}
      <View style={styles.scanlineOverlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    opacity: 0.5,
  }
});
