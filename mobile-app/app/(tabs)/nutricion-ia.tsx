import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, Image, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { SynergyService } from '@/services/SynergyService';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { BioCycleService, BioCycleState } from '@/services/BioCycleService';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');

export default function NutritionIAScreen() {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanProgress] = useState(new Animated.Value(0));
  const [cycleState, setCycleState] = useState<BioCycleState | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Cargar estado de ciclo desde Firebase ──
  useEffect(() => {
    const fetchCycle = async () => {
      if (auth.currentUser) {
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.enableCycleTracking && data.lastPeriodDate) {
            const state = BioCycleService.calculateState(data.lastPeriodDate, data.cycleLength || 28);
            setCycleState(state);
          }
        }
      }
    };
    fetchCycle();
  }, []);

  // ── Análisis de imagen mock (simula IA) ──
  const analyzeImage = (imageUri: string) => {
    setAnalyzing(true);
    scanProgress.setValue(0);
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      setAnalyzing(false);
      generateMockResult();
    });
  };

  const generateMockResult = () => {
    let personalizedAdvice = '';
    if (cycleState) {
      if (cycleState.phase === 'Menstrual') personalizedAdvice = '⚠️ Prioriza Hierro y Magnesio.';
      if (cycleState.phase === 'Folicular') personalizedAdvice = '⚡ Óptimo para metabolizar estrógenos.';
      if (cycleState.phase === 'Ovulatoria') personalizedAdvice = '🔥 Pico de energía: Buen soporte antioxidante.';
      if (cycleState.phase === 'Lútea') personalizedAdvice = '🌙 Enfócate en carbohidratos complejos.';
    }
    setScanResult({
      name: 'Bowl de Proteína y Vegetales',
      calories: 450,
      macros: { protein: 35, carbs: 45, fats: 12 },
      bioScore: 94,
      ntkReward: 12,
      hormonalAdvice: personalizedAdvice,
    });
  };

  // ── ABRIR CÁMARA ──
  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para analizar tu comida.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setScanResult(null);
      analyzeImage(result.assets[0].uri);
    }
  };

  // ── ABRIR GALERÍA ──
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setScanResult(null);
      analyzeImage(result.assets[0].uri);
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    scanProgress.setValue(0);
  };

  const syncNutrition = async () => {
    if (!auth.currentUser || !scanResult) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ntkBalance: increment(scanResult.ntkReward),
        'todaysMacros.protein': increment(scanResult.macros.protein),
        'todaysMacros.carbs': increment(scanResult.macros.carbs),
        'todaysMacros.fats': increment(scanResult.macros.fats),
      });
      await SynergyService.postAchievement(
        'nutrition',
        `Sincronizó un ${scanResult.name} con un Bio-Impacto de ${scanResult.bioScore}%.`,
        scanResult.ntkReward,
      );
      Alert.alert('¡Sincronización Exitosa!', `+${scanResult.ntkReward} NTK otorgados.`);
      resetScan();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo sincronizar la nutrición.');
    }
  };

  const scanLineTranslate = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });

  return (
    <View style={styles.container}>
      {/* ── Vista de imagen capturada o placeholder de cámara ── */}
      <View style={styles.cameraArea}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#060d18', '#0a1520']} style={StyleSheet.absoluteFill} />
        )}

        {/* Scan line animation */}
        {analyzing && (
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />
        )}

        {/* Grid overlay */}
        <View style={styles.gridOverlay} pointerEvents="none">
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.gridRow} />
          ))}
        </View>
      </View>

      {/* ── HUD Overlay ── */}
      <View style={styles.hudContainer} pointerEvents="box-none">
        <View style={styles.hudTop}>
          <Text style={styles.hudTitle}>IA NUTRICIÓN</Text>
          <View style={AppStyles.rowCentered}>
            <View style={[styles.statusDot, {
              backgroundColor: analyzing ? AppColors.primaryOrange : AppColors.primaryBioGreen
            }]} />
            <Text style={styles.statusText}>{analyzing ? 'ANALIZANDO' : 'READY'}</Text>
          </View>
        </View>

        {/* Viewfinder corners */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.sidebarLeft}>
          <Text style={styles.miniData}>ISO: 800</Text>
          <Text style={styles.miniData}>DYN: 92%</Text>
          <Text style={styles.miniData}>BIO: ACT</Text>
        </View>
        <View style={styles.sidebarRight}>
          <Text style={styles.miniData}>X: 12.5</Text>
          <Text style={styles.miniData}>Y: 45.2</Text>
          <Text style={styles.miniData}>Z: 00.1</Text>
        </View>
      </View>

      {/* ── Footer con controles ── */}
      <View style={styles.footer}>
        {!capturedImage && !scanResult ? (
          <>
            {/* Botones principales: Cámara y Galería */}
            <View style={styles.captureRow}>
              {/* Galería */}
              <TouchableOpacity style={styles.sideBtn} onPress={openGallery}>
                <Ionicons name="images-outline" size={26} color="white" />
                <Text style={styles.sideBtnText}>GALERÍA</Text>
              </TouchableOpacity>

              {/* Botón cámara principal */}
              <TouchableOpacity onPress={openCamera} style={styles.scanBtn}>
                <View style={styles.scanBtnInner}>
                  <Ionicons name="camera" size={32} color="black" />
                </View>
              </TouchableOpacity>

              {/* Subir Screenshot */}
              <TouchableOpacity style={styles.sideBtn} onPress={openGallery}>
                <Ionicons name="cloud-upload-outline" size={26} color="white" />
                <Text style={styles.sideBtnText}>SUBIR</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>Toma una foto o sube una imagen de tu comida</Text>
          </>
        ) : analyzing ? (
          <View style={styles.analyzingCard}>
            <ActivityIndicator color={AppColors.primaryNeonBlue} size="large" />
            <Text style={styles.analyzingText}>Analizando macros con IA...</Text>
            <Animated.View style={[styles.progressBar, {
              width: scanProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
            }]} />
          </View>
        ) : scanResult ? (
          <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.resultCard}>
              {/* Header del resultado */}
              <View style={AppStyles.rowBetween}>
                <Text style={styles.resultTitle}>{scanResult.name}</Text>
                <View style={[styles.scoreBadge, { borderColor: AppColors.primaryBioGreen }]}>
                  <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold' }}>{scanResult.bioScore}%</Text>
                </View>
              </View>

              {/* Contexto hormonal */}
              {scanResult.hormonalAdvice ? (
                <View style={{
                  backgroundColor: (cycleState?.color || AppColors.primaryNeonBlue) + '20',
                  padding: 10, borderRadius: 12, marginBottom: 15,
                  borderLeftWidth: 4, borderLeftColor: cycleState?.color || AppColors.primaryNeonBlue
                }}>
                  <Text style={{ color: cycleState?.color || AppColors.primaryNeonBlue, fontSize: 10, fontWeight: '900' }}>
                    {cycleState?.phase?.toUpperCase()} CONTEXT IA:
                  </Text>
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>{scanResult.hormonalAdvice}</Text>
                </View>
              ) : null}

              {/* Calorías */}
              <View style={styles.caloriesRow}>
                <Ionicons name="flame" size={18} color={AppColors.primaryOrange} />
                <Text style={styles.caloriesText}>{scanResult.calories} kcal</Text>
              </View>

              {/* Macros */}
              <Text style={styles.macroLabel}>MACROS DETECTADOS</Text>
              <View style={styles.macroRow}>
                <MacroItem value={`${scanResult.macros.protein}g`} label="PROTEÍNA" color={AppColors.primaryNeonBlue} />
                <MacroItem value={`${scanResult.macros.carbs}g`} label="CARBS" color={AppColors.primaryOrange} />
                <MacroItem value={`${scanResult.macros.fats}g`} label="GRASAS" color={AppColors.primaryBioGreen} />
              </View>

              {/* Botones de acción */}
              <TouchableOpacity style={styles.syncBtn} onPress={syncNutrition}>
                <Text style={styles.syncBtnText}>REGISTRAR EN MI PERFIL</Text>
                <View style={styles.ntkBadge}>
                  <Text style={styles.ntkVal}>+{scanResult.ntkReward} NTK</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={{ marginTop: 12, alignSelf: 'center' }} onPress={resetScan}>
                <Text style={AppStyles.textGray}>Descartar y escanear de nuevo</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const MacroItem = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <View style={styles.macroItem}>
    <Text style={[styles.macroVal, { color }]}>{value}</Text>
    <Text style={styles.macroType}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraArea: { flex: 1, backgroundColor: '#0a1520', overflow: 'hidden' },
  capturedImage: { width: '100%', height: '100%' },
  scanLine: {
    position: 'absolute', width: '100%', height: 2,
    backgroundColor: AppColors.primaryNeonBlue,
    shadowColor: AppColors.primaryNeonBlue, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 10,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    opacity: 0.06,
  },
  gridRow: { width: '100%', height: 1, backgroundColor: 'white' },
  hudContainer: { ...StyleSheet.absoluteFillObject, padding: 20 },
  hudTop: {
    position: 'absolute', top: 55, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
  },
  hudTitle: {
    color: 'white', fontSize: 16, fontWeight: '900',
    letterSpacing: 2, fontStyle: 'italic',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { color: AppColors.textGray, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  viewfinder: {
    position: 'absolute', top: '20%', left: '15%',
    width: '70%', height: '40%',
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: 'rgba(0, 209, 255, 0.5)' },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  sidebarLeft: { position: 'absolute', left: 15, top: '35%' },
  sidebarRight: { position: 'absolute', right: 15, top: '35%' },
  miniData: {
    color: 'rgba(0, 209, 255, 0.3)', fontSize: 8,
    marginBottom: 5, fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute', bottom: 0, width: '100%',
    maxHeight: height * 0.55, paddingBottom: 30,
  },
  captureRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 20, paddingVertical: 10, paddingHorizontal: 30,
  },
  sideBtn: { alignItems: 'center', gap: 6, padding: 12 },
  sideBtnText: {
    color: 'rgba(255,255,255,0.5)', fontSize: 9,
    fontWeight: '900', letterSpacing: 1,
  },
  scanBtn: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', padding: 5,
  },
  scanBtnInner: {
    flex: 1, borderRadius: 35,
    backgroundColor: AppColors.primaryOrange,
    justifyContent: 'center', alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.3)', textAlign: 'center',
    fontSize: 11, paddingHorizontal: 20,
  },
  analyzingCard: {
    backgroundColor: 'rgba(5,10,20,0.95)',
    margin: 20, borderRadius: 20, padding: 30,
    alignItems: 'center', gap: 15,
    borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.2)',
  },
  analyzingText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  progressBar: {
    height: 3, backgroundColor: AppColors.primaryNeonBlue,
    borderRadius: 2, alignSelf: 'flex-start',
  },
  resultScroll: { maxHeight: height * 0.5 },
  resultCard: {
    backgroundColor: 'rgba(5,10,20,0.97)',
    marginHorizontal: 15, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  resultTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  caloriesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginVertical: 12,
  },
  caloriesText: { color: AppColors.primaryOrange, fontSize: 20, fontWeight: '900' },
  macroLabel: {
    color: AppColors.textGray, fontSize: 9,
    marginBottom: 12, fontWeight: 'bold', letterSpacing: 1,
  },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroVal: { fontSize: 18, fontWeight: 'bold' },
  macroType: { color: AppColors.textGray, fontSize: 8, marginTop: 4, fontWeight: '900' },
  syncBtn: {
    backgroundColor: AppColors.primaryNeonBlue, height: 56,
    borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18,
  },
  syncBtnText: { color: 'black', fontWeight: '900', letterSpacing: 0.5, fontSize: 13 },
  ntkBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  ntkVal: { color: 'black', fontWeight: 'bold', fontSize: 11 },
});
