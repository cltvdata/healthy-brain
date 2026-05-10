import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, Alert, StyleSheet } from 'react-native';
import { BioSimulatorService } from '@/services/BioSimulatorService';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BioEconomy, genReferralCode } from '@/constants/BioEconomy';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import BioAvatar3D from '@/components/BioAvatar3D';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PerfilSetupScreen() {
  const [userName, setUserName] = useState('');
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  
  const [isPublic, setIsPublic] = useState(false);
  const [shareStats, setShareStats] = useState(false);
  const [communityPrivacy, setCommunityPrivacy] = useState(true);
  const [legalAccepted, setLegalAccepted] = useState(true);

  const [enableCycleTracking, setEnableCycleTracking] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  
  const [parsingTwin, setParsingTwin] = useState(false);
  const [twinGenerated, setTwinGenerated] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { locale, setLocale, t } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  
  const [referralInput, setReferralInput] = useState('');
  const [syncing, setSyncing] = useState(false);
  
  // Stats for Chronicle
  const [ntkBalance, setNtkBalance] = useState(1000);
  const [isFounder, setIsFounder] = useState(false);

  // Granular Privacy States
  const [showInRanking, setShowInRanking] = useState(true);
  const [shareBioScore, setShareBioScore] = useState(true);
  const [shareNTK, setShareNTK] = useState(true);
  const [shareTrend, setShareTrend] = useState(true);
  const [useAnonymousAlias, setUseAnonymousAlias] = useState(false);

  useEffect(() => {
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
          if (data.legalAccepted !== undefined) setLegalAccepted(data.legalAccepted);
          if (data.ntkBalance !== undefined) setNtkBalance(data.ntkBalance);
          if (data.isFounder !== undefined) setIsFounder(data.isFounder);
          
          if (data.enableCycleTracking !== undefined) setEnableCycleTracking(data.enableCycleTracking);
          if (data.lastPeriodDate) setLastPeriodDate(data.lastPeriodDate);
          if (data.cycleLength) setCycleLength(data.cycleLength.toString());

          if (data.showInRanking !== undefined) setShowInRanking(data.showInRanking);
          if (data.shareBioScore !== undefined) setShareBioScore(data.shareBioScore);
          if (data.shareNTK !== undefined) setShareNTK(data.shareNTK);
          if (data.shareTrend !== undefined) setShareTrend(data.shareTrend);
          if (data.useAnonymousAlias !== undefined) setUseAnonymousAlias(data.useAnonymousAlias);
        }
      }
    };
    loadData();
  }, []);

  const goalOptions = [
    { id: 'fat', label: 'Pérdida de Grasa', icon: 'flame' },
    { id: 'muscle', label: 'Ganancia Muscular', icon: 'barbell' },
    { id: 'hrv', label: 'Optimizar HRV', icon: 'heart' },
    { id: 'longevity', label: 'Longevidad IA', icon: 'infinite' }
  ];

  const calculateBMI = () => {
    const w = parseFloat(peso);
    const h = parseFloat(altura);
    if (isNaN(w) || h <= 0) return 0;
    return unitSystem === 'metric' ? (w / Math.pow(h / 100, 2)) : (703 * w / Math.pow(h, 2));
  };

  const bmi = calculateBMI();
  const level = Math.floor(ntkBalance / 1000) + 1;

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Biological Identity Header */}
      <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onLongPress={() => {
            Alert.alert(
              "🛠️ Consola de Soberanía",
              "Inyección de datos para depuración bio-neural.",
              [
                { text: "INYECTAR ELITE (Demo)", onPress: () => BioSimulatorService.injectEliteStatus() },
                { text: "SIMULAR ESTRÉS", onPress: () => BioSimulatorService.injectStressedStatus() },
                { text: "RESET BASELINE", onPress: () => BioSimulatorService.resetBaseline() },
                { text: "CANCELAR", style: "cancel" }
              ]
            );
          }}
          delayLongPress={2000}
          activeOpacity={0.7}
          style={{ alignItems: 'flex-end' }}
        >
          <View style={[AppStyles.rowCentered, { gap: 6 }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: AppColors.primaryBioGreen }} />
            <Text style={[AppStyles.textGray, { fontSize: 9, fontWeight: '900', letterSpacing: 1 }]}>IDENTITY SYNC V4.0</Text>
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900' }]}>{t('profile.title')}</Text>
        </TouchableOpacity>
      </View>

      {/* Bio-Chronicle (Phase 103 - Final Polish) */}
      <LinearGradient
        colors={['rgba(0, 209, 255, 0.08)', 'rgba(0,0,0,0.5)']}
        style={styles.chronicleCard}
      >
         <View style={AppStyles.rowBetween}>
            <View style={{ flex: 1 }}>
               <Text style={styles.chronicleLabel}>LA CRÓNICA DEL CIUDADANO</Text>
               <Text style={styles.chronicleNarrative}>
                  Has asegurado <Text style={{ color: AppColors.primaryNeonBlue }}>{level > 5 ? 'Nivel de Maestría' : 'Soberanía Inicial'}</Text> en la red. 
                  Tu legado actual es de <Text style={{ color: AppColors.primaryOrange }}>{ntkBalance} NTK</Text>.
               </Text>
            </View>
            {isFounder && (
              <View style={styles.founderBadge}>
                 <Ionicons name="shield-checkmark" size={16} color="black" />
                 <Text style={styles.founderText}>GENESIS</Text>
              </View>
            )}
         </View>
         <View style={styles.chronicleStats}>
            <ChronicleStat icon="time-outline" value="Soberano" label="STATUS" />
            <ChronicleStat icon="layers-outline" value={`NIVEL ${level}`} label="RANGO" />
            <ChronicleStat icon="globe-outline" value="ACTIVO" label="RED ZK" />
         </View>
      </LinearGradient>

      {/* Global Configuration */}
      <View style={[AppStyles.glassCard, { padding: 15, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-around', borderRadius: 20 }]}>
          <ConfigTab label="ESP" active={locale === 'es'} onPress={() => setLocale('es')} />
          <View style={styles.divider} />
          <ConfigTab label="ENG" active={locale === 'en'} onPress={() => setLocale('en')} />
          <View style={styles.divider} />
          <ConfigTab label="MÉTRICO" active={unitSystem === 'metric'} onPress={() => setUnitSystem('metric')} />
          <View style={styles.divider} />
          <ConfigTab label="IMPERIAL" active={unitSystem === 'imperial'} onPress={() => setUnitSystem('imperial')} />
      </View>

      {/* Identity Core */}
      <View style={[AppStyles.glassCard, { padding: 25, marginBottom: 25, borderColor: AppColors.primaryBioGreen + '40', borderWidth: 1, borderRadius: 30 }]}>
          <View style={AppStyles.rowBetween}>
            <Text style={styles.sectionTitle}>Identidad Biográfica</Text>
            <TouchableOpacity onPress={() => router.push('/bio-vault' as any)} style={styles.vaultLink}>
              <Ionicons name="folder-open" size={18} color={AppColors.primaryNeonBlue} />
              <Text style={styles.vaultLinkText}>BIO-VAULT</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionDesc}>Define los parámetros base de tu existencia digital.</Text>

          {/* GÉNERO SELECTOR (Prioritized) */}
          <View style={{ marginBottom: 25 }}>
              <Text style={styles.inputLabel}>GÉNERO BIOLÓGICO (OBLIGATORIO)</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                {[
                  { id: 'Hombre', icon: 'male' },
                  { id: 'Mujer', icon: 'female' },
                  { id: 'Otro', icon: 'male-female' }
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.generoBtn,
                      genero === item.id && { 
                        backgroundColor: 'rgba(0, 209, 255, 0.2)', 
                        borderColor: AppColors.primaryNeonBlue,
                        borderWidth: 2 
                      }
                    ]}
                    onPress={() => setGenero(item.id)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={genero === item.id ? AppColors.primaryNeonBlue : 'rgba(255,255,255,0.4)'}
                    />
                    <Text style={[styles.generoText, genero === item.id && { color: AppColors.primaryNeonBlue, fontWeight: '900' }]}>
                      {item.id.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
          </View>

          <View style={{ marginBottom: 25 }}>
              <Text style={styles.inputLabel}>¿CÓMO TE LLAMAS?</Text>
              <TextInput 
                style={styles.premiumInput}
                placeholder="EJ: JEREMY"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={userName}
                onChangeText={setUserName}
              />
          </View>

          <View>
              <Text style={styles.inputLabel}>TU ENFOQUE ESTRATÉGICO</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {goalOptions.map(goal => (
                  <TouchableOpacity 
                    key={goal.id}
                    style={[
                      styles.goalBtn,
                      objetivo === goal.label && { backgroundColor: 'rgba(0, 209, 255, 0.1)', borderColor: AppColors.primaryNeonBlue }
                    ]}
                    onPress={() => setObjetivo(goal.label)}
                  >
                    <Ionicons name={goal.icon as any} size={20} color={objetivo === goal.label ? AppColors.primaryNeonBlue : 'white'} />
                    <Text style={[styles.goalText, objetivo === goal.label && { color: AppColors.primaryNeonBlue }]}>{goal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
          </View>
      </View>

      {/* Advanced Biometrics */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderRadius: 30 }]}>
          <Text style={styles.sectionTitle}>Biometrías de Sinergia</Text>
          <View style={{ marginTop: 20, gap: 15 }}>
              <View style={[AppStyles.rowBetween, { gap: 15 }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>EDAD (AÑOS)</Text>
                    <TextInput 
                      style={styles.premiumInput}
                      placeholder="25"
                      keyboardType="number-pad"
                      value={edad}
                      onChangeText={setEdad}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>{unitSystem === 'metric' ? "PESO (KG)" : "PESO (LBS)"}</Text>
                    <TextInput 
                      style={styles.premiumInput}
                      placeholder={unitSystem === 'metric' ? "70" : "154"}
                      keyboardType="decimal-pad"
                      value={peso}
                      onChangeText={setPeso}
                    />
                </View>
              </View>
              <View>
                  <Text style={styles.miniLabel}>{unitSystem === 'metric' ? "ALTURA (CM)" : "ALTURA (IN)"}</Text>
                  <TextInput 
                    style={styles.premiumInput}
                    placeholder={unitSystem === 'metric' ? "175" : "68"}
                    keyboardType="decimal-pad"
                    value={altura}
                    onChangeText={setAltura}
                  />
              </View>
          </View>
      </View>

      {/* AI Kinetic Twin Section */}
      <View style={[AppStyles.glassCard, { padding: 25, marginBottom: 25, borderColor: parsingTwin ? AppColors.primaryBioGreen : AppColors.primaryNeonBlue, borderWidth: 1, borderRadius: 30 }]}>
          <View style={AppStyles.rowBetween}>
            <Text style={styles.sectionTitle}>Gemelo Cinético IA</Text>
            <Ionicons name="sparkles" size={20} color={AppColors.primaryNeonBlue} />
          </View>
          <Text style={styles.sectionDesc}>Sube una imagen para instanciar tu avatar 3D. Tu gemelo te guiará con biomecánica perfecta.</Text>
          
          {!twinGenerated ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                disabled={parsingTwin}
                onPress={async () => {
                  try {
                    const cameraAvailable = await ImagePicker.isCameraAvailableAsync();
                    if (!cameraAvailable) {
                      Alert.alert('Cámara no detectada', 'Tu dispositivo no tiene una cámara disponible.');
                      return;
                    }

                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para instanciar tu gemelo cinético. Ve a Ajustes > Healthy+Brain > Cámara.');
                      return;
                    }
                    
                    const result = await ImagePicker.launchCameraAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.8,
                    });
                    
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                      const uri = result.assets[0].uri;
                      setParsingTwin(true);
                      // Simulación de carga (mismo código)
                      let progress = 0;
                      const interval = setInterval(() => {
                        progress += 0.1;
                        setUploadProgress(Math.min(progress, 1));
                        if (progress >= 1) {
                          clearInterval(interval);
                          setParsingTwin(false);
                          setTwinGenerated(true);
                          if (auth.currentUser) {
                            updateDoc(doc(db, 'users', auth.currentUser.uid), {
                              avatarUri: uri
                            }).catch(console.error);
                          }
                        }
                      }, 200);
                    }
                  } catch (error) {
                    console.error("Camera Error:", error);
                    Alert.alert('Error de Cámara', 'Hubo un problema al intentar abrir la cámara. Intenta usar la Galería.');
                  }
                }}
                style={[styles.uploadBtn, { borderColor: AppColors.primaryNeonBlue + '60' }]}
              >
                {parsingTwin ? (
                  <Text style={styles.uploadProgress}>ESCANEANDO {Math.round(uploadProgress * 100)}%</Text>
                ) : (
                  <>
                    <Ionicons name="camera" size={26} color={AppColors.primaryNeonBlue} />
                    <Text style={styles.uploadLabel}>CÁMARA</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={parsingTwin}
                onPress={async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  });
                  if (!result.canceled && result.assets[0]) {
                    setParsingTwin(true);
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += 0.15;
                      setUploadProgress(Math.min(progress, 1));
                      if (progress >= 1) {
                        clearInterval(interval);
                        setParsingTwin(false);
                        setTwinGenerated(true);
                        if (auth.currentUser) {
                          updateDoc(doc(db, 'users', auth.currentUser.uid), {
                            avatarUri: result.assets[0].uri
                          }).catch(console.error);
                        }
                      }
                    }, 150);
                  }
                }}
                style={[styles.uploadBtn, { borderColor: AppColors.primaryOrange + '60' }]}
              >
                 <Ionicons name="image" size={26} color={AppColors.primaryOrange} />
                 <Text style={[styles.uploadLabel, { color: AppColors.primaryOrange }]}>GALERÍA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 15 }}>
               <BioAvatar3D size={200} glowColor={AppColors.primaryBioGreen} intensity="high" />
               <View style={styles.syncStatus}>
                  <Ionicons name="checkmark-seal" size={20} color={AppColors.primaryBioGreen} />
                  <Text style={styles.syncStatusText}>GEMELO INSTANCIADO</Text>
               </View>
               <TouchableOpacity onPress={() => { setTwinGenerated(false); setUploadProgress(0); }} style={{ marginTop: 10 }}>
                 <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Cambiar imagen</Text>
               </TouchableOpacity>
            </View>
          )}
      </View>

      {/* Strategic Privacy */}
      <View style={[AppStyles.glassCard, { padding: 25, marginBottom: 40, borderRadius: 30 }]}>
          <Text style={styles.sectionTitle}>Matriz de Privacidad</Text>
          <View style={{ marginTop: 20, gap: 15 }}>
              <PrivacyToggle label="APAERECER EN RANKING GLOBAL" value={showInRanking} onChange={setShowInRanking} icon="trophy" />
              <PrivacyToggle label="USAR ALIAS ANÓNIMO" value={useAnonymousAlias} onChange={setUseAnonymousAlias} icon="mask" />
              <PrivacyToggle label="COMPARTIR BIO-SCORE" value={shareBioScore} onChange={setShareBioScore} icon="medical" />
              <PrivacyToggle label="COMPARTIR BALANCE NTK" value={shareNTK} onChange={setShareNTK} icon="cash" />
          </View>
      </View>

      <TouchableOpacity 
        style={[AppStyles.glowBtnOrange, { marginBottom: 60 }]}
        disabled={syncing}
        onPress={async () => {
           if (!auth.currentUser) return;
           setSyncing(true);
           try {
             await updateDoc(doc(db, 'users', auth.currentUser.uid), {
               userName,
               genero,
               edad,
               peso,
               altura,
               objetivo,
               unitSystem,
               photoPrivacy: isPublic ? 'public' : 'private',
               statsPrivacy: shareStats ? 'public' : 'private',
               showInRanking,
               shareBioScore,
               shareNTK,
               useAnonymousAlias,
               enableCycleTracking,
               lastPeriodDate: enableCycleTracking ? lastPeriodDate : '',
               cycleLength: enableCycleTracking ? parseInt(cycleLength) || 28 : 28,
             });
             router.push('/(tabs)' as any);
           } catch (e) {
             Alert.alert('Error', 'No se pudo guardar el perfil.');
             console.error(e);
           } finally {
             setSyncing(false);
           }
        }}
      >
        <Text style={AppStyles.glowBtnOrangeText}>{syncing ? 'SINCRONIZANDO...' : 'Sincronizar Identidad'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const ConfigTab = ({ label, active, onPress }: any) => (
  <TouchableOpacity style={{ opacity: active ? 1 : 0.3 }} onPress={onPress}>
    <Text style={{ color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>{label}</Text>
  </TouchableOpacity>
);

const ChronicleStat = ({ icon, value, label }: any) => (
  <View style={{ alignItems: 'center' }}>
     <Ionicons name={icon} size={18} color="white" style={{ marginBottom: 6, opacity: 0.6 }} />
     <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>{value}</Text>
     <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '900', marginTop: 2 }}>{label}</Text>
  </View>
);

const PrivacyToggle = ({ label, value, onChange, icon }: any) => (
  <TouchableOpacity onPress={() => onChange(!value)} style={styles.privacyRow}>
    <View style={AppStyles.rowCentered}>
      <Ionicons name={icon} size={18} color={value ? AppColors.primaryNeonBlue : 'rgba(255,255,255,0.2)'} style={{ marginRight: 15 }} />
      <Text style={[styles.privacyLabel, { color: value ? 'white' : 'rgba(255,255,255,0.4)' }]}>{label}</Text>
    </View>
    <View style={[styles.toggleBg, value && { backgroundColor: AppColors.primaryNeonBlue }]}>
      <View style={[styles.toggleCircle, value && { transform: [{ translateX: 14 }] }]} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  chronicleCard: {
    padding: 25,
    borderRadius: 30,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)',
    overflow: 'hidden'
  },
  chronicleLabel: {
    color: AppColors.primaryNeonBlue,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8
  },
  chronicleNarrative: {
    color: 'white',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500'
  },
  founderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryBioGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
    alignSelf: 'flex-start'
  },
  founderText: {
    color: 'black',
    fontSize: 8,
    fontWeight: '900'
  },
  chronicleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  divider: {
    width: 1,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center'
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  sectionDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10
  },
  premiumInput: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 18,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  miniLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 6
  },
  generoBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 6,
  },
  generoText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  goalBtn: {
    width: '48%',
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    gap: 8
  },
  goalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  uploadBtn: {
    flex: 1,
    height: 110,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  uploadProgress: {
    color: AppColors.primaryBioGreen,
    fontWeight: '900',
    fontSize: 11
  },
  uploadLabel: {
    color: AppColors.primaryNeonBlue,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderRadius: 15,
    marginTop: 20
  },
  syncStatusText: {
    color: AppColors.primaryBioGreen,
    fontWeight: '900',
    fontSize: 10
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  privacyLabel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  toggleBg: {
    width: 38,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white'
  },
  vaultLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primaryNeonBlue + '30'
  },
  vaultLinkText: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  }
});
