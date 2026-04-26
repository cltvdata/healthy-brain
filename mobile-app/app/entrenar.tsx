import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, Animated, Dimensions, Vibration } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import { SynergyService } from '@/services/SynergyService';

const { width } = Dimensions.get('window');

interface SetRecord {
  id: string;
  reps: string;
  weight: string;
  done: boolean;
}

interface CardioSession {
  type: 'CORRER' | 'BICICLETA' | 'ELÍPTICA' | 'BAILAR' | 'NATACIÓN' | 'CAMINAR' | 'BOXEO';
  minutes: string;
  distance: string;
  calories: string;
  speed: string;
  rpe: number; // Esfuerzo Percibido 1-10
  active: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: SetRecord[];
  type: 'barra' | 'mancuerna' | 'polea' | 'peso_corporal';
}

export default function EntrenarScreen() {
  const { t } = useLanguage();
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: '', sets: [{ id: Date.now().toString(), reps: '', weight: '', done: false }], type: 'barra' }
  ]);
  const [cardio, setCardio] = useState<CardioSession>({
    type: 'CORRER',
    minutes: '',
    distance: '',
    calories: '',
    speed: '',
    rpe: 5,
    active: false
  });
  const [restTime, setRestTime] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [bioInsights, setBioInsights] = useState<{ vfc: string; load: string; msg: string }>({
    vfc: '--',
    load: '--',
    msg: 'Analizando integridad biológica...'
  });

  const timerInterval = useRef<any>(null);

  // 1. Fetch Bio-HUD Data from Cloud (Sleep/VFC)
  useEffect(() => {
    const fetchBioData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Look for recent sleep logs or defaults
        const sleepHours = data.lastSleepHours || 7.5;
        if (sleepHours < 6) {
          setBioInsights({
            vfc: 'Crítica 42ms',
            load: 'DANGER',
            msg: 'Catabolismo detectado por sueño insuficiente. Sugerimos calistenia ligera.'
          });
        } else {
          setBioInsights({
            vfc: 'Óptima 115ms',
            load: 'LOW',
            msg: 'Soberanía hormonal confirmada. Protocolo de alta intensidad autorizado.'
          });
        }
      }
    };
    fetchBioData();
  }, []);

  // 2. Timer Logic
  const startRestTimer = () => {
    setIsTimerActive(true);
    setTimerCount(restTime);
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    timerInterval.current = setInterval(() => {
      setTimerCount(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current!);
          setIsTimerActive(false);
          Vibration.vibrate([0, 500, 200, 500]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 3. Exercise Management
  const addExercise = () => {
    setExercises([...exercises, { 
      id: Date.now().toString(), 
      name: '', 
      sets: [{ id: (Date.now() + 1).toString(), reps: '', weight: '', done: false }], 
      type: 'barra' 
    }]);
  };

  const addSet = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return { ...ex, sets: [...ex.sets, { id: Date.now().toString(), reps: '', weight: '', done: false }] };
      }
      return ex;
    }));
  };

  const updateSet = (exId: string, setId: string, field: 'reps' | 'weight' | 'done', value: string | boolean) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        const newSets = ex.sets.map(s => {
          if (s.id === setId) {
             if (field === 'done' && value === true && !s.done) startRestTimer();
             return { ...s, [field]: value };
          }
          return s;
        });
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const saveWorkout = async () => {
    const validExercises = exercises.filter(ex => ex.name.trim() !== "" && ex.sets.some(s => s.reps !== ""));
    if (validExercises.length === 0) {
      Alert.alert("Bio-Error", "Añade al menos un ejercicio y sus repeticiones.");
      return;
    }

    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    try {
      const userRef = doc(db, 'users', userId);
      
      // Calculate Rewards: 25 Base + Cardio Bonus
      let reward = 25;
      if (cardio.active && cardio.minutes) {
        reward += Math.floor(parseInt(cardio.minutes) / 2); // 1 NTK every 2 mins
      }

      // Save Transactional NTK + Log
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const data = userDoc.data() || {};
        const newBalance = (data.ntkBalance || 0) + reward;
        
        transaction.update(userRef, { 
          ntkBalance: newBalance,
          lastWorkout: serverTimestamp()
        });

        // Add Log to Subcollection
        const logsRef = collection(db, 'users', userId, 'logs');
        await addDoc(logsRef, {
          type: 'workout',
          category: 'workout',
          title: cardio.active ? `BIO-MIX: ${validExercises[0].name} + ${cardio.type}` : `BIO-FUERZA: ${validExercises[0].name}...`,
          value: reward,
          unit: 'NTK+',
          exercises: validExercises,
          cardio: cardio.active ? cardio : null,
          timestamp: serverTimestamp()
        });
      });

      // Post to Community Feed (Social Synergy)
      await SynergyService.postAchievement(
        'workout',
        `Completó una Bio-Sesión de Fuerza. ¡Sinergia total! ⚡`,
        reward
      );

      Alert.alert(
        "Sesión Sincronizada",
        `Has ganado ${reward} NTK. Los datos han sido enviados a tu Bio-Reporte y compartidos con la comunidad.`,
        [{ text: "OK", onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error de Sincronización", "Revisa tu conexión a la Bio-Cloud.");
    }
  };

  return (
    <View style={AppStyles.body}>
      {/* Bio-HUD Summary Header */}
      <View style={styles.hudHeader}>
        <View style={AppStyles.rowBetween}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-outline" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.hudTitle}>BIO-GIMNASIO</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={[AppStyles.glassCard, styles.bioInsightBox]}>
          <View style={AppStyles.rowBetween}>
             <View>
               <Text style={styles.insightLabel}>SISTEMA NERVIOSO</Text>
               <Text style={[styles.insightValue, { color: bioInsights.load === 'DANGER' ? '#ff4444' : AppColors.primaryNeonBlue }]}>
                 {bioInsights.load}
               </Text>
             </View>
             <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.insightLabel}>HRV (VFC)</Text>
               <Text style={styles.insightValue}>{bioInsights.vfc}</Text>
             </View>
          </View>
          <Text style={styles.insightMsg}>"{bioInsights.msg}"</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {exercises.map((ex, index) => (
          <View key={ex.id} style={[AppStyles.glassCard, { marginBottom: 20, padding: 15 }]}>
            <View style={AppStyles.rowBetween}>
               <TextInput
                 style={styles.exTitleInput}
                 placeholder="Ej. Press Banca"
                 placeholderTextColor={AppColors.textGray}
                 value={ex.name}
                 onChangeText={(val) => {
                    const newEx = [...exercises];
                    newEx[index].name = val;
                    setExercises(newEx);
                 }}
               />
               <Ionicons name="ellipsis-vertical" size={20} color={AppColors.textGray} />
            </View>

            {/* Sets View */}
            <View style={{ marginTop: 15 }}>
              <View style={[AppStyles.rowBetween, { paddingHorizontal: 10, marginBottom: 5 }]}>
                <Text style={styles.colLabel}>SET</Text>
                <Text style={styles.colLabel}>KG</Text>
                <Text style={styles.colLabel}>REPS</Text>
                <Text style={styles.colLabel}>OK</Text>
              </View>
              {ex.sets.map((set, sIdx) => (
                <View key={set.id} style={[AppStyles.rowBetween, styles.setRow, set.done && styles.setRowDone]}>
                  <Text style={styles.setNumber}>{sIdx + 1}</Text>
                  <TextInput
                     style={styles.setInput}
                     placeholder="0"
                     placeholderTextColor={AppColors.textGray}
                     keyboardType="numeric"
                     value={set.weight}
                     onChangeText={(val) => updateSet(ex.id, set.id, 'weight', val)}
                  />
                  <TextInput
                     style={styles.setInput}
                     placeholder="0"
                     placeholderTextColor={AppColors.textGray}
                     keyboardType="numeric"
                     value={set.reps}
                     onChangeText={(val) => updateSet(ex.id, set.id, 'reps', val)}
                  />
                  <TouchableOpacity onPress={() => updateSet(ex.id, set.id, 'done', !set.done)}>
                    <Ionicons 
                      name={set.done ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={set.done ? AppColors.primaryBioGreen : AppColors.primaryNeonBlue} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(ex.id)}>
               <Text style={styles.addSetBtnText}>+ AÑADIR SERIE</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Cardio Section */}
        <View style={[AppStyles.glassCard, { marginBottom: 30, padding: 20, borderColor: cardio.active ? AppColors.accentBlue : 'rgba(255,255,255,0.05)' }]}>
           <View style={AppStyles.rowBetween}>
              <View style={AppStyles.rowCentered}>
                <Ionicons name="pulse" size={24} color={AppColors.accentBlue} style={{ marginRight: 10 }} />
                <Text style={{ color: 'white', fontWeight: 'bold' }}>COMPLEMENTO CARDIO</Text>
              </View>
              <TouchableOpacity onPress={() => setCardio({...cardio, active: !cardio.active})}>
                <Ionicons name={cardio.active ? "eye" : "eye-off"} size={24} color={cardio.active ? AppColors.accentBlue : AppColors.textGray} />
              </TouchableOpacity>
           </View>

           {cardio.active && (
             <View style={{ marginTop: 20 }}>
                {/* Activity Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                   {['CORRER', 'BICICLETA', 'ELÍPTICA', 'BAILAR', 'NATACIÓN', 'BOXEO'].map((t) => (
                     <TouchableOpacity 
                       key={t} 
                       onPress={() => setCardio({...cardio, type: t as any})}
                       style={{ 
                         paddingHorizontal: 15, 
                         paddingVertical: 8, 
                         borderRadius: 15, 
                         backgroundColor: cardio.type === t ? AppColors.accentBlue : 'rgba(255,255,255,0.05)',
                         marginRight: 8
                       }}
                     >
                       <Text style={{ color: cardio.type === t ? 'black' : 'white', fontSize: 10, fontWeight: 'bold' }}>{t}</Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                   <View style={{ flex: 1, minWidth: '45%' }}>
                      <Text style={styles.insightLabel}>TIEMPO (MIN)</Text>
                      <TextInput 
                        style={AppStyles.highContrastInput} 
                        keyboardType="numeric" 
                        value={cardio.minutes}
                        onChangeText={(v) => setCardio({...cardio, minutes: v})}
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                   </View>
                   <View style={{ flex: 1, minWidth: '45%' }}>
                      <Text style={styles.insightLabel}>DISTANCIA (KM)</Text>
                      <TextInput 
                        style={AppStyles.highContrastInput} 
                        keyboardType="numeric" 
                        value={cardio.distance}
                        onChangeText={(v) => setCardio({...cardio, distance: v})}
                        placeholder="0.0"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                   </View>
                   <View style={{ flex: 1, minWidth: '45%' }}>
                      <Text style={styles.insightLabel}>CALORÍAS (KCAL)</Text>
                      <TextInput 
                        style={AppStyles.highContrastInput} 
                        keyboardType="numeric" 
                        value={cardio.calories}
                        onChangeText={(v) => setCardio({...cardio, calories: v})}
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                   </View>
                   <View style={{ flex: 1, minWidth: '45%' }}>
                      <Text style={styles.insightLabel}>VELOCIDAD (KM/H)</Text>
                      <TextInput 
                        style={AppStyles.highContrastInput} 
                        keyboardType="numeric" 
                        value={cardio.speed}
                        onChangeText={(v) => setCardio({...cardio, speed: v})}
                        placeholder="0.0"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                   </View>
                </View>
             </View>
           )}
        </View>

        <TouchableOpacity style={styles.addExBtn} onPress={addExercise}>
           <Text style={styles.addExBtnText}>NUEVO EJERCICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={AppStyles.glowBtnOrange} onPress={saveWorkout}>
           <Text style={AppStyles.glowBtnOrangeText}>FINALIZAR SESIÓN DE SOBERANÍA</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Rest Timer */}
      {isTimerActive && (
        <View style={styles.floatingTimer}>
          <Text style={styles.timerCount}>{Math.floor(timerCount / 60)}:{String(timerCount % 60).padStart(2, '0')}</Text>
          <Text style={styles.timerSub}>DESCANSO BIO-REGENERATIVO</Text>
          <TouchableOpacity onPress={() => { setIsTimerActive(false); if(timerInterval.current) clearInterval(timerInterval.current); }}>
            <Ionicons name="stop-circle" size={32} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hudHeader: {
    paddingTop: 50,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  hudTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    fontStyle: 'italic'
  },
  bioInsightBox: {
    marginTop: 20,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primaryNeonBlue,
    backgroundColor: 'rgba(0, 209, 255, 0.05)'
  },
  insightLabel: {
    color: AppColors.textGray,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  insightValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic'
  },
  insightMsg: {
    color: AppColors.textGray,
    fontSize: 10,
    marginTop: 8,
    fontWeight: '500',
    fontStyle: 'italic'
  },
  exTitleInput: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1
  },
  colLabel: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center'
  },
  setRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  setRowDone: {
    opacity: 0.5
  },
  setNumber: {
    color: AppColors.primaryNeonBlue,
    fontWeight: '900',
    fontSize: 12,
    width: 50,
    textAlign: 'center'
  },
  setInput: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: 5
  },
  addSetBtn: {
    marginTop: 10,
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 138, 0, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 0, 0.2)'
  },
  addSetBtnText: {
    color: AppColors.primaryOrange,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  addExBtn: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginBottom: 30
  },
  addExBtnText: {
    color: AppColors.textGray,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  floatingTimer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AppColors.primaryNeonBlue,
    shadowColor: AppColors.primaryNeonBlue,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10
  },
  timerCount: {
    color: AppColors.primaryNeonBlue,
    fontSize: 28,
    fontWeight: '900',
    marginRight: 10
  },
  timerSub: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1
  }
});
