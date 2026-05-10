import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function NutricionIAScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [appState, setAppState] = useState<'camera' | 'analyzing' | 'results' | 'barcode'>('camera');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState('Identificando ingredientes...');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAxioms, setSelectedAxioms] = useState<string[]>([]);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (appState === 'camera') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [appState]);

  const startAnalysis = () => {
    setAppState('analyzing');
    let p = 0;
    const texts = [
      "Identificando ingredientes...", 
      "Consultando base de datos...", 
      "Calculando macros...", 
      "Generando veredicto IA..."
    ];
    let step = 0;

    const interval = setInterval(() => {
      p += 0.05;
      setAnalysisProgress(p);
      
      if (p > 0.25 && step === 0) { step = 1; setAnalysisText(texts[1]); }
      if (p > 0.50 && step === 1) { step = 2; setAnalysisText(texts[2]); }
      if (p > 0.75 && step === 2) { step = 3; setAnalysisText(texts[3]); }

      if (p >= 1) {
        clearInterval(interval);
        setAppState('results');
      }
    }, 150);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });

  const saveToDiary = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const logsRef = collection(userRef, 'logs');

      // 1. Save to Unified Cloud Logs
      await addDoc(logsRef, {
        type: 'diet',
        category: 'nutrition',
        foodName: "Bowl de Salmón y Quinoa",
        imageUrl: "", // Placeholder or URI from camera if available
        macros: {
          protein: 42,
          carbs: 55,
          fats: 30
        },
        calories: 680,
        axioms: selectedAxioms,
        timestamp: serverTimestamp()
      });

      // 2. Update User Totals and NTK Balance
      await updateDoc(userRef, {
        ntkBalance: increment(50), 
        totalCalories: increment(680),
        protein: increment(42),
        carbs: increment(55),
        fats: increment(30)
      });

      router.push('/');
    } catch (error) {
      console.error("Save Nutrition Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const lookupBarcode = async (barcode: string) => {
    setAppState('analyzing');
    setAnalysisText("Consultando Bio-Cloud...");
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        const product = data.product;
        const nutrients = product.nutriments;
        
        setScannedProduct({
          name: product.product_name || "Bio-Producto",
          kcal: Math.round(nutrients['energy-kcal_100g'] || (nutrients.energy_100g / 4.184) || 0),
          protein: Math.round(nutrients.proteins_100g || 0),
          carbs: Math.round(nutrients.carbohydrates_100g || 0),
          fats: Math.round(nutrients.fat_100g || 0),
          advice: product.nutriscore_grade ? `Calificación Nutri-Score: ${product.nutriscore_grade.toUpperCase()}.` : "Producto analizado via Bio-Cloud."
        });
        
        setAppState('results');
      } else {
        alert("Producto no encontrado");
        setAppState('camera');
      }
    } catch (e) {
      alert("Error de red");
      setAppState('camera');
    }
  };

  if (!permission) {
    return <View style={AppStyles.body} />;
  }

  if (!permission.granted) {
    return (
      <View style={[AppStyles.body, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[AppStyles.textWhite, { textAlign: 'center', marginBottom: 20 }]}>Necesitamos permiso de cámara para escanear tus comidas.</Text>
        <TouchableOpacity style={AppStyles.glowBtnOrange} onPress={requestPermission}>
          <Text style={AppStyles.glowBtnOrangeText}>Dar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={AppStyles.body}>
      {/* Header */}
      <View style={{ padding: 20, paddingTop: 50, zIndex: 10 }}>
        <View style={AppStyles.rowBetween}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>MOTOR IA V4.0</Text>
          </View>
        </View>
        <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold', marginTop: 10 }]}>Nutrición <Text style={{ color: AppColors.primaryBioGreen }}>IA</Text></Text>
        <Text style={[AppStyles.textGray, { fontSize: 12 }]}>Análisis instantáneo de macros y calorías</Text>
      </View>

      {appState === 'camera' && (
        <View style={{ flex: 1, padding: 20 }}>
          <View style={styles.cameraContainer}>
             <CameraView 
              style={StyleSheet.absoluteFill} 
              facing="back" 
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={appState === 'barcode' ? ({ data }) => {
                lookupBarcode(data);
              } : undefined}
             />
             <LinearGradient 
              colors={['transparent', 'rgba(19, 236, 91, 0.1)', 'transparent']} 
              style={StyleSheet.absoluteFill} 
             />
             
             {/* Scan line */}
             <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
             
             {/* Viewfinder corners */}
             <View style={[styles.corner, { top: 20, left: 20, borderTopWidth: 4, borderLeftWidth: 4 }]} />
             <View style={[styles.corner, { top: 20, right: 20, borderTopWidth: 4, borderRightWidth: 4 }]} />
             <View style={[styles.corner, { bottom: 20, left: 20, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
             <View style={[styles.corner, { bottom: 20, right: 20, borderBottomWidth: 4, borderRightWidth: 4 }]} />

             <View style={styles.cameraOverlay}>
                <View style={styles.focusBadge}>
                  <Ionicons name="scan" size={14} color={AppColors.primaryBioGreen} />
                  <Text style={styles.focusText}>AUTO-ENFOQUE MÚLTIPLE</Text>
                </View>
             </View>

               <View style={styles.cameraActions}>
                <TouchableOpacity style={[styles.scanBtn, AppStyles.glassCardInteractive]} onPress={() => setAppState('barcode')}>
                  <Ionicons name={appState === 'barcode' ? "barcode" : "barcode-outline"} size={24} color={appState === 'barcode' ? AppColors.primaryBioGreen : "white"} />
                  <Text style={[styles.btnSubText, appState === 'barcode' && { color: AppColors.primaryBioGreen }]}>BARRAS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.captureBtn, AppStyles.glassCardInteractive]} onPress={startAnalysis}>
                  <Ionicons name="camera" size={32} color={AppColors.backgroundDark} />
                  <Text style={[styles.btnSubText, { color: AppColors.backgroundDark }]}>CAPTURAR</Text>
                </TouchableOpacity>
              </View>
          </View>
        </View>
      )}

      {appState === 'analyzing' && (
        <View style={styles.fullCenter}>
          <View style={styles.analyzingCircle}>
             <Ionicons name="hardware-chip" size={50} color={AppColors.primaryBioGreen} />
             <Animated.View style={[styles.orbit, { transform: [{ rotate: scanAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
                <View style={styles.orbitDot} />
             </Animated.View>
          </View>
          <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Desglosando Matriz Nutricional</Text>
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: `${analysisProgress * 100}%` }]} />
          </View>
          <Text style={styles.analyzingText}>{analysisText}</Text>
        </View>
      )}

      {appState === 'results' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <View style={[AppStyles.glassCard, { padding: 15, flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20, borderColor: AppColors.primaryBioGreen }]}>
             <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={24} color={AppColors.primaryBioGreen} />
             </View>
             <View>
                <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Análisis Completado</Text>
                <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Detectado: <Text style={{ color: AppColors.primaryBioGreen }}>{scannedProduct?.name || "Bowl de Salmón y Quinoa"}</Text></Text>
             </View>
          </View>

          {/* Macro Chart Simulation */}
          <View style={[AppStyles.glassCard, { padding: 25, alignItems: 'center', marginBottom: 20 }]}>
              <Text style={styles.sectionLabel}>ESTIMACIÓN CALÓRICA Y MACROS</Text>
              <View style={styles.donutContainer}>
                <View style={[styles.donutInner, { borderColor: AppColors.primaryBioGreen, borderWidth: 8, shadowColor: AppColors.primaryBioGreen }]}>
                   <Text style={styles.calText}>680</Text>
                   <Text style={styles.calSubText}>KCAL TOTALES</Text>
                </View>
              </View>
              
              <View style={[AppStyles.rowBetween, { width: '100%', marginTop: 25 }]}>
                <View style={styles.macroStat}>
                   <View style={[styles.macroDot, { backgroundColor: AppColors.accentBlue }]} />
                   <Text style={[styles.macroVal, { color: AppColors.accentBlue }]}>42g</Text>
                   <Text style={styles.macroLabel}>PROTEÍNA</Text>
                </View>
                <View style={styles.macroStat}>
                   <View style={[styles.macroDot, { backgroundColor: AppColors.primaryBioGreen }]} />
                   <Text style={[styles.macroVal, { color: AppColors.primaryBioGreen }]}>55g</Text>
                   <Text style={styles.macroLabel}>CARBOS</Text>
                </View>
                <View style={styles.macroStat}>
                   <View style={[styles.macroDot, { backgroundColor: AppColors.primaryOrange }]} />
                   <Text style={[styles.macroVal, { color: AppColors.primaryOrange }]}>30g</Text>
                   <Text style={styles.macroLabel}>GRASAS</Text>
                </View>
              </View>
          </View>

          {/* AI Verdict */}
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, borderColor: 'rgba(255,255,255,0.1)' }]}>
             <View style={[AppStyles.rowCentered, { gap: 10, marginBottom: 15 }]}>
               <Ionicons name="bulb-outline" size={20} color={AppColors.primaryBioGreen} />
               <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Veredicto IA - <Text style={AppStyles.textGray}>Meta: Recomposición</Text></Text>
             </View>
             
             <View style={[styles.verdictCard, AppStyles.glassCardInteractive]}>
                <Ionicons name="add-circle" size={20} color={AppColors.primaryBioGreen} />
                <View style={{ flex: 1 }}>
                   <Text style={styles.verdictTitle}>Excelente bloque de proteínas y Omega-3.</Text>
                   <Text style={styles.verdictDesc}>Favorece la saciedad prolongada y neuroprotección.</Text>
                </View>
             </View>

             <View style={[styles.verdictCard, AppStyles.glassCardInteractive]}>
                <Ionicons name="alert-circle" size={20} color={AppColors.primaryOrange} />
                <View style={{ flex: 1 }}>
                   <Text style={styles.verdictTitle}>Carbohidratos altos para la noche.</Text>
                   <Text style={styles.verdictDesc}>Sugerencia: Si no has entrenado, reduce la quinoa a la mitad.</Text>
                </View>
             </View>

             {/* Suggested Recipe */}
             <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                <View style={[AppStyles.rowCentered, { gap: 10, marginBottom: 15 }]}>
                   <Ionicons name="restaurant" size={20} color={AppColors.accentBlue} />
                   <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Receta Sugerida IA</Text>
                </View>
                <View style={[AppStyles.glassCard, { padding: 15, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                   <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 5 }]}>Salmón "Neuro-Boost" al Vapor</Text>
                   <Text style={[AppStyles.textGray, { fontSize: 11, marginBottom: 10 }]}>Tiempo: 15 min | Dificultad: Baja</Text>
                   <Text style={[AppStyles.textWhite, { fontSize: 12, lineHeight: 18 }]}>
                     1. Cocina el salmón con piel hacia abajo.{"\n"}
                     2. Prepara la quinoa con una pizca de cúrcuma.{"\n"}
                     3. Añade espinacas frescas para magnesio.
                   </Text>
                </View>
             </View>
          </View>

          {/* Bio-Axioms (Inchauspé Protocol) */}
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, backgroundColor: 'rgba(19, 236, 91, 0.05)', borderColor: 'rgba(19, 236, 91, 0.2)' }]}>
             <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 15 }]}>Bio-Axiomas (Control Glucémico)</Text>
             
             {[
               { id: 'veggies', text: 'Vegetales primero (Fibra protectora)' },
               { id: 'vinegar', text: 'Vinagre antes de comer (Buffer de glucosa)' },
               { id: 'walk', text: 'Caminata de 10 min post-comida' }
             ].map((axiom) => (
               <TouchableOpacity 
                 key={axiom.id} 
                 style={[
                   AppStyles.glassCardInteractive, 
                   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, padding: 10, borderColor: AppColors.borderGlass }
                 ]}
                 onPress={() => {
                   // Tracking-only state (Informational as requested)
                   // @ts-ignore
                   setSelectedAxioms(prev => prev.includes(axiom.id) ? prev.filter(a => a !== axiom.id) : [...prev, axiom.id]);
                 }}
               >
                 <Ionicons 
                   // @ts-ignore
                   name={selectedAxioms.includes(axiom.id) ? "checkbox" : "square-outline"} 
                   size={22} 
                   // @ts-ignore
                   color={selectedAxioms.includes(axiom.id) ? AppColors.primaryBioGreen : AppColors.textGray} 
                 />
                 <Text style={[AppStyles.textWhite, { fontSize: 12 }]}>{axiom.text}</Text>
               </TouchableOpacity>
             ))}
              <Text style={{ color: AppColors.textGray, fontSize: 10, fontStyle: 'italic', marginTop: 5 }}>
                * Protocolos basados en Glucose Revolution para optimización metabólica.
              </Text>
          </View>

          <TouchableOpacity 
            style={[AppStyles.glowBtnBlue, { marginTop: 10, opacity: isSaving ? 0.6 : 1 }]} 
            onPress={saveToDiary}
            disabled={isSaving}
          >
             {isSaving ? (
               <ActivityIndicator color="white" size="small" />
             ) : (
               <Text style={AppStyles.glowBtnBlueText}>
                 AÑADIR AL DIARIO (+50 NTK)
               </Text>
             )}
          </TouchableOpacity>
          
          <TouchableOpacity style={[AppStyles.highContrastInput, { marginTop: 10, alignItems: 'center' }]} onPress={() => setAppState('camera')}>
             <Text style={AppStyles.textWhite}>Re-Escanear</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold'
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.2)'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: AppColors.primaryBioGreen,
    opacity: 0.8
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
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6
  },
  focusText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold'
  },
  cameraActions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 15
  },
  scanBtn: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 25, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  captureBtn: {
    flex: 1,
    backgroundColor: AppColors.primaryBioGreen,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center'
  },
  btnSubText: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white'
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
    backgroundColor: AppColors.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)',
    marginBottom: 30
  },
  orbit: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  orbitDot: {
    position: 'absolute',
    top: 0,
    left: 71,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primaryBioGreen
  },
  progressBarBg: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 10
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.primaryBioGreen
  },
  analyzingText: {
    color: AppColors.textGray,
    fontSize: 11,
    fontWeight: 'bold'
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)'
  },
  sectionLabel: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 25
  },
  donutContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  donutInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: AppColors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  calText: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold'
  },
  calSubText: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold'
  },
  macroStat: {
    alignItems: 'center'
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8
  },
  macroVal: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  macroLabel: {
    fontSize: 8,
    color: AppColors.textGray,
    fontWeight: 'bold',
    marginTop: 2
  },
  verdictCard: {
    flexDirection: 'row',
    gap: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10
  },
  verdictTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold'
  },
  verdictDesc: {
    color: AppColors.textGray,
    fontSize: 11,
    marginTop: 2
  }
});
