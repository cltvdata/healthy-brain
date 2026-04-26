import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotebookInsightsScreen() {
  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>Segundo Cerebro</Text>
          <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 1 }]}>POWERED BY NOTEBOOKLM</Text>
        </View>
      </View>

      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
        <View style={AppStyles.rowCentered}>
          <Ionicons name="library" size={24} color={AppColors.primaryNeonBlue} style={{ marginRight: 15 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Insights Curados</Text>
            <Text style={{ color: AppColors.textGray, fontSize: 12, marginTop: 4 }}>
              Conocimiento destilado de los mejores protocolos de longevidad para tu Bio-Perfil.
            </Text>
          </View>
        </View>
      </View>

      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>
        Protocolos Destacados
      </Text>

      {/* Insight 1 */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="restaurant" size={20} color={AppColors.primaryOrange} />
          <Text style={styles.insightTitle}>Glucosa y Metabolismo</Text>
        </View>
        <Text style={styles.insightBody}>
          El protocolo de Inchauspé recomienda consumir los alimentos en el siguiente orden para achatar la curva de glucosa en un 73%: primero fibra (vegetales), luego proteínas y grasas, y al final los carbohidratos. Adicionalmente, una caminata de 10 minutos (1000 pasos) post-comida activa los transportadores GLUT4 disminuyendo drásticamente la resistencia a la insulina.
        </Text>
        <View style={styles.insightFooter}>
          <Text style={styles.insightRef}>Fuente: V1 - Jessie Inchauspé (NotebookLM)</Text>
        </View>
      </View>

      {/* Insight 2 */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="sunny" size={20} color={AppColors.primaryBioGreen} />
          <Text style={styles.insightTitle}>Dopamina y Ritmo Circadiano</Text>
        </View>
        <Text style={styles.insightBody}>
          Ver la luz del sol directamente entre 10 y 30 minutos al despertar (antes de las 9:00 AM) configura el reloj biológico central. Esto causa un pulso saludable de cortisol matutino que optimiza la asimilación de dopamina a lo largo del día y programa la liberación de melatonina 14 horas después.
        </Text>
        <View style={styles.insightFooter}>
          <Text style={styles.insightRef}>Fuente: V2 - Huberman Lab (NotebookLM)</Text>
        </View>
      </View>

      {/* Insight 3 */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="fitness" size={20} color={AppColors.primaryNeonBlue} />
          <Text style={styles.insightTitle}>Entrenamiento Zona 2 y HRV</Text>
        </View>
        <Text style={styles.insightBody}>
          Destinar 150 a 180 minutos a la semana de entrenamiento cardiovascular en Zona 2 (60-70% del FCM) incrementa la densidad mitocondrial. Este protocolo es directamente responsable de un aumento del HRV en reposo y una mayor flexibilidad metabólica.
        </Text>
        <View style={styles.insightFooter}>
          <Text style={styles.insightRef}>Fuente: V3 - Attia Longevity (NotebookLM)</Text>
        </View>
      </View>

      <TouchableOpacity style={[AppStyles.glowBtnOrange, { marginTop: 10, alignSelf: 'center', paddingHorizontal: 30 }]}>
        <Ionicons name="sync" size={16} color="black" style={{ marginRight: 8 }} />
        <Text style={AppStyles.glowBtnOrangeText}>Sincronizar Nuevos Protocolos</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  insightCard: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10
  },
  insightTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10
  },
  insightBody: {
    color: AppColors.textGray,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 15
  },
  insightFooter: {
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  insightRef: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: 'bold'
  }
});
