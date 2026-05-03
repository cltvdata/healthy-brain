import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { AppColors } from '@/constants/AppStyles';

const { width } = Dimensions.get('window');

interface SleepDay {
  deep: number;
  rem: number;
  light: number;
  date: string;
}

interface BioDistributionBarsProps {
  data: SleepDay[];
}

export const BioDistributionBars: React.FC<BioDistributionBarsProps> = ({ data }) => {
  const chartWidth = width - 80;
  const barWidth = (chartWidth / data.length) - 10;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARQUITECTURA DEL SUEÑO (7 DÍAS)</Text>
      
      <View style={styles.chartArea}>
        {data.map((day, i) => {
          const total = day.deep + day.rem + day.light;
          const deepPct = (day.deep / total) * 100;
          const remPct = (day.rem / total) * 100;
          const lightPct = (day.light / total) * 100;

          return (
            <View key={i} style={[styles.barColumn, { width: barWidth }]}>
              <View style={[styles.segment, { height: `${lightPct}%`, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={[styles.segment, { height: `${remPct}%`, backgroundColor: AppColors.primaryBioGreen }]} />
              <View style={[styles.segment, { height: `${deepPct}%`, backgroundColor: AppColors.primaryNeonBlue }]} />
              <Text style={styles.dayLabel}>{day.date}</Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: AppColors.primaryNeonBlue }]} />
          <Text style={styles.legendText}>PROFUNDO</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: AppColors.primaryBioGreen }]} />
          <Text style={styles.legendText}>REM</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <Text style={styles.legendText}>LIGERO</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 20,
  },
  chartArea: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  segment: {
    width: '100%',
    borderRadius: 2,
    marginBottom: 1,
  },
  dayLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: 'bold',
  }
});
