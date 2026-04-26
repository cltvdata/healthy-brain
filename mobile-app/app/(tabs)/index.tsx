import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AtlasOrganico from '@/components/AtlasOrganico';
import { db, auth } from '@/constants/FirebaseConfig';
import { onSnapshot, doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { BioEconomy } from '@/constants/BioEconomy';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/context/LanguageContext';
import { SynergyService } from '@/services/SynergyService';
import BioBriefing from '@/components/BioBriefing';
import { BioNotificationService } from '@/services/NotificationService';
import { BioSensorService } from '@/services/BioSensorService';
import BioBanner, { BioBannerRef } from '@/components/BioBanner';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t, locale } = useLanguage();
  const [ntk, setNtk] = useState(0);
  const [score, setScore] = useState(0);
  const [hrv, setHrv] = useState(0);
  const [stepPosted, setStepPosted] = useState(false);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [showBriefing, setShowBriefing] = useState(false);
  const [glucose, setGlucose] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [userName, setUserName] = useState('Bio-Explorer');
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const bannerRef = React.useRef<BioBannerRef>(null);

  useEffect(() => {
    if (stepCount > 1000 && !stepPosted) {
      SynergyService.postAchievement(
        'steps',
        `Alcanzó su hito de movimientos biológicos del día (${stepCount} pasos). ¡Sinergia activa! 🏃‍♂️`,
        50
      );
      setStepPosted(true);
    }
  }, [stepCount, stepPosted]);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupSync = async () => {
      try {
        auth.onAuthStateChanged(async (user: any) => {
          if (!user) {
            await signInAnonymously(auth);
            return;
          }

          const userId = user.uid;
          const userDocRef = doc(db, 'users', userId);

          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
             const now = new Date();
             const trialEnd = new Date();
             trialEnd.setDate(now.getDate() + BioEconomy.TRIAL_DURATION_DAYS);
             
             await setDoc(userDocRef, {
                ntkBalance: BioEconomy.TRIAL_INITIAL_TOKENS,
                trialStartDate: serverTimestamp(),
                trialEndDate: trialEnd,
                bioScore: 85,
                hrv: 60,
                userName: 'Bio-Explorer',
                photoPrivacy: 'private'
             }, { merge: true });
          }

          unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              
              // Set Banner Ref
              BioNotificationService.setBannerRef(bannerRef.current);

              if (data.ntkBalance !== undefined) setNtk(data.ntkBalance);
              if (data.bioScore !== undefined) setScore(data.bioScore);
              if (data.hrv !== undefined) {
                 setHrv(data.hrv);
                 // [BIO-CONTEXTUAL-ALERT] 
                 // Analizar contexto si hay cambios significativos
                 BioNotificationService.analyzeBioContext(data.hrv, data.bioScore || 85, data.ntkBalance || 0);
              }
              if (data.glucosa !== undefined) setGlucose(data.glucosa);
              if (data.userName) setUserName(data.userName);
              
              if (data.todaysMacros) {
                setProteins(data.todaysMacros.protein || 0);
                setCarbs(data.todaysMacros.carbs || 0);
                setFats(data.todaysMacros.fats || 0);
              }

              // [SESSION-DETECTION] Show Briefing only once
              const sessionKey = 'last_briefing_' + new Date().toDateString();
              if (!data[sessionKey]) {
                setShowBriefing(true);
                await updateDoc(userDocRef, { [sessionKey]: true });
              }
              
              if (data.trialEndDate) {
                 const diff = data.trialEndDate.toDate().getTime() - new Date().getTime();
                 const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                 setDaysRemaining(days > 0 ? days : 0);
              }

              if (data.legalAccepted !== true) {
                // @ts-ignore
                router.replace('/legal-disclaimer');
              }
            }
          });
        });
      } catch (error) {
        console.error("Mobile Cloud Sync Error:", error);
      }
    };

    setupSync();

    // Bio-Sensor Setup
    let subscription: { remove: () => void } | null = null;
    const subscribePedometer = async () => {
      const isAvailable = await BioSensorService.isHardwareReady();
      setIsPedometerAvailable(String(isAvailable));

      subscription = BioSensorService.subscribeToSteps(steps => {
         setStepCount(prev => prev + steps); 
      });
    };
    subscribePedometer();

    return () => {
      unsubscribe && unsubscribe();
      subscription && subscription.remove();
    };
  }, []);

  const dynamicStepGoal = hrv > 75 ? 10000 : hrv > 50 ? 7500 : 5000;
  const stepProgress = (stepCount / dynamicStepGoal) * 100;

  const level = Math.floor(ntk / 1000) + 1;
  const xp = ntk % 1000;
  const progress = (xp / 1000) * 100;

  return (
    <View style={{ flex: 1 }}>
       <BioBanner ref={bannerRef} />
       <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={{ marginBottom: 25, marginTop: 10 }}>
        <View style={[AppStyles.rowBetween, { alignItems: 'flex-start' }]}>
           <View>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 4 }]}>{t('common.welcome')}, {userName}!</Text>
              <View style={AppStyles.rowCentered}>
                <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold' }]}>{t('home.bioStatus')} </Text>
                <Text style={{ fontSize: 22 }}>🧠</Text>
              </View>
           </View>
           <TouchableOpacity onPress={() => router.push('/perfil-setup')}>
              <Ionicons name="settings-sharp" size={28} color="rgba(255,255,255,0.5)" />
           </TouchableOpacity>
        </View>

        {/* Bio-Trial Banner */}
        {daysRemaining !== null && daysRemaining > 0 && (
          <View style={{ marginTop: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)', backgroundColor: 'rgba(0, 209, 255, 0.1)' }}>
            <View style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }}>
               <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 209, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                  <Ionicons name="time" size={20} color={AppColors.primaryNeonBlue} />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Prueba Gratuita Bio-Elite</Text>
                  <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Te quedan <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold' }}>{daysRemaining} días</Text> de soberanía total.</Text>
               </View>
               <TouchableOpacity 
                style={{ backgroundColor: AppColors.primaryNeonBlue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                onPress={() => router.push('/pagos')}
              >
                  <Text style={{ color: 'black', fontSize: 10, fontWeight: 'bold' }}>UPGRADE</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity 
        // @ts-ignore
        onPress={() => router.push('/sesion-enfoque')}
        style={[AppStyles.glassCard, { marginBottom: 15, padding: 15, flexDirection: 'row', alignItems: 'center', borderColor: 'rgba(19, 236, 91, 0.3)', backgroundColor: 'rgba(0,0,0,0.4)' }]}
      >
        <View style={{ width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(19, 236, 91, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
           <Ionicons name="sunny-outline" size={24} color={AppColors.primaryBioGreen} />
        </View>
        <View style={{ flex: 1 }}>
           <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold' }]}>{t('home.dopamineReset')} 🧠</Text>
           <Text style={[AppStyles.textGray, { fontSize: 11 }]}>{t('home.dopamineResetSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>

      <TouchableOpacity 
        // @ts-ignore
        onPress={() => router.push('/progreso')}
        style={[AppStyles.glassCard, { marginBottom: 25, padding: 15, flexDirection: 'row', alignItems: 'center', borderColor: AppColors.primaryNeonBlue, backgroundColor: 'rgba(0, 209, 255, 0.05)' }]}
      >
        <View style={{ width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(0, 209, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
           <Ionicons name="stats-chart" size={24} color={AppColors.primaryNeonBlue} />
        </View>
        <View style={{ flex: 1 }}>
           <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold' }]}>Analítica Biográfica 📊</Text>
           <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Visualiza tu balance neuro-físico</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>

      {/* Dynamic Pedometer Widget */}
      <View style={[AppStyles.glassCard, { marginBottom: 25, padding: 20 }]}>
         <View style={AppStyles.rowBetween}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="footsteps" size={24} color={AppColors.primaryBioGreen} style={{ marginRight: 10 }} />
              <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>PEDÓMETRO DINÁMICO</Text>
            </View>
            <TouchableOpacity 
              // @ts-ignore
              onPress={() => router.push('/bio-sync')}
            >
               <View style={{ backgroundColor: 'rgba(0, 209, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderColor: 'rgba(0, 209, 255, 0.2)', borderWidth: 1 }}>
                  <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold' }}>SYNC IA</Text>
               </View>
            </TouchableOpacity>
         </View>

         <View style={{ marginTop: 20, alignItems: 'center' }}>
            <View style={{ position: 'relative', width: 120, height: 120, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900' }]}>{stepCount.toLocaleString()}</Text>
               <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Soberanía / {dynamicStepGoal}</Text>
            </View>
            
            <View style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 15 }}>
               <View style={{ width: `${Math.min(stepProgress, 100)}%`, height: '100%', backgroundColor: AppColors.primaryBioGreen }} />
            </View>

            <View style={{ marginTop: 15, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: hrv < 50 ? 'rgba(255, 138, 0, 0.1)' : 'rgba(19, 236, 91, 0.1)', borderRadius: 10 }}>
               <Text style={{ color: hrv < 50 ? AppColors.primaryOrange : AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                 {hrv < 50 ? "⚠️ MODO RECUPERACIÓN: META REDUCIDA" : "⚡ ÓPTIMO: META ESTÁNDAR"}
               </Text>
            </View>
         </View>
      </View>

      {/* Gamification Stats (Neuro-Tokens NTK) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
         <View style={{ flex: 1, marginRight: 15 }}>
            <View style={AppStyles.rowBetween}>
               <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold' }]}>LVL {level}</Text>
               <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{xp}/1000 XP</Text>
            </View>
            <View style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
              <View style={{ width: `${progress}%`, height: '100%', backgroundColor: AppColors.primaryNeonBlue }} />
            </View>
         </View>
         <TouchableOpacity 
          style={[AppStyles.rowCentered, { backgroundColor: 'rgba(255, 138, 0, 0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255, 138, 0, 0.2)' }]}
          // @ts-ignore
          onPress={() => router.push('/market')}
        >
            <Ionicons name="flash" size={16} color={AppColors.primaryOrange} style={{ marginRight: 6 }} />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{ntk} <Text style={{ color: AppColors.primaryOrange, fontSize: 10 }}>NTK</Text></Text>
         </TouchableOpacity>
      </View>

      {/* Bio-Synergy Navigation */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 25 }}>
         <TouchableOpacity 
           style={[AppStyles.glassCard, { flex: 1, padding: 15, borderColor: 'rgba(255, 138, 0, 0.3)', backgroundColor: 'rgba(255, 138, 0, 0.05)' }]}
           // @ts-ignore
           onPress={() => router.push('/market')}
         >
            <Ionicons name="gift" size={24} color={AppColors.primaryOrange} style={{ marginBottom: 8 }} />
            <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Marketplace</Text>
            <Text style={[AppStyles.textGray, { fontSize: 9 }]}>Canjear Tokens</Text>
         </TouchableOpacity>
          <TouchableOpacity 
            style={[AppStyles.glassCard, { flex: 1, padding: 15, borderColor: 'rgba(0, 209, 255, 0.3)', backgroundColor: 'rgba(0, 209, 255, 0.05)' }]}
            onPress={() => router.push('/comunidad')}
          >
            <Ionicons name="people" size={24} color={AppColors.primaryNeonBlue} style={{ marginBottom: 8 }} />
            <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>{t('community.title')}</Text>
            <Text style={[AppStyles.textGray, { fontSize: 9 }]}>Ranking Bio</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[AppStyles.glassCard, { marginTop: 15, padding: 20, borderColor: AppColors.primaryBioGreen, backgroundColor: 'rgba(19, 236, 91, 0.05)', flexDirection: 'row', alignItems: 'center' }]}
          // @ts-ignore
          onPress={() => router.push('/mentores')}
        >
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(19, 236, 91, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
            <Ionicons name="sparkles" size={26} color={AppColors.primaryBioGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>{t('mentors.title')}</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>{t('mentors.subtitle')}</Text>
          </View>
        </TouchableOpacity>

        {/* Pill Trackers */}
        <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 15 }]}>
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 69, 0, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 69, 0, 0.3)' }}>
            <Ionicons name="flame" size={14} color="#FF4500" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FF4500', fontWeight: 'bold', fontSize: 11 }}>300 cal</Text>
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(19, 236, 91, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(19, 236, 91, 0.3)' }}>
            <Ionicons name="walk" size={14} color={AppColors.primaryBioGreen} style={{ marginRight: 6 }} />
            <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 11 }}>1,250 steps</Text>
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 209, 255, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)' }}>
            <Ionicons name="water" size={14} color="#00d1ff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#00d1ff', fontWeight: 'bold', fontSize: 11 }}>4 glasses</Text>
         </View>
      </View>
 
      <AtlasOrganico />

      {/* IA Prescription */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryOrange, borderWidth: 1 }]}>
         <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <View style={AppStyles.rowCentered}>
               <Ionicons name="nutrition" size={20} color={AppColors.primaryOrange} style={{ marginRight: 10 }} />
               <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>ESTADO NUTRICIONAL (IA)</Text>
            </View>
            <Text style={{ color: AppColors.primaryOrange, fontSize: 10 }}>HOY</Text>
         </View>
         
         <View style={{ gap: 12 }}>
            <View>
               <View style={AppStyles.rowBetween}>
                  <Text style={{ color: AppColors.textGray, fontSize: 10 }}>PROTEÍNAS</Text>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{proteins || 0}g / 180g</Text>
               </View>
               <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 5 }}>
                  <View style={{ height: '100%', backgroundColor: AppColors.primaryOrange, width: `${Math.min(((proteins || 0) / 180) * 100, 100)}%` }} />
               </View>
            </View>

            <View>
                <View style={AppStyles.rowBetween}>
                  <Text style={{ color: AppColors.textGray, fontSize: 10 }}>DIETA CEREBRAL (CARBS)</Text>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{carbs || 0}g / 250g</Text>
               </View>
               <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 5 }}>
                  <View style={{ height: '100%', backgroundColor: AppColors.primaryNeonBlue, width: `${Math.min(((carbs || 0) / 250) * 100, 100)}%` }} />
               </View>
            </View>
         </View>
      </View>

      {/* IA Recommendation */}
      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
         <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="hardware-chip" size={20} color={AppColors.primaryOrange} style={{ marginRight: 8 }} />
              <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Prescripción IA Dinámica</Text>
            </View>
            <Text style={{ color: AppColors.primaryOrange, fontSize: 12, fontWeight: 'bold' }}>HOY</Text>
         </View>
         <Text style={[AppStyles.textGray, { fontSize: 14, marginBottom: 15, lineHeight: 20 }]}>
            Tu HRV bajó a 65 y la carga del CNS está alta. Hemos ajustado tu sesión a <Text style={{ color: 'white', fontWeight: 'bold' }}>Movilidad y Fuerza Funcional (Zona 2)</Text> para optimizar tu longevidad.
         </Text>
         <TouchableOpacity 
          style={AppStyles.glowBtnOrange} 
          // @ts-ignore
          onPress={() => router.push('/entrenar')}
        >
          <Text style={AppStyles.glowBtnOrangeText}>Iniciar Sesión Adaptada</Text>
        </TouchableOpacity>
      </View>

      <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25 }]}>
        <View style={[AppStyles.rowBetween, { marginBottom: 20 }]}>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Centro Metabólico</Text>
          <Text style={{ color: AppColors.primaryBioGreen, fontWeight: '600' }}>Óptimo</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: AppColors.primaryNeonBlue, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>{hrv}</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>HRV</Text>
            </View>
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 14, fontWeight: '600' }]}>Corazón</Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: AppColors.primaryBioGreen, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>{score}%</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>SCORE</Text>
            </View>
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 14, fontWeight: '600' }]}>Longevidad</Text>
          </View>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: AppColors.primaryOrange, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>{glucose || 92}</Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>GLIC</Text>
            </View>
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 14, fontWeight: '600' }]}>Glucosa</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[AppStyles.glassCard, { padding: 15, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderStyle: 'dashed' }]}
        // @ts-ignore
        onPress={() => router.push('/analisis-longevidad')}
      >
        <View style={AppStyles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Análisis de Longevidad IA</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 2 }]}>Prénosticos basados en tus últimos 30 días.</Text>
          </View>
          <Ionicons name="sparkles" size={24} color={AppColors.primaryNeonBlue} />
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      <BioBriefing 
        visible={showBriefing} 
        onClose={() => setShowBriefing(false)} 
        userId={auth.currentUser?.uid || ''} 
      />
    </ScrollView>
    </View>
  );
}
