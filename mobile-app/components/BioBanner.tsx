import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { BioSensorService } from '@/services/BioSensorService';

const { width } = Dimensions.get('window');

export interface BioBannerRef {
  show: (message: string, type?: 'info' | 'warning' | 'reward', duration?: number) => void;
}

const BioBanner = forwardRef<BioBannerRef, {}>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'reward'>('info');
  const slideAnim = useState(new Animated.Value(-120))[0];

  useImperativeHandle(ref, () => ({
    show(msg, t = 'info', duration = 5000) {
      setMessage(msg);
      setType(t);
      setVisible(true);
      
      // Feedback físico sutil
      BioSensorService.triggerHaptic(t === 'warning' ? 'warning' : 'selection');

      Animated.spring(slideAnim, {
        toValue: 50,
        useNativeDriver: true,
        bounciness: 8
      }).start();

      setTimeout(() => {
        hide();
      }, duration);
    }
  }));

  const hide = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true
    }).start(() => setVisible(false));
  };

  const getColors = () => {
    switch(type) {
      case 'warning': return { bg: '#FF4500', icon: 'alert-circle' };
      case 'reward': return { bg: AppColors.primaryBioGreen, icon: 'flash' };
      default: return { bg: AppColors.primaryNeonBlue, icon: 'notifications' };
    }
  };

  if (!visible) return null;

  const info = getColors();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={hide}
        style={[styles.banner, { backgroundColor: info.bg }]}
      >
        <Ionicons name={info.icon as any} size={22} color="black" style={{ marginRight: 15 }} />
        <View style={{ flex: 1 }}>
           <Text style={styles.title}>{type.toUpperCase()}</Text>
           <Text style={styles.message} numberOfLines={2}>{message}</Text>
        </View>
        <Ionicons name="close" size={18} color="rgba(0,0,0,0.3)" />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    zIndex: 9999,
  },
  banner: {
    height: 75,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10
  },
  title: {
    color: 'black',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.6
  },
  message: {
    color: 'black',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2
  }
});

export default BioBanner;
