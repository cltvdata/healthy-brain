import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import BreathingTimer from '@/components/BreathingTimer';

const { width } = Dimensions.get('window');

export default function EntrenarScreen() {
  const [isResting, setIsResting] = useState(false);
  const [showFemaleAnatomy, setShowFemaleAnatomy] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSets = 4;

  const handleNextSet = () => {
    if (currentSet < totalSets) {
      setIsResting(true);
    } else {
      // Workout Finished Logic
      alert("¡Entrenamiento Completado! +250 XP");
    }
  };

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Biological Sovereignty Header */}
      <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 10 }]}>
        <View>
          <Text style={[AppStyles.textGray, { fontSize: 12, fontWeight: 'bold' }]}>SESIÓN ACTIVA</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>Hipertrofia CNS</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 15, alignItems: 'center' }}>
          <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold' }}>98% IA</Text>
          <Text style={{ color: AppColors.textGray, fontSize: 10 }}>PRECISIÓN</Text>
        </View>
      </View>

      {/* Main Exercise Card */}
      <View style={[AppStyles.glassCard, { padding: 0, marginBottom: 25 }]}>
        <View style={{ padding: 20 }}>
          <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>Press de Banca</Text>
            <View style={{ backgroundColor: 'black', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 }}>
              <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>Set {currentSet}/{totalSets}</Text>
            </View>
          </View>

          {/* Deep Interactive Anatomy Atlas (ESRF Style) */}
          <View style={{ height: 350, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 20, marginBottom: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: AppColors.primaryNeonBlue }}>
             {/* Deep Scan Background Simulation */}
             <Image 
                source={{ uri: showFemaleAnatomy 
                  ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Muscular_system_female_posterior.svg/512px-Muscular_system_female_posterior.svg.png' 
                  : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Muscular_system_front.svg/512px-Muscular_system_front.svg.png' 
                }}
                style={{ width: '100%', height: '100%', resizeMode: 'contain', opacity: 0.2 }}
              />
              
              {/* Internal Organ Glow Simulation (Liver/Heart/Metabolic pathways) */}
              <View style={{ position: 'absolute', top: '35%', left: '45%', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 69, 0, 0.4)', shadowColor: AppColors.primaryOrange, shadowOpacity: 1, shadowRadius: 20 }} />
              <View style={{ position: 'absolute', top: '25%', left: '42%', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0, 209, 255, 0.3)', shadowColor: AppColors.primaryNeonBlue, shadowOpacity: 1, shadowRadius: 15 }} />

              <View style={{ position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(0, 209, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: AppColors.primaryNeonBlue }}>
                 <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>🧬 ATLAS ESRF HiP-CT ACTIVO</Text>
              </View>

              <View style={{ position: 'absolute', bottom: 15, left: 15 }}>
                 <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold' }]}>Impacto Vascular y Órganos</Text>
                 <Text style={[AppStyles.textGray, { fontSize: 10 }]}>+14% Oxidación Lipídica (Hígado)</Text>
              </View>

              <TouchableOpacity 
                style={{ position: 'absolute', bottom: 15, right: 15, padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                onPress={() => setShowFemaleAnatomy(!showFemaleAnatomy)}
              >
                <Ionicons name="layers-outline" size={20} color="white" />
              </TouchableOpacity>
          </View>


          {!isResting ? (
            <View>
              <View style={[AppStyles.rowBetween, { marginBottom: 20 }]}>
                 <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={AppStyles.textGray}>Objetivo</Text>
                    <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>12 Reps</Text>
                 </View>
                 <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                 <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={AppStyles.textGray}>Carga</Text>
                    <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>80 Kg</Text>
                 </View>
              </View>

              <TouchableOpacity 
                style={AppStyles.glowBtnOrange} 
                onPress={handleNextSet}
              >
                <Text style={AppStyles.glowBtnOrangeText}>Completar Serie</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Ventana de Descanso</Text>
              <BreathingTimer />
              <TouchableOpacity 
                style={[AppStyles.glowBtnBlue, { marginTop: 20, width: '100%' }]} 
                onPress={() => {
                  setIsResting(false);
                  setCurrentSet(prev => prev + 1);
                }}
              >
                <Text style={AppStyles.glowBtnBlueText}>Siguiente Serie</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Bio-Feed Section */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Inteligencia de Sesión</Text>
      
      <View style={[AppStyles.glassCard, { padding: 15, marginBottom: 15, borderColor: AppColors.primaryBioGreen, borderLeftWidth: 4 }]}>
        <View style={[AppStyles.rowCentered, { gap: 10 }]}>
          <Ionicons name="shield-checkmark" size={24} color={AppColors.primaryBioGreen} />
          <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Estado Óptimo Detectado</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Tu HRV indica que puedes mantener esta intensidad.</Text>
          </View>
        </View>
      </View>

      <View style={[AppStyles.glassCard, { padding: 15, borderColor: AppColors.primaryOrange, borderLeftWidth: 4 }]}>
        <View style={[AppStyles.rowCentered, { gap: 10 }]}>
          <Ionicons name="alert-circle" size={24} color={AppColors.primaryOrange} />
          <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Ajuste de Técnica Sugerido</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Controla el descenso de la barra para maximizar el tiempo bajo tensión.</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
