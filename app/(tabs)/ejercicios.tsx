import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

export default function EjerciciosScreen() {
  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={[AppStyles.rowCentered, { marginBottom: 20 }]}>
        <Ionicons name="library-outline" size={32} color="white" style={{ marginRight: 10 }} />
        <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold' }]}>Biblioteca</Text>
      </View>

      {/* Custom Search Bar */}
      <View style={[AppStyles.highContrastInput, AppStyles.rowCentered, { marginBottom: 20 }]}>
        <Ionicons name="search" size={20} color="#a1a1aa" style={{ marginRight: 10 }} />
        <TextInput 
          placeholder="Buscar ejercicio..."
          placeholderTextColor="#a1a1aa"
          style={{ flex: 1, color: 'white' }}
        />
      </View>

      {/* Category Pills */}
      <View style={[AppStyles.rowCentered, { marginBottom: 20 }]}>
        <TouchableOpacity style={{ backgroundColor: 'rgba(19, 236, 91, 0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: AppColors.primaryBioGreen }}>
          <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold' }}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 }}>
          <Text style={AppStyles.textWhite}>Hipertrofia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: 'rgba(255,138,0,0.1)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}>
          <Text style={{ color: AppColors.primaryOrange }}>CNS</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Workout List (Image 1 Style) */}
      <View style={{ marginBottom: 15 }}>
        <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Selecciona un Entrenamiento</Text>

        {/* Card 1 */}
        <View style={styles.workoutCard}>
          <View style={{ height: 160 }}>
            <Video
              source={{ uri: 'https://v.ftcdn.net/01/24/76/90/700_F_124769018_v6qI4T3x8Cg63n2x9r6Ym1S0MvP8n4S0_ST.mp4' }}
              style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
              shouldPlay
              isLooping
              isMuted
              resizeMode={ResizeMode.COVER}
            />
            {/* Tags Row */}
            <View style={styles.tagsContainer}>
               <View style={styles.tagUI}>
                 <Ionicons name="bar-chart" size={10} color="white" style={{ marginRight: 4 }} />
                 <Text style={styles.tagText}>Intermedio</Text>
               </View>
               <View style={styles.tagUI}>
                 <Ionicons name="time" size={10} color="white" style={{ marginRight: 4 }} />
                 <Text style={styles.tagText}>1hr 20min</Text>
               </View>
               <View style={styles.tagUI}>
                 <Ionicons name="flame" size={10} color="white" style={{ marginRight: 4 }} />
                 <Text style={styles.tagText}>250 kcal</Text>
               </View>
            </View>
          </View>
          {/* Bottom Info Row */}
          <View style={styles.bottomInfoRow}>
            <Text style={styles.workoutTitle}>Circuito de Fuerza y Acondicionamiento</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <TouchableOpacity style={styles.iconBtnDark}>
                 <Ionicons name="heart-outline" size={20} color="white" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.iconBtnOrange}>
                 <Ionicons name="arrow-forward" size={20} color="black" style={{ transform: [{ rotate: '-45deg' }] }} />
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card 2 */}
        <View style={styles.workoutCard}>
          <View style={{ height: 160 }}>
            <Video
              source={{ uri: 'https://v.ftcdn.net/03/49/71/84/700_F_349718485_4z4e7I1P8M5T0H3D9o1X2u6A7S0D4F5_ST.mp4' }}
              style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
              shouldPlay
              isLooping
              isMuted
              resizeMode={ResizeMode.COVER}
            />
            {/* Tags Row */}
            <View style={styles.tagsContainer}>
               <View style={styles.tagUI}>
                 <Ionicons name="flash" size={10} color="white" style={{ marginRight: 4 }} />
                 <Text style={styles.tagText}>Avanzado</Text>
               </View>
               <View style={styles.tagUI}>
                 <Ionicons name="time" size={10} color="white" style={{ marginRight: 4 }} />
                 <Text style={styles.tagText}>1hr 55min</Text>
               </View>
               <View style={styles.tagUI}>
                 <Ionicons name="flame" size={10} color="white" style={{ marginRight: 4 }} />
                 <Text style={styles.tagText}>300 kcal</Text>
               </View>
            </View>
          </View>
          {/* Bottom Info Row */}
          <View style={styles.bottomInfoRow}>
            <Text style={styles.workoutTitle}>Entrenamiento de Intervalos de Alta Intensidad</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <TouchableOpacity style={styles.iconBtnDark}>
                 <Ionicons name="heart-outline" size={20} color="white" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.iconBtnOrange}>
                 <Ionicons name="arrow-forward" size={20} color="black" style={{ transform: [{ rotate: '-45deg' }] }} />
               </TouchableOpacity>
            </View>
          </View>
        </View>

      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  workoutCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15
  },
  tagUI: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  bottomInfoRow: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A'
  },
  workoutTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: '60%'
  },
  iconBtnDark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconBtnOrange: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AppColors.primaryOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  }
});
