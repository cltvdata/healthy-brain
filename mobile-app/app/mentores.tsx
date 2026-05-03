import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image, Animated } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Mentor {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
}

export default function MentoresScreen() {
  const { t } = useLanguage();
  const [selectedMentor, setSelectedMentor] = useState<string>('longevity');
  const [bioData, setBioData] = useState<any>(null);
  const [advice, setAdvice] = useState<string>('Analizando tu integridad biológica para darte el mejor consejo...');
  const [fadeAnim] = useState(new Animated.Value(1));

  const mentores: Mentor[] = [
    { 
        id: 'longevity', 
        name: 'Dr. Chronos', 
        role: t('mentors.longevity'), 
        icon: 'infinite-outline', 
        color: AppColors.primaryBioGreen,
        description: 'Especialista en extensión de vida saludable y optimización celular.' 
    },
    { 
        id: 'performance', 
        name: 'Ares 2.0', 
        role: t('mentors.performance'), 
        icon: 'flash-outline', 
        color: AppColors.primaryOrange,
        description: 'Maximiza tu potencia física y enfoque cognitivo en picos de alta demanda.' 
    },
    { 
        id: 'zen', 
        name: 'Luna', 
        role: t('mentors.zen'), 
        icon: 'moon-outline', 
        color: AppColors.primaryNeonBlue,
        description: 'Dominio del sistema parasimpático, sueño profundo y resiliencia emocional.' 
    },
  ];

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBioData(data);
        generateAdvice(selectedMentor, data);
      }
    });
    return () => unsubscribe();
  }, [selectedMentor]);

  const selectMentorWithAnimation = (id: string) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
    setSelectedMentor(id);
  };

  const generateAdvice = (mentorId: string, data: any) => {
    const hrv = data.hrv || 60;
    const score = data.bioScore || 80;
    const obj = data.objetivo || '';

    if (mentorId === 'longevity') {
      if (hrv < 55) {
        setAdvice("Tu variabilidad cardíaca sugiere inflamación sistémica leve. Reduce carbohidratos simples hoy y prioriza el descanso para proteger tus telómeros.");
      } else if (obj.includes('Longevidad')) {
        setAdvice("Estado de homeostasis detectado. Buen momento para un ayuno intermitente extendido (16h+) para potenciar la autofagia celular.");
      } else {
        setAdvice("Ritmo circadiano estable. Mantén la suplementación básica de Magnesio y Vitamina D para sostener esta curva de salud.");
      }
    } else if (mentorId === 'performance') {
      if (score > 85) {
        setAdvice(obj.includes('Muscular') ? 
          "Bio-Score de Élite. Ventana anabólica optimizada: Hoy es el día para tu entrenamiento de fuerza máxima con volumen alto." : 
          "Potencial cognitivo al 100%. Momento ideal para tareas de alta demanda neuronal o toma de decisiones críticas.");
      } else {
        setAdvice("Recuperación incompleta detectada. Tu sistema nervioso central (CNS) necesita una descarga. Opta por movilidad o sesión técnica ligera.");
      }
    } else {
      // Zen Mentor
      if (hrv < 50) {
        setAdvice("Alerta de Estrés: Tu sistema simpático está hiperactivo. Realiza 5 min de respiración 4-7-8 ahora mismo para recalibrar tu nervio vago.");
      } else if (data.sleepQuality < 70) {
        setAdvice("Arquitectura del sueño fragmentada detectada. Evita la luz azul desde las 20:00 y considera un baño de contraste térmico.");
      } else {
        setAdvice("Excelente resiliencia. Estás en un estado de 'Flow' biológico. Aprovecha esta claridad mental para la meditación profunda.");
      }
    }
  };

  const currentMentor = mentores.find(m => m.id === selectedMentor)!;

  return (
    <View style={AppStyles.body}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={[AppStyles.textWhite, { fontSize: 32, fontWeight: 'bold' }]}>{t('mentors.title')}</Text>
        <Text style={[AppStyles.textGray, { fontSize: 16 }]}>{t('mentors.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Mentor Selection Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
          {mentores.map((m) => (
            <TouchableOpacity 
              key={m.id}
              onPress={() => selectMentorWithAnimation(m.id)}
              style={[
                AppStyles.glassCard,
                selectedMentor === m.id && AppStyles.glassCardInteractive,
                { 
                  width: width / 3.6, 
                  height: 100, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderColor: selectedMentor === m.id ? m.color : AppColors.borderGlass,
                  backgroundColor: selectedMentor === m.id ? `${m.color}15` : AppColors.surfaceGlassLight
                }
              ]}
            >
              <Ionicons name={m.icon as any} size={32} color={selectedMentor === m.id ? m.color : AppColors.textGray} />
              <Text style={{ fontSize: 10, color: selectedMentor === m.id ? 'white' : AppColors.textGray, marginTop: 5, textAlign: 'center', fontWeight: 'bold' }}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Mentor Insight */}
        <Animated.View style={[
            AppStyles.glassCard, 
            { padding: 25, borderColor: currentMentor.color, borderLeftWidth: 4, opacity: fadeAnim }
        ]}>
          <View style={AppStyles.rowBetween}>
            <View>
              <Text style={{ color: currentMentor.color, fontWeight: 'bold', fontSize: 14 }}>{currentMentor.role}</Text>
              <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900', fontStyle: 'italic' }]}>{currentMentor.name}</Text>
            </View>
            <Ionicons name="sparkles" size={24} color={currentMentor.color} />
          </View>
          
          <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 10, fontStyle: 'italic' }]}>{currentMentor.description}</Text>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 20 }} />

          <Text style={[AppStyles.textWhite, { fontSize: 16, lineHeight: 26, fontWeight: '500' }]}>
            "{advice}"
          </Text>

          <TouchableOpacity 
            style={[
              AppStyles.rowCentered, 
              { 
                marginTop: 30, 
                backgroundColor: currentMentor.color, 
                padding: 15, 
                borderRadius: 15, 
                justifyContent: 'center',
                shadowColor: currentMentor.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 8
              }
            ]}
          >
            <Text style={{ color: 'black', fontWeight: '900', letterSpacing: 1 }}>{t('mentors.advice').toUpperCase()}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bio-Context Summary */}
        <View style={{ marginTop: 40 }}>
            <Text style={[AppStyles.textGray, { fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 }]}>BIO-CONTEXTO ACTUAL</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
                <View style={[AppStyles.glassCard, AppStyles.glassCardInteractive, { flex: 1, padding: 15, alignItems: 'center' }]}>
                    <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 1 }]}>HRV (REST)</Text>
                    <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900', color: AppColors.primaryNeonBlue }]}>{bioData?.hrv || '--'}</Text>
                </View>
                <View style={[AppStyles.glassCard, AppStyles.glassCardInteractive, { flex: 1, padding: 15, alignItems: 'center' }]}>
                    <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 1 }]}>SCORE</Text>
                    <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900', color: AppColors.primaryBioGreen }]}>{bioData?.bioScore || '--'}%</Text>
                </View>
            </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}
