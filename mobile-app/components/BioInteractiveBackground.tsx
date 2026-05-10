import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface BioInteractiveBackgroundProps {
  type: 'brain' | 'lungs' | 'muscles';
  intensity?: number; // 0 to 1
  isAnimating?: boolean;
  tintColor?: string;
}

export const BioInteractiveBackground: React.FC<BioInteractiveBackgroundProps> = ({ 
  type, 
  intensity = 0.5, 
  isAnimating = false,
  tintColor = 'rgba(255, 255, 255, 0.4)'
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAnimating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: type === 'lungs' ? 3000 : 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: type === 'lungs' ? 3500 : 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isAnimating, type]);

  const getSource = () => {
    switch (type) {
      case 'brain':
        return require('../assets/anatomy/brain.jpg');
      case 'lungs':
        return require('../assets/anatomy/respiratory.jpg');
      case 'muscles':
        return require('../assets/anatomy/torso.jpg');
      default:
        return require('../assets/anatomy/brain.jpg');
    }
  };

  const animatedStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, type === 'lungs' ? 1.1 : 1.05],
        }),
      },
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.2 + (intensity * 0.1)],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image 
          source={getSource()} 
          style={[styles.image, tintColor ? { tintColor } : null]} 
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: width * 1.2,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
