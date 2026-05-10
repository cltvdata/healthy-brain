import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Modal, Image
} from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BioIntelligenceService, BioRecommendation } from '@/services/BioIntelligenceService';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

// ── REAL PUBLIC VIDEOS (Mixkit / Pexels – free) ───────────────
const ALL_ROUTINES: Record<string, any[]> = {
  Longevidad: [
    {
      id: 'l1',
      title: 'Resiliencia Metabólica',
      level: 'Avanzado',
      time: '45m',
      kcal: '320',
      muscles: 'Full Body',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-woman-doing-exercises-with-rubber-band-22698-large.mp4',
      tip: 'Sobrecarga progresiva → activa mTOR → longevidad celular.',
    },
    {
      id: 'l2',
      title: 'Movilidad Articular 360°',
      level: 'Intermedio',
      time: '20m',
      kcal: '85',
      muscles: 'Articulaciones',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-young-woman-doing-yoga-exercises-at-home-4790-large.mp4',
      tip: 'Berberina + Movilidad = Optimización glucemia post-entreno.',
    },
    {
      id: 'l3',
      title: 'Caminata de Zona 2',
      level: 'Básico',
      time: '30m',
      kcal: '140',
      muscles: 'Cardio / Mitocondrias',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-woman-running-on-a-track-4814-large.mp4',
      tip: 'Zona 2 es el mayor activador de biogénesis mitocondrial.',
    },
  ],
  Hipertrofia: [
    {
      id: 'h1',
      title: 'Push / Pull Funcional',
      level: 'Avanzado',
      time: '65m',
      kcal: '450',
      muscles: 'Pecho · Espalda · Brazos',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-man-doing-exercises-with-kettlebell-4812-large.mp4',
      tip: 'Rango 8-12 reps con RIR 1-2 maximiza tensión mecánica.',
    },
    {
      id: 'h2',
      title: 'Volumen Piernas: Squat & RDL',
      level: 'Élite',
      time: '50m',
      kcal: '520',
      muscles: 'Cuádriceps · Isquios · Glúteos',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-man-training-with-a-barbell-4795-large.mp4',
      tip: 'SNC alta fatiga. Consume CHO simples intra-entreno.',
    },
    {
      id: 'h3',
      title: 'Shoulders & Arms Hypertrophy',
      level: 'Intermedio',
      time: '40m',
      kcal: '280',
      muscles: 'Deltoides · Bíceps · Tríceps',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-man-training-in-the-gym-1037-large.mp4',
      tip: 'Drop sets al fallo en último ejercicio = máximo reclutamiento.',
    },
  ],
  CNS: [
    {
      id: 'c1',
      title: 'Potenciación Post-Activación',
      level: 'Élite',
      time: '35m',
      kcal: '260',
      muscles: 'Neuro-muscular',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-man-doing-push-ups-in-a-gym-4796-large.mp4',
      tip: 'PAP: Sprint 6s → fuerza máxima → potencia explosiva +12%.',
    },
    {
      id: 'c2',
      title: 'Pliométricos & Explosividad',
      level: 'Avanzado',
      time: '25m',
      kcal: '200',
      muscles: 'Fibras Tipo II',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-athlete-warming-up-before-training-4811-large.mp4',
      tip: 'Box jumps activan vías de señalización IGF-1 en 48h.',
    },
  ],
  Metabolismo: [
    {
      id: 'm1',
      title: 'HIIT Metabólico 4×4',
      level: 'Avanzado',
      time: '20m',
      kcal: '380',
      muscles: 'Cardio / VO2Max',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-woman-doing-aerobics-in-the-gym-4816-large.mp4',
      tip: 'HIIT 4×4: 4 min al 85% FC + 3 min recuperación × 4 bloques.',
    },
    {
      id: 'm2',
      title: 'Circuito Ketogénico',
      level: 'Intermedio',
      time: '30m',
      kcal: '310',
      muscles: 'Full Body Oxidativo',
      video: 'https://cdn.mixkit.co/videos/preview/mixkit-woman-training-with-dumbbells-4817-large.mp4',
      tip: 'Ayuno 14h previo amplifica oxidación lipídica hasta 3×.',
    },
  ],
};

