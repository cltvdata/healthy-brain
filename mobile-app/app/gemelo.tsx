import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { BioTwinService, BioTwinStats } from '@/services/BioTwinService';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function GemeloScreen() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [twinPhoto, setTwinPhoto] = useState<string | null>(null);
  const [twinStats, setTwinStats] = useState<BioTwinStats | null>(null);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    loadTwinData();
  }, []);

  const loadTwinData = async () => {
    if (!auth.currentUser) return;

    try {
      // Escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTwinPhoto(data.latestTwinPhoto || null);
        }
      });

      // Obtener estadísticas
      const stats = await BioTwinService.getTwinStats();
      setTwinStats(stats);
      setInsight(BioTwinService.generateEvolutionInsight(stats));

      setLoading(false);
      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading twin data:", error);
      setLoading(false);
    }
  };

  const takeNewPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para actualizar tu gemelo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await updateTwin(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await updateTwin(result.assets[0].uri);
    }
  };

  const updateTwin = async (uri: string) => {
    setUpdating(true);
    
    try {
      const success = await BioTwinService.updateTwinWithNewPhoto(uri, {
        notes: `Actualización del Gemelo - ${new Date().toLocaleDateString()}`
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Evolución Documentada', 'Tu progreso ha sido guardado. ¡Sigue así!');
        
        // Recargar datos
        const stats = await BioTwinService.getTwinStats();
        setTwinStats(stats);
        setInsight(BioTwinService.generateEvolutionInsight(stats));
      }
    } catch (error) {
      console.error("Error updating twin:", error);
      Alert.alert('Error', 'No se pudo actualizar tu Gemelo IA.');
    } finally {
      setUpdating(false);
    }
  };

  const nextMilestone = twinStats ? BioTwinService.getNextMilestone(twinStats.totalPhotos) : null;

  if (loading) {
    return (
      <View style={[AppStyles.body, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primaryBioGreen} />
        <Text style={[AppStyles.textWhite, { marginTop: 20 }]}>Cargando Gemelo IA...</Text>
      </View>
    );
  }

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        
        {/* Header */}
        <View style={[AppStyles.rowBetween, { marginBottom: 25 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>Gemelo Cinético IA</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Tu evolución física documentada</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Estado del Gemelo */}
        {!twinPhoto ? (
          // Sin Gemelo - Crear
          <View style={[AppStyles.glassCard, { padding: 30, alignItems: 'center', marginBottom: 20 }]}>
            <View style={styles.gemeloPlaceholder}>
              <Ionicons name="person-add" size={60} color={AppColors.primaryNeonBlue} />
            </View>
            <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }]}>
              Instancia tu Gemelo IA
            </Text>
            <Text style={[AppStyles.textGray, { textAlign: 'center', marginBottom: 25, lineHeight: 20 }]}>
              Sube una foto para crear tu gemelo digital.{"\n"}
              Trackeamos tu evolución física a lo largo del tiempo.{"\n"}
              Desbloquea logros por cada actualización.
            </Text>

            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity 
                onPress={takeNewPhoto}
                style={[AppStyles.glowBtnBlue, { flexDirection: 'row', gap: 8, paddingHorizontal: 20 }]}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={AppStyles.glowBtnBlueText}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={pickFromGallery}
                style={[AppStyles.glassCard, { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: AppColors.primaryOrange + '50' }]}
              >
                <Ionicons name="image" size={20} color={AppColors.primaryOrange} />
                <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold', fontSize: 12 }}>Galería</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Gemelo existente - Mostrar y actualizar
          <>
            {/* Foto actual del Gemelo */}
            <View style={[AppStyles.glassCard, { marginBottom: 20, padding: 0, overflow: 'hidden' }]}>
              <Image source={{ uri: twinPhoto }} style={{ width: '100%', height: 300, resizeMode: 'cover' }} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                <View style={[AppStyles.rowCentered, { gap: 8 }]}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.primaryBioGreen }} />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Gemelo Activo</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 5 }}>
                  Última actualización: {twinStats?.lastUpdate?.toLocaleDateString() || 'N/A'}
                </Text>
              </LinearGradient>
            </View>

            {/* Botones de actualización */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <TouchableOpacity 
                onPress={takeNewPhoto}
                disabled={updating}
                style={[AppStyles.glowBtnBioGreen, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <>
                    <Ionicons name="camera" size={18} color="black" />
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 13 }}>Nueva Foto</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={pickFromGallery}
                disabled={updating}
                style={[AppStyles.glassCard, { flex: 1, paddingVertical: 14, alignItems: 'center', borderColor: AppColors.primaryNeonBlue + '50' }]}
              >
                <Ionicons name="image" size={18} color={AppColors.primaryNeonBlue} />
                <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold', fontSize: 11, marginTop: 4 }}>Galería</Text>
              </TouchableOpacity>
            </View>

            {/* Estadísticas */}
            <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
              <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
                📊 Estadísticas de Evolución
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: AppColors.primaryBioGreen }]}>{twinStats?.totalPhotos || 0}</Text>
                  <Text style={styles.statLabel}>Fotos</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: AppColors.primaryNeonBlue }]}>{twinStats?.daysSinceStart || 0}</Text>
                  <Text style={styles.statLabel}>Días</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: AppColors.primaryOrange }]}>{twinStats?.currentStreak || 0}</Text>
                  <Text style={styles.statLabel}>Racha</Text>
                </View>
              </View>

              {/* Progreso hacia siguiente logro */}
              {nextMilestone && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 15 }}>
                  <View style={[AppStyles.rowBetween, { marginBottom: 10 }]}>
                    <Text style={{ color: AppColors.textGray, fontSize: 12 }}>Próximo Logro</Text>
                    <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold', fontSize: 12 }}>+{nextMilestone.reward} NTK</Text>
                  </View>
                  <Text style={{ color: AppColors.textWhite, fontWeight: 'bold', marginBottom: 8 }}>{nextMilestone.title}</Text>
                  <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.min(100, (twinStats?.totalPhotos || 0) / nextMilestone.target * 100)}%`, height: '100%', backgroundColor: AppColors.primaryOrange }} />
                  </View>
                  <Text style={{ color: AppColors.textGray, fontSize: 10, marginTop: 5 }}>
                    {(twinStats?.totalPhotos || 0)} / {nextMilestone.target} fotos
                  </Text>
                </View>
              )}
            </View>

            {/* Insight IA */}
            <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, backgroundColor: AppColors.primaryBioGreen + '10', borderColor: AppColors.primaryBioGreen + '30' }]}>
              <View style={[AppStyles.rowCentered, { gap: 10, marginBottom: 15 }]}>
                <Ionicons name="brain" size={22} color={AppColors.primaryBioGreen} />
                <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>Insight IA</Text>
              </View>
              <Text style={[AppStyles.textGray, { lineHeight: 22 }]}>{insight}</Text>
            </View>

            {/* Logros del Gemelo */}
            <View style={[AppStyles.glassCard, { padding: 20 }]}>
              <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
                🏆 Logros de Transformación
              </Text>
              
              <View style={{ gap: 10 }}>
                <AchievementRow 
                  icon="checkmark-circle" 
                  title="Primer Escaneo" 
                  desc="Sube tu primera foto" 
                  unlocked={twinStats && twinStats.totalPhotos >= 1} 
                />
                <AchievementRow 
                  icon="albums" 
                  title="Seguimiento Inicial" 
                  desc="5 fotos de evolución" 
                  unlocked={twinStats && twinStats.totalPhotos >= 5} 
                />
                <AchievementRow 
                  icon="library" 
                  title="Documentación Serial" 
                  desc="10 fotos de evolución" 
                  unlocked={twinStats && twinStats.totalPhotos >= 10} 
                />
                <AchievementRow 
                  icon="trophy" 
                  title="Transformación Total" 
                  desc="30 días documentados" 
                  unlocked={twinStats && twinStats.totalPhotos >= 30} 
                />
              </View>
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const AchievementRow = ({ icon, title, desc, unlocked }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: unlocked ? AppColors.primaryBioGreen + '10' : 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: unlocked ? AppColors.primaryBioGreen + '30' : 'transparent' }}>
    <Ionicons 
      name={icon as any} 
      size={24} 
      color={unlocked ? AppColors.primaryBioGreen : AppColors.textGray} 
    />
    <View style={{ flex: 1 }}>
      <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 13 }]}>{title}</Text>
      <Text style={[AppStyles.textGray, { fontSize: 11 }]}>{desc}</Text>
    </View>
    {unlocked && (
      <View style={{ backgroundColor: AppColors.primaryBioGreen + '30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
        <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>DESBLOQUEADO</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gemeloPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.primaryNeonBlue + '10',
    borderWidth: 2,
    borderColor: AppColors.primaryNeonBlue + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: AppColors.textGray,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});