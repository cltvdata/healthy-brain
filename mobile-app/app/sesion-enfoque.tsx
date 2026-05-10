import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Platform } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function SesionEnfoqueScreen() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25 min default
  const [isSaving, setIsSaving] = useState(false);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Rhythmic Breathing Animation (4s in, 4s out)
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isActive]);

  const finishSession = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const logsRef = collection(userRef, 'logs');

      await addDoc(logsRef, {
        type: 'focus',
        category: 'performance',
        durationMinutes: 25,
        ntkEarned: 50,
        timestamp: serverTimestamp()
      });

      await updateDoc(userRef, {
        ntkBalance: increment(50)
      });

      router.push('/');
    } catch (e) {
      console.error("Save Focus Session Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      finishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const ringGlow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 209, 255, 0.05)', 'rgba(0, 209, 255, 0.2)']
  });

  return (
    <View style={[AppStyles.body, { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={{ padding: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }]}>PORTAL DE SOBERANÍA 🧠</Text>
        <Ionicons name="infinite" size={24} color={isActive ? AppColors.primaryNeonBlue : "rgba(255,255,255,0.4)"} />
      </View>

      {/* Main Focus UI */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        
        <Animated.View style={[
          styles.timerRing, 
          { 
            transform: [{ scale: pulseAnim }],
            backgroundColor: ringGlow,
            borderColor: isActive ? AppColors.primaryNeonBlue : 'rgba(255,255,255,0.05)'
          }
        ]}>
           <Text style={styles.timerText}>{formatTime(seconds)}</Text>
           <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 10, letterSpacing: 6, color: isActive ? AppColors.primaryNeonBlue : AppColors.textGray }]}>
             {isActive ? 'INTERLINK ACTIVO' : 'ESTADO EN ESPERA'}
           </Text>
        </Animated.View>

        <View style={{ marginTop: 60, paddingHorizontal: 40, alignItems: 'center' }}>
          <Text style={[AppStyles.textWhite, { fontSize: 18, textAlign: 'center', fontWeight: 'bold' }]}>
            {isActive ? 'Sincronización de Coherencia' : 'Preparando Interlink...'}
          </Text>
          <Text style={[AppStyles.textGray, { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 }]}>
            {isActive 
              ? 'Respira al ritmo del pulso. Tu atención está siendo minada como un activo de soberanía.'
              : 'Protocolo de recuperación neuroquímica. Reduce estímulos visuales y entra en el flujo.'}
          </Text>
        </View>
      </View>

      {/* Control Tray */}
      <View style={{ padding: 40, paddingBottom: 60, alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          style={isActive ? styles.stopBtn : styles.startBtn}
        >
          <Text style={{ color: isActive ? '#fff' : '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2 }}>
            {isActive ? 'SUSPENDER CONEXIÓN' : 'INICIAR INTERLINK'}
          </Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', marginTop: 40, gap: 40 }}>
          <View style={styles.statBox}>
             <Ionicons name="pulse" size={18} color={AppColors.primaryNeonBlue} />
             <Text style={styles.statVal}>+2.5%</Text>
             <Text style={styles.statLab}>Foco</Text>
          </View>
          <View style={styles.statBox}>
             <Ionicons name="diamond" size={18} color={AppColors.primaryOrange} />
             <Text style={[styles.statVal, { color: AppColors.primaryOrange }]}>50 NTK</Text>
             <Text style={styles.statLab}>RECURSO</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timerRing: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 80,
    color: '#fff',
    fontWeight: '200',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  startBtn: {
    backgroundColor: '#fff',
    paddingVertical: 22,
    paddingHorizontal: 50,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  stopBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 22,
    paddingHorizontal: 50,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statBox: {
    alignItems: 'center',
    gap: 5
  },
  statVal: {
    color: AppColors.primaryNeonBlue,
    fontSize: 18,
    fontWeight: '900'
  },
  statLab: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
