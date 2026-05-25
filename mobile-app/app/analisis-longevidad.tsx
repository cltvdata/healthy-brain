import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { BioForecasting } from '@/services/BioForecasting';

const { width } = Dimensions.get('window');

export default function AnalisisLongevidad() {
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [bioScore, setBioScore] = useState(0);
  const [hrv, setHrv] = useState(0);
  const [steps, setSteps] = useState(0);
  const [ntk, setNtk] = useState(0);
  
  // Projections
  const [metabolicAge, setMetabolicAge] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [userAge, setUserAge] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      setBioScore(data.bioScore || 75);
      setHrv(data.hrv || 55);
      setSteps(data.steps || 8000);
      setNtk(data.ntkBalance || 0);
      setUnlocked(data.longevityUnlocked || false);
      setUserAge(data.age || 30);
      
      const mAge = BioForecasting.estimateMetabolicAge(data.age || 30, data.hrv || 55, data.steps || 8000);
      setMetabolicAge(mAge);
      setPrediction(BioForecasting.getInsight(data.bioScore || 75, mAge - (data.age || 30), 0));
    }
    setLoading(false);
  };

  const handleUnlock = async () => {
    if (ntk < 50) {
      alert("Necesitas 50 NTK para procesar este análisis profundo.");
      return;
    }
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ntkBalance: increment(-50),
        longevityUnlocked: true
      });
      setUnlocked(true);
      setNtk(prev => prev - 50);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <View style={AppStyles.body}><Text style={AppStyles.textWhite}>PROCESANDO RED BIO-NEURAL...</Text></View>;

  const twinData = BioForecasting.project2050(userAge, bioScore, hrv);

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 50 }}>
        
        {/* Header */}
        <View style={{ paddingTop: 40, marginBottom: 30 }}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }]}>Fase 49: Bio-Forecasting</Text>
          <View style={[AppStyles.rowBetween, { marginTop: 5 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>Predicción Longevidad ⏳</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={32} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          </View>
        </View>

        {!unlocked ? (
          <View style={styles.lockContainer}>
             <Ionicons name="lock-closed" size={60} color={AppColors.primaryOrange} />
             <Text style={styles.lockTitle}>Análisis Bloqueado</Text>
             <Text style={styles.lockSub}>Para proyectar tu longevidad real, debemos realizar 10k simulaciones en la red NTK. Esto consume recursos computacionales.</Text>
             
             <View style={styles.payBox}>
                <Text style={styles.costText}>COSTO: 50 NTK</Text>
                <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                   <Text style={styles.unlockBtnText}>DESBLOQUEAR ANÁLISIS</Text>
                </TouchableOpacity>
             </View>

             <Text style={[AppStyles.textGray, { fontSize: 10, marginTop: 20 }]}>Saldo Actual: {ntk} NTK</Text>
          </View>
        ) : (
          <View>
             {/* Metabolic Age Card */}
             <LinearGradient 
              colors={[AppColors.primaryBioGreen + '20', 'transparent']}
              style={[AppStyles.glassCard, { padding: 25, marginBottom: 25, alignItems: 'center' }]}
             >
                <Text style={[AppStyles.textGray, { fontSize: 14, fontWeight: 'bold' }]}>EDAD METABÓLICA</Text>
                <Text style={styles.ageValue}>{metabolicAge}</Text>
                <Text style={styles.ageLabel}>Años Biológicos</Text>
                <View style={[styles.badge, { backgroundColor: metabolicAge < userAge - 2 ? AppColors.primaryBioGreen : AppColors.primaryOrange }]}>
                   <Text style={{ color: 'black', fontSize: 10, fontWeight: 'bold' }}>{metabolicAge < userAge - 2 ? 'SOBERANÍA ÓPTIMA' : 'MODO RECUPERACIÓN'}</Text>
                </View>
             </LinearGradient>

             {/* Forecast Insights */}
             <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
                <Text style={styles.sectionTitle}>INSIGHT IA (PRONÓSTICO)</Text>
                <Text style={styles.predictionText}>{prediction}</Text>
             </View>

             {/* Bio-Twin 2050 Projection (NEW) */}
             <View style={[AppStyles.glassCard, { padding: 25, marginBottom: 25, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}>
                 <View style={AppStyles.rowBetween}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Bio-Twin 🧬 2050</Text>
                    <View style={{ backgroundColor: 'rgba(0, 209, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                       <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold' }}>ESTIMACIÓN ZKP</Text>
                    </View>
                 </View>
                 
                 <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                       <Text style={{ color: AppColors.textGray, fontSize: 11 }}>PROBABILIDAD DE SOBERANÍA LONGEVA (PSL)</Text>
                       <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', marginTop: 5 }}>{twinData.probability}%</Text>
                    </View>
                    <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: AppColors.primaryNeonBlue, alignItems: 'center', justifyContent: 'center' }}>
                       <Ionicons name="infinite" size={32} color={AppColors.primaryNeonBlue} />
                    </View>
                 </View>

                 <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20, marginTop: 15, fontStyle: 'italic' }}>
                    "{twinData.narrative}"
                 </Text>
              </View>

             {/* Chart Simulation */}
             <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, height: 180 }]}>
                <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 20 }]}>TENDENCIA BIO-SCORE (30 DÍAS)</Text>
                <View style={styles.chartArea}>
                   <View style={[styles.bar, { height: '60%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                   <View style={[styles.bar, { height: '70%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                   <View style={[styles.bar, { height: '65%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                   <View style={[styles.bar, { height: '85%', backgroundColor: AppColors.primaryBioGreen }]} />
                   <View style={[styles.bar, { height: '75%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                   <View style={[styles.bar, { height: '90%', backgroundColor: AppColors.primaryNeonBlue }]} />
                </View>
                <View style={AppStyles.rowBetween}>
                   <Text style={styles.chartDate}>SEMANA 1</Text>
                   <Text style={styles.chartDate}>PROYECCIÓN</Text>
                </View>
             </View>

             {/* Longevity Pillars */}
             <View style={{ gap: 15, marginBottom: 30 }}>
                <View style={styles.pillarItem}>
                   <Ionicons name="heart" size={24} color={AppColors.primaryNeonBlue} />
                   <Text style={styles.pillarText}>Resiliencia Cardíaca: <Text style={{ color: 'white', fontWeight: 'bold' }}>94%</Text></Text>
                </View>
                <View style={[styles.pillarItem, { alignSelf: 'flex-end', width: '90%' }]}>
                   <Ionicons name="leaf" size={24} color={AppColors.primaryBioGreen} />
                   <Text style={styles.pillarText}>Capacidad Celular: <Text style={{ color: 'white', fontWeight: 'bold' }}>Excelente</Text></Text>
                </View>
             </View>

             <TouchableOpacity 
              style={[AppStyles.glowBtnOrange, { marginTop: 20, height: 65 }]}
              // @ts-ignore
              onPress={() => router.push('/certificado')}
             >
                <Text style={AppStyles.glowBtnOrangeText}>GENERAR CERTIFICADO OFICIAL</Text>
             </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20
  },
  lockTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20
  },
  lockSub: {
    color: AppColors.textGray,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 15,
    lineHeight: 22
  },
  payBox: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center'
  },
  costText: {
    color: AppColors.primaryOrange,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 20
  },
  unlockBtn: {
    backgroundColor: 'white',
    height: 60,
    width: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unlockBtnText: {
    color: 'black',
    fontWeight: '900',
    letterSpacing: 1
  },
  ageValue: {
    color: 'white',
    fontSize: 72,
    fontWeight: '900',
    marginVertical: 10
  },
  ageLabel: {
    color: AppColors.primaryBioGreen,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 20
  },
  sectionTitle: {
    color: AppColors.primaryNeonBlue,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1
  },
  predictionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic'
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 10
  },
  bar: {
    width: (width - 100) / 6,
    borderRadius: 5
  },
  chartDate: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    borderRadius: 20,
    gap: 15
  },
  pillarText: {
    color: AppColors.textGray,
    fontSize: 14
  }
});
