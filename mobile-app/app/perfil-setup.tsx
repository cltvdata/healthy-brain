import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, Alert, StyleSheet } from 'react-native';
import { BioSimulatorService } from '@/services/BioSimulatorService';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BioEconomy, genReferralCode } from '@/constants/BioEconomy';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import { BioCycleService, BioCycleState } from '@/services/BioCycleService';
import { BioTwinService } from '@/services/BioTwinService';
import BioAvatar3D from '@/components/BioAvatar3D';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function PerfilSetupScreen() {
  const [userName, setUserName] = useState('');
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [aguaMeta, setAguaMeta] = useState('2.5'); // Litros por día
  const [currentHormonalPhase, setCurrentHormonalPhase] = useState('Folicular');
  
  const [isPublic, setIsPublic] = useState(false);
  const [shareStats, setShareStats] = useState(false);
  const [communityPrivacy, setCommunityPrivacy] = useState(true);
  const [legalAccepted, setLegalAccepted] = useState(true);

  const [enableCycleTracking, setEnableCycleTracking] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [cycleState, setCycleState] = useState<BioCycleState | null>(null);
  
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

  useEffect(() => {
    if (enableCycleTracking && lastPeriodDate) {
      const state = BioCycleService.calculateState(lastPeriodDate, parseInt(cycleLength) || 28);
      setCycleState(state);
    } else {
      setCycleState(null);
    }
  }, [enableCycleTracking, lastPeriodDate, cycleLength]);

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageAction(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para generar tu gemelo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageAction(result.assets[0].uri);
    }
  };

  const handleImageAction = async (uri: string) => {
    setParsingTwin(true);
    setUploadProgress(0.1);
    
    try {
      // Subir y crear el Gemelo IA
      const twinId = await BioTwinService.uploadAndCreateTwin(uri, {
        weight: peso ? parseFloat(peso) : undefined,
        notes: 'Primera foto del Gemelo IA'
      });

      // Simulate AI Processing animation
      setTimeout(() => setUploadProgress(0.4), 1000);
      setTimeout(() => setUploadProgress(0.8), 2500);
      
      setTimeout(() => {
        setUploadProgress(1);
        setTwinGenerated(true);
        setParsingTwin(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (twinId) {
          Alert.alert('🎉 Gemelo IA Instanciado', 'Tu Gemelo Cinético ha sido creado. ¡Sube fotos regularmente para trackear tu evolución física!');
        }
      }, 4000);
    } catch (error) {
      console.error("Error creating twin:", error);
      setParsingTwin(false);
      Alert.alert('Error', 'No se pudo crear el Gemelo IA. Intenta de nuevo.');
    }
  };

  const updateTwinPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para actualizar tu gemelo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setParsingTwin(true);
      setUploadProgress(0);
      
      const success = await BioTwinService.updateTwinWithNewPhoto(result.assets[0].uri, {
        weight: peso ? parseFloat(peso) : undefined,
        notes: `Actualización del Gemelo - Día ${new Date().toLocaleDateString()}`
      });

      if (success) {
        Alert.alert('✅ Gemelo Actualizado', 'Tu foto de evolución ha sido guardada. ¡Sigue documentando tu progreso!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setParsingTwin(false);
    }
  };

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
          <Text style={styles.sectionTitle}>Identidad Biográfica</Text>
          
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

          <View style={{ marginBottom: 25 }}>
              <Text style={styles.inputLabel}>GÉNERO / IDENTIDAD BIOLÓGICA</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['MASCULINO', 'FEMENINO', 'OTRO'].map(g => (
                  <TouchableOpacity 
                    key={g}
                    style={[
                      styles.genderBtn,
                      genero === g && { backgroundColor: 'rgba(0, 209, 255, 0.1)', borderColor: AppColors.primaryNeonBlue }
                    ]}
                    onPress={() => setGenero(g)}
                  >
                    <Text style={[styles.genderText, genero === g && { color: AppColors.primaryNeonBlue }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
          </View>

          {genero === 'FEMENINO' && (
            <View style={{ marginBottom: 25, padding: 15, backgroundColor: 'rgba(255, 138, 0, 0.05)', borderRadius: 20, borderWidth: 1, borderColor: AppColors.primaryOrange + '40' }}>
               <View style={AppStyles.rowBetween}>
                  <View>
                    <Text style={[styles.sectionTitle, { fontSize: 16, color: AppColors.primaryOrange }]}>Protocolo Salud Hormonal</Text>
                    <Text style={{ color: 'rgba(255,138,0,0.6)', fontSize: 10, fontWeight: 'bold' }}>INSPIRADO EN FLO HEALTH</Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                    setEnableCycleTracking(!enableCycleTracking);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}>
                     <View style={[styles.toggleBg, enableCycleTracking && { backgroundColor: AppColors.primaryOrange }]}>
                        <View style={[styles.toggleCircle, enableCycleTracking && { transform: [{ translateX: 14 }] }]} />
                     </View>
                  </TouchableOpacity>
               </View>
               <Text style={[styles.sectionDesc, { marginBottom: 15 }]}>Optimiza tu entrenamiento, nutrición y suplementación según tu fase biológica detectada por IA.</Text>
               
               {enableCycleTracking && (
                 <View style={{ gap: 15 }}>
                    <View style={styles.phaseIndicator}>
                       <Ionicons name="moon" size={20} color={AppColors.primaryOrange} />
                       <View>
                          <Text style={styles.phaseTitle}>FASE DETECTADA: {currentHormonalPhase.toUpperCase()}</Text>
                          <Text style={styles.phaseDesc}>Tu energía está subiendo. Ideal para fuerza máxima.</Text>
                       </View>
                    </View>

                    <View>
                      <Text style={styles.miniLabel}>FECHA ÚLTIMO PERIODO</Text>
                      <TextInput 
                        style={styles.premiumInput}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={lastPeriodDate}
                        onChangeText={setLastPeriodDate}
                      />
                    </View>

                    <View>
                      <Text style={styles.miniLabel}>DURACIÓN DEL CICLO (DÍAS)</Text>
                      <TextInput 
                        style={styles.premiumInput}
                        placeholder="28"
                        keyboardType="number-pad"
                        value={cycleLength}
                        onChangeText={setCycleLength}
                      />
                    </View>

                    <View style={styles.hormonalTips}>
                        <Text style={styles.tipTitle}>💡 CONSEJO IA:</Text>
                        <Text style={styles.tipText}>Durante esta fase, prioriza el consumo de fibra y grasas saludables para regular estrógenos.</Text>
                    </View>
                 </View>
               )}
            </View>
          )}

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
              <View style={{ marginTop: 10 }}>
                  <Text style={[styles.miniLabel, { color: AppColors.primaryNeonBlue }]}>META DE HIDRATACIÓN DIARIA (LITROS)</Text>
                  <View style={AppStyles.rowCentered}>
                    <Ionicons name="water" size={24} color={AppColors.primaryNeonBlue} style={{ marginRight: 10 }} />
                    <TextInput 
                      style={[styles.premiumInput, { flex: 1 }]}
                      placeholder="2.5"
                      keyboardType="decimal-pad"
                      value={aguaMeta}
                      onChangeText={setAguaMeta}
                    />
                  </View>
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
                onPress={takePhoto}
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
                onPress={pickImage}
                style={[styles.uploadBtn, { borderColor: AppColors.primaryOrange + '60' }]}
              >
                 <Ionicons name="image" size={26} color={AppColors.primaryOrange} />
                 <Text style={[styles.uploadLabel, { color: AppColors.primaryOrange }]}>GALERÍA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 15 }}>
               <BioAvatar3D size={200} glowColor={AppColors.primaryBioGreen} intensity="high" />
               <View style={[styles.syncStatus, { backgroundColor: AppColors.primaryBioGreen + '20', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15 }]}>
                  <Ionicons name="checkmark-seal" size={18} color={AppColors.primaryBioGreen} />
                  <Text style={[styles.syncStatusText, { fontSize: 11 }]}>GEMELO INSTANCIADO</Text>
               </View>
               
               {/* Botón de actualizar */}
               <TouchableOpacity 
                 onPress={updateTwinPhoto}
                 style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: AppColors.primaryNeonBlue + '10', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: AppColors.primaryNeonBlue + '30' }}
               >
                 <Ionicons name="refresh" size={18} color={AppColors.primaryNeonBlue} />
                 <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold', fontSize: 12 }}>Actualizar Evolución</Text>
               </TouchableOpacity>

               {/* Progreso del Gemelo */}
               <View style={{ marginTop: 20, width: '100%' }}>
                 <View style={[AppStyles.rowBetween, { marginBottom: 8 }]}>
                   <Text style={{ color: AppColors.textGray, fontSize: 11 }}>Progreso de Documentación</Text>
                   <Text style={{ color: AppColors.primaryBioGreen, fontSize: 11, fontWeight: 'bold' }}>3 fotos</Text>
                 </View>
                 <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                   <View style={{ width: '30%', height: '100%', backgroundColor: AppColors.primaryBioGreen }} />
                 </View>
                 <Text style={{ color: AppColors.textGray, fontSize: 10, marginTop: 5, textAlign: 'center' }}>
                   Sube más fotos para desbloquear logros de transformación
                 </Text>
               </View>
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
           setSyncing(true);
           const user = auth.currentUser;
           if (user) {
             await updateDoc(doc(db, 'users', user.uid), {
               userName,
               genero,
               edad,
               peso,
               altura,
               objetivo,
               enableCycleTracking,
               lastPeriodDate,
               cycleLength: parseInt(cycleLength) || 28,
               aguaMeta: parseFloat(aguaMeta) || 2.5,
               showInRanking,
               shareBioScore,
               shareNTK,
               useAnonymousAlias,
               updatedAt: serverTimestamp()
             });
           }
           setSyncing(false);
           router.push('/' as any);
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
  genderBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  genderText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 0, 0.2)'
  },
  phaseTitle: {
    color: AppColors.primaryOrange,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  phaseDesc: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2
  },
  hormonalTips: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 15,
    marginTop: 5
  },
  tipTitle: {
    color: AppColors.primaryBioGreen,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 5
  },
  tipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    lineHeight: 16
  }
});
