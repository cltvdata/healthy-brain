import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Mock data for Longevity routines
const LONGEVITY_ROUTINES = [
  { 
    id: '1', 
    title: 'Resiliencia Metabólica y Fuerza', 
    level: 'Avanzado', 
    time: '45m', 
    kcal: '320', 
    video: 'https://v.ftcdn.net/01/24/76/90/700_F_124769018_v6qI4T3x8Cg63n2x9r6Ym1S0MvP8n4S0_ST.mp4',
    tip: 'La sobrecarga progresiva es el motor de la longevidad celular (mTOR).'
  },
  { 
    id: '2', 
    title: 'Protocolo de Movilidad Articular', 
    level: 'Intermedio', 
    time: '20m', 
    kcal: '85', 
    video: 'https://v.ftcdn.net/03/49/71/84/700_F_349718485_4z4e7I1P8M5T0H3D9o1X2u6A7S0D4F5_ST.mp4',
    tip: 'Berberina + Movilidad = Optimización de la Glucemia post-entrenamiento.'
  },
];

const HYPERTROPHY_ROUTINES = [
  { 
    id: '3', 
    title: 'Hipertrofia Funcional: Push/Pull', 
    level: 'Avanzado', 
    time: '65m', 
    kcal: '450', 
    video: 'https://v.ftcdn.net/02/76/06/33/700_F_276063346_4Z97I632N7wzNq3Zq42Y2x8t8Ixy9M41_ST.mp4',
    tip: 'Rango de repeticiones de 8 a 12 con RIR 1-2 maximiza tensión mecánica.'
  },
  { 
    id: '4', 
    title: 'Volumen y Densidad: Piernas', 
    level: 'Élite', 
    time: '50m', 
    kcal: '520', 
    video: 'https://v.ftcdn.net/05/20/39/10/700_F_520391054_47QZQm8v2cZ8R91b8zM6h9C4pZ6wZ4H_ST.mp4',
    tip: 'SNC: Fatiga central alta. Prioriza consumo de carbohidratos simples intra-entreno.'
  },
];

export default function EjerciciosScreen() {
  const [activeCategory, setActiveCategory] = useState<'Longevidad' | 'Hipertrofia' | 'CNS' | 'Metabolismo'>('Longevidad');

  const getRoutines = () => {
    switch(activeCategory) {
      case 'Hipertrofia': return HYPERTROPHY_ROUTINES;
      default: return LONGEVITY_ROUTINES; // Default to longevity for missing ones
    }
  };

  const activeRoutines = getRoutines();
  
  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Bio-Header */}
        <View style={{ marginBottom: 25, paddingTop: 40 }}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }]}>Performance Científica</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>Bio-Entrenamiento 🧬</Text>
        </View>

        {/* Longevity Tip Banner */}
        <LinearGradient
          colors={['rgba(19, 236, 91, 0.1)', 'rgba(0,0,0,0)']}
          style={{ padding: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(19, 236, 91, 0.2)', marginBottom: 25 }}
        >
          <View style={AppStyles.rowCentered}>
             <Ionicons name="flask" size={20} color={AppColors.primaryBioGreen} style={{ marginRight: 10 }} />
             <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Tip de la Bio-Elite</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 8 }]}>
            "La Ashwagandha reduce el cortisol en un 27% si se consume tras sesiones de fuerza de alta intensidad."
          </Text>
        </LinearGradient>

        {/* Category Pills (Longevidad / Ciencia) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
          {['Longevidad', 'Hipertrofia', 'CNS', 'Metabolismo'].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setActiveCategory(cat as any)}
                style={isActive ? styles.catPillActive : styles.catPill}
              >
                <Text style={isActive ? styles.catTextActive : styles.catText}>{cat === 'CNS' ? 'CNS (Neuro)' : cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Premium Workout Feed */}
        {activeRoutines.map((item) => (
          <View key={item.id} style={styles.workoutCard}>
            <View style={{ height: 180 }}>
              <Video
                source={{ uri: item.video }}
                style={StyleSheet.absoluteFill}
                shouldPlay
                isLooping
                isMuted
                resizeMode={ResizeMode.COVER}
              />
              {/* Sci-Overlay */}
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
              />
              
              <View style={styles.tagsContainer}>
                 <View style={styles.tagUI}>
                   <Text style={styles.tagText}>{item.level}</Text>
                 </View>
                 <View style={styles.tagUI}>
                   <Text style={styles.tagText}>{item.time} • {item.kcal} kcal</Text>
                 </View>
              </View>
            </View>

            <View style={styles.bottomInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutTitle}>{item.title}</Text>
                <Text style={[AppStyles.textGray, { fontSize: 10, marginTop: 4 }]}>PROT: {item.tip}</Text>
              </View>
              <TouchableOpacity style={styles.startBtn}>
                <Ionicons name="play" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  catPillActive: {
    backgroundColor: 'rgba(19, 236, 91, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: AppColors.primaryBioGreen
  },
  catPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
  },
  catTextActive: {
    color: AppColors.primaryBioGreen,
    fontWeight: 'bold',
    fontSize: 13
  },
  catText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13
  },
  workoutCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#161616',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  tagUI: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  bottomInfoRow: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A'
  },
  workoutTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  startBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primaryBioGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15
  }
});
