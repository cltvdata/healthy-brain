import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, Animated, Dimensions, Vibration } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import { SynergyService } from '@/services/SynergyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BioEconomy } from '@/constants/BioEconomy';
import { BioInteractiveBackground } from '@/components/BioInteractiveBackground';
import { ExercisesDB } from '@/constants/ExercisesDB';
import ExerciseCoach from '@/components/ExerciseCoach';

const { width } = Dimensions.get('window');

interface SetRecord {
  id: string;
  reps: string;
  weight: string;
  rpe: string; // Perceived effort 1-10
  done: boolean;
}

interface CardioSession {
  type: 'CORRER' | 'BICICLETA' | 'ELÍPTICA' | 'BAILAR' | 'NATACIÓN' | 'CAMINAR' | 'BOXEO';
  minutes: string;
  distance: string;
  calories: string;
  speed: string;
  rpe: number; 
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
    { id: '1', name: '', sets: [{ id: Date.now().toString(), reps: '', weight: '', rpe: '', done: false }], type: 'barra' }
  ]);
  const [malla, setMalla] = useState<'HIPERTROFIA' | 'FUERZA' | 'POTENCIA' | 'RESISTENCIA' | 'DESCARGA'>('HIPERTROFIA');
  const [microciclo, setMicrociclo] = useState<number>(1);
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
  const [selectedCoachEx, setSelectedCoachEx] = useState<any>(null);
  const [showCoach, setShowCoach] = useState(false);

  const timerInterval = useRef<any>(null);
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadPref = async () => {
      const pref = await AsyncStorage.getItem('@rest_time_v1');
      if (pref) setRestTime(parseInt(pref));
    };
    loadPref();
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { toValue: 1, duration: 4000, useNativeDriver: false }),
          Animated.timing(breathAnim, { toValue: 0, duration: 4000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      breathAnim.stopAnimation();
      breathAnim.setValue(0);
    }
  }, [isTimerActive]);

  useEffect(() => {
    const fetchBioData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
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

  const startRestTimer = (customTime?: number) => {
    const timeToSet = customTime || restTime;
    setIsTimerActive(true);
    setTimerCount(timeToSet);
    
    if (customTime) {
      setRestTime(customTime);
      AsyncStorage.setItem('@rest_time_v1', customTime.toString());
    }

    if (timerInterval.current) clearInterval(timerInterval.current);
    
    timerInterval.current = setInterval(() => {
      setTimerCount(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current!);
          setIsTimerActive(false);
          Vibration.vibrate([0, 1000, 500, 1000]); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const addExercise = () => {
    setExercises([...exercises, { 
      id: Date.now().toString(), 
      name: '', 
      sets: [{ id: (Date.now() + 1).toString(), reps: '', weight: '', rpe: '', done: false }], 
      type: 'barra' 
    }]);
  };

  const addSet = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return { ...ex, sets: [...ex.sets, { id: Date.now().toString(), reps: '', weight: '', rpe: '', done: false }] };
      }
      return ex;
    }));
  };

  const updateSet = (exId: string, setId: string, field: 'reps' | 'weight' | 'rpe' | 'done', value: string | boolean) => {
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
      let reward = BioEconomy.REWARD_WORKOUT_FIXED;
      if (cardio.active && cardio.minutes) {
        reward += Math.floor(parseInt(cardio.minutes) / 2) * BioEconomy.REWARD_WORKOUT_CARDIO_PER_2MIN;
      }
      await SynergyService.rewardUser(userId, reward, `Sesión de Entrenamiento: ${malla} (S${microciclo})`);
      const logsRef = collection(db, 'users', userId, 'logs');
      await addDoc(logsRef, {
        type: 'workout',
        malla,
        microciclo,
        title: cardio.active ? `BIO-MIX: ${validExercises[0].name} + ${cardio.type}` : `BIO-FUERZA: ${validExercises[0].name}...`,
        value: reward,
        unit: 'NTK',
        exercises: validExercises,
        cardio: cardio.active ? cardio : null,
        timestamp: serverTimestamp()
      });
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { lastWorkout: serverTimestamp() });
      await SynergyService.postAchievement('workout', `Completó: ${malla} - Mic. ${microciclo}. ¡Sinergia total! ⚡`, reward);

      Alert.alert("Sesión Sincronizada", `Has ganado ${reward} NTK. Protocolo ${malla} guardado correctamente.`, [{ text: "OK", onPress: () => router.replace('/(tabs)') }]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error de Sincronización", "Revisa tu conexión a la Bio-Cloud.");
    }
  };

  return (
    <View style={AppStyles.body}>
      <BioInteractiveBackground 
        type={isTimerActive ? 'lungs' : 'muscles'} 
        isAnimating={isTimerActive}
        intensity={isTimerActive ? 1 : 0.5}
      />
      <View style={styles.hudHeader}>
        <View style={AppStyles.rowBetween}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <Ionicons name="close-outline" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.hudTitle}>BIO-GIMNASIO</Text>
          <TouchableOpacity onPress={() => router.push('/recovery-dashboard')} style={{ padding: 5 }}>
             <Ionicons name="body-outline" size={24} color={AppColors.primaryBioGreen} />
          </TouchableOpacity>
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

        <View style={styles.periodBox}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
            {(['HIPERTROFIA', 'FUERZA', 'POTENCIA', 'RESISTENCIA', 'DESCARGA'] as const).map((p) => (
              <TouchableOpacity key={p} onPress={() => setMalla(p)} style={[styles.periodBtn, malla === p && styles.periodBtnActive, AppStyles.glassCardInteractive]}>
                <Text style={[styles.periodBtnText, malla === p && styles.periodBtnTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={AppStyles.rowCentered}>
            <Text style={styles.microLabel}>MICROCICLO (SEMANA): </Text>
            {[1, 2, 3, 4].map(w => (
              <TouchableOpacity key={w} onPress={() => setMicrociclo(w)} style={[styles.weekBtn, microciclo === w && styles.weekBtnActive, AppStyles.glassCardInteractive]}>
                <Text style={[styles.weekBtnText, microciclo === w && styles.weekBtnTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {exercises.map((ex, index) => (
          <View key={ex.id} style={[AppStyles.glassCard, styles.exerciseCard]}>
             <View style={styles.exHeader}>
                  <TextInput
                    style={styles.exTitle}
                    placeholder="Ej. Press Banca"
                    placeholderTextColor={AppColors.textGray}
                    value={ex.name}
                    onChangeText={(val) => {
                       const newEx = [...exercises];
                       newEx[index].name = val;
                       setExercises(newEx);
                    }}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      const meta = ExercisesDB[ex.name];
                      if (meta) {
                        setSelectedCoachEx(meta);
                        setShowCoach(true);
                      } else {
                        Alert.alert("Bio-Info", "Selecciona un ejercicio de la DB para ver la técnica.");
                      }
                    }}
                    style={{ padding: 5, marginRight: 10 }}
                  >
                    <Ionicons name="information-circle-outline" size={24} color={AppColors.primaryNeonBlue} />
                  </TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={20} color={AppColors.textGray} />
             </View>

            <View>
              {ex.sets.map((set, idx) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setText}>SET {idx + 1}</Text>
                  <View style={styles.setInputGroup}>
                    <TextInput style={AppStyles.highContrastInput} placeholder="KG" placeholderTextColor="#666" keyboardType="numeric" value={set.weight} onChangeText={(val) => updateSet(ex.id, set.id, 'weight', val)} />
                    <TextInput style={AppStyles.highContrastInput} placeholder="REPS" placeholderTextColor="#666" keyboardType="numeric" value={set.reps} onChangeText={(val) => updateSet(ex.id, set.id, 'reps', val)} />
                    <TextInput style={[AppStyles.highContrastInput, { width: 45 }]} placeholder="RPE" placeholderTextColor="#666" keyboardType="numeric" maxLength={2} value={set.rpe} onChangeText={(val) => updateSet(ex.id, set.id, 'rpe', val)} />
                  </View>
                  <TouchableOpacity onPress={() => updateSet(ex.id, set.id, 'done', !set.done)} style={[styles.checkBtn, set.done && styles.checkBtnDone]}>
                    <Ionicons name={set.done ? "checkmark-circle" : "ellipse-outline"} size={28} color={set.done ? AppColors.primaryBioGreen : "#444"} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(ex.id)}>
               <Ionicons name="add-circle-outline" size={20} color={AppColors.primaryOrange} />
               <Text style={styles.addSetBtnText}>AÑADIR SERIE</Text>
            </TouchableOpacity>
          </View>
        ))}

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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                   {['CORRER', 'BICICLETA', 'ELÍPTICA', 'BAILAR', 'NATACIÓN', 'BOXEO'].map((t) => (
                     <TouchableOpacity key={t} onPress={() => setCardio({...cardio, type: t as any})} style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, backgroundColor: cardio.type === t ? AppColors.accentBlue : 'rgba(255,255,255,0.05)', marginRight: 8 }}>
                       <Text style={{ color: cardio.type === t ? 'black' : 'white', fontSize: 10, fontWeight: 'bold' }}>{t}</Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                   <View style={{ flex: 1, minWidth: '45%' }}><Text style={styles.insightLabel}>TIEMPO (MIN)</Text><TextInput style={AppStyles.highContrastInput} keyboardType="numeric" value={cardio.minutes} onChangeText={(v) => setCardio({...cardio, minutes: v})} placeholder="0" placeholderTextColor="rgba(255,255,255,0.2)" /></View>
                   <View style={{ flex: 1, minWidth: '45%' }}><Text style={styles.insightLabel}>DISTANCIA (KM)</Text><TextInput style={AppStyles.highContrastInput} keyboardType="numeric" value={cardio.distance} onChangeText={(v) => setCardio({...cardio, distance: v})} placeholder="0.0" placeholderTextColor="rgba(255,255,255,0.2)" /></View>
                </View>
             </View>
           )}
        </View>

        <TouchableOpacity style={styles.addExBtn} onPress={addExercise}>
           <Ionicons name="add" size={24} color="white" />
           <Text style={styles.addExBtnText}>NUEVO EJERCICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[AppStyles.glowBtnOrange, styles.finishBtn]} onPress={saveWorkout}>
           <Text style={AppStyles.glowBtnOrangeText}>FINALIZAR SESIÓN DE SOBERANÍA</Text>
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>

      {isTimerActive && (
        <View style={styles.floatingTimer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 60, height: 60, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
               <Animated.View style={{ position: 'absolute', width: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 60] }), height: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 60] }), borderRadius: 30, borderWidth: 2, borderColor: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [AppColors.primaryNeonBlue, AppColors.primaryBioGreen] }), opacity: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) }} />
               <Text style={styles.timerCount}>{Math.floor(timerCount / 60)}:{String(timerCount % 60).padStart(2, '0')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.timerSub}>RESPIRACIÓN TÁCTICA</Text>
              <Text style={{ color: AppColors.textGray, fontSize: 8 }}>Inhala (4s) - Sostén (4s) - Exhala (4s)</Text>
              <View style={{ flexDirection: 'row', gap: 5, marginTop: 10 }}>
                 {[60, 90, 120, 150].map(s => (
                   <TouchableOpacity key={s} onPress={() => startRestTimer(s)} style={{ backgroundColor: restTime === s ? AppColors.primaryNeonBlue : 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                     <Text style={{ color: restTime === s ? 'black' : 'white', fontSize: 10, fontWeight: 'bold' }}>{s/60}M</Text>
                   </TouchableOpacity>
                 ))}
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => { setIsTimerActive(false); if(timerInterval.current) clearInterval(timerInterval.current); }}>
            <Ionicons name="stop-circle" size={40} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}

      <ExerciseCoach visible={showCoach} onClose={() => setShowCoach(false)} exercise={selectedCoachEx} />
    </View>
  );
}

