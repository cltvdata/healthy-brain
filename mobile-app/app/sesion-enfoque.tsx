import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, ScrollView, Modal } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { BioWellnessService, BREATHING_PATTERNS, WellnessTechnique } from '@/services/BioWellnessService';

const { width } = Dimensions.get('window');

const TECHNIQUES: { id: WellnessTechnique; icon: string; category: string }[] = [
  { id: 'box_breathing', icon: 'square-outline', category: 'Equilibrio' },
  { id: '478_breathing', icon: 'moon', category: 'Sueño' },
  { id: 'coherent_breathing', icon: 'pulse', category: 'HRV' },
  { id: 'vagal_breathing', icon: 'git-branch', category: 'Ansiedad' },
  { id: 'stress_relief', icon: 'flash', category: 'Rápido' },
  { id: 'energy_boost', icon: 'sunny', category: 'Mañana' },
];

export default function SesionEnfoqueScreen() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(300); // Default 5 min
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<WellnessTechnique>('box_breathing');
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [showSelector, setShowSelector] = useState(true);
  const [hrv, setHrv] = useState(0);
  const [stressAlert, setStressAlert] = useState(false);
  const [recommended, setRecommended] = useState<{ technique: WellnessTechnique; reason: string } | null>(null);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;

  // Load user HRV and get recommendation
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const data = userDoc.data();
      if (data?.hrv) {
        setHrv(data.hrv);
        const stress = BioWellnessService.detectStressLevel(data.hrv);
        
        if (stress.level === 'high' || stress.level === 'critical') {
          setStressAlert(true);
          BioWellnessService.triggerStressAlert();
        }

        // Auto-recommend based on HRV
        const optimal = BioWellnessService.getOptimalTechnique(data.hrv);
        setRecommended(optimal);
        if (stress.level !== 'low') {
          setSelectedTechnique(optimal.technique);
        }
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  // Breathing animation logic
  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
    } else {
      stopBreathingCycle();
    }
  }, [isActive]);

  const startBreathingCycle = () => {
    const pattern = BREATHING_PATTERNS[selectedTechnique];
    
    // Start with glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();

    // Breathing phase sequence
    const runPhase = (phase: 'inhale' | 'hold' | 'exhale' | 'rest', step: number) => {
      if (!isActive) return;
      
      setCurrentPhase(phase);
      BioWellnessService.triggerBreathHaptic(phase);

      let duration = 0;
      switch (phase) {
        case 'inhale':
          duration = pattern.inhale * 1000;
          Animated.timing(breathAnim, { toValue: 1.5, duration, useNativeDriver: true }).start();
          break;
        case 'hold':
          duration = pattern.hold1 * 1000;
          break;
        case 'exhale':
          duration = pattern.exhale * 1000;
          Animated.timing(breathAnim, { toValue: 1, duration, useNativeDriver: true }).start();
          break;
        case 'rest':
          duration = pattern.hold2 * 1000;
          break;
      }

      setTimeout(() => {
        if (!isActive) return;
        
        if (phase === 'exhale') {
          setCycleCount(c => c + 1);
          if (cycleCount >= pattern.cycles - 1) {
            setSeconds(s => s - 10); // Quick pass time
          }
        }
        
        const nextStep = step + 1;
        if (nextStep < 4) {
          const phases: ('inhale' | 'hold' | 'exhale' | 'rest')[] = ['inhale', 'hold', 'exhale', 'rest'];
          runPhase(phases[nextStep], nextStep);
        } else {
          runPhase('inhale', 0);
        }
      }, duration);
    };

    runPhase('inhale', 0);
  };

  const stopBreathingCycle = () => {
    pulseAnim.stopAnimation();
    glowAnim.stopAnimation();
    breathAnim.stopAnimation();
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
    breathAnim.setValue(1);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const finishSession = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const logsRef = collection(userRef, 'logs');

      await addDoc(logsRef, {
        type: 'wellness',
        category: 'breathing',
        technique: selectedTechnique,
        durationMinutes: Math.floor((300 - seconds) / 60) || 1,
        cyclesCompleted: cycleCount,
        ntkEarned: 25,
        timestamp: serverTimestamp()
      });

      await updateDoc(userRef, {
        ntkBalance: increment(25),
        focusSessionsCompleted: increment(1)
      });

      BioWellnessService.triggerCompletion();
      router.push('/');
    } catch (e) {
      console.error("Save Session Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const getPhaseText = () => {
    const texts = {
      inhale: 'INHALA',
      hold: 'MANTÉN',
      exhale: 'EXHALA',
      rest: 'PAUSA'
    };
    return texts[currentPhase];
  };

  const pattern = BREATHING_PATTERNS[selectedTechnique];

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 50 }}>
        {/* Header */}
        <View style={[AppStyles.rowBetween, { marginBottom: 20 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>🧘 Respiración IA</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Técnica: {pattern.name}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowSelector(true)} style={styles.backBtn}>
            <Ionicons name="options" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stress Alert */}
        {stressAlert && (
          <View style={[styles.stressAlert, { borderColor: AppColors.primaryOrange }]}>
            <Ionicons name="warning" size={20} color={AppColors.primaryOrange} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold', fontSize: 12 }}>Nivel de Estrés Elevado</Text>
              <Text style={{ color: AppColors.textGray, fontSize: 10 }}>Tu HRV indica que necesitas esta sesión.</Text>
            </View>
          </View>
        )}

        {/* Recommended */}
        {recommended && !stressAlert && (
          <View style={[styles.recommendCard, { borderColor: AppColors.primaryBioGreen }]}>
            <Ionicons name="sparkles" size={18} color={AppColors.primaryBioGreen} />
            <Text style={{ color: AppColors.textWhite, fontSize: 11, flex: 1, marginLeft: 8 }}>
              {recommended.reason}
            </Text>
          </View>
        )}

        {/* Main Breathing Circle */}
        <View style={{ alignItems: 'center', marginVertical: 40 }}>
          <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
            <Animated.View style={[
              styles.breathCircle,
              { 
                borderColor: pattern.color,
                backgroundColor: pattern.color + '20'
              }
            ]}>
              <Animated.View style={{ 
                opacity: glowAnim,
                ...StyleSheet.absoluteFillObject,
                backgroundColor: pattern.color,
                borderRadius: 150,
              }} />
              
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons 
                  name={isActive ? 'pause' : 'play'} 
                  size={40} 
                  color={pattern.color} 
                  style={{ marginBottom: 10 }}
                />
                {isActive ? (
                  <>
                    <Text style={[styles.phaseText, { color: pattern.color }]}>{getPhaseText()}</Text>
                    <Text style={[styles.cycleText]}>Ciclo {cycleCount + 1}/{pattern.cycles}</Text>
                  </>
                ) : (
                  <Text style={styles.startText}>TOCA PARA INICIAR</Text>
                )}
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Timer */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={[styles.timerText]}>{formatTime(seconds)}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Duración total</Text>
        </View>

        {/* Pattern Info */}
        <View style={[AppStyles.glassCard, { padding: 15, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontWeight: 'bold', marginBottom: 10 }]}>Patrón: {pattern.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={styles.patternStep}>
              <Text style={{ color: pattern.color, fontSize: 20, fontWeight: 'bold' }}>{pattern.inhale}s</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>INHALAR</Text>
            </View>
            <View style={styles.patternStep}>
              <Text style={{ color: pattern.color, fontSize: 20, fontWeight: 'bold' }}>{pattern.hold1}s</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>HOLD</Text>
            </View>
            <View style={styles.patternStep}>
              <Text style={{ color: pattern.color, fontSize: 20, fontWeight: 'bold' }}>{pattern.exhale}s</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>EXHALAR</Text>
            </View>
            <View style={styles.patternStep}>
              <Text style={{ color: pattern.color, fontSize: 20, fontWeight: 'bold' }}>{pattern.hold2}s</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>PAUSA</Text>
            </View>
          </View>
        </View>

        {/* Control Button */}
        <TouchableOpacity 
          style={[styles.mainBtn, { backgroundColor: isActive ? AppColors.primaryOrange : pattern.color }]}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.mainBtnText}>
            {isActive ? 'PAUSAR' : 'INICIAR SESIÓN'}
          </Text>
        </TouchableOpacity>

        {/* Finish if active */}
        {isActive && cycleCount > 0 && (
          <TouchableOpacity 
            style={[styles.finishBtn, { marginTop: 15 }]}
            onPress={finishSession}
          >
            <Text style={{ color: AppColors.textGray, fontSize: 12 }}>Terminar antes de tiempo</Text>
          </TouchableOpacity>
        )}

        {/* HRV Display */}
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={[AppStyles.textGray, { fontSize: 10 }]}>TU HRV ACTUAL</Text>
          <Text style={[styles.hrvValue, { color: hrv > 60 ? AppColors.primaryBioGreen : hrv > 40 ? AppColors.primaryOrange : '#ff4444' }]}>
            {hrv || '--'}
          </Text>
        </View>
      </ScrollView>

      {/* Technique Selector Modal */}
      <Modal visible={showSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#111' }]}>
            <View style={styles.modalHeader}>
              <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Elige tu Técnica</Text>
              <TouchableOpacity onPress={() => setShowSelector(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 20 }}>
              {TECHNIQUES.map((tech) => (
                <TouchableOpacity 
                  key={tech.id}
                  onPress={() => {
                    setSelectedTechnique(tech.id);
                    setShowSelector(false);
                    setIsActive(false);
                    setCycleCount(0);
                  }}
                  style={[
                    styles.techOption,
                    selectedTechnique === tech.id && { borderColor: BREATHING_PATTERNS[tech.id].color }
                  ]}
                >
                  <View style={[styles.techIcon, { backgroundColor: BREATHING_PATTERNS[tech.id].color + '20' }]}>
                    <Ionicons name={tech.icon as any} size={24} color={BREATHING_PATTERNS[tech.id].color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{BREATHING_PATTERNS[tech.id].name}</Text>
                    <Text style={[AppStyles.textGray, { fontSize: 11 }]}>{BREATHING_PATTERNS[tech.id].description}</Text>
                  </View>
                  {selectedTechnique === tech.id && (
                    <Ionicons name="checkmark-circle" size={24} color={BREATHING_PATTERNS[tech.id].color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stressAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryOrange + '10',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
  },
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryBioGreen + '10',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  breathCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  phaseText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  cycleText: {
    color: AppColors.textGray,
    fontSize: 12,
    marginTop: 5,
  },
  startText: {
    color: AppColors.textGray,
    fontSize: 14,
    letterSpacing: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    color: 'white',
  },
  patternStep: {
    alignItems: 'center',
  },
  mainBtn: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  mainBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  finishBtn: {
    alignItems: 'center',
  },
  hrvValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceGlass,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  techIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});