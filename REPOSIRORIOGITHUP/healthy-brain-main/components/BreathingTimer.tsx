import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { AppColors } from '@/constants/AppStyles';

export default function BreathingTimer({ durationSeconds = 60 }: { durationSeconds?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  // Box Breathing cycle: 4s inhale (scale up), 4s hold, 4s exhale (scale down), 4s hold
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }), // Inhale
        withTiming(1.5, { duration: 4000 }), // Hold
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }), // Exhale
        withTiming(1, { duration: 4000 }) // Hold
      ),
      -1, // infinite loop
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }), // Inhale
        withTiming(1, { duration: 4000 }), // Hold
        withTiming(0.5, { duration: 4000 }), // Exhale
        withTiming(0.5, { duration: 4000 }) // Hold
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, animatedStyle]} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Respira</Text>
        <Text style={styles.subtitle}>4s Inhala - 4s Mantén - 4s Exhala</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.primaryNeonBlue,
    shadowColor: AppColors.primaryNeonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  title: {
    color: AppColors.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: AppColors.textWhite,
    fontSize: 12,
    marginTop: 5,
    opacity: 0.8,
  }
});
