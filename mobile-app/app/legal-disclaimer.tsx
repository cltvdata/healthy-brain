import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const TRANSLATIONS = {
  es: {
    langName: "Español",
    title: "Soberanía Biológica y Responsabilidad Legal",
    subtitle: "TÉRMINOS DE SERVICIO, PRIVACIDAD Y DESCARGO MÉDICO",
    sec0Title: "⚠️ EXENCIÓN DE RESPONSABILIDAD - LEE ATENTAMENTE",
    sec0p1: "Healthy + Brain es una plataforma de bienestar y optimización personal. Todos los servicios, recomendaciones, análisis y contenido generado por IA son meramente informativos y educativos. NO CONSTITUYEN CONSEJO MÉDICO, DIAGNÓSTICO, TRATAMIENTO NI CURA PARA NINGUNA ENFERMEDAD.",
    sec0p2: "NO SOMOS RESPONSABLES por las acciones, decisiones o consecuencias que el usuario tome basándose en la información proporcionada por la app. El usuario es plenamente responsable de consultar a profesionales de la salud calificados antes de realizar cualquier cambio en su dieta, ejercicio, suplementación o estilo de vida.",
    
    sec1Title: "🤖 INTELIGENCIA ARTIFICIAL - NO ES CONSEJO MÉDICO",
    sec1p1: "Todas las recomendaciones, análisis y sugerencias generadas por nuestros sistemas de IA (incluyendo análisis nutricional, sugerencias de entrenamiento, consejos de sueño, análisis del Gemelo IA y predicciones de bienestar) son producto de algoritmos y NO constituyen asesoramiento médico profesional.",
    sec1p2: "La IA puede cometer errores, proporcionar información desactualizada o no aplicable a tu situación específica. Siempre verifica con profesionales de la salud antes de actuar.",
    sec1p3: "El análisis de screenshots, fotos de alimentos y datos manuales por IA es una estimación basada en patrones generales y NO debe usarse como guía nutricional precisa para condiciones médicas específicas.",
    
    sec2Title: "📷 CÁMARA Y ANÁLISIS DE IMÁGENES",
    sec2p1: "Al usar las funciones de cámara (escaneo nutricional, Gemelo IA, screenshots), autorizas a la app a procesar imágenes para análisis. Estas imágenes se almacenan de forma segura y se usan exclusivamente para los servicios solicitados.",
    sec2p2: "El análisis de imágenes de alimentos por IA es una estimación y puede no ser precisa. No uses estos datos como única fuente de información nutricional si tienes restricciones dietéticas médicas.",
    sec2p3: "El Gemelo IA es una herramienta de seguimiento visual y NO representa un diagnóstico médico ni evaluación física profesional.",
    
    sec3Title: "🏥 SALUD CONECTADA - APPLE HEALTH & GOOGLE HEALTH CONNECT",
    sec3p1: "Al conectar Apple Health o Google Health Connect, autorizas la sincronización de datos biométricos (pasos, frecuencia cardíaca, HRV, sueño, glucosa, peso, ejercicios). Estos datos se usan para calcular tu Bio-Score y personalización.",
    sec3p2: "No somos responsables de la exactitud, integridad o puntualidad de los datos recibidos de estos servicios externos. Los datos de terceros pueden contener errores o retrasos.",
    sec3p3: "La integración con dispositivos wearables (Apple Watch, Oura Ring, Garmin, Fitbit, Whoop, etc.) es proporcionada por los fabricantes respectivos. No garantizamos la compatibilidad continua ni la exactitud de datos de terceros.",
    
    sec4Title: "📊 ENTRADA MANUAL DE DATOS",
    sec4p1: "Si ingresas datos manualmente (CSV, texto, o upload de screenshots), garantizas que la información es correcta. No somos responsables de errores en los datos proporcionados por el usuario.",
    sec4p2: "El análisis IA de datos manuales es una interpretación algorítmica y puede no reflejar tu condición real. Siempre consulta con profesionales para decisiones importantes.",
    
    sec5Title: "⚖️ RESPONSABILIDAD Y RIESGOS",
    sec5p1: "Al usar Healthy + Brain, reconoces que:",
    sec5p2: "• Ningún contenido de la app sustituye el asesoramiento médico profesional",
    sec5p3: "• Las actividades físicas, cambios nutricionales y suplementación conllevan riesgos inherentes",
    sec5p4: "• Eres responsable de consultar a tu médico antes de iniciar cualquier protocolo",
    sec5p5: "• No nos haces responsables por lesiones, enfermedades o consecuencias derivadas del uso de la app",
    sec5p6: "• Los resultados varían entre usuarios y no garantizamos resultados específicos",
    
    sec6Title: "🔒 PRIVACIDAD Y DATOS PERSONALES",
    sec6p1: "Tus datos biométricos, fotos del Gemelo IA, historial de sincronizaciones y preferencias de privacidad son tuyos. Puedes eliminar tus datos en cualquier momento desde la configuración.",
    sec6p2: "Compartimos datos solo cuando tú lo decidas (escuadrón, comunidad, ranking). No vendemos ni compartimos tus datos con terceros con fines comerciales.",
    
    footer: "Al presionar 'ACEPTAR Y CONTINUAR', confirmo que he leído, entiendo y acepto incondicionalmente todos los términos acima, reconociendo que Healthy + Brain es una herramienta informativa y NO un servicio médico. Acepto que soy responsable exclusivo de mis decisiones de salud.",
    btn: "ACEPTAR Y CONTINUAR"
  },
  en: {
    langName: "English",
    title: "Biological Sovereignty & Legal Responsibility",
    subtitle: "TERMS OF SERVICE, PRIVACY & MEDICAL DISCLAIMER",
    sec0Title: "⚠️ LIABILITY WAIVER - READ CAREFULLY",
    sec0p1: "Healthy + Brain is a wellness and personal optimization platform. All services, recommendations, analysis, and AI-generated content are purely informational and educational. They DO NOT CONSTITUTE MEDICAL ADVICE, DIAGNOSIS, TREATMENT, OR CURE FOR ANY CONDITION.",
    sec0p2: "We are NOT RESPONSIBLE for any actions, decisions, or consequences the user takes based on information provided by the app. The user is fully responsible for consulting qualified health professionals before making any changes to diet, exercise, supplementation, or lifestyle.",
    
    sec1Title: "🤖 ARTIFICIAL INTELLIGENCE - NOT MEDICAL ADVICE",
    sec1p1: "All recommendations, analysis, and suggestions generated by our AI systems (including nutritional analysis, training suggestions, sleep advice, AI Twin analysis, and wellness predictions) are algorithm-based and DO NOT constitute professional medical advice.",
    sec1p2: "AI can make mistakes, provide outdated information, or be inapplicable to your specific situation. Always verify with health professionals before acting.",
    sec1p3: "AI analysis of food screenshots, photos, and manual data is an estimate based on general patterns and should NOT be used as precise nutritional guidance for specific medical conditions.",
    
    sec2Title: "📷 CAMERA AND IMAGE ANALYSIS",
    sec2p1: "By using camera functions (nutritional scanning, AI Twin, screenshots), you authorize the app to process images for analysis. These images are stored securely and used exclusively for requested services.",
    sh2p2: "AI food image analysis is an estimate and may not be accurate. Do not use this data as the sole source of nutritional information if you have medical dietary restrictions.",
    sec2p3: "The AI Twin is a visual tracking tool and does NOT represent a medical diagnosis or professional physical assessment.",
    
    sec3Title: "🏥 HEALTH CONNECTED - APPLE HEALTH & GOOGLE HEALTH CONNECT",
    sec3p1: "By connecting Apple Health or Google Health Connect, you authorize synchronization of biometric data (steps, heart rate, HRV, sleep, glucose, weight, workouts). This data is used to calculate your Bio-Score and personalization.",
    sec3p2: "We are not responsible for the accuracy, completeness, or timeliness of data received from these external services. Third-party data may contain errors or delays.",
    sec3p3: "Integration with wearable devices (Apple Watch, Oura Ring, Garmin, Fitbit, Whoop, etc.) is provided by respective manufacturers. We do not guarantee continued compatibility or data accuracy from third parties.",
    
    sec4Title: "📊 MANUAL DATA ENTRY",
    sec4p1: "If you enter data manually (CSV, text, or screenshot upload), you guarantee that the information is correct. We are not responsible for errors in data provided by the user.",
    sec4p2: "AI analysis of manual data is an algorithmic interpretation and may not reflect your actual condition. Always consult with professionals for important decisions.",
    
    sec5Title: "⚖️ RESPONSIBILITY AND RISKS",
    sec5p1: "By using Healthy + Brain, you acknowledge that:",
    sec5p2: "• No content in the app substitutes professional medical advice",
    sec5p3: "• Physical activities, nutritional changes, and supplementation carry inherent risks",
    sec5p4: "• You are responsible for consulting your doctor before starting any protocol",
    sec5p5: "• You hold us not liable for injuries, illnesses, or consequences arising from app use",
    sec5p6: "• Results vary between users and we do not guarantee specific results",
    
    sec6Title: "🔒 PRIVACY AND PERSONAL DATA",
    sec6p1: "Your biometric data, AI Twin photos, sync history, and privacy preferences are yours. You can delete your data anytime from settings.",
    sec6p2: "We share data only when you decide (squad, community, ranking). We do not sell or share your data with third parties for commercial purposes.",
    
    footer: "By pressing 'ACCEPT AND CONTINUE', I confirm that I have read, understood, and unconditionally accept all the above terms, recognizing that Healthy + Brain is an informative tool and NOT a medical service. I accept that I am solely responsible for my health decisions.",
    btn: "ACCEPT AND CONTINUE"
  }
};

