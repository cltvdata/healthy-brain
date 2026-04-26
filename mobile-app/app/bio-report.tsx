import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function BioReportScreen() {
  const { style: initialStyle } = useLocalSearchParams<{ style: string }>();
  const [style, setStyle] = useState(initialStyle || 'clinical');

  const isClinical = style === 'clinical';
  const theme = {
    bg: isClinical ? '#FFFFFF' : '#0A0A0A',
    text: isClinical ? '#1A1A1A' : '#FFFFFF',
    subText: isClinical ? '#666666' : '#888888',
    primary: isClinical ? '#2563EB' : AppColors.primaryBioGreen, // Clinical blue vs Bio Green
    card: isClinical ? '#F3F4F6' : 'rgba(255,255,255,0.05)',
    border: isClinical ? '#E5E7EB' : 'rgba(255,255,255,0.1)'
  };

  const renderQR = () => (
    <View style={{ alignItems: 'center', marginTop: 30 }}>
        <Svg height="120" width="120" viewBox="0 0 20 20">
            <G fill={theme.primary}>
                <Rect x="0" y="0" width="6" height="6" />
                <Rect x="14" y="0" width="6" height="6" />
                <Rect x="0" y="14" width="6" height="6" />
                <Rect x="14" y="14" width="6" height="6" />
                <Rect x="8" y="8" width="4" height="4" />
                <Rect x="2" y="8" width="2" height="2" />
                <Rect x="16" y="8" width="2" height="2" />
            </G>
        </Svg>
        <Text style={{ color: theme.subText, fontSize: 8, marginTop: 10, fontWeight: 'bold' }}>BLOCKCHAIN VERIFIED: HB-993-2X</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Dynamic Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontWeight: '900', letterSpacing: 2, fontSize: 14 }}>HEALTHY + BRAIN</Text>
            <Text style={{ color: theme.primary, fontSize: 10, fontWeight: 'bold' }}>SISTEMA DE SOBERANÍA MÉDICA</Text>
        </View>
        <TouchableOpacity 
            onPress={() => setStyle(isClinical ? 'cyber' : 'clinical')}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: theme.card }}
        >
            <Text style={{ color: theme.text, fontSize: 10, fontWeight: 'bold' }}>{isClinical ? 'CYBER' : 'CLÍNICO'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
          {/* Patient Details */}
          <View style={{ marginBottom: 40 }}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <View>
                    <Text style={{ color: theme.subText, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>Identificador Bio-ID</Text>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>U#8812-Génesis</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: theme.subText, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>Fecha de Emisión</Text>
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>05 Abr 2026</Text>
                </View>
             </View>
             <View style={{ height: 4, backgroundColor: theme.primary, width: '30%', borderRadius: 2 }} />
          </View>

          {/* Core Metric 1: Bio-Age */}
          <View style={{ backgroundColor: theme.card, padding: 25, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
             <Text style={{ color: theme.subText, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10 }}>Edad Biológica Estimada</Text>
             <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                <Text style={{ color: theme.text, fontSize: 44, fontWeight: '900' }}>24.2</Text>
                <Text style={{ color: theme.primary, fontSize: 16, fontWeight: 'bold' }}>(-3.8 AÑOS)</Text>
             </View>
             <Text style={{ color: theme.subText, fontSize: 11, marginTop: 10 }}>Optimización basada en 45 sesiones de enfoque y dieta pro-hipertrofia.</Text>
          </View>

          {/* Metric Grid */}
          <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
            <View style={{ flex: 1, backgroundColor: theme.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ color: theme.subText, fontSize: 9, fontWeight: 'bold' }}>HRV AVG</Text>
                <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>98ms</Text>
                <Text style={{ color: '#00ff00', fontSize: 9, fontWeight: 'bold' }}>EXCELENTE</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: theme.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ color: theme.subText, fontSize: 9, fontWeight: 'bold' }}>DEEP WORK</Text>
                <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>12h</Text>
                <Text style={{ color: theme.subText, fontSize: 9 }}>ESTA SEMANA</Text>
            </View>
          </View>

          {/* Blood/Nutrition Logic */}
          <View style={{ backgroundColor: theme.card, padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
             <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>BALANCE NUTRICIONAL CELULAR</Text>
             <View style={{ gap: 10 }}>
                {['Proteína', 'Micros', 'Hidratación'].map((label, i) => (
                    <View key={i}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: theme.subText, fontSize: 10 }}>{label}</Text>
                            <Text style={{ color: theme.text, fontSize: 10, fontWeight: 'bold' }}>{80 + (i*5)}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: isClinical ? '#E5E7EB' : 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${80 + (i*5)}%`, backgroundColor: theme.primary }} />
                        </View>
                    </View>
                ))}
             </View>
          </View>

          {/* Disclaimer / Validation */}
          <View style={{ marginTop: 40, alignItems: 'center' }}>
             <Text style={{ color: theme.subText, fontSize: 10, textAlign: 'center', lineHeight: 16 }}>
                 Este documento es propiedad del usuario y está validado mediante criptografía en Bio-Cloud.{"\n"}
                 No reemplaza un diagnóstico médico clínico tradicional.
             </Text>
             {renderQR()}
          </View>

          {/* CTA Export */}
          <TouchableOpacity style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center', shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10 }}>
             <Text style={{ color: isClinical ? 'white' : 'black', fontWeight: 'bold' }}>EXPORTAR COMO PDF OFICIAL</Text>
          </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
