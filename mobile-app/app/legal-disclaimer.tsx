import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LegalDisclaimerScreen() {
  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
        {/* Header Jurídico */}
        <View style={{ marginTop: 40, marginBottom: 30, alignItems: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 69, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="shield-checkmark" size={32} color={AppColors.primaryOrange} />
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold', textAlign: 'center' }]}>Soberanía y Responsabilidad Biológica</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 8, letterSpacing: 1 }]}>TÉRMINOS DE SERVICIO Y DESCARGO MÉDICO</Text>
        </View>

        {/* Sección 1: Descargo Médico (CRÍTICO) */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, borderColor: AppColors.primaryOrange, borderLeftWidth: 4 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="alert-circle" size={20} color={AppColors.primaryOrange} style={{ marginRight: 8 }} />
            <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>IMPORTANTE: NO ES CONSEJO MÉDICO</Text>
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 13, lineHeight: 20 }]}>
            El contenido de <Text style={{ fontWeight: 'bold' }}>Healthy + Brain</Text>, incluyendo protocolos de biohacking, guías de suplementación, análisis de glucosa y rutinas de entrenamiento, se proporciona únicamente con fines informativos y educativos.
            {"\n\n"}
            <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>ESTA APP NO SUSTITUYE EL ASESORAMIENTO MÉDICO PROFESIONAL.</Text> No diagnostica, trata ni cura ninguna enfermedad. Nunca ignores el consejo de tu médico por algo leído en esta plataforma.
          </Text>
        </View>

        {/* Sección 2: Uso bajo Propio Riesgo */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>1. Uso bajo Propio Riesgo</Text>
          <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 18 }]}>
            Al utilizar los protocolos de alto rendimiento de Healthy + Brain, usted reconoce y acepta que las actividades físicas y los cambios en la nutrición conllevan riesgos inherentes de lesiones, enfermedades o complicaciones. Usted asume voluntariamente toda la responsabilidad por los riesgos derivados de su uso.
          </Text>
        </View>

        {/* Sección 3: Bio-Datos y Soberanía */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>2. Privacidad y Bio-Datos</Text>
          <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 18 }]}>
            Nos comprometemos a proteger su identidad biológica. Sus datos sensibles están encriptados y usted tiene el control total (Soberanía) para decidir qué información desea compartir con la comunidad a través de los interruptores de privacidad en su perfil.
          </Text>
        </View>

        {/* Sección 4: Neuro-Economía */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>3. Neuro-Tokens (NTK)</Text>
          <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 18 }]}>
            Los NTK son activos digitales destinados a ser utilizados exclusivamente dentro del ecosistema de Healthy + Brain. Los depósitos vía Bitcoin o Zelle están sujetos a validación manual y no son reembolsables una vez acreditados los tokens.
          </Text>
        </View>

        {/* Sección Final de Acuerdo */}
        <Text style={[AppStyles.textGray, { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }]}>
          Al presionar "ACEPTAR Y CONTINUAR", confirmas que has leído y aceptas incondicionalmente estos términos, incluyendo el descargo médico.
        </Text>
      </ScrollView>

      {/* Botón de Aceptación Fijo Abajo */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000', padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
        <TouchableOpacity 
          style={AppStyles.glowBtnOrange}
          onPress={() => router.push('/perfil-setup')}
        >
          <Text style={AppStyles.glowBtnOrangeText}>ACEPTAR Y CONTINUAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
