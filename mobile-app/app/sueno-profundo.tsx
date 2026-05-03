import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { BioEconomy } from '@/constants/BioEconomy';
import { BioInteractiveBackground } from '@/components/BioInteractiveBackground';

const { width } = Dimensions.get('window');

// Deep Red Theme for Melatonin Protection
const RedColors = {
  bg: '#050000',
  card: '#150000',
  primary: '#FF0000',
  secondary: '#880000',
  text: '#AA8888'
};

export default function SuenoProfundoScreen() {
  const [hours, setHours] = useState(8);
  const [saving, setSaving] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sunlightDetected, setSunlightDetected] = useState<'morning' | 'evening' | null>(null);
  const [hasSyncedSun, setHasSyncedSun] = useState(false);

  useEffect(() => {
    const checkSunlightWindow = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) setSunlightDetected('morning');
      else if (hour >= 17 && hour < 20) setSunlightDetected('evening');
      else setSunlightDetected(null);
    };

    const loadStreak = async () => {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setStreak(snap.data().sleepStreak || 0);
      }
    };

    checkSunlightWindow();
    loadStreak();
  }, []);

  const handleSunlightSync = async () => {
    if (!auth.currentUser || hasSyncedSun) return;
    
    const hour = new Date().getHours();
    let type = '';
    if (hour >= 5 && hour < 11) type = 'Morning (Sunrise)';
    else if (hour >= 17 && hour < 20) type = 'Evening (Sunset)';
    else {
      Alert.alert("Fuera de Ventana", "El protocolo Huberman requiere luz solar de ángulo bajo. Intenta durante el amanecer o atardecer.");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(userRef);
        if (!snap.exists()) return;
        
        const logRef = doc(collection(userRef, 'logs'));
        transaction.set(logRef, {
            type: 'sunlight',
            window: type,
            timestamp: serverTimestamp(),
            category: 'circadian'
        });
        
        transaction.update(userRef, {
            ntkBalance: increment(BioEconomy.REWARD_SUN_SYNC || 50)
        });
      });
      setHasSyncedSun(true);
      Alert.alert("Sincronización Exitosa", `Has registrado luz de ${type}. +${BioEconomy.REWARD_SUN_SYNC} NTK.`);
    } catch (e) {
      Alert.alert("Error", "Error al sincronizar con el sol.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogSleep = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    
    const isGoalMet = hours >= 7.5;
    const reward = isGoalMet ? BioEconomy.REWARD_GOAL_ACHIEVED : 0;

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', auth.currentUser!.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw "User error";

        // Log to unified logs
        const logRef = doc(collection(db, 'users', auth.currentUser!.uid, 'logs'));
        transaction.set(logRef, {
          type: 'sleep',
          hours,
          goalMet: isGoalMet,
          timestamp: serverTimestamp(),
          category: 'rest'
        });

        // Update balance and streak
        if (isGoalMet) {
          transaction.update(userRef, {
            ntkBalance: increment(reward),
            sleepStreak: increment(1),
            lastSleep: hours
          });
        }
      });

      if (isGoalMet) {
        Alert.alert("¡Meta de Recuperación!", `Has ganado +${reward} NTK por un sueño reparador.`);
      } else {
        Alert.alert("Sueño Registrado", "Log guardado para el historial. Intenta llegar a las 7.5h hoy.");
      }
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo sincronizar el descanso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[AppStyles.body, { backgroundColor: RedColors.bg }]}>
      <BioInteractiveBackground 
        type="brain" 
        isAnimating={true} 
        intensity={0.2} 
        tintColor="rgba(255, 0, 0, 0.2)"
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={RedColors.primary} />
        </TouchableOpacity>
        <Text style={{ color: RedColors.primary, fontSize: 18, fontWeight: 'bold', marginLeft: 20 }}>PROTOCOLO DE SUEÑO</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Circadian Info */}
        <View style={{ padding: 20, backgroundColor: RedColors.card, borderRadius: 20, borderWidth: 1, borderColor: RedColors.secondary, marginBottom: 30 }}>
          <Text style={{ color: RedColors.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 }}>MODO PROTECCIÓN CIRCADIANA</Text>
          <Text style={{ color: RedColors.text, fontSize: 14, lineHeight: 20 }}>
            Esta interfaz utiliza luz roja pura para evitar la inhibición de la melatonina. 
            Tu cuerpo detecta que es hora de entrar en fase de recuperación profunda.
          </Text>
        </View>

        {/* Goal Indicator */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ color: RedColors.text, fontSize: 12, marginBottom: 10 }}>META DE HOY: 7.5 HORAS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity onPress={() => setHours(Math.max(4, hours - 0.5))}>
              <Ionicons name="remove-circle-outline" size={40} color={RedColors.primary} />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 48, fontWeight: 'bold' }}>{hours}h</Text>
            <TouchableOpacity onPress={() => setHours(Math.min(12, hours + 0.5))}>
              <Ionicons name="add-circle-outline" size={40} color={RedColors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: hours >= 7.5 ? '#00FF00' : RedColors.secondary, fontSize: 14, marginTop: 10, fontWeight: 'bold' }}>
            {hours >= 7.5 ? 'ENTRANDO EN ZONA DE RECOMPENSA' : 'DÉFICIT DE RECUPERACIÓN'}
          </Text>
        </View>

        {/* Recovery Stats */}
        <View style={{ flexDirection: 'row', gap: 15, marginBottom: 30 }}>
          <View style={[AppStyles.glassCardInteractive, { flex: 1, padding: 15, backgroundColor: RedColors.card, borderRadius: 15, alignItems: 'center', borderColor: RedColors.secondary, borderWidth: 1 }]}>
            <Text style={{ color: RedColors.text, fontSize: 10 }}>RACHA</Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{streak} DÍAS</Text>
          </View>
          <View style={[AppStyles.glassCardInteractive, { flex: 1, padding: 15, backgroundColor: RedColors.card, borderRadius: 15, alignItems: 'center', borderColor: RedColors.primary, borderWidth: 1 }]}>
            <Text style={{ color: RedColors.text, fontSize: 10 }}>VALOR META</Text>
            <Text style={{ color: RedColors.primary, fontSize: 18, fontWeight: 'bold' }}>+150 NTK</Text>
          </View>
        </View>

        {/* Sunlight Protocol (Huberman) */}
        <View style={{ padding: 20, backgroundColor: 'rgba(255,165,0,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,165,0,0.2)', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="sunny" size={20} color="#FFA500" />
                <Text style={{ color: '#FFA500', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }}>PROTOCOLO HUBERMAN</Text>
            </View>
            <Text style={{ color: RedColors.text, fontSize: 11, marginBottom: 15 }}>
                Sincroniza tu reloj circadiano con luz natural de ángulo bajo (Amanecer/Atardecer).
            </Text>
            
            <TouchableOpacity 
              onPress={handleSunlightSync}
              disabled={saving || hasSyncedSun}
              style={[
                AppStyles.glassCardInteractive, 
                { 
                  backgroundColor: hasSyncedSun ? 'rgba(0,255,0,0.1)' : 'rgba(255,165,0,0.15)', 
                  padding: 15, 
                  borderRadius: 15, 
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: hasSyncedSun ? '#13ec5b' : '#FFA500',
                  opacity: (saving || hasSyncedSun) ? 0.7 : 1
                }
              ]}
            >
                <Text style={{ color: hasSyncedSun ? '#13ec5b' : '#FFA500', fontWeight: 'bold' }}>
                  {hasSyncedSun ? 'SOL SINCRONIZADO' : sunlightDetected ? `SINCRONIZAR SOL (${sunlightDetected === 'morning' ? 'AM' : 'PM'})` : 'SINCRONIZAR SOL AUTOMÁTICO'}
                </Text>
            </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={handleLogSleep}
          disabled={saving}
          style={{ 
            backgroundColor: RedColors.primary, 
            padding: 20, 
            borderRadius: 20, 
            alignItems: 'center',
            shadowColor: RedColors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8
          }}
        >
          {saving ? <ActivityIndicator color="black" /> : (
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>SINCRONIZAR DESCANSO</Text>
          )}
        </TouchableOpacity>

        <Text style={{ color: RedColors.text, fontSize: 10, textAlign: 'center', marginTop: 20 }}>
          Solo se otorgan NTK al alcanzar la meta de 7.5h.
        </Text>
      </ScrollView>
    </View>
  );
}
