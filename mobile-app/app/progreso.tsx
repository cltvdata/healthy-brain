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
        
        {/* Bio-Heatmap Section */}
        <BioHeatmap data={heatmapData} />

        {/* Radar Chart */}
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

        {/* Muscle Volume Growth Section */}
        <View style={[styles.cardHeader, { marginTop: 30 }]}>
           <Text style={styles.cardTitle}>Volumen de Carga Muscular</Text>
           <Text style={styles.cardSub}>Progreso acumulado: +12.5% este mes</Text>
        </View>
         <View style={styles.statsCard}>
            {/* Integrated Synergy Graphic (SVG) */}
            <Svg height="140" width={width - 80}>
              {/* Strength bars (Volume) */}
              {[40, 60, 45, 80, 55, 90, 85].map((h, i) => (
                <View key={i} style={{ position: 'absolute', bottom: 30, left: i * 40, width: 20, height: h, backgroundColor: 'rgba(255, 138, 0, 0.3)', borderRadius: 4 }} />
              ))}
              {/* Cardio Line (Intensity) */}
              <Polyline
                points={`10,100 50,85 130,52 170,70 210,60 250,45 290,10`}
                fill="none"
                stroke={AppColors.accentBlue}
                strokeWidth="3"
              />
              <Circle cx="290" cy="10" r="5" fill={AppColors.accentBlue} />
            </Svg>
            <View style={[AppStyles.rowBetween, { marginTop: 15 }]}>
               <View style={AppStyles.rowCentered}><View style={{ width: 8, height: 8, backgroundColor: 'rgba(255, 138, 0, 0.6)', marginRight: 5, borderRadius: 2 }} /><Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>VOLUMEN FUERZA</Text></View>
               <View style={AppStyles.rowCentered}><View style={{ width: 8, height: 8, backgroundColor: AppColors.accentBlue, marginRight: 5, borderRadius: 2 }} /><Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>INTENSIDAD CARDIO</Text></View>
            </View>
         </View>

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
