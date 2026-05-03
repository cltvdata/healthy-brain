import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RecoveryService, MuscleState } from '@/services/RecoveryService';
import { BioIntelligenceService, BioRecommendation } from '@/services/BioIntelligenceService';
import BioRecoveryInteractive from '@/components/BioRecoveryInteractive';

export default function RecoveryDashboard() {
  const [muscleStates, setMuscleStates] = useState<MuscleState[]>([]);
  const [recommendation, setRecommendation] = useState<BioRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [muscles, advice] = await Promise.all([
      RecoveryService.getMuscleRecoveryState(),
      BioIntelligenceService.getDailyRecommendation()
    ]);
    setMuscleStates(muscles);
    setRecommendation(advice);
    setLoading(false);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 85) return AppColors.primaryBioGreen;
    if (percentage > 50) return AppColors.primaryOrange;
    return '#ff4444';
  };

  if (loading) {
    return (
      <View style={[AppStyles.body, AppStyles.centered]}>
        <ActivityIndicator size="large" color={AppColors.primaryNeonBlue} />
        <Text style={{ color: 'white', marginTop: 10 }}>SINCRONIZANDO BIOMETRÍA...</Text>
      </View>
    );
  }

  return (
    <View style={AppStyles.body}>
      {/* HUD Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BIO-RECUPERACIÓN</Text>
        <TouchableOpacity style={styles.injuryBtn}>
           <Text style={styles.injuryBtnText}>+ ADD INJURY</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Hologram Section */}
        <View style={styles.hologramContainer}>
           <BioRecoveryInteractive muscleStates={muscleStates} size={Dimensions.get('window').width * 0.8} />
           
           {/* Summary Tooltip */}
           <View style={[AppStyles.glassCard, styles.summaryCard]}>
              <Text style={styles.summaryLabel}>READINESS SCORE</Text>
              <Text style={[styles.summaryValue, { color: recommendation?.status === 'OPTIMAL' ? AppColors.primaryBioGreen : AppColors.primaryOrange }]}>
                {recommendation?.readinessScore}%
              </Text>
              <Text style={styles.summaryStatus}>{recommendation?.status}</Text>
           </View>
        </View>

        {/* AI Advice Banner */}
        {recommendation && (
          <View style={[AppStyles.glassCard, styles.adviceCard]}>
             <View style={AppStyles.rowBetween}>
                <Ionicons name="sparkles" size={24} color={AppColors.primaryNeonBlue} />
                <Text style={styles.adviceTag}>AI BIO-ADVISOR</Text>
             </View>
             <Text style={styles.adviceText}>{recommendation.primaryAdvise}</Text>
             {recommendation.bioNotes.map((note, idx) => (
               <View key={idx} style={styles.noteRow}>
                 <Ionicons name="analytics" size={14} color={AppColors.textGray} />
                 <Text style={styles.noteText}>{note}</Text>
               </View>
             ))}
          </View>
        )}

        {/* Detailed Muscle List */}
        <View style={styles.listHeader}>
           <Text style={styles.listHeaderText}>Muscle</Text>
           <Text style={styles.listHeaderText}>Recovery Rate</Text>
           <Text style={styles.listHeaderText}>Recovery Time</Text>
        </View>

        {muscleStates.map((m) => (
          <View key={m.id} style={styles.muscleRow}>
             <View style={{ flex: 1 }}>
                <Text style={styles.muscleName}>{m.name}</Text>
             </View>
             <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.musclePercent, { color: getStatusColor(m.recoveryPercentage) }]}>
                  {m.recoveryPercentage}%
                </Text>
             </View>
             <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.muscleTime}>{m.timeRemainingH}h</Text>
             </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const { Dimensions } = require('react-native');

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'black'
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  injuryBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  injuryBtnText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  hologramContainer: {
    alignItems: 'center',
    marginVertical: 20,
    height: 350,
  },
  summaryCard: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 15,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  summaryLabel: {
    color: AppColors.textGray,
    fontSize: 8,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  summaryStatus: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  adviceCard: {
    padding: 20,
    marginBottom: 30,
    borderColor: 'rgba(0, 209, 255, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primaryNeonBlue,
  },
  adviceTag: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  adviceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    lineHeight: 20
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  noteText: {
    color: AppColors.textGray,
    fontSize: 11,
    fontStyle: 'italic'
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  listHeaderText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  muscleName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  musclePercent: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic'
  },
  muscleTime: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  }
});
