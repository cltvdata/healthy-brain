import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BioWellnessService, WellnessTechnique, BREATHING_PATTERNS } from '@/services/BioWellnessService';

const { width } = Dimensions.get('window');

const MEDITATION_CATEGORIES = [
  { id: 'morning', title: '🌅 Mañana', icon: 'sunny', description: 'Energiza tu día' },
  { id: 'stress', title: '🧘 Estrés', icon: 'leaf', description: 'Libera tensión' },
  { id: 'sleep', title: '🌙 Sueño', icon: 'moon', description: 'Relajación profunda' },
  { id: 'focus', title: '⚡ Enfoque', icon: 'bulb', description: 'Claridad mental' },
];

const MEDITATIONS: Record<string, { technique: WellnessTechnique, duration: number, color: string }> = {
  morning_1: { technique: 'energy_boost', duration: 300, color: '#f59e0b' },
  morning_2: { technique: 'box_breathing', duration: 600, color: '#00d1ff' },
  stress_1: { technique: '478_breathing', duration: 480, color: '#13ec5b' },
  stress_2: { technique: 'vagal_breathing', duration: 600, color: '#ff6b35' },
  stress_3: { technique: 'stress_relief', duration: 300, color: '#ef4444' },
  sleep_1: { technique: 'sleep_meditation', duration: 900, color: '#8b5cf6' },
  sleep_2: { technique: 'body_scan', duration: 720, color: '#a855f7' },
  focus_1: { technique: 'coherent_breathing', duration: 600, color: '#3b82f6' },
  focus_2: { technique: 'mindfulness', duration: 480, color: '#6366f1' },
};

export default function MeditacionScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('stress');
  const [isPlaying, setIsPlaying] = useState(false);

  const getMeditationsByCategory = (category: string) => {
    return Object.entries(MEDITATIONS)
      .filter(([key]) => key.startsWith(category))
      .map(([key, value]) => ({ id: key, ...value }));
  };

  const startMeditation = (id: string) => {
    const meditation = MEDITATIONS[id];
    // Navigate to focus session with the technique
    router.push('/sesion-enfoque' as any);
  };

  const meditations = getMeditationsByCategory(selectedCategory);

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        
        {/* Header */}
        <View style={[AppStyles.rowBetween, { marginBottom: 25 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>🧘 Meditación</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Sesiones guiadas con IA</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Current Recommendation */}
        <View style={[styles.recommendSection, { borderColor: AppColors.primaryBioGreen }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="sparkles" size={20} color={AppColors.primaryBioGreen} />
            <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', marginLeft: 8 }}>
              Recomendado para ti
            </Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18 }]}>
            Basado en tu nivel de estrés actual, te sugerimos comenzar con una sesión de 
            Respiración Vagal para activar tu nervio vago y reducir la activación simpática.
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: AppColors.primaryBioGreen }]}
            onPress={() => router.push('/sesion-enfoque' as any)}
          >
            <Ionicons name="play" size={18} color="black" />
            <Text style={{ color: 'black', fontWeight: 'bold', marginLeft: 8 }}>INICIAR AHORA</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 10 }]}>
          Categorías
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {MEDITATION_CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryCard,
                selectedCategory === cat.id && { borderColor: AppColors.primaryBioGreen }
              ]}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={28} 
                color={selectedCategory === cat.id ? AppColors.primaryBioGreen : AppColors.textGray} 
              />
              <Text style={[
                styles.categoryTitle,
                selectedCategory === cat.id && { color: AppColors.primaryBioGreen }
              ]}>
                {cat.title}
              </Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{cat.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meditations List */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
          Sesiones Disponibles
        </Text>
        
        {meditations.map((med) => {
          const pattern = BREATHING_PATTERNS[med.technique];
          const mins = Math.floor(med.duration / 60);
          
          return (
            <TouchableOpacity 
              key={med.id}
              onPress={() => startMeditation(med.id)}
              style={[styles.meditationCard, { borderColor: med.color }]}
            >
              <View style={[styles.meditationIcon, { backgroundColor: med.color + '20' }]}>
                <Ionicons name="musical-notes" size={24} color={med.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 14 }]}>
                  {pattern.name}
                </Text>
                <Text style={[AppStyles.textGray, { fontSize: 11 }]}>
                  {pattern.description}
                </Text>
                <View style={[AppStyles.rowCentered, { marginTop: 5 }]}>
                  <View style={[styles.tag, { backgroundColor: med.color + '20' }]}>
                    <Text style={{ color: med.color, fontSize: 9 }}>{mins} MIN</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: AppColors.surfaceGlass }]}>
                    <Text style={{ color: AppColors.textGray, fontSize: 9 }}>{med.color === '#8b5cf6' ? '🎵 AUDIO' : '🌬️ RESPIRA'}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="play-circle" size={32} color={med.color} />
            </TouchableOpacity>
          );
        })}

        {/* Quick Techniques */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 }]}>
          Técnicas de Respiración
        </Text>
        
        <View style={{ gap: 10 }}>
          {(['box_breathing', '478_breathing', 'coherent_breathing', 'vagal_breathing'] as WellnessTechnique[]).map((tech) => {
            const pattern = BREATHING_PATTERNS[tech];
            return (
              <TouchableOpacity 
                key={tech}
                onPress={() => router.push('/sesion-enfoque' as any)}
                style={[styles.techniqueRow, { borderColor: pattern.color }]}
              >
                <View style={[styles.techDot, { backgroundColor: pattern.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 13 }]}>{pattern.name}</Text>
                  <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{pattern.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={AppColors.textGray} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Benefits Info */}
        <View style={[styles.benefitsCard, { marginTop: 25 }]}>
          <Text style={[AppStyles.textWhite, { fontWeight: 'bold', marginBottom: 10 }]}>💡 Beneficios Respiroterapia</Text>
          <View style={{ gap: 8 }}>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>• Reduce cortisol y estrés crónico</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>• Mejora la variabilidad cardíaca (HRV)</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>• Optimiza la función del nervio vago</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>• Mejora la calidad del sueño</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>• Aumenta la capacidad de concentración</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  recommendSection: {
    backgroundColor: AppColors.primaryBioGreen + '08',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
  },
  categoryCard: {
    backgroundColor: AppColors.surfaceGlass,
    padding: 15,
    borderRadius: 18,
    marginRight: 10,
    width: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  meditationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceGlass,
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  meditationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 5,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceGlass,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
  },
  techDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  benefitsCard: {
    backgroundColor: AppColors.surfaceGlass,
    padding: 20,
    borderRadius: 20,
  },
});