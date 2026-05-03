import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Animated } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
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
import BioCycleCard from '@/components/BioCycleCard';
import { NativeHealthService, BioMetrics } from '@/services/NativeHealthService';
import { BioScoreService, BioImpactReport } from '@/services/BioScoreService';
import { StreakService, StreakState } from '@/services/StreakService';
import * as Haptics from 'expo-haptics';
import { WeeklyStabilityReport } from '@/components/WeeklyStabilityReport';

const { width } = Dimensions.get('window');

const TICKER_EVENTS = [
  "Soberano-88 ha sincronizado su pulso neural.",
  "Nuevo bloque de Bio-Soberanía minado en la red.",
  "Iniciativa 'Oxígeno Puro' ha recibido 1,200 votos.",
  "Alerta: Coherencia global en aumento (94%).",
  "Un ciudadano ha alcanzado el rango de Bio-Oráculo.",
  "Integridad de datos ZK-Verified al 100%.",
  "Propuesta territorial: Lagos de Silencio activada.",
];

export default function HomeScreen() {
  const { t, locale } = useLanguage();
  const pathname = usePathname();
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
  const [cycleState, setCycleState] = useState<any | null>(null);
  const [bioReport, setBioReport] = useState<BioImpactReport | null>(null);
  const [activeRisks, setActiveRisks] = useState<any[] | null>(null);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<any>(null);
  const [personalInsight, setPersonalInsight] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [shields, setShields] = useState(0);
  const [showProtection, setShowProtection] = useState(false);
  const bannerRef = React.useRef<BioBannerRef>(null);

  // Ticker Animation
  const [tickerIndex, setTickerIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cycleTicker = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_EVENTS.length);
      });
    };
    
    cycleTicker();
    const interval = setInterval(cycleTicker, 6500);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    const metrics = await NativeHealthService.fetchLatestMetrics();
    const history = await NativeHealthService.fetchWeeklyMetrics();
    
    if (metrics) {
      const report = BioScoreService.calculateScore(metrics);
      setBioReport(report);
      setScore(report.score);
      setHrv(metrics.hrv);
      setStepCount(metrics.steps);

      // Analyze risks based on weekly history
      const detectedRisks = BioScoreService.detectBiometricRisks(metrics, history);
      setActiveRisks(detectedRisks);

      if (detectedRisks && detectedRisks.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Personalized Coaching
      setPersonalInsight(BioScoreService.generatePersonalInsight(metrics, history));
      setCurrentChallenge(BioScoreService.getDailyChallenge(report));

      // Streak Logic
      if (auth.currentUser) {
        const streakData = await StreakService.processDailyScore(auth.currentUser.uid, report.score);
        if (streakData) {
          setStreak(streakData.currentStreak);
          setShields(streakData.bioShields || 0);
          if (streakData.needsProtection) {
            setShowProtection(true);
          }
        }
      }
    }
  };

  useEffect(() => {
    handleSync();
  }, []);

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
              BioNotificationService.setBannerRef(bannerRef.current);

              if (data.ntkBalance !== undefined) setNtk(data.ntkBalance);
              if (data.bioScore !== undefined) setScore(data.bioScore);
              if (data.hrv !== undefined) {
                 setHrv(data.hrv);
                 BioNotificationService.analyzeBioContext(data.hrv, data.bioScore || 85, data.ntkBalance || 0);
              }
              if (data.glucosa !== undefined) setGlucose(data.glucosa);
              if (data.userName) setUserName(data.userName);
              
              if (data.todaysMacros) {
                setProteins(data.todaysMacros.protein || 0);
                setCarbs(data.todaysMacros.carbs || 0);
                setFats(data.todaysMacros.fats || 0);
              }

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

              if (data.legalAccepted !== true && pathname !== '/legal-disclaimer') {
                router.replace('/legal-disclaimer' as any);
              }

              const lastReport = data.lastWeeklyReportDate?.toDate();
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);

              if (!lastReport || lastReport < weekAgo) {
                 const history = await NativeHealthService.fetchWeeklyMetrics();
                 const stabilityReport = BioScoreService.calculateWeeklyStability(history);
                 if (stabilityReport) {
                    setWeeklyReportData(stabilityReport);
                    setShowWeeklyReport(true);
                 }
              }
            }
          });
        });
      } catch (error) {
        console.error("Mobile Cloud Sync Error:", error);
      }
    };

    setupSync();

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

  const handleClaimReward = async (reward: number) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    await updateDoc(userRef, {
      ntkBalance: ntk + reward,
      lastWeeklyReportDate: serverTimestamp()
    });
    
    setShowWeeklyReport(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCompleteChallenge = async () => {
    if (!auth.currentUser || !currentChallenge) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    await updateDoc(userRef, {
      ntkBalance: ntk + currentChallenge.reward
    });
    
    setChallengeCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    SynergyService.postAchievement(
      'challenge',
      `Completó el reto biológico: ${currentChallenge.title}. ¡Soberanía expandida! 🧬`,
      currentChallenge.reward
    );
  };

  const handleUseShield = async () => {
    if (!auth.currentUser) return;
    const success = await StreakService.useShield(auth.currentUser.uid);
    if (success) {
      setShields(prev => prev - 1);
      setShowProtection(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handlePurchaseShield = async () => {
    if (!auth.currentUser) return;
    const success = await StreakService.purchaseShield(auth.currentUser.uid);
    if (success) {
      setShields(prev => prev + 1);
      setNtk(prev => prev - BioEconomy.COST_BIO_SHIELD);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
       <BioBanner ref={bannerRef} />
       <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
        
        {/* Global Sovereignty Ticker (Phase 103) */}
        <Animated.View style={[styles.tickerBar, { opacity: fadeAnim }]}>
           <Ionicons name="radio-outline" size={14} color={AppColors.primaryNeonBlue} />
           <Text style={styles.tickerText}>{TICKER_EVENTS[tickerIndex]}</Text>
        </Animated.View>

        {/* BIO-PROTECTION BANNER */}
        {showProtection && shields > 0 && (
          <LinearGradient
            colors={[AppColors.primaryNeonBlue, '#005577']}
            style={styles.protectionBanner}
          >
            <View style={AppStyles.rowAtStart}>
              <View style={{ flex: 1, marginRight: 15 }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>Racha en Peligro</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 }}>
                  Tu Bio-Score hoy no alcanzó el hito. Usa un escudo ahora.
                </Text>
              </View>
              <TouchableOpacity onPress={handleUseShield} style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>USAR ESCUDO</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

      {/* Header */}
      <View style={{ marginBottom: 25, marginTop: 10 }}>
        <View style={[AppStyles.rowBetween, { alignItems: 'flex-start' }]}>
           <View>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 4, letterSpacing: 1 }]}>{t('common.welcome').toUpperCase()}, {userName}</Text>
              <View style={AppStyles.rowCentered}>
                <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: '900' }]}>{t('home.bioStatus')} </Text>
                <Text style={{ fontSize: 24 }}>🧠</Text>
              </View>
           </View>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity 
                onPress={() => router.push('/passport' as any)}
                style={styles.circleIconBtn}
              >
                 <Ionicons name="id-card" size={24} color={AppColors.primaryBioGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/perfil-setup')} style={styles.circleIconBtn}>
                 <Ionicons name="settings" size={24} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
        </View>

        {/* BIO-STATUS BAR */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
           <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 107, 0, 0.05)', borderColor: 'rgba(255, 107, 0, 0.2)' }]}>
              <Ionicons name="flame" size={14} color="#FF6B00" />
              <Text style={{ color: '#FF6B00', fontWeight: 'bold', fontSize: 11 }}>{streak} DÍAS</Text>
           </View>
           <View style={[styles.statusBadge, { backgroundColor: 'rgba(0, 209, 255, 0.05)', borderColor: 'rgba(0, 209, 255, 0.2)' }]}>
              <Ionicons name="shield-half" size={14} color={AppColors.primaryNeonBlue} />
              <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold', fontSize: 11 }}>{shields} ESCUDOS</Text>
           </View>
        </View>
      </View>

      {/* Primary Action: Interlink (Neural Pulse) */}
      <TouchableOpacity 
        onPress={() => router.push('/sesion-enfoque')}
        style={[styles.premiumCard, { borderColor: AppColors.primaryBioGreen + '40' }]}
      >
        <LinearGradient
            colors={['rgba(19, 236, 91, 0.1)', 'transparent']}
            style={styles.cardGradient}
        />
        <View style={styles.cardIconBox}>
           <Ionicons name="pulse" size={26} color={AppColors.primaryBioGreen} />
        </View>
        <View style={{ flex: 1 }}>
           <Text style={styles.cardTitle}>{t('home.dopamineReset')} ⚡</Text>
           <Text style={styles.cardSub}>{t('home.dopamineResetSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
      </TouchableOpacity>

      {/* Analítica Link */}
      <TouchableOpacity 
        onPress={() => router.push('/progreso')}
        style={[styles.premiumCard, { borderColor: AppColors.primaryNeonBlue + '40' }]}
      >
        <LinearGradient
            colors={['rgba(0, 209, 255, 0.1)', 'transparent']}
            style={styles.cardGradient}
        />
        <View style={[styles.cardIconBox, { backgroundColor: 'rgba(0, 209, 255, 0.1)' }]}>
           <Ionicons name="analytics" size={26} color={AppColors.primaryNeonBlue} />
        </View>
        <View style={{ flex: 1 }}>
           <Text style={styles.cardTitle}>MATRIZ BIOGRÁFICA 📊</Text>
           <Text style={styles.cardSub}>Visualiza tu balance neuro-físico</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
      </TouchableOpacity>

      {/* BRAIN COACH IA */}
      <View style={styles.coachContainer}>
         <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <View style={AppStyles.rowCentered}>
                <Ionicons name="sparkles" size={18} color={AppColors.primaryNeonBlue} />
                <Text style={styles.coachLabel}>COACH PERSONAL IA</Text>
            </View>
            <Text style={styles.coachBadge}>NIVEL {level}</Text>
         </View>

         <Text style={styles.coachInsight}>"{personalInsight}"</Text>

         {currentChallenge && !challengeCompleted && (
            <TouchableOpacity onPress={handleCompleteChallenge} style={styles.challengeBox}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.challengeTag}>RETO DE SOBERANÍA</Text>
                  <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
                  <Text style={styles.challengeDesc}>{currentChallenge.task}</Text>
               </View>
               <View style={styles.challengeReward}>
                  <Text style={styles.rewardText}>+{currentChallenge.reward}</Text>
                  <Text style={styles.rewardSub}>NTK</Text>
               </View>
            </TouchableOpacity>
         )}
      </View>

      {/* Gamification Stats */}
      <View style={styles.xpRow}>
         <View style={{ flex: 1, marginRight: 20 }}>
            <View style={AppStyles.rowBetween}>
               <Text style={styles.xpLvl}>NIVEL {level}</Text>
               <Text style={styles.xpVal}>{xp}/1000 XP</Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${progress}%` }]} />
            </View>
         </View>
         <TouchableOpacity 
            onPress={() => router.push('/wallet' as any)}
            style={styles.ntkBadge}
          >
            <Ionicons name="diamond" size={16} color={AppColors.primaryOrange} />
            <Text style={styles.ntkTotal}>{ntk}</Text>
         </TouchableOpacity>
      </View>

      <AtlasOrganico hrv={hrv} score={score} />

      {/* Navigation Cluster */}
      <View style={styles.navCluster}>
         <NavButton 
            icon="basket" 
            label="Market" 
            sub="Canjear NTK" 
            color={AppColors.primaryOrange} 
            onPress={() => router.push('/market' as any)} 
         />
         <NavButton 
            icon="earth" 
            label="Red Global" 
            sub="Ranking ZK" 
            color={AppColors.primaryNeonBlue} 
            onPress={() => router.push('/ranking' as any)} 
         />
      </View>

      <TouchableOpacity 
        style={styles.mentorsBanner}
        onPress={() => router.push('/mentores' as any)}
      >
        <LinearGradient 
           colors={['rgba(19, 236, 91, 0.1)', 'rgba(0,0,0,0.3)']} 
           style={styles.mentorsGradient}
        />
        <View style={styles.mentorsIconBox}>
          <Ionicons name="infinite" size={26} color={AppColors.primaryBioGreen} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mentorsTitle}>{t('mentors.title')}</Text>
          <Text style={styles.mentorsSub}>{t('mentors.subtitle')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
      </TouchableOpacity>

      <View style={{ height: 60 }} />
      
      <BioBriefing 
        visible={showBriefing} 
        onClose={() => setShowBriefing(false)} 
        userId={auth.currentUser?.uid || ''} 
      />

      <WeeklyStabilityReport 
         visible={showWeeklyReport} 
         data={weeklyReportData} 
         onClose={handleClaimReward} 
      />
    </ScrollView>
    </View>
  );
}

const NavButton = ({ icon, label, sub, color, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.navBtn, { borderColor: color + '30' }]}>
    <Ionicons name={icon} size={22} color={color} style={{ marginBottom: 6 }} />
    <Text style={styles.navLabel}>{label}</Text>
    <Text style={styles.navSub}>{sub}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.1)',
    gap: 8
  },
  tickerText: {
    color: AppColors.primaryNeonBlue,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  protectionBanner: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  bannerBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12
  },
  bannerBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 10
  },
  circleIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    gap: 6
  },
  premiumCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 25,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden'
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5
  },
  cardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18
  },
  cardTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  cardSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2
  },
  coachContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 22,
    borderRadius: 30,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  coachLabel: {
    color: AppColors.primaryNeonBlue,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 2,
    marginLeft: 10
  },
  coachBadge: {
    color: AppColors.primaryBioGreen,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  coachInsight: {
    color: 'white',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 25,
    fontStyle: 'italic'
  },
  challengeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.15)',
    alignItems: 'center'
  },
  challengeTag: {
    color: AppColors.primaryNeonBlue,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 4
  },
  challengeTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  challengeDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2
  },
  challengeReward: {
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 15,
    marginLeft: 10
  },
  rewardText: {
    color: AppColors.primaryOrange,
    fontSize: 18,
    fontWeight: '900'
  },
  rewardSub: {
    color: AppColors.primaryOrange,
    fontSize: 8,
    fontWeight: 'bold'
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25
  },
  xpLvl: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  xpVal: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11
  },
  xpBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden'
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: AppColors.primaryNeonBlue
  },
  ntkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 0, 0.2)'
  },
  ntkTotal: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    marginLeft: 8
  },
  navCluster: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25
  },
  navBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 18,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center'
  },
  navLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  navSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    marginTop: 2,
    textTransform: 'uppercase'
  },
  mentorsBanner: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: AppColors.primaryBioGreen + '40',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },
  mentorsGradient: {
    ...StyleSheet.absoluteFillObject
  },
  mentorsIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(19, 236, 91, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18
  },
  mentorsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  mentorsSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2
  }
});
