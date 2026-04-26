import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { BioEconomy } from '@/constants/BioEconomy';

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

  useEffect(() => {
    const loadStreak = async () => {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setStreak(snap.data().sleepStreak || 0);
      }
    };
    loadStreak();
  }, []);

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
          <View style={{ flex: 1, padding: 15, backgroundColor: RedColors.card, borderRadius: 15, alignItems: 'center' }}>
            <Text style={{ color: RedColors.text, fontSize: 10 }}>RACHA</Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{streak} DÍAS</Text>
          </View>
          <View style={{ flex: 1, padding: 15, backgroundColor: RedColors.card, borderRadius: 15, alignItems: 'center' }}>
            <Text style={{ color: RedColors.text, fontSize: 10 }}>VALOR META</Text>
            <Text style={{ color: RedColors.primary, fontSize: 18, fontWeight: 'bold' }}>+150 NTK</Text>
          </View>
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
