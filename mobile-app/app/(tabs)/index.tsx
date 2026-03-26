import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AtlasOrganico from '@/components/AtlasOrganico';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Header (Image 1 & 3 Hybrid) */}
      <View style={{ marginBottom: 25, marginTop: 10 }}>
        <View style={[AppStyles.rowBetween, { alignItems: 'flex-start' }]}>
           <View>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 4 }]}>Welcome back, Jeremy!</Text>
              <View style={AppStyles.rowCentered}>
                <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold' }]}>Light Work buddy </Text>
                <Text style={{ fontSize: 22 }}>🏋️</Text>
              </View>
           </View>
           <TouchableOpacity onPress={() => router.push('/perfil-setup')}>
              <Ionicons name="grid" size={28} color="rgba(255,255,255,0.5)" />
           </TouchableOpacity>
        </View>
      </View>

      {/* Gamification Stats (Image 3 Style) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
         <View style={{ flex: 1, marginRight: 15 }}>
            <View style={AppStyles.rowBetween}>
               <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold' }]}>LVL 12</Text>
               <Text style={[AppStyles.textGray, { fontSize: 10 }]}>650/1000 XP</Text>
            </View>
            <View style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
              <View style={{ width: '65%', height: '100%', backgroundColor: AppColors.primaryNeonBlue }} />
            </View>
         </View>
         <View style={[AppStyles.rowCentered, { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 }]}>
            <Ionicons name="cash" size={16} color={AppColors.primaryBioGreen} style={{ marginRight: 6 }} />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>100</Text>
         </View>
      </View>

      {/* Pill Trackers (Image 1 Style) */}
      <View style={[AppStyles.rowBetween, { marginBottom: 30 }]}>
         {/* Calorie Pill */}
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 69, 0, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 69, 0, 0.3)' }}>
            <Ionicons name="flame" size={14} color="#FF4500" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FF4500', fontWeight: 'bold', fontSize: 11 }}>300 cal</Text>
         </View>
         {/* Steps Pill */}
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(19, 236, 91, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(19, 236, 91, 0.3)' }}>
            <Ionicons name="walk" size={14} color={AppColors.primaryBioGreen} style={{ marginRight: 6 }} />
            <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 11 }}>1,250 steps</Text>
         </View>
         {/* Water Pill */}
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 209, 255, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)' }}>
            <Ionicons name="water" size={14} color="#00d1ff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#00d1ff', fontWeight: 'bold', fontSize: 11 }}>4 glasses</Text>
         </View>
      </View>
 
      <AtlasOrganico />


      {/* Closed-Loop AI Prescription */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryOrange, borderWidth: 1 }]}>
         <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="hardware-chip" size={20} color={AppColors.primaryOrange} style={{ marginRight: 8 }} />
              <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Prescripción IA Dinámica</Text>
            </View>
            <Text style={{ color: AppColors.primaryOrange, fontSize: 12, fontWeight: 'bold' }}>HOY</Text>
         </View>
         <Text style={[AppStyles.textGray, { fontSize: 14, marginBottom: 15, lineHeight: 20 }]}>
            Tu HRV bajó a 65 y la carga del CNS está alta. Hemos ajustado tu sesión a <Text style={{ color: 'white', fontWeight: 'bold' }}>Movilidad y Fuerza Funcional (Zona 2)</Text> para optimizar tu longevidad.
         </Text>
         <TouchableOpacity 
          style={AppStyles.glowBtnOrange} 
          onPress={() => router.push('/entrenar')}
        >
          <Text style={AppStyles.glowBtnOrangeText}>Iniciar Sesión Adaptada</Text>
        </TouchableOpacity>
      </View>

      {/* Main Metabolic Command Center */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25 }]}>
        <View style={[AppStyles.rowBetween, { marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Centro Metabólico</Text>
          <Text style={{ color: AppColors.primaryBioGreen, fontWeight: '600' }}>Óptimo</Text>
        </View>

        {/* HRV & Recovery Visualizer */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: AppColors.primaryNeonBlue, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>65</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>HRV</Text>
            </View>
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 14, fontWeight: '600' }]}>Corazón</Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: AppColors.primaryBioGreen, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>92%</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>SCORE</Text>
            </View>
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 14, fontWeight: '600' }]}>Longevidad</Text>
          </View>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: AppColors.primaryOrange, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>1.4</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>GLIC</Text>
            </View>
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 14, fontWeight: '600' }]}>Glucosa</Text>
          </View>
        </View>
      </View>

      {/* Premium IA Banner */}
      <TouchableOpacity 
        style={[AppStyles.glassCard, { padding: 15, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderStyle: 'dashed' }]}
        onPress={() => router.push('/pagos')}
      >
        <View style={AppStyles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Análisis de Longevidad IA</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 2 }]}>Prénosticos basados en tus últimos 30 días.</Text>
          </View>
          <Ionicons name="sparkles" size={24} color={AppColors.primaryNeonBlue} />
        </View>
      </TouchableOpacity>

      {/* NotebookLM Biohacking Protocols: Glucose & Longevity */}
      <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold', marginBottom: 15 }]}>Protocolos de Longevidad</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
        {/* Glucose Protocol (Inchauspé) */}
        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15, borderColor: AppColors.primaryOrange, borderWidth: 1 }]}>
          <Ionicons name="restaurant" size={24} color={AppColors.primaryOrange} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 4 }]}>Pico de Glucosa</Text>
          <Text style={[AppStyles.textGray, { fontSize: 10, marginBottom: 8 }]}>Protocolo Inchauspé</Text>
          <View style={{ gap: 4 }}>
             <View style={AppStyles.rowCentered}>
               <Ionicons name="checkmark-circle" size={12} color={AppColors.primaryBioGreen} style={{ marginRight: 4 }} />
               <Text style={[AppStyles.textWhite, { fontSize: 10 }]}>Desayuno Salado</Text>
             </View>
             <View style={AppStyles.rowCentered}>
               <Ionicons name="checkmark-circle" size={12} color={AppColors.primaryBioGreen} style={{ marginRight: 4 }} />
               <Text style={[AppStyles.textWhite, { fontSize: 10 }]}>Vinagre prev. Comida</Text>
             </View>
          </View>
        </View>

        {/* Longevity Supplements (NMN / AKG) */}
        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
          <Ionicons name="flask" size={24} color={AppColors.primaryNeonBlue} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 4 }]}>Reparación Celular</Text>
          <Text style={[AppStyles.textGray, { fontSize: 10, marginBottom: 8 }]}>Suplementos Activos</Text>
          <View style={{ gap: 4 }}>
             <View style={AppStyles.rowBetween}>
               <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>NMN</Text>
               <Ionicons name="checkmark-circle" size={12} color={AppColors.primaryBioGreen} />
             </View>
             <View style={AppStyles.rowBetween}>
               <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>Ca-AKG</Text>
               <Ionicons name="time" size={12} color={AppColors.primaryOrange} />
             </View>
          </View>
        </View>

        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15 }]}>
          <Ionicons name="moon" size={24} color={AppColors.primaryNeonBlue} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Sueño Profundo</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>2h 15m</Text>
        </View>

        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15 }]}>
          <Ionicons name="water" size={24} color={AppColors.primaryBioGreen} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Hidratación</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>2.4L</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
