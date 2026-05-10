import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function DescansoScreen() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleSound = async (id: string, url: string) => {
    try {
      if (playing === id) {
        // Stop current
        if (sound) await sound.pauseAsync();
        setPlaying(null);
      } else {
        // Stop any old sound
        if (sound) await sound.unloadAsync();
        
        // Start new
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true, isLooping: true });
        setSound(newSound);
        setPlaying(id);
      }
    } catch (err) {
      console.log('Audio Error:', err);
    }
  };

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={[AppStyles.rowBetween, { marginBottom: 24, marginTop: 10 }]}>
        <View>
           <Text style={[AppStyles.textGray, { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }]}>PROTOCOLO DE RECUPERACIÓN</Text>
           <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: 'bold' }]}>Regulación CNS</Text>
        </View>
        <Ionicons name="moon" size={40} color={AppColors.primaryNeonBlue} />
      </View>

      {/* Sleep Architecture Visualizer (Longevity Focus) */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
        <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
          <View style={AppStyles.rowCentered}>
             <Ionicons name="analytics" size={20} color={AppColors.primaryNeonBlue} style={{ marginRight: 8 }} />
             <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Arquitectura del Sueño</Text>
          </View>
          <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: '600' }}>8.2 hrs</Text>
        </View>
        
        <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 15 }]}>Calidad reparadora que maximiza la neuroplasticidad y el lavado linfático nocturno.</Text>

        {/* Visualizer bars */}
        <View style={{ flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
           <View style={{ flex: 2, backgroundColor: '#1A1A1A' }} />
           <View style={{ flex: 1.5, backgroundColor: AppColors.primaryNeonBlue }} />
           <View style={{ flex: 3, backgroundColor: '#333' }} />
           <View style={{ flex: 2.5, backgroundColor: AppColors.primaryBioGreen }} />
        </View>
        <View style={AppStyles.rowBetween}>
           <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Vigilia (15%)</Text>
           <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold' }}>REM (22%)</Text>
           <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Ligero (40%)</Text>
           <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>Profundo (23%)</Text>
        </View>
      </View>

      {/* Dopamine Detox & Cortisol Protocol */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Control Circadiano y Dopamina</Text>
      
      <View style={{ flexDirection: 'row', gap: 15, marginBottom: 25 }}>
         <View style={[AppStyles.glassCard, { flex: 1, padding: 15, alignItems: 'center' }]}>
            <Ionicons name="eye-off-outline" size={32} color={AppColors.primaryOrange} style={{ marginBottom: 10 }} />
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', textAlign: 'center' }]}>Detox Digital</Text>
            <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginVertical: 8 }]}>Restablece receptores de dopamina.</Text>
            <Text style={{ color: AppColors.primaryOrange, fontSize: 18, fontWeight: 'bold' }}>1h 45m</Text>
         </View>

         <View style={[AppStyles.glassCard, { flex: 1, padding: 15, alignItems: 'center' }]}>
            <Ionicons name="sunny-outline" size={32} color={AppColors.primaryBioGreen} style={{ marginBottom: 10 }} />
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', textAlign: 'center' }]}>Luz Solar</Text>
            <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginVertical: 8 }]}>Sincroniza el Ritmo Circadiano.</Text>
            <Text style={{ color: AppColors.primaryBioGreen, fontSize: 18, fontWeight: 'bold' }}>22 min</Text>
         </View>
      </View>

      {/* Cellular Repair & Autophagy (NotebookLM Protocol) */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Metabolismo & Reparación Celular</Text>
      
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryBioGreen, borderWidth: 1 }]}>
        <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
          <View style={AppStyles.rowCentered}>
             <Ionicons name="timer-outline" size={20} color={AppColors.primaryBioGreen} style={{ marginRight: 8 }} />
             <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Ventana de Ayuno (Autofagia)</Text>
          </View>
          <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold' }}>14h 30m</Text>
        </View>
        
        <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 15, lineHeight: 18 }]}>Iniciada respuesta de escasez (vías mTOR inhibidas). Activando la limpieza celular y maximizando longevidad.</Text>

        <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
           <View style={{ width: '85%', height: '100%', backgroundColor: AppColors.primaryBioGreen }} />
        </View>
        <View style={[AppStyles.rowBetween, { marginTop: 6 }]}>
           <Text style={[AppStyles.textGray, { fontSize: 10 }]}>0h</Text>
           <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Meta Óptima: 16h</Text>
        </View>
      </View>

      {/* Neuroplasticity Meditations */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Audios de Neuroplasticidad</Text>
      
      <TouchableOpacity 
         onPress={() => toggleSound('nsdr', 'https://dns.google/health/ping')} // Replace with a real audio URL later, demo mode now uses raw uri
         style={[AppStyles.glassCard, { padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }]}
      >
         <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0, 209, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
            <Ionicons name={playing === 'nsdr' ? "pause" : "play"} size={24} color={AppColors.primaryNeonBlue} style={{ marginLeft: playing === 'nsdr' ? 0 : 4 }} />
         </View>
         <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>NSDR (Non-Sleep Deep Rest)</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12 }]}>15 min • Equivale a 2 hrs de sueño extra.</Text>
         </View>
      </TouchableOpacity>

      <TouchableOpacity 
         onPress={() => toggleSound('cortex', 'https://dns.google/health/ping')}
         style={[AppStyles.glassCard, { padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }]}
      >
         <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 138, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
            <Ionicons name={playing === 'cortex' ? "pause" : "play"} size={24} color={AppColors.primaryOrange} style={{ marginLeft: playing === 'cortex' ? 0 : 4 }} />
         </View>
         <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Apagado Reactivo Córtex</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12 }]}>10 min • Reduce Cortisol Post-Entrenamiento.</Text>
         </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
