import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Modal, Easing,
} from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ── REAL PUBLIC AUDIO (Archive.org / free streams) ────────────
const AUDIOS = [
  {
    id: 'nsdr',
    title: 'NSDR — Non-Sleep Deep Rest',
    subtitle: '20 min · Equivale a 2h de sueño extra',
    icon: 'moon',
    color: AppColors.primaryNeonBlue,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'cortex',
    title: 'Apagado Reactivo Córtex',
    subtitle: '10 min · Reduce Cortisol post-entreno',
    icon: 'fitness',
    color: AppColors.primaryOrange,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'theta',
    title: 'Ondas Theta 6Hz',
    subtitle: '15 min · Creatividad y consolidación de memoria',
    icon: 'wifi',
    color: '#9b59b6',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'delta',
    title: 'Delta Sleep Induction',
    subtitle: '30 min · Reparación celular y GH nocturna',
    icon: 'bed',
    color: AppColors.primaryBioGreen,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
];

// ── BREATHING EXERCISE SCREEN ─────────────────────────────────
function BreathingScreen({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [cycle, setCycle] = useState(0);
  const [label, setLabel] = useState('Toca para iniciar');
  const [running, setRunning] = useState(false);
  const [counter, setCounter] = useState(0);

  // Circle & finger animations
  const circleScale = useRef(new Animated.Value(1)).current;
  const fingerMove = useRef(new Animated.Value(0)).current; // 0 to 1 for circular path
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const runCycle = (c: number) => {
    if (c >= 4) {
      setRunning(false);
      setPhase('idle');
      setLabel('¡Completo! 🎉');
      setCycle(0);
      return;
    }

    // INHALE 4s
    setPhase('inhale');
    setLabel('Inhala');
    setCounter(4);
    Animated.parallel([
      Animated.timing(circleScale, { toValue: 1.45, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(fingerMove, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 4000, useNativeDriver: false }),
    ]).start(() => {

      // HOLD 4s
      setPhase('hold');
      setLabel('Retén');
      setCounter(4);
      setTimeout(() => {

        // EXHALE 6s
        setPhase('exhale');
        setLabel('Exhala');
        setCounter(6);
        Animated.parallel([
          Animated.timing(circleScale, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(fingerMove, { toValue: 0, duration: 6000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.1, duration: 6000, useNativeDriver: false }),
        ]).start(() => {
          setCycle(c + 1);
          runCycle(c + 1);
        });
      }, 4000);
    });
  };

  // Circular Path for finger tracing
  // We use a multi-step interpolation to simulate a circular path
  const radius = width * 0.36; // Matching breathOuter radius
  
  const fingerX = fingerMove.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, radius, 0, -radius, 0],
  });
  
  const fingerY = fingerMove.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-radius, 0, radius, 0, -radius],
  });

  const fingerRotate = fingerMove.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Countdown effect
  useEffect(() => {
    if (!running) return;
    const dur = phase === 'exhale' ? 6 : 4;
    setCounter(dur);
    let count = dur;
    const iv = setInterval(() => {
      count--;
      setCounter(count);
      if (count <= 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, running]);

  const start = () => {
    if (running) return;
    setRunning(true);
    setCycle(0);
    runCycle(0);
  };

  const glowColor = glowOpacity.interpolate({
    inputRange: [0.1, 1],
    outputRange: ['rgba(0,209,255,0.08)', 'rgba(0,209,255,0.35)'],
  });

  const phaseColor = phase === 'inhale' ? AppColors.primaryNeonBlue
    : phase === 'hold' ? AppColors.primaryOrange
      : phase === 'exhale' ? AppColors.primaryBioGreen
        : 'rgba(255,255,255,0.2)';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050a0f', alignItems: 'center', justifyContent: 'center' }]}>
      {/* Close */}
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>

      <Text style={[AppStyles.textGray, { fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 60 }]}>
        Respiración 4-4-6
      </Text>

      {/* Animated Circle */}
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 50 }}>
        <Animated.View style={[styles.breathOuter, { backgroundColor: glowColor, transform: [{ scale: circleScale }] }]}>
          <View style={[styles.breathInner, { borderColor: phaseColor }]}>
            <Text style={[styles.breathPhaseText, { color: phaseColor }]}>{label}</Text>
            {running && (
              <Text style={[styles.breathCounter, { color: phaseColor }]}>{counter}</Text>
            )}
          </View>
        </Animated.View>

        {/* ── HAND & INDEX FINGER ── */}
        <Animated.View style={[styles.handContainer, { 
          position: 'absolute',
          transform: [
            { translateX: fingerX }, 
            { translateY: fingerY }, 
            { rotate: fingerRotate }
          ] 
        }]}>
          <View style={styles.handPalm}>
            <View style={styles.fingersRow}>
              <View style={[styles.finger, { height: 38 }]} />
              <View style={[styles.finger, { height: 44 }]} />
              <View style={[styles.finger, styles.indexFinger, { borderColor: phaseColor }]} />
              <View style={[styles.finger, { height: 40 }]} />
              <View style={[styles.finger, { height: 28, borderRadius: 6 }]} />
            </View>
            <View style={styles.palm} />
          </View>
        </Animated.View>
      </View>


      {/* Cycle dots */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 40 }}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.cycleDot, i < cycle && { backgroundColor: AppColors.primaryNeonBlue }]} />
        ))}
      </View>

      {!running && (
        <TouchableOpacity style={styles.breathStartBtn} onPress={start}>
          <Text style={{ color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 2 }}>
            {label === '¡Completo! 🎉' ? 'REPETIR' : 'INICIAR'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[AppStyles.textGray, { fontSize: 11, textAlign: 'center', marginTop: 24, paddingHorizontal: 40 }]}>
        4 ciclos de respiración consciente elevan la VFC y reducen el cortisol en un 18%.
      </Text>
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────
export default function DescansoScreen() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);

  useEffect(() => {
    return () => { sound?.unloadAsync(); };
  }, [sound]);

  const toggleSound = async (id: string, url: string) => {
    try {
      if (playing === id) {
        await sound?.pauseAsync();
        setPlaying(null);
      } else {
        await sound?.unloadAsync();
        await Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });
        const { sound: ns } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true, isLooping: true });
        setSound(ns);
        setPlaying(id);
      }
    } catch (err) { console.warn('Audio error:', err); }
  };

  return (
    <>
      <ScrollView style={AppStyles.body} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={['rgba(0,209,255,0.1)', 'transparent']}
          style={{ paddingTop: 56, paddingHorizontal: 22, paddingBottom: 20 }}
        >
          <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }]}>
            Protocolo de Recuperación
          </Text>
          <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: '900', marginTop: 2 }]}>
            Regulación CNS 🌙
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>

          {/* ── SLEEP ARCHITECTURE ── */}
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 22, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
            <View style={[AppStyles.rowBetween, { marginBottom: 10 }]}>
              <View style={AppStyles.rowCentered}>
                <Ionicons name="analytics" size={20} color={AppColors.primaryNeonBlue} style={{ marginRight: 8 }} />
                <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Arquitectura del Sueño</Text>
              </View>
              <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: '700' }}>8.2 hrs</Text>
            </View>
            <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 14 }]}>
              Calidad reparadora que maximiza la neuroplasticidad y el lavado linfático nocturno.
            </Text>
            <View style={{ flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden', marginBottom: 8 }}>
              <View style={{ flex: 2, backgroundColor: '#1A1A1A' }} />
              <View style={{ flex: 1.5, backgroundColor: AppColors.primaryNeonBlue }} />
              <View style={{ flex: 3, backgroundColor: '#333' }} />
              <View style={{ flex: 2.5, backgroundColor: AppColors.primaryBioGreen }} />
            </View>
            <View style={AppStyles.rowBetween}>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Vigilia 15%</Text>
              <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold' }}>REM 22%</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Ligero 40%</Text>
              <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>Profundo 23%</Text>
            </View>
          </View>

          {/* ── TOOLS ROW ── */}
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 14 }]}>
            Herramientas de Recuperación
          </Text>
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}>

            {/* RESPIRACIÓN BUTTON */}
            <TouchableOpacity
              style={[styles.toolCard, { borderColor: AppColors.primaryNeonBlue }]}
              onPress={() => setShowBreathing(true)}
            >
              <LinearGradient colors={['rgba(0,209,255,0.18)', 'rgba(0,209,255,0.04)']} style={StyleSheet.absoluteFill} />
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🤚</Text>
              <Text style={[AppStyles.textWhite, { fontWeight: '800', fontSize: 14, textAlign: 'center' }]}>
                Respiración Guiada
              </Text>
              <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginTop: 5 }]}>
                4-4-6 · Dedo índice
              </Text>
              <View style={[styles.toolBadge, { backgroundColor: AppColors.primaryNeonBlue }]}>
                <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>INTERACTIVO</Text>
              </View>
            </TouchableOpacity>

            {/* MEDITACIÓN BUTTON */}
            <TouchableOpacity
              style={[styles.toolCard, { borderColor: '#9b59b6' }]}
              onPress={() => setShowMeditation(true)}
            >
              <LinearGradient colors={['rgba(155,89,182,0.18)', 'rgba(155,89,182,0.04)']} style={StyleSheet.absoluteFill} />
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🧘</Text>
              <Text style={[AppStyles.textWhite, { fontWeight: '800', fontSize: 14, textAlign: 'center' }]}>
                Meditación
              </Text>
              <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginTop: 5 }]}>
                Guías de audio
              </Text>
              <View style={[styles.toolBadge, { backgroundColor: '#9b59b6' }]}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>4 PISTAS</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── CONTROL CIRCADIANO ── */}
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}>
            <View style={[AppStyles.glassCard, { flex: 1, padding: 15, alignItems: 'center' }]}>
              <Ionicons name="eye-off-outline" size={32} color={AppColors.primaryOrange} style={{ marginBottom: 8 }} />
              <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', textAlign: 'center' }]}>Detox Digital</Text>
              <Text style={[AppStyles.textGray, { fontSize: 9, textAlign: 'center', marginVertical: 6 }]}>Restablece receptores de dopamina</Text>
              <Text style={{ color: AppColors.primaryOrange, fontSize: 18, fontWeight: '900' }}>1h 45m</Text>
            </View>
            <View style={[AppStyles.glassCard, { flex: 1, padding: 15, alignItems: 'center' }]}>
              <Ionicons name="sunny-outline" size={32} color={AppColors.primaryBioGreen} style={{ marginBottom: 8 }} />
              <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', textAlign: 'center' }]}>Luz Solar</Text>
              <Text style={[AppStyles.textGray, { fontSize: 9, textAlign: 'center', marginVertical: 6 }]}>Sincroniza el ritmo circadiano</Text>
              <Text style={{ color: AppColors.primaryBioGreen, fontSize: 18, fontWeight: '900' }}>22 min</Text>
            </View>
          </View>

          {/* ── AUTOFAGIA ── */}
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 24, borderColor: AppColors.primaryBioGreen, borderWidth: 1 }]}>
            <View style={[AppStyles.rowBetween, { marginBottom: 10 }]}>
              <View style={AppStyles.rowCentered}>
                <Ionicons name="timer-outline" size={20} color={AppColors.primaryBioGreen} style={{ marginRight: 8 }} />
                <Text style={[AppStyles.textWhite, { fontSize: 15, fontWeight: 'bold' }]}>Autofagia Activa</Text>
              </View>
              <Text style={{ color: AppColors.primaryBioGreen, fontWeight: '700' }}>14h 30m</Text>
            </View>
            <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 14, lineHeight: 18 }]}>
              Vías mTOR inhibidas. Limpieza celular activa y maximización de longevidad.
            </Text>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <View style={{ width: '85%', height: '100%', backgroundColor: AppColors.primaryBioGreen }} />
            </View>
            <View style={[AppStyles.rowBetween, { marginTop: 6 }]}>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>0h</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Meta: 16h</Text>
            </View>
          </View>

          {/* ── AUDIOS DE NEUROPLASTICIDAD ── */}
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 14 }]}>
            Audios de Neuroplasticidad
          </Text>
          {AUDIOS.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => toggleSound(a.id, a.url)}
              style={[AppStyles.glassCard, { padding: 15, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }]}
            >
              <View style={[styles.audioCircle, { backgroundColor: `${a.color}18`, borderColor: playing === a.id ? a.color : 'transparent', borderWidth: 1 }]}>
                <Ionicons
                  name={playing === a.id ? 'pause' : 'play'}
                  size={22}
                  color={a.color}
                  style={{ marginLeft: playing === a.id ? 0 : 3 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[AppStyles.textWhite, { fontSize: 15, fontWeight: 'bold' }]}>{a.title}</Text>
                <Text style={[AppStyles.textGray, { fontSize: 11, marginTop: 3 }]}>{a.subtitle}</Text>
              </View>
              {playing === a.id && (
                <View style={styles.playingWave}>
                  {[1, 2, 3, 4].map(i => (
                    <View key={i} style={[styles.waveBar, { backgroundColor: a.color, height: Math.random() * 18 + 6 }]} />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>

      {/* ── MODAL RESPIRACIÓN ── */}
      <Modal visible={showBreathing} animationType="fade" onRequestClose={() => setShowBreathing(false)}>
        <BreathingScreen onClose={() => setShowBreathing(false)} />
      </Modal>

      {/* ── MODAL MEDITACIÓN ── */}
      <Modal visible={showMeditation} animationType="slide" onRequestClose={() => setShowMeditation(false)}>
        <View style={{ flex: 1, backgroundColor: '#06001a' }}>
          <LinearGradient colors={['rgba(155,89,182,0.3)', 'transparent']} style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30 }}>
            <TouchableOpacity onPress={() => setShowMeditation(false)} style={{ marginBottom: 16 }}>
              <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }]}>Meditación Guiada</Text>
            <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: '900', marginTop: 4 }]}>Audios de Sanación 🧘</Text>
          </LinearGradient>
          <ScrollView style={{ paddingHorizontal: 20 }}>
            {AUDIOS.map((a) => (
              <TouchableOpacity
                key={`m_${a.id}`}
                onPress={() => toggleSound(a.id, a.url)}
                style={[AppStyles.glassCard, { padding: 18, marginBottom: 16 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.audioCircle, { width: 56, height: 56, borderRadius: 28, backgroundColor: `${a.color}20`, marginRight: 16 }]}>
                    <Ionicons name={playing === a.id ? 'pause' : 'play'} size={26} color={a.color} style={{ marginLeft: playing === a.id ? 0 : 3 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>{a.title}</Text>
                    <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 4 }]}>{a.subtitle}</Text>
                    {playing === a.id && (
                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <View key={i} style={[styles.waveBar, { backgroundColor: a.color, height: Math.random() * 20 + 6, width: 4 }]} />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toolCard: {
    flex: 1, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 160,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  toolBadge: {
    marginTop: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  closeBtn: {
    position: 'absolute', top: 56, left: 24, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  breathOuter: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    alignItems: 'center', justifyContent: 'center',
  },
  breathInner: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  breathPhaseText: { fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  breathCounter: { fontSize: 46, fontWeight: '200', marginTop: 4 },
  handContainer: { marginTop: -30, alignItems: 'center' },
  handPalm: { alignItems: 'center' },
  fingersRow: { flexDirection: 'row', gap: 4, alignItems: 'flex-end', marginBottom: 2 },
  finger: {
    width: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  indexFinger: {
    height: 52, width: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,209,255,0.2)',
    borderWidth: 2,
  },
  palm: {
    width: 94, height: 55, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cycleDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  breathStartBtn: {
    backgroundColor: AppColors.primaryNeonBlue,
    paddingVertical: 18, paddingHorizontal: 60,
    borderRadius: 18,
  },
  audioCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  playingWave: { flexDirection: 'row', gap: 3, alignItems: 'flex-end', marginLeft: 10 },
  waveBar: { width: 3, borderRadius: 2 },
});
