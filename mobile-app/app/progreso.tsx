import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Line, Circle, Polyline } from 'react-native-svg';
import { db, auth } from '@/constants/FirebaseConfig';
import { router } from 'expo-router';
import { collection, query, orderBy, limit, onSnapshot, doc, getDocs, where, Timestamp } from 'firebase/firestore';
import { BioHeatmap } from '@/components/HistoryCharts';
import { NativeHealthService, BioMetrics } from '@/services/NativeHealthService';
import { BioScoreService } from '@/services/BioScoreService';
import { BioTrendChart } from '@/components/BioTrendChart';
import { BioDistributionBars } from '@/components/BioDistributionBars';
import { Image, TextInput } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Bio-Radar Chart (5 Axes)
 */
const RadarChart = ({ data }: { data: number[] }) => {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / 5;

  const points = data.map((val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * (val / 100) * Math.cos(angle);
    const y = center + radius * (val / 100) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1].map(r => {
    return data.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${center + radius * r * Math.cos(angle)},${center + radius * r * Math.sin(angle)}`;
    }).join(' ');
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Svg height={size} width={size}>
        {gridPoints.map((p, i) => (
          <Polygon key={i} points={p} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {data.map((_, i) => {
           const angle = i * angleStep - Math.PI / 2;
           return <Line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.05)" />;
        })}
        <Polygon points={points} fill="rgba(0, 255, 128, 0.2)" stroke={AppColors.primaryBioGreen} strokeWidth="2" />
      </Svg>
    </View>
  );
};

export default function ProgresoScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ date: string, score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    fuerza: 85,
    enfoque: 92,
    movilidad: 65,
    resistencia: 75,
    recuperacion: 80
  });

  const [wearableInput, setWearableInput] = useState({
    steps: '',
    sleep: '',
    hrv: ''
  });
  const [weeklyData, setWeeklyData] = useState<BioMetrics[]>([]);
  const [activeRisks, setActiveRisks] = useState<any[] | null>(null);
  const [showManualSync, setShowManualSync] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await NativeHealthService.fetchWeeklyMetrics();
      setWeeklyData(history);
      
      // Calculate averaged stats for radar
      if (history.length > 0) {
        const avgHrv = history.reduce((sum, h) => sum + h.hrv, 0) / history.length;
        const avgSteps = history.reduce((sum, h) => sum + h.steps, 0) / history.length;
        
        setStats({
          fuerza: Math.min((avgSteps / 5000) * 100, 100),
          enfoque: Math.min((avgHrv / 60) * 100, 100),
          movilidad: 75,
          resistencia: Math.min((avgSteps / 8000) * 100, 100),
          recuperacion: Math.round(history[history.length - 1].sleepHours * 12.5)
        });

        // Detect risks for visual highlighting
        const risks = BioScoreService.detectBiometricRisks(history[history.length - 1], history.slice(0, -1));
        setActiveRisks(risks);
      }
    };
    
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const logsRef = collection(userRef, 'logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(15));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    });

    // Heatmap Query (Last 30 Days)
    const fetchHeatmap = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35);
      
      const qH = query(
        logsRef, 
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp', 'asc')
      );
      
      const snap = await getDocs(qH);
      const hData = snap.docs.map(d => {
        const data = d.data();
        const date = (data.timestamp as Timestamp).toDate().toISOString().split('T')[0];
        return { date, score: data.score || 85 };
      });
      setHeatmapData(hData);
      setLoading(false);
    };

    fetchHeatmap();
    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'diet': return 'restaurant';
      case 'focus': return 'pulse-outline';
      case 'workout': return 'fitness';
      case 'sleep': return 'moon';
      default: return 'stats-chart';
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'diet': return AppColors.primaryOrange;
      case 'focus': return AppColors.primaryBioGreen;
      case 'workout': return AppColors.primaryNeonBlue;
      case 'cardio': return AppColors.accentBlue;
      case 'sleep': return '#8B5CF6';
      default: return AppColors.textGray;
    }
  };

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
        
        {/* PREMIUM 3D TWIN EVOLUTION SECTION */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 5 }]}>Evolución Cinética</Text>
          <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 15 }]}>Comparativa de recomposición corporal basada en IA</Text>

          <View style={{ gap: 15 }}>
            {/* CURRENT BUILD (30% FAT) */}
            <LinearGradient 
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', minHeight: 140, alignItems: 'center' }}
            >
               <View style={{ flex: 1, zIndex: 2 }}>
                  <Text style={[AppStyles.textWhite, { fontSize: 32, fontWeight: '900' }]}>30%</Text>
                  <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginTop: -5 }]}>BODY FAT</Text>
                  <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold', marginTop: 5, letterSpacing: 1 }}>ESTADO ACTUAL</Text>
               </View>
               <View style={{ position: 'absolute', right: 0, bottom: -20, opacity: 0.5 }}>
                 {/* Placeholder for 30% body model */}
                 <Ionicons name="body" size={160} color="rgba(255,255,255,0.4)" />
               </View>
            </LinearGradient>

            {/* LEAN BUILD (8% FAT) */}
            <LinearGradient 
              colors={['rgba(0, 255, 128, 0.1)', 'rgba(0, 209, 255, 0.05)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 20, borderWidth: 1, borderColor: AppColors.primaryBioGreen, flexDirection: 'row', minHeight: 140, alignItems: 'center' }}
            >
               <View style={{ flex: 1, zIndex: 2 }}>
                  <Text style={[AppStyles.textWhite, { fontSize: 32, fontWeight: '900' }]}>8%</Text>
                  <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginTop: -5 }]}>BODY FAT</Text>
                  <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold', marginTop: 5, letterSpacing: 1 }}>GEMELO FIT & LEAN</Text>
               </View>
               <View style={{ position: 'absolute', right: 0, bottom: -20, opacity: 0.8 }}>
                 {/* Placeholder for lean body model */}
                 <Ionicons name="body" size={160} color={AppColors.primaryBioGreen} />
               </View>
            </LinearGradient>
          </View>

          {/* TISSULAR COMPOSITION MAP */}
          <View style={{ marginTop: 20, padding: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', textAlign: 'center', marginBottom: 15, letterSpacing: 1 }}>MAPA DE COMPOSICIÓN TISULAR PROYECTADA</Text>
            
            {/* Composition Bar */}
            <View style={{ height: 10, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden', marginBottom: 15 }}>
               <View style={{ height: '100%', width: '30%', backgroundColor: AppColors.primaryNeonBlue, position: 'absolute', left: 0 }} />
               <View style={{ height: '100%', width: '10%', backgroundColor: AppColors.primaryBioGreen, position: 'absolute', left: '30%', borderLeftWidth: 2, borderColor: 'black' }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.primaryNeonBlue, marginRight: 5 }} />
                  <Text style={{ color: 'white', fontSize: 9 }}>GRASA ACTUAL (30%)</Text>
               </View>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.primaryBioGreen, marginRight: 5 }} />
                  <Text style={{ color: 'white', fontSize: 9 }}>META ATHLETIC (8%)</Text>
               </View>
            </View>
          </View>
        </View>

        {/* Bio-Heatmap Section */}
        <BioHeatmap data={heatmapData} />

        {/* Radar Chart Head */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25 }]}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }]}>Analítica Biográfica</Text>
          <View style={[AppStyles.rowBetween, { marginTop: 5 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>Rendimiento 🧬</Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/bio-report', params: { style: 'clinical' } } as any)}
              style={{ backgroundColor: AppColors.primaryBioGreen + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderColor: AppColors.primaryBioGreen + '30', borderWidth: 1 }}
            >
              <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>📄 EMITIR REPORTE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI BIO-ASSISTANT INSTRUCTIONS INCORPORATION */}
        <View style={[styles.cardHeader, { marginTop: 10 }]}>
           <Text style={styles.cardTitle}>Bio-Insight de IA</Text>
           <Text style={styles.cardSub}>Asesoría adaptativa según tus biomarcadores</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(0, 209, 255, 0.05)', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)', marginBottom: 30, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 209, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
            <Ionicons name="sparkles" size={20} color={AppColors.primaryNeonBlue} />
          </View>
          <View style={{ flex: 1 }}>
             <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: '900', fontSize: 12, marginBottom: 5 }}>SISTEMA NERVIOSO: TENSO</Text>
             <Text style={{ color: 'white', fontSize: 12, lineHeight: 18, fontStyle: 'italic' }}>
               "Tus últimas sesiones generaron un alto volumen muscular, pero has dormido bajo la cuota regenerativa (+7h). Prioriza movilidad articular y LISS cardiovascular hoy para evitar hipertrofia asimétrica."
             </Text>
          </View>
        </View>

        {/* Bio-Radar Section */}
        <View style={styles.cardHeader}>
           <Text style={styles.cardTitle}>Radar Bio-Integral</Text>
           <Text style={styles.cardSub}>Balance de sistemas (Mental + Físico)</Text>
        </View>
        <LinearGradient 
          colors={['rgba(255,255,255,0.03)', 'transparent']}
          style={styles.statsCard}
        >
          <RadarChart data={[stats.fuerza, stats.enfoque, stats.movilidad, stats.resistencia, stats.recuperacion]} />
          
          <View style={styles.radarLegend}>
             <View style={styles.legendItem}><Text style={styles.legendText}>Fuerza</Text></View>
             <View style={styles.legendItem}><Text style={styles.legendText}>Enfoque</Text></View>
             <View style={styles.legendItem}><Text style={styles.legendText}>Movilidad</Text></View>
             <View style={styles.legendItem}><Text style={styles.legendText}>Resistencia</Text></View>
             <View style={styles.legendItem}><Text style={styles.legendText}>Descanso</Text></View>
          </View>
        </LinearGradient>

        {/* NEW: Automated Progress Charts */}
        <View style={[styles.cardHeader, { marginTop: 30 }]}>
           <Text style={styles.cardTitle}>Análisis de Tendencia IA</Text>
           <Text style={styles.cardSub}>Basado en tus biomarcadores de los últimos 7 días</Text>
        </View>

        {weeklyData.length > 0 && (
          <>
            <BioTrendChart 
              data={weeklyData.map(d => BioScoreService.calculateScore(d).score)} 
              label="Evolución Bio-Soberanía" 
              color={AppColors.primaryBioGreen} 
            />
            
            <BioTrendChart 
              data={weeklyData.map(d => d.hrv)} 
              label="Estado del Sistema Nervioso (HRV)" 
              color={AppColors.primaryNeonBlue} 
              hasAlert={activeRisks?.some(r => r.type === 'CNS_FATIGUE')}
            />

            <BioDistributionBars 
              data={weeklyData.map(d => ({
                deep: d.sleepStages.deepMinutes,
                rem: d.sleepStages.remMinutes,
                light: d.sleepStages.lightMinutes,
                date: d.timestamp.toLocaleDateString([], { weekday: 'short' })
              }))} 
            />
          </>
        )}

        {/* Community Synergy Section */}
        <View style={[styles.cardHeader, { marginTop: 30 }]}>
           <Text style={styles.cardTitle}>Sinergia de la Bio-Elite</Text>
           <Text style={styles.cardSub}>Impacto de la comunidad en tiempo real</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: 'rgba(255, 138, 0, 0.05)', borderColor: 'rgba(255, 138, 0, 0.2)' }]}>
           <View style={AppStyles.rowBetween}>
              <View>
                 <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>4,250 kg</Text>
                 <Text style={AppStyles.textGray}>Levantados hoy</Text>
              </View>
              <Ionicons name="people" size={32} color={AppColors.primaryOrange} />
           </View>
        </View>

        {/* WEARABLE SYNC SECTION */}
        <View style={[styles.cardHeader, { marginTop: 40 }]}>
           <Text style={styles.cardTitle}>Conexión Smart Devices</Text>
           <Text style={styles.cardSub}>Actualiza tus métricas desde Apple Health, Garmin o ingresos manuales de tu Smartwatch.</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
          {/* Integrated Services */}
          {[
            { icon: 'watch', name: 'Apple', color: '#FFF' },
            { icon: 'fitness', name: 'Google Fit', color: '#4285F4' },
            { icon: 'hardware-chip', name: 'Garmin', color: '#007CC3' },
            { icon: 'radio', name: 'Oura', color: '#97825C' }
          ].map((device, idx) => (
            <TouchableOpacity key={idx} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, alignItems: 'center', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }}>
               <Ionicons name={device.icon as any} size={20} color={device.color} />
               <Text style={{ color: 'white', fontSize: 8, marginTop: 5, fontWeight: 'bold' }}>{device.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={() => setShowManualSync(!showManualSync)}
          style={{ backgroundColor: showManualSync ? 'rgba(0, 209, 255, 0.1)' : 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 15, alignItems: 'center', borderColor: showManualSync ? AppColors.primaryNeonBlue : 'rgba(255,255,255,0.1)', borderWidth: 1 }}
        >
           <View style={AppStyles.rowCentered}>
             <Ionicons name="create-outline" color={showManualSync ? AppColors.primaryNeonBlue : "white"} size={16} />
             <Text style={{ color: showManualSync ? AppColors.primaryNeonBlue : 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }}>INGRESO MANUAL DE SMARTWATCH</Text>
           </View>
        </TouchableOpacity>

        {showManualSync && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 15, padding: 20, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
             <Text style={{ color: AppColors.textGray, fontSize: 10, fontWeight: 'bold', marginBottom: 15 }}>Inserta los datos como figuran en tu pulsera inteligente:</Text>
             <View style={{ flexDirection: 'row', gap: 10 }}>
               <View style={{ flex: 1 }}>
                 <Text style={styles.legendText}>Pasos hoy</Text>
                 <TextInput
                   placeholder="Ej. 8500"
                   placeholderTextColor="#666"
                   keyboardType="numeric"
                   style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, color: 'white', marginTop: 5 }}
                 />
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.legendText}>Horas de sueño</Text>
                 <TextInput
                   placeholder="Ej. 7.5"
                   placeholderTextColor="#666"
                   keyboardType="numeric"
                   style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, color: 'white', marginTop: 5 }}
                 />
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.legendText}>Kcal activas</Text>
                 <TextInput
                   placeholder="Ej. 450"
                   placeholderTextColor="#666"
                   keyboardType="numeric"
                   style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, color: 'white', marginTop: 5 }}
                 />
               </View>
             </View>
             <TouchableOpacity style={{ backgroundColor: AppColors.primaryBioGreen, padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' }}>
               <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 12 }}>SINCRONIZAR A LA IA</Text>
             </TouchableOpacity>
          </View>
        )}

        {/* Timeline (Unified Cloud Logs) */}
        <View style={[styles.cardHeader, { marginTop: 30 }]}>
           <Text style={styles.cardTitle}>Historial Bio-Cloud</Text>
           <Text style={styles.cardSub}>Actividad unificada (Cloud Sync)</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={AppColors.primaryBioGreen} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.timelineContainer}>
            {logs.length === 0 ? (
              <View style={[AppStyles.glassCard, { padding: 30, alignItems: 'center' }]}>
                 <Ionicons name="cloud-offline-outline" size={32} color="rgba(255,255,255,0.1)" />
                 <Text style={[AppStyles.textGray, { textAlign: 'center', marginTop: 10, fontSize: 12 }]}>No hay actividad reciente en la nube.</Text>
              </View>
            ) : (
              logs.map((log, index) => (
                <View key={log.id} style={styles.logRow}>
                   <View style={[styles.iconCircle, { backgroundColor: getColor(log.type) + '20', borderColor: getColor(log.type) + '40' }]}>
                      <Ionicons name={getIcon(log.type)} size={16} color={getColor(log.type)} />
                   </View>
                   <View style={styles.logTextContainer}>
                      <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold' }]}>
                        {log.type === 'diet' ? (log.foodName || 'Carga Nutricional') : log.type === 'focus' ? 'Sesión de Enfoque' : log.type === 'workout' ? 'Entrenamiento' : 'Actividad'}
                      </Text>
                      <Text style={[AppStyles.textGray, { fontSize: 10 }]}>
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                      </Text>
                      {log.type === 'nutrition' && (
                        <View style={{ backgroundColor: AppColors.primaryBioGreen + '20', padding: 12, borderRadius: 12, marginTop: 10 }}>
                          <Text style={{ color: AppColors.primaryBioGreen, fontSize: 12, fontWeight: 'bold' }}>{log.category === 'meal' ? 'NUTRICIÓN CELULAR' : 'SUPLEMENTACIÓN'}</Text>
                          <Text style={{ color: 'white', fontSize: 14, marginTop: 4 }}>{log.title}</Text>
                        </View>
                      )}

                      {log.type === 'workout' && (
                        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                          <View style={AppStyles.rowBetween}>
                            <Text style={{ color: AppColors.primaryOrange, fontSize: 11, fontWeight: 'bold' }}>{log.cardio ? 'BIO-SESSION MIX' : 'GIMNASIO'}</Text>
                            {log.cardio && <Ionicons name="flash" size={12} color={AppColors.accentBlue} />}
                          </View>
                          
                          <Text style={{ color: 'white', fontSize: 14, marginTop: 4, fontWeight: '600' }}>{log.title}</Text>
                          
                          {/* Exercises list */}
                          {log.exercises && (
                            <Text style={{ color: AppColors.textGray, fontSize: 10, marginTop: 4 }}>
                              {log.exercises.map((ex: any) => ex.name).join(' • ')}
                            </Text>
                          )}

                          {/* Cardio overlay if exists */}
                          {log.cardio && (
                            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', gap: 10 }}>
                               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                 <Ionicons name="time-outline" size={10} color={AppColors.accentBlue} style={{ marginRight: 4 }} />
                                 <Text style={{ color: AppColors.accentBlue, fontSize: 10 }}>{log.cardio.minutes} min</Text>
                               </View>
                               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                 <Ionicons name="flame-outline" size={10} color={AppColors.accentBlue} style={{ marginRight: 4 }} />
                                 <Text style={{ color: AppColors.accentBlue, fontSize: 10 }}>{log.cardio.calories} kcal</Text>
                               </View>
                            </View>
                          )}
                        </View>
                      )}
                   </View>
                   <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 12 }}>
                        {log.value ? `+${log.value}` : '+0'} NTK
                      </Text>
                      <Text style={styles.cardSub}>{log.type === 'diet' ? `${log.calories} kcal` : `${log.durationMinutes || 25} min`}</Text>
                   </View>
                   {index < logs.length - 1 && <View style={styles.connector} />}
                </View>
              ))
            )}
            
            <TouchableOpacity style={[AppStyles.glassCard, { padding: 15, alignItems: 'center', marginTop: 10 }]}>
               <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold' }]}>VER TODO EL HISTORIAL</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    marginBottom: 15
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  cardSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4
  },
  statsCard: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  radarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10
  },
  legendItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6
  },
  legendText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  timelineContainer: {
    marginTop: 10,
    paddingLeft: 5
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 15,
    position: 'relative'
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  logTextContainer: {
    flex: 1
  },
  connector: {
    position: 'absolute',
    left: 20,
    top: 40,
    bottom: -25,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 1
  }
});
