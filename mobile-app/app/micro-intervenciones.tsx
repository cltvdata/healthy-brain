import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SmartBreathingCoach } from '@/components/SmartBreathingCoach';
import * as Haptics from 'expo-haptics';

export default function MicroInterventionsScreen() {
  const [activeModule, setActiveModule] = useState<'none' | 'breath' | 'move' | 'sleep' | 'sun'>('none');
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Simulación del "Cerebro" NotebookLM dictando el contexto
  const getContextualProtocol = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return {
        phase: 'MAÑANA',
        title: 'Optimización Matutina',
        message: 'La IA sugiere maximizar la dopamina base. Tienes 10 minutos para configurar tu ritmo circadiano.',
        cards: ['sun', 'move']
      };
    } else if (currentHour >= 12 && currentHour < 19) {
      return {
        phase: 'TARDE',
        title: 'Mantenimiento de Enfoque',
        message: 'Llevas un bloque largo de actividad. La IA sugiere un reseteo parasimpático para evitar la fatiga adrenal.',
        cards: ['breath', 'move']
      };
    } else {
      return {
        phase: 'NOCHE',
        title: 'Preparación para el Sueño',
        message: 'Tu ritmo circadiano pide reducción de estímulos. La IA ha diseñado un protocolo para inducir melatonina.',
        cards: ['sleep', 'breath']
      };
    }
  };

  const context = getContextualProtocol();

  const toggleModule = (module: 'breath' | 'move' | 'sleep' | 'sun') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeModule === module) {
      setActiveModule('none');
    } else {
      setActiveModule(module);
    }
  };

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* HEADER POMELLI */}
      <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>{context.title}</Text>
          <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 1 }]}>NOTEBOOKLM: FASE {context.phase}</Text>
        </View>
      </View>

      <Text style={{ color: AppColors.textGray, fontSize: 14, marginBottom: 20, lineHeight: 22 }}>
        {context.message}
      </Text>

      {/* STITCH: Adaptive Card para Luz Solar (Mañana) */}
      {context.cards.includes('sun') && (
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => toggleModule('sun')}
          style={[
            styles.actionCard,
            activeModule === 'sun' ? styles.actionCardActiveYellow : null
          ]}
        >
          <View style={AppStyles.rowBetween}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="sunny" size={24} color={activeModule === 'sun' ? AppColors.textBlack : '#ffd700'} style={{ marginRight: 15 }} />
              <Text style={[
                styles.cardTitle,
                activeModule === 'sun' ? { color: AppColors.textBlack } : null
              ]}>Exposición Fotónica</Text>
            </View>
            <Text style={[styles.timeTag, activeModule === 'sun' ? { color: AppColors.textBlack, borderColor: AppColors.textBlack } : null]}>10 MIN</Text>
          </View>

          {activeModule === 'sun' && (
            <View style={styles.expandedContent}>
              <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 15, textAlign: 'center', fontWeight: '500' }}>
                Mira hacia el cielo (sin gafas) para un pico de cortisol saludable. Vibraré cuando pasen 10 minutos.
              </Text>
              <TouchableOpacity style={[AppStyles.glowBtnOrange, { backgroundColor: '#ffd700', shadowColor: '#ffd700' }]}>
                <Text style={AppStyles.glowBtnOrangeText}>INICIAR TIMER HÁPTICO</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* STITCH: Adaptive Card para Respiración (Tarde/Noche) */}
      {context.cards.includes('breath') && (
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => toggleModule('breath')}
          style={[
            styles.actionCard,
            activeModule === 'breath' ? styles.actionCardActiveBlue : null
          ]}
        >
          <View style={AppStyles.rowBetween}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="water" size={24} color={activeModule === 'breath' ? AppColors.textBlack : AppColors.primaryNeonBlue} style={{ marginRight: 15 }} />
              <Text style={[
                styles.cardTitle,
                activeModule === 'breath' ? { color: AppColors.textBlack } : null
              ]}>Reseteo Parasimpático</Text>
            </View>
            <Text style={[styles.timeTag, activeModule === 'breath' ? { color: AppColors.textBlack, borderColor: AppColors.textBlack } : null]}>10 MIN</Text>
          </View>

          {activeModule === 'breath' && (
            <View style={styles.expandedContent}>
              <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 15, textAlign: 'center', fontWeight: '500' }}>
                Protocolo 4-7-8 adaptativo. Sigue la vibración y el pulso visual.
              </Text>
              <SmartBreathingCoach isActive={true} />
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* STITCH: Adaptive Card para Movimiento (Mañana/Tarde) */}
      {context.cards.includes('move') && (
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => toggleModule('move')}
          style={[
            styles.actionCard,
            activeModule === 'move' ? styles.actionCardActiveOrange : null
          ]}
        >
          <View style={AppStyles.rowBetween}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="flash" size={24} color={activeModule === 'move' ? AppColors.textBlack : AppColors.primaryOrange} style={{ marginRight: 15 }} />
              <Text style={[
                styles.cardTitle,
                activeModule === 'move' ? { color: AppColors.textBlack } : null
              ]}>Activación Metabólica</Text>
            </View>
            <Text style={[styles.timeTag, activeModule === 'move' ? { color: AppColors.textBlack, borderColor: AppColors.textBlack } : null]}>10 MIN</Text>
          </View>

          {activeModule === 'move' && (
            <View style={styles.expandedContent}>
              <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 15, textAlign: 'center', fontWeight: '500' }}>
                Secuencia sugerida por tu historial: 30 sentadillas, 2 min plancha, estiramiento de psoas.
              </Text>
              <TouchableOpacity style={AppStyles.glowBtnOrange}>
                <Text style={AppStyles.glowBtnOrangeText}>INICIAR SECUENCIA</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* STITCH: Adaptive Card para Sueño Profundo (Noche) */}
      {context.cards.includes('sleep') && (
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => toggleModule('sleep')}
          style={[
            styles.actionCard,
            activeModule === 'sleep' ? styles.actionCardActivePurple : null
          ]}
        >
          <View style={AppStyles.rowBetween}>
            <View style={AppStyles.rowCentered}>
              <Ionicons name="moon" size={24} color={activeModule === 'sleep' ? AppColors.textBlack : '#a855f7'} style={{ marginRight: 15 }} />
              <Text style={[
                styles.cardTitle,
                activeModule === 'sleep' ? { color: AppColors.textBlack } : null
              ]}>Inducción de Melatonina</Text>
            </View>
            <Text style={[styles.timeTag, activeModule === 'sleep' ? { color: AppColors.textBlack, borderColor: AppColors.textBlack } : null]}>10 MIN</Text>
          </View>

          {activeModule === 'sleep' && (
            <View style={styles.expandedContent}>
              <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 15, textAlign: 'center', fontWeight: '500' }}>
                Frecuencias hápticas ultra-bajas. Cierra los ojos y deja el teléfono en tu pecho.
              </Text>
              <SmartBreathingCoach isActive={true} mode="sleep" />
            </View>
          )}
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: AppColors.surfaceGlass,
    borderColor: AppColors.borderGlass,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  actionCardActiveBlue: {
    backgroundColor: AppColors.primaryNeonBlue,
    borderColor: AppColors.primaryNeonBlue,
    shadowColor: AppColors.primaryNeonBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  actionCardActiveOrange: {
    backgroundColor: AppColors.primaryOrange,
    borderColor: AppColors.primaryOrange,
    shadowColor: AppColors.primaryOrange,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  actionCardActiveYellow: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  actionCardActivePurple: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeTag: {
    color: AppColors.textGray,
    fontSize: 12,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: AppColors.textGray,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  }
});
