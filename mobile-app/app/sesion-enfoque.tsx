import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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

  return (
    <View style={[AppStyles.body, { backgroundColor: '#000' }]}>
      {/* Header */}
      <View style={{ padding: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Dopamine Reset 🧠</Text>
        <Ionicons name="ellipsis-horizontal" size={24} color="rgba(255,255,255,0.4)" />
      </View>

      {/* Main Focus UI */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.timerRing}>
           <Text style={styles.timerText}>{formatTime(seconds)}</Text>
           <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 10, letterSpacing: 4 }]}>DEEP FOCUS</Text>
        </View>

        <View style={{ marginTop: 60, paddingHorizontal: 40, alignItems: 'center' }}>
          <Text style={[AppStyles.textWhite, { fontSize: 18, textAlign: 'center', fontWeight: 'bold' }]}>
            Desconectando del ruido...
          </Text>
          <Text style={[AppStyles.textGray, { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 }]}>
            Protocolo de recuperación neuroquímica. Mantén la aplicación abierta y reduce estímulos visuales.
          </Text>
        </View>
      </View>

      {/* Control Tray */}
      <View style={{ padding: 40, paddingBottom: 60, alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          style={isActive ? styles.stopBtn : styles.startBtn}
        >
          <Text style={{ color: isActive ? '#fff' : '#000', fontWeight: 'bold', fontSize: 16 }}>
            {isActive ? 'Pausa Cerebral' : 'Iniciar Reset'}
          </Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', marginTop: 30, gap: 25 }}>
          <View style={styles.statBox}>
             <Text style={styles.statVal}>+2.5%</Text>
             <Text style={styles.statLab}>Foco</Text>
          </View>
          <View style={styles.statBox}>
             <Text style={styles.statVal}>50 NTK</Text>
             <Text style={styles.statLab}>Bono</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timerRing: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 2,
    borderColor: 'rgba(19, 236, 91, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 236, 91, 0.02)'
  },
  timerText: {
    fontSize: 70,
    color: '#fff',
    fontWeight: '300',
    fontFamily: 'Courier'
  },
  startBtn: {
    backgroundColor: AppColors.primaryBioGreen,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center'
  },
  stopBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  statBox: {
    alignItems: 'center'
  },
  statVal: {
    color: AppColors.primaryBioGreen,
    fontSize: 16,
    fontWeight: 'bold'
  },
  statLab: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 4
  }
});