type LangKey = keyof typeof TRANSLATIONS;

export default function LegalDisclaimerScreen() {
  const [lang, setLang] = useState<LangKey>('es');
  const [syncing, setSyncing] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleAccept = async () => {
    if (!auth.currentUser) {
      router.replace('/');
      return;
    }

    setSyncing(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        legalAccepted: true,
        legalAcceptedAt: new Date().toISOString(),
        legalVersion: '2.0',
        acceptedTerms: ['medicalDisclaimer', 'aiNotMedicalAdvice', 'cameraUsage', 'healthConnect', 'manualData', 'liability']
      });
      router.replace('/perfil-setup');
    } catch (error) {
      console.error("[LegalDisclaimer] Error saving acceptance:", error);
      router.replace('/perfil-setup');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={AppStyles.body}>
      <View style={{ paddingTop: 50, paddingBottom: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {(Object.keys(TRANSLATIONS) as LangKey[]).map((key) => (
            <TouchableOpacity 
              key={key} 
              onPress={() => setLang(key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: lang === key ? AppColors.primaryBioGreen : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: lang === key ? AppColors.primaryBioGreen : 'rgba(255,255,255,0.1)'
              }}
            >
              <Text style={{ 
                color: lang === key ? '#000' : '#fff', 
                fontWeight: 'bold', 
                fontSize: 12 
              }}>
                {TRANSLATIONS[key].langName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
        <View style={{ marginTop: 10, marginBottom: 30, alignItems: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 69, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="shield-checkmark" size={32} color={AppColors.primaryOrange} />
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold', textAlign: 'center' }]}>{t.title}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11, marginTop: 8, letterSpacing: 1, textAlign: 'center' }]}>{t.subtitle}</Text>
        </View>

        {/* Sección 0: Exención de Responsabilidad Principal */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, borderColor: '#ff4444', borderLeftWidth: 4 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 12 }]}>
            <Ionicons name="warning" size={22} color="#ff4444" style={{ marginRight: 8 }} />
            <Text style={{ color: '#ff4444', fontWeight: 'bold', fontSize: 15 }}>{t.sec0Title}</Text>
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 12, lineHeight: 19 }]}>
            {t.sec0p1}
          </Text>
          <Text style={[AppStyles.textWhite, { fontSize: 12, lineHeight: 19, marginTop: 12, fontWeight: 'bold' }]}>
            {t.sec0p2}
          </Text>
        </View>

        {/* Sección 1: IA */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 15 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="robot" size={20} color={AppColors.primaryNeonBlue} style={{ marginRight: 8 }} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{t.sec1Title}</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18 }]}>{t.sec1p1}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec1p2}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec1p3}</Text>
        </View>

        {/* Sección 2: Cámara */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 15 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="camera" size={20} color={AppColors.primaryOrange} style={{ marginRight: 8 }} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{t.sec2Title}</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18 }]}>{t.sec2p1}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec2p2}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec2p3}</Text>
        </View>

        {/* Sección 3: Health Connect */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 15 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="hardware-chip" size={20} color={AppColors.primaryBioGreen} style={{ marginRight: 8 }} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{t.sec3Title}</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18 }]}>{t.sec3p1}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec3p2}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec3p3}</Text>
        </View>

        {/* Sección 4: Datos Manual */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 15 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="document-text" size={20} color={AppColors.secondaryOrange} style={{ marginRight: 8 }} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{t.sec4Title}</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18 }]}>{t.sec4p1}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec4p2}</Text>
        </View>

        {/* Sección 5: Responsabilidad */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 15 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="alert-triangle" size={20} color="#ffcc00" style={{ marginRight: 8 }} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{t.sec5Title}</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginBottom: 8 }]}>{t.sec5p1}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11, lineHeight: 16 }]}>{t.sec5p2}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11, lineHeight: 16 }]}>{t.sec5p3}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11, lineHeight: 16 }]}>{t.sec5p4}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11, lineHeight: 16 }]}>{t.sec5p5}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 11, lineHeight: 16 }]}>{t.sec5p6}</Text>
        </View>

        {/* Sección 6: Privacidad */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="lock-closed" size={20} color={AppColors.primaryBioGreen} style={{ marginRight: 8 }} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{t.sec6Title}</Text>
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18 }]}>{t.sec6p1}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, lineHeight: 18, marginTop: 10 }]}>{t.sec6p2}</Text>
        </View>

        <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: 20, paddingHorizontal: 10, lineHeight: 16 }]}>
          {t.footer}
        </Text>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000', padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
        <TouchableOpacity 
          style={[AppStyles.glowBtnOrange, syncing && { opacity: 0.7 }]}
          onPress={handleAccept}
          disabled={syncing}
        >
          <Text style={AppStyles.glowBtnOrangeText}>
            {syncing ? 'Sincronizando...' : t.btn}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}