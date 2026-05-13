import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { auth, db } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import GeminiVisionService, { GeminiAnalysisResult } from '@/services/GeminiVisionService';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type AppState = 'camera' | 'barcode' | 'analyzing' | 'results' | 'history';

export default function NutricionIAScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [appState, setAppState] = useState<AppState>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState('Iniciando Bio-Scanner...');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAxioms, setSelectedAxioms] = useState<string[]>([]);
  const [history, setHistory] = useState<GeminiAnalysisResult[]>([]);
  const [isEliteUser, setIsEliteUser] = useState(false);
  
  const [devTapCount, setDevTapCount] = useState(0);
  
  const cameraRef = useRef<any>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (appState === 'camera') {
      startScanAnimation();
    }
    checkUserSeniority();
  }, [appState]);

  const checkUserSeniority = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // If already persistent elite, just set local state
        if (data.isElite) {
          setIsEliteUser(true);
          return;
        }

        if (data.createdAt) {
          const createdDate = data.createdAt.toDate();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          if (createdDate < sixMonthsAgo) {
            setIsEliteUser(true);
            // Persist to Firestore
            await updateDoc(userRef, { isElite: true });
            
            // Elite Welcome Haptic & Alert
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            console.log("Elite status unlocked and persisted!");
          }
        }
      }
    } catch (e) {
      console.log("Error checking seniority:", e);
    }
  };

  const startScanAnimation = () => {
    scanAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
      setSelectedImage(photo.uri);
      startAnalysis(photo.base64);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      startAnalysis(result.assets[0].base64 || "");
    }
  };

  const startAnalysis = async (base64Data: string) => {
    setAppState('analyzing');
    setAnalysisProgress(0);
    
    const texts = [
      "Identificando estructuras moleculares...", 
      "Consultando Bio-Cloud...", 
      "Calculando impacto glucémico...", 
      "Generando veredicto Bio-IA..."
    ];
    let step = 0;

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + 0.05;
        if (newProgress > 0.25 && step === 0) { step = 1; setAnalysisText(texts[1]); }
        if (newProgress > 0.50 && step === 1) { step = 2; setAnalysisText(texts[2]); }
        if (newProgress > 0.75 && step === 2) { step = 3; setAnalysisText(texts[3]); }
        return Math.min(newProgress, 0.95);
      });
    }, 150);

    try {
      let cyclePhaseContext = '';
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        cyclePhaseContext = userDoc.data()?.currentHormonalPhase || '';
      }

      // Simulate network delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await GeminiVisionService.analyzeImage(base64Data, cyclePhaseContext);
      setAnalysisResult(result);
      
      setAnalysisProgress(1);
      clearInterval(progressInterval);
      setTimeout(() => setAppState('results'), 500);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error("Analysis error:", error);
      clearInterval(progressInterval);
      setAppState('camera');
    }
  };

  const saveToDiary = async () => {
    if (!auth.currentUser || !analysisResult) return;
    setIsSaving(true);
    
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const logsRef = collection(userRef, 'logs');

      await addDoc(logsRef, {
        type: analysisResult.type === 'food' || analysisResult.type === 'beverage' ? 'diet' : 'health',
        category: analysisResult.type,
        name: analysisResult.name,
        imageUrl: selectedImage || "",
        macros: analysisResult.macros,
        calories: analysisResult.calories,
        axioms: selectedAxioms,
        healthData: analysisResult.healthData || null,
        timestamp: serverTimestamp()
      });

      const axiomBonus = selectedAxioms.length * 10;
      const eliteBonus = isEliteUser ? 50 : 0;
      const ntkReward = (analysisResult.ntkReward || 15) + axiomBonus + eliteBonus;
      
      await updateDoc(userRef, {
        ntkBalance: increment(ntkReward), 
        totalCalories: increment(analysisResult.calories || 0),
        protein: increment(analysisResult.macros?.protein || 0),
        carbs: increment(analysisResult.macros?.carbs || 0),
        fats: increment(analysisResult.macros?.fats || 0),
        nutritionScans: increment(1)
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/');
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadHistory = async () => {
    setAppState('history');
    const historyData = await GeminiVisionService.getAnalysisHistory();
    setHistory(historyData);
  };

  if (!permission) return <View style={AppStyles.body} />;
  if (!permission.granted) {
    return (
      <View style={[AppStyles.body, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="camera-outline" size={80} color={AppColors.primaryBioGreen} style={{ marginBottom: 20 }} />
        <Text style={[AppStyles.textWhite, { textAlign: 'center', marginBottom: 30, fontSize: 16 }]}>
          Para hackear tu nutrición, necesitamos acceso a la cámara.
        </Text>
        <TouchableOpacity style={AppStyles.glowBtnGreen} onPress={requestPermission}>
          <Text style={AppStyles.glowBtnGreenText}>CONCEDER ACCESO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });

  return (
    <View style={AppStyles.body}>
      {/* Header */}
      <View style={{ padding: 20, paddingTop: 50, zIndex: 10 }}>
        <View style={AppStyles.rowBetween}>
          <TouchableOpacity onPress={() => appState === 'camera' ? router.back() : setAppState('camera')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={[
            styles.badge, 
            isEliteUser && { borderColor: AppColors.primaryOrange, shadowColor: AppColors.primaryOrange, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }
          ]}>
            <View style={[styles.dot, { backgroundColor: isEliteUser ? AppColors.primaryOrange : AppColors.primaryBioGreen }]} />
            <Text style={[styles.badgeText, isEliteUser && { color: AppColors.primaryOrange }]}>
              {isEliteUser ? 'BIO-ELITE ACCESS' : 'MOTOR IA V4.0'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => {
            setDevTapCount(prev => {
              if (prev + 1 >= 5) {
                setIsEliteUser(!isEliteUser);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                return 0;
              }
              return prev + 1;
            });
          }}
        >
          <View style={AppStyles.rowCentered}>
            <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: '900', marginTop: 10 }]}>
              Bio-Scanner <Text style={{ color: isEliteUser ? AppColors.primaryOrange : AppColors.primaryBioGreen }}>{isEliteUser ? 'ELITE' : 'IA'}</Text>
            </Text>
            {isEliteUser && <Ionicons name="shield-checkmark" size={24} color={AppColors.primaryOrange} style={{ marginLeft: 10, marginTop: 10 }} />}
          </View>
        </TouchableOpacity>
      </View>

      {appState === 'camera' && (
        <View style={{ flex: 1, padding: 20 }}>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            
            <View style={styles.cameraOverlay}>
              <View style={styles.focusBadge}>
                <ActivityIndicator size="small" color={AppColors.primaryBioGreen} />
                <Text style={styles.focusText}>IA EN TIEMPO REAL: DETECTANDO...</Text>
              </View>
            </View>

            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.scanBtn} onPress={pickImage}>
                <Ionicons name="document-text" size={24} color={AppColors.primaryNeonBlue} />
                <Text style={styles.btnSubText}>REPORTES</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                <View style={styles.innerCaptureBtn} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.scanBtn} onPress={loadHistory}>
                <Ionicons name="time" size={24} color="white" />
                <Text style={styles.btnSubText}>HISTORIAL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {appState === 'analyzing' && (
        <View style={styles.fullCenter}>
          <View style={styles.analyzingCircle}>
             <Animated.View style={[styles.orbit, { transform: [{ rotate: '0deg' }] }]} />
             <Ionicons name="scan" size={50} color={AppColors.primaryBioGreen} />
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', textAlign: 'center' }]}>{analysisText}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${analysisProgress * 100}%` }]} />
          </View>
          <Text style={styles.analyzingText}>{Math.round(analysisProgress * 100)}% COMPLETADO</Text>
        </View>
      )}

      {appState === 'results' && analysisResult && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <View style={[AppStyles.glassCard, { padding: 0, overflow: 'hidden', marginBottom: 20 }]}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: '100%', height: 200 }} />}
            <View style={{ padding: 20 }}>
              <View style={AppStyles.rowBetween}>
                <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>{analysisResult.name}</Text>
                <View style={[styles.bioScoreBadge, { backgroundColor: analysisResult.bioScore > 80 ? 'rgba(19, 236, 91, 0.2)' : 'rgba(255, 165, 0, 0.2)' }]}>
                  <Text style={{ color: analysisResult.bioScore > 80 ? AppColors.primaryBioGreen : AppColors.primaryOrange, fontWeight: 'bold' }}>{analysisResult.bioScore} BS</Text>
                </View>
              </View>
              <Text style={[AppStyles.textGray, { marginTop: 5 }]}>{analysisResult.description}</Text>
            </View>
          </View>

          {/* Health Data (Reports/Accessories) */}
          {analysisResult.healthData && (
            <View style={[AppStyles.glassCard, { padding: 0, marginBottom: 20, borderColor: AppColors.primaryNeonBlue, borderWidth: 1.5 }]}>
               <LinearGradient 
                 colors={['rgba(0, 209, 255, 0.2)', 'transparent']} 
                 style={{ padding: 20 }}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                 <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
                    <View style={AppStyles.rowCentered}>
                      <Ionicons name="pulse" size={24} color={AppColors.primaryNeonBlue} />
                      <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: '900', marginLeft: 10, letterSpacing: 1 }]}>
                        BIO-DATA SYNC
                      </Text>
                    </View>
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveText}>DATA STABLE</Text>
                    </View>
                 </View>
                 
                 <View style={styles.healthMetricRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold' }]}>{analysisResult.healthData.metricName.toUpperCase()}</Text>
                      <Text style={[AppStyles.textWhite, { fontSize: 36, fontWeight: '900', color: AppColors.primaryNeonBlue }]}>
                        {analysisResult.healthData.value}
                      </Text>
                    </View>
                    <View style={{ flex: 1.5, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 12 }}>
                      <Text style={[AppStyles.textWhite, { fontSize: 12, lineHeight: 18, fontStyle: 'italic' }]}>
                        "{analysisResult.healthData.interpretation}"
                      </Text>
                    </View>
                 </View>
                 
                 <View style={styles.adviceBox}>
                    <View style={AppStyles.rowCentered}>
                      <Ionicons name="flash" size={14} color={AppColors.primaryNeonBlue} />
                      <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: '900', marginLeft: 5 }}>BIO-HACK RECOMENDADO</Text>
                    </View>
                    <Text style={[AppStyles.textWhite, { fontSize: 13, marginTop: 6, fontWeight: '500' }]}>
                      {analysisResult.healthData.actionableAdvice}
                    </Text>
                 </View>
               </LinearGradient>
            </View>
          )}

          {/* Macros (Only for food/beverage) */}
          {(analysisResult.type === 'food' || analysisResult.type === 'beverage') && (
            <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
              <View style={AppStyles.rowBetween}>
                <View style={styles.macroItem}>
                   <Text style={[styles.macroVal, { color: AppColors.primaryBioGreen }]}>{analysisResult.macros.protein}g</Text>
                   <Text style={styles.macroLabel}>PROTEÍNA</Text>
                </View>
                <View style={styles.macroItem}>
                   <Text style={[styles.macroVal, { color: AppColors.primaryNeonBlue }]}>{analysisResult.macros.carbs}g</Text>
                   <Text style={styles.macroLabel}>CARBOS</Text>
                </View>
                <View style={styles.macroItem}>
                   <Text style={[styles.macroVal, { color: AppColors.primaryOrange }]}>{analysisResult.macros.fats}g</Text>
                   <Text style={styles.macroLabel}>GRASAS</Text>
                </View>
                <View style={styles.macroItem}>
                   <Text style={[styles.macroVal, { color: 'white' }]}>{analysisResult.calories}</Text>
                   <Text style={styles.macroLabel}>KCAL</Text>
                </View>
              </View>
            </View>
          )}

          {/* Hormonal & Recommendations */}
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
            <View style={[AppStyles.rowCentered, { gap: 10, marginBottom: 15 }]}>
               <Ionicons name="flask" size={20} color={AppColors.primaryBioGreen} />
               <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Contexto Bio-Hormonal</Text>
            </View>
            <Text style={[AppStyles.textWhite, { fontSize: 14, marginBottom: 15, lineHeight: 20 }]}>{analysisResult.hormonalAdvice}</Text>
            
            {analysisResult.recommendations.map((rec, i) => (
              <View key={i} style={[styles.recCard, { borderLeftColor: rec.priority === 'high' ? AppColors.primaryOrange : AppColors.primaryNeonBlue }]}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recDesc}>{rec.description}</Text>
              </View>
            ))}
          </View>

          {/* Bio-Axioms */}
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, backgroundColor: 'rgba(19, 236, 91, 0.05)' }]}>
             <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 15 }]}>Bio-Axiomas (Control Glucémico)</Text>
             {[
               { id: 'veggies', text: 'Vegetales primero (Fibra protectora)' },
               { id: 'vinegar', text: 'Vinagre antes de comer (Buffer de glucosa)' },
               { id: 'walk', text: 'Caminata de 10 min post-comida' }
             ].map((axiom) => (
               <TouchableOpacity 
                 key={axiom.id} 
                 style={styles.axiomRow}
                 onPress={() => {
                   Haptics.selectionAsync();
                   setSelectedAxioms(prev => prev.includes(axiom.id) ? prev.filter(a => a !== axiom.id) : [...prev, axiom.id]);
                 }}
               >
                 <Ionicons 
                   name={selectedAxioms.includes(axiom.id) ? "checkbox" : "square-outline"} 
                   size={22} 
                   color={selectedAxioms.includes(axiom.id) ? AppColors.primaryBioGreen : AppColors.textGray} 
                 />
                 <Text style={[AppStyles.textWhite, { fontSize: 13 }]}>{axiom.text}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <TouchableOpacity 
            style={[isEliteUser ? AppStyles.glowBtnOrange : AppStyles.glowBtnBlue, { marginBottom: 15, opacity: isSaving ? 0.7 : 1 }]} 
            onPress={saveToDiary}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="white" /> : <Text style={isEliteUser ? AppStyles.glowBtnOrangeText : AppStyles.glowBtnBlueText}>GUARDAR EN BIO-DIARIO (+{(analysisResult.ntkReward || 15) + (selectedAxioms.length * 10) + (isEliteUser ? 50 : 0)} NTK)</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[AppStyles.highContrastInput, { alignItems: 'center' }]} onPress={() => setAppState('camera')}>
            <Text style={AppStyles.textWhite}>DESCARTAR Y RE-ESCANEAR</Text>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      )}

      {appState === 'history' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 20 }]}>Historial de Bio-Scanner</Text>
          {history.length === 0 ? (
            <Text style={AppStyles.textGray}>No hay registros previos.</Text>
          ) : (
            history.map((item, index) => (
              <TouchableOpacity key={index} style={[AppStyles.glassCard, { padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }]}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={{ width: 50, height: 50, borderRadius: 10, marginRight: 15 }} /> : <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 15, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="image-outline" size={24} color={AppColors.textGray} /></View>}
                <View style={{ flex: 1 }}>
                  <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{item.name}</Text>
                  <Text style={[AppStyles.textGray, { fontSize: 11 }]}>{item.type.toUpperCase()} • {item.bioScore} BioScore</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={AppColors.textGray} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.borderGlass
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceGlass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: AppColors.borderGlass,
    gap: 6
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.primaryBioGreen
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.2)'
  },
  scanLine: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: AppColors.primaryBioGreen,
    shadowColor: AppColors.primaryBioGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10
  },
  cameraOverlay: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)',
    gap: 8
  },
  focusText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold'
  },
  cameraActions: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  scanBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: AppColors.primaryBioGreen
  },
  innerCaptureBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white'
  },
  btnSubText: {
    fontSize: 8,
    color: 'white',
    marginTop: 2,
    fontWeight: 'bold'
  },
  fullCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  analyzingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(19, 236, 91, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)',
    marginBottom: 30
  },
  orbit: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.2)',
    borderStyle: 'dashed'
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    marginTop: 30,
    marginBottom: 10,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.primaryBioGreen
  },
  analyzingText: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  bioScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  macroItem: {
    alignItems: 'center'
  },
  macroVal: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  macroLabel: {
    fontSize: 9,
    color: AppColors.textGray,
    fontWeight: 'bold',
    marginTop: 2
  },
  recCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    marginBottom: 10
  },
  recTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold'
  },
  recDesc: {
    color: AppColors.textGray,
    fontSize: 11,
    marginTop: 2
  },
  axiomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  healthMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  adviceBox: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.2)'
  },
  liveBadge: {
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)'
  },
  liveText: {
    color: AppColors.primaryBioGreen,
    fontSize: 8,
    fontWeight: '900'
  }
});