// ── PLAN SEMANAL ─────────────────────────────────────────────
const WEEKLY_PLAN = [
  { day: 'Lun', label: 'Push', icon: 'fitness-outline', color: AppColors.primaryBioGreen, done: true },
  { day: 'Mar', label: 'Zona 2', icon: 'walk-outline', color: AppColors.primaryNeonBlue, done: true },
  { day: 'Mié', label: 'Pull', icon: 'barbell-outline', color: AppColors.primaryBioGreen, done: false },
  { day: 'Jue', label: 'NSDR', icon: 'moon-outline', color: AppColors.primaryOrange, done: false },
  { day: 'Vie', label: 'Piernas', icon: 'body-outline', color: AppColors.primaryBioGreen, done: false },
  { day: 'Sáb', label: 'HIIT', icon: 'flash-outline', color: '#ff4d8d', done: false },
  { day: 'Dom', label: 'Móvil.', icon: 'leaf-outline', color: AppColors.primaryNeonBlue, done: false },
];

export default function EjerciciosScreen() {
  const [activeCategory, setActiveCategory] = useState<'Longevidad' | 'Hipertrofia' | 'CNS' | 'Metabolismo'>('Longevidad');
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<BioRecommendation | null>(null);

  useEffect(() => {
    const fetchRec = async () => {
      const rec = await BioIntelligenceService.getDailyRecommendation();
      setRecommendation(rec);
    };
    fetchRec();
  }, []);

  const routines = ALL_ROUTINES[activeCategory] ?? [];

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={['rgba(19,236,91,0.12)', 'transparent']}
          style={{ paddingTop: 56, paddingHorizontal: 22, paddingBottom: 20 }}
        >
          <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }]}>
            Performance Científica
          </Text>
          <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: '900', marginTop: 2 }]}>
            Bio-Entrenamiento 🧬
          </Text>
        </LinearGradient>

        {/* ── AI ADVISOR BANNER ── */}
        {recommendation && (
          <TouchableOpacity 
            onPress={() => router.push('/recovery-dashboard')}
            style={[AppStyles.glassCard, styles.advisorBanner]}
          >
            <View style={AppStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <View style={AppStyles.rowCentered}>
                  <Ionicons name="sparkles" size={18} color={AppColors.primaryNeonBlue} />
                  <Text style={styles.advisorTag}>BIO-ADVISOR IA</Text>
                </View>
                <Text style={styles.advisorMain}>{recommendation.primaryAdvise}</Text>
                <Text style={styles.advisorSub}>Score: {recommendation.readinessScore}% · {recommendation.status}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={AppColors.primaryNeonBlue} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── PLAN SEMANAL ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 14 }]}>
            📅 Plan de la Semana
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {WEEKLY_PLAN.map((d) => (
              <View key={d.day} style={[styles.dayCard, d.done && { borderColor: d.color }]}>
                <Text style={[styles.dayLabel, d.done && { color: d.color }]}>{d.day}</Text>
                <Ionicons
                  name={d.icon as any}
                  size={20}
                  color={d.done ? d.color : 'rgba(255,255,255,0.2)'}
                />
                <Text style={[styles.dayText, d.done && { color: d.color }]}>{d.label}</Text>
                {d.done && (
                  <View style={[styles.doneDot, { backgroundColor: d.color }]} />
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── CATEGORIA PILLS ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20, marginBottom: 22 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {(['Longevidad', 'Hipertrofia', 'CNS', 'Metabolismo'] as const).map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={active ? styles.catPillActive : styles.catPill}
              >
                <Text style={active ? styles.catTextActive : styles.catText}>
                  {cat === 'CNS' ? '⚡ CNS Neuro' : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── WORKOUT CARDS ── */}
        <View style={{ paddingHorizontal: 20 }}>
          {routines.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              style={styles.workoutCard}
              onPress={() => setSelectedRoutine(item)}
            >
              {/* Video Preview */}
              <View style={{ height: 200, borderRadius: 18, overflow: 'hidden' }}>
                <Video
                  source={{ uri: item.video }}
                  style={StyleSheet.absoluteFill}
                  shouldPlay
                  isLooping
                  isMuted
                  resizeMode={ResizeMode.COVER}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.8)']}
                  style={StyleSheet.absoluteFill}
                />
                {/* Level & Time badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.level}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.time} · {item.kcal} kcal</Text>
                  </View>
                </View>
                {/* Play Button */}
                <View style={styles.playCenter}>
                  <Ionicons name="play-circle" size={52} color="rgba(255,255,255,0.9)" />
                </View>
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutTitle}>{item.title}</Text>
                  <View style={styles.muscleRow}>
                    <Ionicons name="body-outline" size={12} color={AppColors.primaryBioGreen} />
                    <Text style={styles.muscleText}>{item.muscles}</Text>
                  </View>
                  <Text style={[AppStyles.textGray, { fontSize: 10, marginTop: 6, lineHeight: 15 }]}>
                    🔬 {item.tip}
                  </Text>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={() => setSelectedRoutine(item)}>
                  <Ionicons name="play" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── MODAL: Video Full Screen ── */}
      <Modal
        visible={!!selectedRoutine}
        animationType="slide"
        onRequestClose={() => setSelectedRoutine(null)}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {selectedRoutine && (
            <>
              <Video
                source={{ uri: selectedRoutine.video }}
                style={{ width: '100%', height: 320 }}
                shouldPlay
                isLooping
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
              <ScrollView style={{ padding: 24 }}>
                <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900', marginBottom: 8 }]}>
                  {selectedRoutine.title}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  {[selectedRoutine.level, selectedRoutine.time, `${selectedRoutine.kcal} kcal`, selectedRoutine.muscles].map(t => (
                    <View key={t} style={styles.badge}><Text style={styles.badgeText}>{t}</Text></View>
                  ))}
                </View>
                <LinearGradient
                  colors={['rgba(19,236,91,0.1)', 'rgba(0,0,0,0)']}
                  style={{ padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(19,236,91,0.2)' }}
                >
                  <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', marginBottom: 6 }}>
                    🔬 Protocolo Científico
                  </Text>
                  <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 20 }]}>
                    {selectedRoutine.tip}
                  </Text>
                </LinearGradient>
              </ScrollView>
              <TouchableOpacity
                onPress={() => setSelectedRoutine(null)}
                style={{ margin: 24, padding: 18, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dayCard: {
    width: 62,
    height: 90,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginRight: 10,
    paddingVertical: 10,
    position: 'relative',
  },
  dayLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 'bold' },
  dayText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600' },
  doneDot: {
    position: 'absolute', bottom: 7, width: 6, height: 6, borderRadius: 3,
  },
  catPillActive: {
    backgroundColor: 'rgba(19,236,91,0.15)',
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 25, marginRight: 12,
    borderWidth: 1, borderColor: AppColors.primaryBioGreen,
  },
  catPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 25, marginRight: 12,
  },
  catTextActive: { color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 13 },
  catText: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
  workoutCard: {
    borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#161616',
    marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  badgeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    position: 'absolute', top: 12, left: 12, right: 12,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  playCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  cardFooter: {
    padding: 18, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  workoutTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
  muscleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 },
  muscleText: { color: AppColors.primaryBioGreen, fontSize: 11 },
  startBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: AppColors.primaryBioGreen,
    justifyContent: 'center', alignItems: 'center', marginLeft: 14,
  },
  advisorBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primaryNeonBlue,
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
  },
  advisorTag: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 8,
  },
  advisorMain: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  advisorSub: {
    color: AppColors.textGray,
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  }
});
