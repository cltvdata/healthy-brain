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
    title: "Soberanía y Responsabilidad Biológica",
    subtitle: "TÉRMINOS DE SERVICIO Y DESCARGO MÉDICO",
    sec1Title: "IMPORTANTE: NO ES CONSEJO MÉDICO",
    sec1p1: "El contenido de Healthy + Brain, incluyendo protocolos de biohacking, guías de suplementación, análisis de glucosa y rutinas de entrenamiento, se proporciona únicamente con fines informativos y educativos.",
    sec1p2: "ESTA APP NO SUSTITUYE EL ASESORAMIENTO MÉDICO PROFESIONAL.",
    sec1p3: "No diagnostica, trata ni cura ninguna enfermedad. Nunca ignores el consejo de tu médico por algo leído en esta plataforma.",
    sec2Title: "1. Uso bajo Propio Riesgo",
    sec2p1: "Al utilizar los protocolos de alto rendimiento de Healthy + Brain, usted reconoce y acepta que las actividades físicas y los cambios en la nutrición conllevan riesgos inherentes de lesiones, enfermedades o complicaciones. Usted asume voluntariamente toda la responsabilidad por los riesgos derivados de su uso.",
    sec3Title: "2. Privacidad y Bio-Datos",
    sec3p1: "Nos comprometemos a proteger su identidad biológica. Healthy + Brain se integra con Apple HealthKit y Google Health Connect para sincronizar sus pasos, biometrías y datos de sueño en segundo plano de forma silenciosa. Usted conserva el control absoluto (Soberanía) sobre qué información permanece privada y qué decide compartir manualmente con su Escuadrón o la Comunidad a través de sus ajustes de privacidad.",
    sec4Title: "3. Neuro-Tokens (NTK)",
    sec4p1: "Los NTK son activos digitales destinados a ser utilizados exclusivamente dentro del ecosistema de Healthy + Brain. Los depósitos vía Bitcoin o Zelle están sujetos a validación manual y no son reembolsables una vez acreditados los tokens.",
    footer: "Al presionar 'ACEPTAR Y CONTINUAR', confirmas que has leído y aceptas incondicionalmente estos términos, incluyendo el descargo médico.",
    btn: "ACEPTAR Y CONTINUAR"
  },
  en: {
    langName: "English",
    title: "Biological Sovereignty & Responsibility",
    subtitle: "TERMS OF SERVICE AND MEDICAL DISCLAIMER",
    sec1Title: "IMPORTANT: NOT MEDICAL ADVICE",
    sec1p1: "The content of Healthy + Brain, including biohacking protocols, supplementation guides, glucose analysis, and training routines, is provided solely for informational and educational purposes.",
    sec1p2: "THIS APP SUBTITUTES NO PROFESSIONAL MEDICAL ADVICE.",
    sec1p3: "It does not diagnose, treat, or cure any disease. Never ignore your doctor's advice because of something read on this platform.",
    sec2Title: "1. Use at Your Own Risk",
    sec2p1: "By using the high-performance protocols of Healthy + Brain, you acknowledge and agree that physical activities and nutrition changes carry inherent risks of injury, illness, or complications. You voluntarily assume all responsibility for the risks arising from its use.",
    sec3Title: "2. Privacy and Bio-Data",
    sec3p1: "We are committed to protecting your biological identity. Healthy + Brain integrates with Apple HealthKit and Google Health Connect to silently sync your steps, biometrics, and sleep data in the background. You maintain absolute control (Sovereignty) over what information remains private and what you manually choose to share with your Squad or the Community via your privacy settings.",
    sec4Title: "3. Neuro-Tokens (NTK)",
    sec4p1: "NTK are digital assets intended to be used exclusively within the Healthy + Brain ecosystem. Deposits via Bitcoin or Zelle are subject to manual validation and are non-refundable once the tokens are credited.",
    footer: "By pressing 'ACCEPT AND CONTINUE', you confirm that you have read and unconditionally accept these terms, including the medical disclaimer.",
    btn: "ACCEPT AND CONTINUE"
  },
  fr: {
    langName: "Français",
    title: "Souveraineté et Responsabilité Biologique",
    subtitle: "CONDITIONS DE SERVICE ET AVERTISSEMENT MÉDICAL",
    sec1Title: "IMPORTANT: PAS UN AVIS MÉDICAL",
    sec1p1: "Le contenu de Healthy + Brain, y compris les protocoles de biohacking, les guides de supplémentation et les routines d'entraînement, est fourni uniquement à des fins d'information et d'éducation.",
    sec1p2: "CETTE APPLICATION NE REMPLACE PAS L'AVIS MÉDICAL PROFESSIONNEL.",
    sec1p3: "Elle ne diagnostique, ne traite ni ne guérit aucune maladie. N'ignorez jamais l'avis de votre médecin suite à une lecture sur cette plateforme.",
    sec2Title: "1. Utilisation à Vos Propres Risques",
    sec2p1: "En utilisant les protocoles, vous reconnaissez que les activités physiques et les changements de nutrition comportent des risques inhérents. Vous assumez volontairement toute responsabilité pour les risques liés à son utilisation.",
    sec3Title: "2. Confidentialité et Bio-Données",
    sec3p1: "Nous protégeons votre identité biologique. Vos données sont cryptées, et vous avez le contrôle total (Souveraineté) sur ce que vous partagez avec la communauté.",
    sec4Title: "3. Neuro-Tokens (NTK)",
    sec4p1: "Les NTK sont des actifs numériques à utiliser dans l'écosystème. Les dépôts en Bitcoin ou Zelle sont validés manuellement et ne sont pas remboursables.",
    footer: "En appuyant sur 'ACCEPTER ET CONTINUER', vous confirmez avoir lu et accepté ces termes inconditionnellement.",
    btn: "ACCEPTER ET CONTINUER"
  },
  pt: {
    langName: "Português",
    title: "Soberania e Responsabilidade Biológica",
    subtitle: "TERMOS DE SERVIÇO E AVISO MÉDICO",
    sec1Title: "IMPORTANTE: NÃO É ACONSELHAMENTO MÉDICO",
    sec1p1: "O conteúdo do Healthy + Brain é fornecido apenas para fins informativos e educacionais.",
    sec1p2: "ESTE APLICATIVO NÃO SUBSTITUI O ACONSELHAMENTO MÉDICO PROFISSIONAL.",
    sec1p3: "Não diagnostica, trata ou cura nenhuma doença. Nunca ignore o conselho do seu médico por algo lido nesta plataforma.",
    sec2Title: "1. Uso por Sua Conta e Risco",
    sec2p1: "Ao usar os protocolos de alto desempenho, você reconhece que atividades físicas e mudanças nutricionais apresentam riscos. Você assume voluntariamente toda a responsabilidade.",
    sec3Title: "2. Privacidade e Bio-Dados",
    sec3p1: "Protegemos sua identidade biológica. Seus dados são criptografados e você tem controle total para decidir o que compartilhar.",
    sec4Title: "3. Neuro-Tokens (NTK)",
    sec4p1: "Os depósitos via Bitcoin ou Zelle estão sujeitos a validação manual e não são reembolsáveis após o crédito.",
    footer: "Ao pressionar 'ACEITAR E CONTINUAR', você confirma que leu e aceita incondicionalmente estes termos.",
    btn: "ACEITAR E CONTINUAR"
  },
  ru: {
    langName: "Русский",
    title: "Биологический суверенитет и ответственность",
    subtitle: "УСЛОВИЯ ОБСЛУЖИВАНИЯ И МЕДИЦИНСКИЙ ОТКАЗ",
    sec1Title: "ВАЖНО: НЕ МЕДИЦИНСКИЙ СОВЕТ",
    sec1p1: "Содержимое предназначено исключительно для информационных и образовательных целей.",
    sec1p2: "ЭТО ПРИЛОЖЕНИЕ НЕ ЗАМЕНЯЕТ ПРОФЕССИОНАЛЬНОЕ МЕДИЦИНСКОЕ ОБСЛУЖИВАНИЕ.",
    sec1p3: "Не игнорируйте советы врача.",
    sec2Title: "1. Использование на свой страх и риск",
    sec2p1: "Физические нагрузки несут риски. Вы добровольно берете на себя всю ответственность.",
    sec3Title: "2. Конфиденциальность",
    sec3p1: "Ваши данные зашифрованы, и вы полностью контролируете то, чем делитесь.",
    sec4Title: "3. Нейро-Токены (NTK)",
    sec4p1: "Депозиты через Bitcoin не подлежат возврату.",
    footer: "Нажимая ПРИНЯТЬ И ПРОДОЛЖИТЬ, вы соглашаетесь с этими условиями.",
    btn: "ПРИНЯТЬ И ПРОДОЛЖИТЬ"
  },
  ko: {
    langName: "한국어",
    title: "생물학적 주권 및 책임",
    subtitle: "서비스 약관 및 의료 면책 조항",
    sec1Title: "주의: 의학적 조언이 아님",
    sec1p1: "Healthy + Brain의 모든 콘텐츠는 정보 제공 및 교육 목적으로 만 제공됩니다.",
    sec1p2: "이 앱은 전문적인 의학적 조언을 대체하지 않습니다.",
    sec1p3: "질병을 진단, 치료 또는 치료하지 않습니다. 의사의 조언을 무시하지 마십시오.",
    sec2Title: "1. 본인 책임하에 사용",
    sec2p1: "신체 활동 및 영양 섭취의 변화는 부상의 위험이 있습니다. 사용자는 모든 책임을 집니다.",
    sec3Title: "2. 개인정보 및 생체 데이터",
    sec3p1: "생체 데이터는 암호화되며 사용자가 제어합니다.",
    sec4Title: "3. 뉴로-토큰 (NTK)",
    sec4p1: "비트코인 입금은 수동 확인되며 환불되지 않습니다.",
    footer: "'동의 및 계속'을 누르면 모든 약관에 동의하는 것으로 간주됩니다.",
    btn: "동의 및 계속"
  },
  ar: {
    langName: "العربية",
    title: "السيادة البيولوجية والمسؤولية",
    subtitle: "شروط الخدمة وإخلاء المسؤولية الطبية",
    sec1Title: "هام: ليس نصيحة طبية",
    sec1p1: "محتوى التطبيق مقدم للأغراض الإعلامية والتعليمية فقط.",
    sec1p2: "هذا التطبيق لا يغني عن الاستشارة الطبية المهنية.",
    sec1p3: "لا تتجاهل نصيحة طبيبك بسبب شيء قرأته هنا.",
    sec2Title: "1. الاستخدام على مسؤوليتك الخاصة",
    sec2p1: "أنت تتحمل طوعًا جميع المسؤوليات المتعلقة بالأنشطة البدنية.",
    sec3Title: "2. الخصوصية والبيانات الحيوية",
    sec3p1: "بياناتك مشفرة ولديك السيطرة الكاملة على ما تشاركه.",
    sec4Title: "3. الرموز العصبية (NTK)",
    sec4p1: "الإيداعات عن طريق البيتكوين غير قابلة للاسترداد.",
    footer: "بالضغط على موافق، أنت توافق على هذه الشروط.",
    btn: "موافق والمتابعة"
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
        legalAcceptedAt: new Date().toISOString()
      });
      // Use replace to ensure they can't go back
      router.replace('/perfil-setup');
    } catch (error) {
      console.error("[LegalDisclaimer] Error saving acceptance:", error);
      // Even if it fails, try to move forward so they aren't stuck, 
      // though the loop might catch them again if Firestore didn't update.
      router.replace('/perfil-setup');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={AppStyles.body}>
      {/* Selector de Idiomas Fijo Arriba */}
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
        {/* Header Jurídico */}
        <View style={{ marginTop: 10, marginBottom: 30, alignItems: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 69, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="shield-checkmark" size={32} color={AppColors.primaryOrange} />
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold', textAlign: 'center' }]}>{t.title}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 8, letterSpacing: 1, textAlign: 'center' }]}>{t.subtitle}</Text>
        </View>

        {/* Sección 1: Descargo Médico (CRÍTICO) */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, borderColor: AppColors.primaryOrange, borderLeftWidth: 4 }]}>
          <View style={[AppStyles.rowCentered, { marginBottom: 10 }]}>
            <Ionicons name="alert-circle" size={20} color={AppColors.primaryOrange} style={{ marginRight: 8 }} />
            <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>{t.sec1Title}</Text>
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 13, lineHeight: 20 }]}>
            {t.sec1p1}
            {"\n\n"}
            <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>{t.sec1p2}</Text> {t.sec1p3}
          </Text>
        </View>

        {/* Sección 2: Uso bajo Propio Riesgo */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>{t.sec2Title}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 18 }]}>
            {t.sec2p1}
          </Text>
        </View>

        {/* Sección 3: Bio-Datos y Soberanía */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>{t.sec3Title}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 18 }]}>
            {t.sec3p1}
          </Text>
        </View>

        {/* Sección 4: Neuro-Economía */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>{t.sec4Title}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 13, lineHeight: 18 }]}>
            {t.sec4p1}
          </Text>
        </View>

        {/* Sección Final de Acuerdo */}
        <Text style={[AppStyles.textGray, { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: 20, paddingHorizontal: 10 }]}>
          {t.footer}
        </Text>
      </ScrollView>

      {/* Botón de Aceptación Fijo Abajo */}
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
