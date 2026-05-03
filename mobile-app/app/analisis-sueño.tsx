import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NativeHealthService, BioMetrics } from '@/services/NativeHealthService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AnalisisSueño() {
  const [metrics, setMetrics] = useState<BioMetrics | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await NativeHealthService.fetchLatestMetrics();
    setMetrics(data);
  };

  if (!metrics) return null;

  const totalMin = metrics.sleepHours * 60;
  
  return (
    <View style={[AppStyles.container, { paddingTop: 60 }]}>
      <View style={[AppStyles.rowBetween, { paddingHorizontal: 20, marginBottom: 30 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: '900' }]}>NEURO-REGENERACIÓN</Text>
        <TouchableOpacity onPress={loadData}>
          <Ionicons name="refresh" size={24} color={AppColors.primaryNeonBlue} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Main Sleep Score Card */}
        <View style={[AppStyles.glassCard, { padding: 25, alignItems: 'center', marginBottom: 30 }]}>
          <Text style={[AppStyles.textGray, { fontSize: 14, fontWeight: 'bold', marginBottom: 10 }]}>CALIDAD DEL DESCANSO</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 56, fontWeight: '900' }]}>{Math.round((metrics.sleepStages.deepMinutes / (totalMin * 0.2)) * 100)}%</Text>
          <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold' }}>EFICIENCIA REGENERATIVA</Text>
        </View>

        {/* Architecture Breakdown */}
        <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 20 }]}>Arquitectura del Sueño</Text>
        
        <View style={{ gap: 20, marginBottom: 40 }}>
          {/* Deep Sleep */}
          <View style={[AppStyles.glassCard, { padding: 15 }]}>
            <View style={AppStyles.rowBetween}>
              <View style={AppStyles.rowCentered}>
                 <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: AppColors.primaryNeonBlue, marginRight: 10 }} />
                 <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>SUEÑO PROFUNDO (REPARACIÓN)</Text>
              </View>
              <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{metrics.sleepStages.deepMinutes} min</Text>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginTop: 12 }}>
               <View style={{ width: `${(metrics.sleepStages.deepMinutes / totalMin) * 100}%`, height: '100%', backgroundColor: AppColors.primaryNeonBlue }} />
            </View>
            <Text style={[AppStyles.textGray, { fontSize: 11, marginTop: 10 }]}>Vital para la limpieza de detritos metabólicos cerebrales.</Text>
          </View>

          {/* REM Sleep */}
          <View style={[AppStyles.glassCard, { padding: 15 }]}>
            <View style={AppStyles.rowBetween}>
              <View style={AppStyles.rowCentered}>
                 <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: AppColors.primaryBioGreen, marginRight: 10 }} />
                 <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>REM (CONSOLIDACIÓN)</Text>
              </View>
              <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{metrics.sleepStages.remMinutes} min</Text>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginTop: 12 }}>
               <View style={{ width: `${(metrics.sleepStages.remMinutes / totalMin) * 100}%`, height: '100%', backgroundColor: AppColors.primaryBioGreen }} />
            </View>
            <Text style={[AppStyles.textGray, { fontSize: 11, marginTop: 10 }]}>Esencial para la salud cognitiva y regulación emocional.</Text>
          </View>
        </View>

        {/* Neuro-Insights */}
        <View style={[AppStyles.glassCard, { padding: 20, borderColor: AppColors.primaryOrange, borderWidth: 1 }]}>
          <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold', marginBottom: 15 }}>INSIGHT DE LONGEVIDAD</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 14, lineHeight: 22 }]}>
            Tu sueño profundo alcanzó el 22% del total. Esto significa que tu sistema glinfático ha completado un ciclo de limpieza óptimo. Tu cerebro está en un estado de "Tabula Rasa" biológica hoy.
          </Text>
          
          <TouchableOpacity 
            style={[AppStyles.glowBtnOrange, { marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={AppStyles.glowBtnOrangeText}>Continuar Soberanía</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
