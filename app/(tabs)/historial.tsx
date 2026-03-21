import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HistorialScreen() {
  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={[AppStyles.rowBetween, { marginBottom: 24, marginTop: 10 }]}>
        <View>
           <Text style={[AppStyles.textGray, { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }]}>ANÁLISIS LONGITUDINAL</Text>
           <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: 'bold' }]}>Healthspan</Text>
        </View>
        <Ionicons name="infinite" size={40} color={AppColors.primaryBioGreen} />
      </View>

      {/* Biological vs Chronological Age */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25 }]}>
        <View style={AppStyles.rowBetween}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Edad Biológica</Text>
          <View style={{ backgroundColor: 'rgba(19, 236, 91, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ color: AppColors.primaryBioGreen, fontSize: 12, fontWeight: 'bold' }}>-4.2 Años</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 15, gap: 20 }}>
           <View>
              <Text style={[AppStyles.textWhite, { fontSize: 36, fontWeight: 'bold', color: AppColors.primaryBioGreen }]}>27</Text>
              <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Biológica</Text>
           </View>
           <View style={{ paddingBottom: 5 }}>
              <Text style={[AppStyles.textGray, { fontSize: 20, fontWeight: '600', textDecorationLine: 'line-through' }]}>31</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Cronológica</Text>
           </View>
        </View>
        <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 15, lineHeight: 18 }]}>Basado en tu HRV, VO2 Max, y perfiles de glucosa de los últimos 6 meses. La curva de envejecimiento se ha ralentizado un 18%.</Text>
      </View>

      {/* Metabolic Flexibility */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryOrange, borderLeftWidth: 4 }]}>
         <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="flame" size={20} color={AppColors.primaryOrange} style={{ marginRight: 8 }} />
              <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Flexibilidad Metabólica</Text>
            </View>
            <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>Alto</Text>
         </View>
         
         <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10 }}>
            <View style={{ width: '85%', height: '100%', backgroundColor: AppColors.primaryOrange }} />
         </View>
         <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Tu cuerpo puede alternar eficientemente entre quemar glucosa y oxidar grasas. Entrenamientos en Ayunas: Óptimo.</Text>
      </View>

      {/* Active Aging Score (Dr. Jaramillo concepts) */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Marcadores Funcionales</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15 }]}>
          <Ionicons name="body" size={24} color={AppColors.primaryNeonBlue} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Masa Magra</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>+1.2 kg</Text>
          <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, marginTop: 5 }}>↑ Retención</Text>
        </View>

        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15 }]}>
          <Ionicons name="pulse" size={24} color={AppColors.primaryOrange} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textGray, { fontSize: 12 }]}>VO2 Max</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>52.4</Text>
          <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, marginTop: 5 }}>↑ Élite (Edad)</Text>
        </View>

        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15 }]}>
          <Ionicons name="water" size={24} color="white" style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Inflamación</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Baja</Text>
          <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, marginTop: 5 }}>↓ Estable</Text>
        </View>

        <View style={[AppStyles.glassCard, { width: (width - 55) / 2, padding: 15 }]}>
          <Ionicons name="battery-charging" size={24} color={AppColors.primaryBioGreen} style={{ marginBottom: 10 }} />
          <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Mitocondria</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Denso</Text>
          <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, marginTop: 5 }}>↑ Eficiencia</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
