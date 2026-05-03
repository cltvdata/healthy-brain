import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseMetadata } from '@/constants/ExercisesDB';

interface Props {
  visible: boolean;
  onClose: () => void;
  exercise: ExerciseMetadata | null;
}

export default function ExerciseCoach({ visible, onClose, exercise }: Props) {
  if (!exercise) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{exercise.name.toUpperCase()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* Visual Guide (GIF) */}
            <View style={styles.videoContainer}>
               <Image 
                 source={{ uri: exercise.gifUrl }} 
                 style={styles.gif}
                 resizeMode="contain"
               />
               <View style={styles.scanlines} pointerEvents="none" />
            </View>

            {/* Muscle Map Hint */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>MÚSCULOS TRABAJADOS</Text>
               <View style={styles.muscleTags}>
                  {exercise.primaryMuscles.map(m => (
                    <View key={m} style={[styles.tag, { borderColor: AppColors.primaryBioGreen }]}>
                      <Text style={[styles.tagText, { color: AppColors.primaryBioGreen }]}>{m.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                  ))}
                  {exercise.secondaryMuscles.map(m => (
                    <View key={m} style={[styles.tag, { borderColor: AppColors.textGray }]}>
                      <Text style={[styles.tagText, { color: AppColors.textGray }]}>{m.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                  ))}
               </View>
            </View>

            {/* Instructions */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>EJECUCIÓN TÉCNICA</Text>
               {exercise.instructions.map((step, i) => (
                 <View key={i} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                 </View>
               ))}
            </View>

            {/* Bio Insight */}
            <View style={[AppStyles.glassCard, styles.insightCard]}>
               <View style={AppStyles.rowCentered}>
                  <Ionicons name="flash" size={18} color={AppColors.primaryNeonBlue} style={{ marginRight: 8 }} />
                  <Text style={styles.insightTitle}>BIO-INSIGHT</Text>
               </View>
               <Text style={styles.insightText}>{exercise.bioInsight}</Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#050505',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    flex: 1,
  },
  closeBtn: {
    padding: 5,
  },
  scroll: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#111',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: AppColors.primaryNeonBlue,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    opacity: 0.5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  stepNum: {
    color: AppColors.primaryNeonBlue,
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    width: 25,
  },
  stepText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  insightCard: {
    padding: 20,
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primaryNeonBlue,
  },
  insightTitle: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  insightText: {
    color: 'white',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  }
});
