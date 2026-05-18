import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';

import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WeeklyStabilityReportProps {
  visible: boolean;
  onClose: (reward: number) => void;
  data: {
    stability: number;
    grade: string;
    reward: number;
    avgScore: number;
  } | null;
}

export const WeeklyStabilityReport: React.FC<WeeklyStabilityReportProps> = ({ visible, onClose, data }) => {
  if (!data) return null;

  const size = width * 0.6;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (data.stability / 100) * circumference;

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'S': return AppColors.primaryBioGreen;
      case 'A': return AppColors.primaryNeonBlue;
      case 'B': return AppColors.primaryOrange;
      default: return AppColors.textGray;
    }
  };

  const gradeColor = getGradeColor(data.grade);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <View style={styles.centeredView}>
          <LinearGradient
            colors={['rgba(20, 20, 25, 0.95)', 'rgba(10, 10, 15, 0.98)']}
            style={styles.modalView}
          >
            <View style={styles.header}>
              <Text style={styles.title}>REPORTE DE ESTABILIDAD</Text>
              <Text style={styles.subtitle}>Ciclo de 7 días completado</Text>
            </View>

            {/* Radial Stability Gauge */}
            <View style={styles.gaugeContainer}>
              <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={gradeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </G>
                <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', top: size/4 }]}>
                    <Text style={[styles.gradeText, { color: gradeColor }]}>{data.grade}</Text>
                    <Text style={styles.stabilityVal}>{data.stability}%</Text>
                    <Text style={styles.stabilityLabel}>ESTABILIDAD</Text>
                </View>
              </Svg>
            </View>

            {/* Summary Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                 <Text style={styles.statSub}>MEDIA BIO-SCORE</Text>
                 <Text style={styles.statVal}>{data.avgScore}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={styles.statSub}>RECOMPENSA MÉRITO</Text>
                 <View style={AppStyles.rowCentered}>
                    <Text style={[styles.statVal, { color: AppColors.primaryBioGreen }]}>+{data.reward}</Text>
                    <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, marginLeft: 4, fontWeight: 'bold' }}>NTK</Text>
                 </View>
              </View>
            </View>

            <View style={styles.messageBox}>
               <Ionicons name="ribbon-outline" size={24} color={gradeColor} style={{ marginBottom: 10 }} />
               <Text style={styles.messageText}>
                 {data.grade === 'S' 
                   ? '¡Soberanía total! Tu sistema nervioso ha mantenido una resiliencia impecable esta semana.' 
                   : data.grade === 'A'
                   ? 'Felicidades por tu constancia. Estás construyendo una base biológica sólida.'
                   : 'Buen intento. Mantener hábitos estables es la clave para la próxima semana.'}
               </Text>
            </View>

            <TouchableOpacity 
              style={[styles.claimButton, { backgroundColor: gradeColor }]} 
              onPress={() => onClose(data.reward)}
            >
              <Text style={styles.claimButtonText}>RECLAMAR RECOMPENSAS</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    width: '100%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 5,
  },
  gaugeContainer: {
    height: width * 0.6,
    width: width * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  gradeText: {
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
  },
  stabilityVal: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -10,
  },
  stabilityLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statVal: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageBox: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  messageText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  claimButton: {
    width: '100%',
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButtonText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  }
});
