import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { AppColors } from '@/constants/AppStyles';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 80) / 7;

interface HistoryData {
  date: string; // YYYY-MM-DD
  score: number;
}

export const BioHeatmap = ({ data }: { data: HistoryData[] }) => {
  // Generar últimos 35 días (5 semanas)
  const days = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const iso = d.toISOString().split('T')[0];
    const log = data.find(l => l.date === iso);
    return { iso, score: log ? log.score : 0 };
  });

  const getColor = (score: number) => {
    if (score === 0) return 'rgba(255,255,255,0.05)';
    if (score < 50) return '#FF450030';
    if (score < 70) return AppColors.primaryOrange + '60';
    if (score < 85) return AppColors.primaryNeonBlue + '80';
    return AppColors.primaryBioGreen;
  };

  return (
    <View style={styles.container}>
       <View style={styles.header}>
          <Text style={styles.title}>CONSISTENCIA DE LONGEVIDAD</Text>
          <Text style={styles.subtitle}>Últimos 35 días de Bio-Sync</Text>
       </View>
       
       <View style={styles.grid}>
          {days.map((day, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { backgroundColor: getColor(day.score) }
              ]} 
            />
          ))}
       </View>

       <View style={styles.legend}>
          <Text style={styles.legendText}>Inactivo</Text>
          <View style={[styles.miniDot, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          <View style={[styles.miniDot, { backgroundColor: AppColors.primaryOrange + '40' }]} />
          <View style={[styles.miniDot, { backgroundColor: AppColors.primaryNeonBlue + '80' }]} />
          <View style={[styles.miniDot, { backgroundColor: AppColors.primaryBioGreen }]} />
          <Text style={styles.legendText}>Elite</Text>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 25
  },
  header: {
    marginBottom: 15
  },
  title: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center'
  },
  dot: {
    width: GRID_SIZE - 4,
    height: GRID_SIZE - 4,
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 5
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 8,
    marginHorizontal: 4
  }
});
