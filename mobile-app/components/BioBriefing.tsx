import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { BioNotification, BioNotificationService } from '@/services/NotificationService';

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function BioBriefing({ visible, onClose, userId }: Props) {
  const [notifications, setNotifications] = useState<BioNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && userId) {
      loadBriefing();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, userId]);

  const loadBriefing = async () => {
    setLoading(true);
    const unread = await BioNotificationService.getUnreadForBriefing(userId);
    setNotifications(unread);
    setLoading(false);
  };

  const handleFinish = async () => {
    if (notifications.length > 0) {
      await BioNotificationService.markAllAsRead(userId, notifications.map(n => n.id!));
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          
          {/* HUD Header */}
          <View style={styles.header}>
            <View style={AppStyles.rowCentered}>
              <View style={[styles.pulse, { backgroundColor: AppColors.primaryBioGreen }]} />
              <Text style={styles.headerTitle}>BIO-STATUS BRIEFING</Text>
            </View>
            <Text style={styles.sessionText}>SESIÓN ACTIVA: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.welcomeTitle}>Bienvenido, Explorador</Text>
            <Text style={styles.subtitle}>Esto es lo que ha ocurrido desde tu última sincronización:</Text>

            {loading ? (
              <Text style={AppStyles.textGray}>ANALIZANDO RED DE SINERGIA...</Text>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="shield-checkmark" size={48} color={AppColors.primaryBioGreen} style={{ marginBottom: 15 }} />
                <Text style={[AppStyles.textWhite, { textAlign: 'center' }]}>Todo bajo control. Tu sistema biológico está estable y no hay alertas críticas.</Text>
              </View>
            ) : (
              notifications.map((notif, idx) => (
                <View key={idx} style={styles.notifItem}>
                   <View style={styles.iconBox}>
                      <Ionicons 
                        name={notif.type === 'glow' ? "star" : (notif.type === 'mentor' ? "chatbubble-ellipses" : "flash")} 
                        size={20} 
                        color={notif.type === 'glow' ? AppColors.primaryOrange : AppColors.primaryNeonBlue} 
                      />
                   </View>
                   <View style={{ flex: 1 }}>
                      <Text style={styles.notifMsg}>{notif.message}</Text>
                   </View>
                </View>
              ))
            )}

            {/* AI Advisor Preview */}
            <View style={styles.mentorPreview}>
               <Text style={styles.mentorLabel}> CONSEJO DEL DÍA (IA)</Text>
               <Text style={styles.mentorText}>"Tu HRV ha mostrado una tendencia positiva. Es el momento ideal para realizar tu entrenamiento de mayor intensidad."</Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={{ paddingBottom: 20 }}>
            <TouchableOpacity style={styles.btn} onPress={handleFinish}>
              <Text style={styles.btnText}>ENTENDIDO (BIO-SYNC)</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 20
  },
  headerTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  sessionText: {
    color: AppColors.textGray,
    fontSize: 10,
    fontFamily: 'monospace'
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  scroll: {
    flex: 1,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 20
  },
  subtitle: {
    color: AppColors.textGray,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 20
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primaryNeonBlue
  },
  iconBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    borderRadius: 12,
    marginRight: 15
  },
  notifMsg: {
    color: 'white',
    fontSize: 13,
    lineHeight: 18
  },
  mentorPreview: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(255, 69, 0, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)'
  },
  mentorLabel: {
    color: AppColors.primaryOrange,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10
  },
  mentorText: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 20
  },
  btn: {
    backgroundColor: AppColors.primaryOrange,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primaryOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  btnText: {
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
