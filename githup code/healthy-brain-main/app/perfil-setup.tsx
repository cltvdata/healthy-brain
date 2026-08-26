import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PerfilSetupScreen() {
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const genderOptions = ['Masculino', 'Femenino', 'Biológico'];
  const goalOptions = [
    { id: 'fat', label: 'Pérdida de Grasa', icon: 'flame' },
    { id: 'muscle', label: 'Ganancia Muscular', icon: 'barbell' },
    { id: 'hrv', label: 'Optimizar HRV', icon: 'heart' },
    { id: 'longevity', label: 'Longevidad IA', icon: 'infinite' }
  ];

  const calculateBMI = () => {
    const w = parseFloat(peso);
    const h = parseFloat(altura);
    if (isNaN(w) || isNaN(h)) return 0;
    return unitSystem === 'metric' ? (w / Math.pow(h / 100, 2)) : (703 * w / Math.pow(h, 2));
  };

  const bmi = calculateBMI();

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Biological Identity Header */}
      <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[AppStyles.rowCentered, { gap: 6 }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: AppColors.primaryBioGreen }} />
            <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold' }]}>DATA SECURE</Text>
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>Identidad Biológica</Text>
        </View>
      </View>

      {/* Global Configuration */}
      <View style={[AppStyles.glassCard, { padding: 15, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-around' }]}>
          <TouchableOpacity 
            style={{ alignItems: 'center', opacity: language === 'es' ? 1 : 0.4 }}
            onPress={() => setLanguage('es')}
          >
            <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>ESP</Text>
          </TouchableOpacity>
          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <TouchableOpacity 
            style={{ alignItems: 'center', opacity: language === 'en' ? 1 : 0.4 }}
            onPress={() => setLanguage('en')}
          >
            <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>ENG</Text>
          </TouchableOpacity>
          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <TouchableOpacity 
            style={{ alignItems: 'center', opacity: unitSystem === 'metric' ? 1 : 0.4 }}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>METRIC</Text>
          </TouchableOpacity>
          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <TouchableOpacity 
            style={{ alignItems: 'center', opacity: unitSystem === 'imperial' ? 1 : 0.4 }}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>IMPERIAL</Text>
          </TouchableOpacity>
      </View>

      {/* Biometric Scan Section */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 20 }]}>Biometrías de Base</Text>
          
          <View style={{ marginBottom: 20 }}>
             <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 10 }]}>Fenotipo</Text>
             <View style={{ flexDirection: 'row', gap: 10 }}>
                {genderOptions.map(option => (
                  <TouchableOpacity 
                    key={option}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 15,
                      backgroundColor: genero === option ? AppColors.primaryOrange : 'rgba(255,255,255,0.05)',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: genero === option ? AppColors.primaryOrange : 'transparent'
                    }}
                    onPress={() => setGenero(option)}
                  >
                    <Text style={{ color: genero === option ? 'black' : 'white', fontWeight: 'bold', fontSize: 12 }}>{option}</Text>
                  </TouchableOpacity>
                ))}
             </View>
          </View>

          <View style={{ gap: 15 }}>
            <View style={[AppStyles.rowBetween, { gap: 15 }]}>
               <View style={{ flex: 1 }}>
                  <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 5 }]}>Crono-Edad</Text>
                  <TextInput 
                    style={AppStyles.highContrastInput}
                    placeholder="25"
                    placeholderTextColor="#444"
                    keyboardType="number-pad"
                    value={edad}
                    onChangeText={setEdad}
                  />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 5 }]}>{unitSystem === 'metric' ? "Peso (Kg)" : "Peso (Lbs)"}</Text>
                  <TextInput 
                    style={AppStyles.highContrastInput}
                    placeholder="75.0"
                    placeholderTextColor="#444"
                    keyboardType="decimal-pad"
                    value={peso}
                    onChangeText={setPeso}
                    onEndEditing={() => {
                      if (peso && !peso.includes('.') && peso.length >= 3) {
                        setPeso((parseFloat(peso) / 10).toFixed(1));
                      } else if (peso) {
                        setPeso(parseFloat(peso).toFixed(1));
                      }
                    }}
                  />
               </View>
            </View>

            <View style={{ flex: 1 }}>
                <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 5 }]}>{unitSystem === 'metric' ? "Altura (Cm)" : "Altura (In)"}</Text>
                <TextInput 
                  style={AppStyles.highContrastInput}
                  placeholder="180"
                  placeholderTextColor="#444"
                  keyboardType="decimal-pad"
                  value={altura}
                  onChangeText={setAltura}
                  onEndEditing={() => {
                    if (altura && !altura.includes('.') && altura.length >= 3 && unitSystem === 'imperial') {
                      setAltura((parseFloat(altura) / 10).toFixed(1));
                    } else if (altura) {
                      setAltura(parseFloat(altura).toFixed(unitSystem === 'metric' ? 0 : 1));
                    }
                  }}
                />
            </View>
          </View>
      </View>

      {/* Reporte Antropométrico */}
      {bmi > 0 && (
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryBioGreen }]}>
           <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
              <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Reporte Antropométrico</Text>
              <Text style={{ color: AppColors.primaryBioGreen }}>{bmi.toFixed(1)} BMI</Text>
           </View>
           <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ 
                height: '100%', 
                backgroundColor: bmi < 18.5 ? '#ffcc00' : (bmi < 25 ? AppColors.primaryBioGreen : AppColors.primaryOrange),
                width: `${Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 0), 100)}%`
              }} />
           </View>
           <Text style={[AppStyles.textGray, { fontSize: 10, marginTop: 8, textAlign: 'center' }]}>
              {bmi < 18.5 ? "DÉFICIT CALÓRICO DETECTADO" : (bmi < 25 ? "FENOTIPO ÓPTIMO" : "ESTRÉS METABÓLICO DETECTADO")}
           </Text>
        </View>
      )}

      {/* Strategic Goal */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Objetivo Estratégico</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
        {goalOptions.map(goal => (
           <TouchableOpacity 
            key={goal.id}
            style={{
              width: (width - 50) / 2,
              padding: 15,
              borderRadius: 20,
              backgroundColor: objetivo === goal.label ? 'rgba(0, 209, 255, 0.1)' : AppColors.surfaceGlass,
              borderWidth: 1,
              borderColor: objetivo === goal.label ? AppColors.primaryNeonBlue : 'transparent'
            }}
            onPress={() => setObjetivo(goal.label)}
           >
             <Ionicons name={goal.icon as any} size={24} color={objetivo === goal.label ? AppColors.primaryNeonBlue : 'white'} style={{ marginBottom: 10 }} />
             <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold' }]}>{goal.label}</Text>
           </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={AppStyles.glowBtnOrange}
        onPress={() => router.push('/')}
      >
        <Text style={AppStyles.glowBtnOrangeText}>Sincronizar Identidad</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