const styles = StyleSheet.create({
  hudHeader: { paddingTop: 50, backgroundColor: '#000', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  hudTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 3, fontStyle: 'italic' },
  bioInsightBox: { marginTop: 20, padding: 15, borderLeftWidth: 3, borderLeftColor: AppColors.primaryNeonBlue, backgroundColor: 'rgba(0, 209, 255, 0.05)' },
  insightLabel: { color: AppColors.textGray, fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
  insightValue: { color: 'white', fontSize: 16, fontWeight: '900', fontStyle: 'italic' },
  insightMsg: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  periodBox: { marginTop: 15, paddingHorizontal: 5 },
  periodBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: AppColors.surfaceGlassLight, marginRight: 8, borderWidth: 1, borderColor: AppColors.borderGlass },
  periodBtnActive: { backgroundColor: AppColors.primaryNeonBlue, borderColor: AppColors.primaryNeonBlue },
  periodBtnText: { color: '#aaa', fontSize: 11, fontWeight: 'bold' },
  periodBtnTextActive: { color: '#000' },
  microLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  weekBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginLeft: 10, backgroundColor: AppColors.surfaceGlassLight, borderWidth: 1, borderColor: AppColors.borderGlass },
  weekBtnActive: { backgroundColor: AppColors.primaryBioGreen, borderColor: AppColors.primaryBioGreen },
  weekBtnText: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  weekBtnTextActive: { color: '#000' },
  scroll: { flex: 1, padding: 20 },
  exerciseCard: { marginBottom: 20, padding: 15 },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  exTitle: { color: 'white', fontSize: 18, fontWeight: '800', flex: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  setText: { color: '#aaa', fontSize: 12, fontWeight: 'bold', width: 45 },
  setInputGroup: { flexDirection: 'row', flex: 1, justifyContent: 'space-around', paddingHorizontal: 10 },
  checkBtn: { width: 40, alignItems: 'flex-end' },
  checkBtnDone: { opacity: 0.8 },
  addSetBtn: { marginTop: 10, width: '100%', padding: 12, borderRadius: 15, backgroundColor: 'rgba(255, 138, 0, 0.05)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255, 138, 0, 0.3)' },
  addSetBtnText: { color: AppColors.primaryOrange, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  addExBtn: { width: '100%', padding: 20, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', marginBottom: 30 },
  addExBtnText: { color: AppColors.textGray, fontWeight: 'bold', letterSpacing: 2 },
  finishBtn: { marginTop: 20, marginBottom: 50 },
  floatingTimer: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#000', borderRadius: 25, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: AppColors.primaryNeonBlue, shadowColor: AppColors.primaryNeonBlue, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  timerCount: { color: AppColors.primaryNeonBlue, fontSize: 18, fontWeight: '900' },
  timerSub: { color: 'white', fontSize: 10, fontWeight: 'bold', flex: 1 }
});
