import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BioEconomy, genReferralCode } from '@/constants/BioEconomy';
import { db, auth } from '@/constants/FirebaseConfig';
import { useLanguage } from '@/context/LanguageContext';
import { doc, updateDoc, getDoc, query, collection, where, getDocs, setDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function PerfilSetupScreen() {
  const [userName, setUserName] = useState('');
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  
  const [parsingTwin, setParsingTwin] = useState(false);
  const [twinGenerated, setTwinGenerated] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { locale, setLocale, t } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  
  const [referralInput, setReferralInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareStats, setShareStats] = useState(false);
  const [communityPrivacy, setCommunityPrivacy] = useState(true);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Attempt to load existing data if available
    const loadData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userName) setUserName(data.userName);
          if (data.genero) setGenero(data.genero);
          if (data.edad) setEdad(data.edad);
          if (data.peso) setPeso(data.peso);
          if (data.altura) setAltura(data.altura);
          if (data.objetivo) setObjetivo(data.objetivo);
          if (data.photoPrivacy) setIsPublic(data.photoPrivacy === 'public');
          if (data.statsPrivacy) setShareStats(data.statsPrivacy === 'public');
          if (data.communityPrivacy !== undefined) setCommunityPrivacy(data.communityPrivacy);
        }
      }
    };
    loadData();
  }, []);

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
          <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>{t('profile.title')}</Text>
        </View>
      </View>

      {/* Global Configuration */}
      <View style={[AppStyles.glassCard, { padding: 15, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-around' }]}>
          <TouchableOpacity 
            style={{ alignItems: 'center', opacity: locale === 'es' ? 1 : 0.4 }}
            onPress={() => setLocale('es')}
          >
            <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>ESP</Text>
          </TouchableOpacity>
          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <TouchableOpacity 
            style={{ alignItems: 'center', opacity: locale === 'en' ? 1 : 0.4 }}
            onPress={() => setLocale('en')}
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
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 20 }]}>Biometrias de Base</Text>
          
          <View style={{ marginBottom: 20 }}>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 10 }]}>{t('profile.name')}</Text>
              <TextInput 
                style={AppStyles.highContrastInput}
                placeholder="EJ: JEREMY"
                placeholderTextColor="#444"
                value={userName}
                onChangeText={setUserName}
              />
          </View>

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
                  />
               </View>
            </View>

            <View>
                <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 5 }]}>{unitSystem === 'metric' ? "Altura (Cm)" : "Altura (In)"}</Text>
                <TextInput 
                  style={AppStyles.highContrastInput}
                  placeholder="180"
                  placeholderTextColor="#444"
                  keyboardType="decimal-pad"
                  value={altura}
                  onChangeText={setAltura}
                />
            </View>
          </View>
      </View>

      {/* Reporte Antropométrico */}
      {bmi > 0 && (
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryBioGreen, borderWidth: 1 }]}>
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

      {/* AI Kinetic Twin Section */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: parsingTwin ? AppColors.primaryBioGreen : AppColors.primaryNeonBlue, borderWidth: 1 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>Gemelo Cinético IA</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 15, lineHeight: 18 }]}>Sube tu foto para generar tu avatar 3D. Te verás a ti mismo realizando los ejercicios con perfecta biomecánica.</Text>
          
          {!twinGenerated ? (
            <TouchableOpacity 
              disabled={parsingTwin}
              onPress={() => {
                setParsingTwin(true);
                let p = 0;
                const interval = setInterval(() => {
                  p += 0.1;
                  setUploadProgress(p);
                  if (p >= 1) {
                    clearInterval(interval);
                    setParsingTwin(false);
                    setTwinGenerated(true);
                  }
                }, 300);
              }}
              style={{ 
                height: 100, 
                borderRadius: 15, 
                backgroundColor: 'rgba(0, 209, 255, 0.05)', 
                borderStyle: 'dashed', 
                borderWidth: 2, 
                borderColor: parsingTwin ? AppColors.primaryBioGreen : AppColors.primaryNeonBlue, 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              {parsingTwin ? (
                <View style={{ width: '80%', alignItems: 'center' }}>
                  <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 12, marginBottom: 10 }}>ESCANEANDO... {Math.round(uploadProgress * 100)}%</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="camera" size={28} color={AppColors.primaryNeonBlue} style={{ marginBottom: 5 }} />
                  <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold', fontSize: 12 }}>Escanear Cuerpo</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[AppStyles.rowCentered, { gap: 15, padding: 10, backgroundColor: 'rgba(0, 255, 128, 0.1)', borderRadius: 15 }]}>
               <Ionicons name="checkmark-circle" size={24} color={AppColors.primaryBioGreen} />
               <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 12 }}>¡GEMELO ACTIVO!</Text>
            </View>
          )}
      </View>

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

      {/* Bio-Sovereignty & Referral */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 30 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>Soberanía y Afiliación</Text>
          
          <View style={{ marginBottom: 20 }}>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 8 }]}>Ajustes de Privacidad</Text>
              <TouchableOpacity 
                onPress={() => setIsPublic(!isPublic)}
                style={[AppStyles.rowBetween, { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: isPublic ? AppColors.primaryBioGreen : 'transparent' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={isPublic ? "eye" : "eye-off"} size={20} color={isPublic ? AppColors.primaryBioGreen : AppColors.textGray} style={{ marginRight: 10 }} />
                  <Text style={{ color: 'white', fontSize: 13 }}>{isPublic ? "Fotos Públicas" : "Solo Historial Privado"}</Text>
                </View>
                <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: isPublic ? AppColors.primaryBioGreen : 'rgba(255,255,255,0.1)', alignItems: isPublic ? 'flex-end' : 'flex-start', padding: 2 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'white' }} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShareStats(!shareStats)}
                style={[AppStyles.rowBetween, { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: shareStats ? AppColors.primaryNeonBlue : 'transparent', marginTop: 10 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={shareStats ? "stats-chart" : "lock-closed"} size={20} color={shareStats ? AppColors.primaryNeonBlue : AppColors.textGray} style={{ marginRight: 10 }} />
                  <Text style={{ color: 'white', fontSize: 13 }}>{shareStats ? "Gráficas de Progreso Públicas" : "Estadísticas Privadas"}</Text>
                </View>
                <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: shareStats ? AppColors.primaryNeonBlue : 'rgba(255,255,255,0.1)', alignItems: shareStats ? 'flex-end' : 'flex-start', padding: 2 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'white' }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setCommunityPrivacy(!communityPrivacy)}
                style={[AppStyles.rowBetween, { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: communityPrivacy ? AppColors.primaryBioGreen : 'transparent', marginTop: 10 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={communityPrivacy ? "megaphone" : "notifications-off"} size={20} color={communityPrivacy ? AppColors.primaryBioGreen : AppColors.textGray} style={{ marginRight: 10 }} />
                  <Text style={{ color: 'white', fontSize: 13 }}>{communityPrivacy ? "Compartir Sinergias en Comunidad" : "Logros Ocultos"}</Text>
                </View>
                <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: communityPrivacy ? AppColors.primaryBioGreen : 'rgba(255,255,255,0.1)', alignItems: communityPrivacy ? 'flex-end' : 'flex-start', padding: 2 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'white' }} />
                </View>
              </TouchableOpacity>
          </View>

          <View>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 8 }]}>Código de Afiliado (Opcional)</Text>
              <TextInput 
                style={AppStyles.highContrastInput}
                placeholder="EJ: BRAIN-CODE-1234"
                placeholderTextColor="#444"
                value={referralInput}
                onChangeText={setReferralInput}
                autoCapitalize="characters"
              />
              <Text style={{ color: AppColors.textGray, fontSize: 9, marginTop: 5 }}>Obtén +100 NTK al ingresar el código de quien te invitó.</Text>
          </View>
      </View>

      <TouchableOpacity 
        style={[AppStyles.glowBtnOrange, { opacity: syncing ? 0.6 : 1, marginBottom: 40 }]}
        disabled={syncing}
        onPress={async () => {
           setSyncing(true);
           try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                router.push('/');
                return;
              }

              // [LEG-FIX] Legal Acceptance Check
              if (!legalAccepted) {
                alert("Debes aceptar el descargo de responsabilidad para continuar.");
                return;
              }

              const userDocRef = doc(db, 'users', userId);
              const dataToUpdate: any = {
                userName,
                genero,
                edad,
                peso,
                altura,
                objetivo,
                photoPrivacy: isPublic ? 'public' : 'private',
                statsPrivacy: shareStats ? 'public' : 'private',
                communityPrivacy,
                legalAccepted: true,
                referralCode: genReferralCode(userName || 'SOLO'),
                setupComplete: true
              };

              // Referral Logic
              if (referralInput) {
                const q = query(collection(db, 'users'), where('referralCode', '==', referralInput));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const referrerDoc = querySnapshot.docs[0];
                  dataToUpdate.referredBy = referrerDoc.id;
                  
                  // Reward Referrer
                  const referrerRef = doc(db, 'users', referrerDoc.id);
                  const referrerData = referrerDoc.data();
                  await updateDoc(referrerRef, {
                    ntkBalance: (referrerData.ntkBalance || 0) + BioEconomy.REFERRAL_BONUS_FIXED
                  });

                  // Reward Current User
                  dataToUpdate.ntkBalance = (BioEconomy.TRIAL_INITIAL_TOKENS + BioEconomy.REFERRAL_BONUS_FIXED);
                }
              }

              await setDoc(userDocRef, dataToUpdate, { merge: true });
              router.push('/');
           } catch (e) {
              console.error("Setup Error:", e);
           } finally {
              setSyncing(false);
           }
        }}
      >
        <Text style={AppStyles.glowBtnOrangeText}>{syncing ? 'SINCRONIZANDO...' : 'Sincronizar Identidad'}</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
