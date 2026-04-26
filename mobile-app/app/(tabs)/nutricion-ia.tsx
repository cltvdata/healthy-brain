import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { SynergyService } from '@/services/SynergyService';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function NutritionIAScreen() {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanProgress] = useState(new Animated.Value(0));
  const [showHUD, setShowHUD] = useState(true);

  const startScan = () => {
    setIsScanning(true);
    setScanResult(null);
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      setIsScanning(false);
      generateMockResult();
    });
  };

  const generateMockResult = () => {
    setScanResult({
      name: "Bowl de Proteína y Vegetales",
      calories: 450,
      macros: {
        protein: 35,
        carbs: 45,
        fats: 12
      },
      bioScore: 94,
      ntkReward: 12
    });
  };

  const syncNutrition = async () => {
    if (!auth.currentUser || !scanResult) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      await updateDoc(userRef, {
        ntkBalance: increment(scanResult.ntkReward),
        'todaysMacros.protein': increment(scanResult.macros.protein),
        'todaysMacros.carbs': increment(scanResult.macros.carbs),
        'todaysMacros.fats': increment(scanResult.macros.fats)
      });

      await SynergyService.postAchievement(
        'nutrition',
        `Sincronizó un ${scanResult.name} con un Bio-Impacto de ${scanResult.bioScore}%.`,
        scanResult.ntkReward
      );

      alert(`¡Sincronización Exitosa! +${scanResult.ntkReward} NTK otorgados.`);
      setScanResult(null);
      scanProgress.setValue(0);
    } catch (e) {
      console.error(e);
    }
  };

  const scanLineTranslate = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.5]
  });

  return (
    <View style={styles.container}>
      {/* Background - Vision Simulator */}
      <View style={styles.cameraPlaceholder}>
         {/* Aquí se integraría Expo Camera, usamos un placeholder estilizado */}
         <LinearGradient
            colors={['#0a0a0a', '#1a1a1a']}
            style={StyleSheet.absoluteFill}
         />
         {isScanning && (
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />
         )}
      </View>

      {/* Futuristic HUD Overlay */}
      <View style={styles.hudContainer} pointerEvents="box-none">
        <View style={styles.hudTop}>
           <Text style={styles.hudTitle}>{t('nutrition.title').toUpperCase()}</Text>
           <View style={AppStyles.rowCentered}>
              <View style={[styles.statusDot, { backgroundColor: isScanning ? AppColors.primaryOrange : AppColors.primaryBioGreen }]} />
              <Text style={styles.statusText}>{isScanning ? t('nutrition.scanning') : 'READY'}</Text>
           </View>
        </View>

        {/* Viewfinder Corners */}
        <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* HUD Data Sidebars (Visual only) */}
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

      {/* Scan Controls / results */}
      <View style={styles.footer}>
        {!scanResult ? (
          <TouchableOpacity 
            onPress={startScan} 
            disabled={isScanning}
            style={[styles.scanBtn, isScanning && { opacity: 0.5 }]}
          >
            <View style={[styles.scanBtnInner, { backgroundColor: isScanning ? 'transparent' : AppColors.primaryOrange }]}>
                {isScanning ? (
                    <Text style={styles.scanningText}>{t('nutrition.detecting')}</Text>
                ) : (
                    <Ionicons name="scan" size={32} color="black" />
                )}
            </View>
          </TouchableOpacity>
        ) : (
          <Animated.View style={styles.resultCard}>
             <View style={AppStyles.rowBetween}>
                <Text style={styles.resultTitle}>{scanResult.name}</Text>
                <View style={[styles.scoreBadge, { borderColor: AppColors.primaryBioGreen }]}>
                   <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold' }}>{scanResult.bioScore}%</Text>
                </View>
             </View>

             <Text style={styles.macroLabel}>{t('nutrition.macros')}</Text>
             <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                   <Text style={styles.macroVal}>{scanResult.macros.protein}g</Text>
                   <Text style={styles.macroType}>{t('nutrition.protein')}</Text>
                </View>
                <View style={styles.macroItem}>
                   <Text style={styles.macroVal}>{scanResult.macros.carbs}g</Text>
                   <Text style={styles.macroType}>{t('nutrition.carbs')}</Text>
                </View>
                <View style={styles.macroItem}>
                   <Text style={styles.macroVal}>{scanResult.macros.fats}g</Text>
                   <Text style={styles.macroType}>{t('nutrition.fats')}</Text>
                </View>
             </View>

             <TouchableOpacity style={styles.syncBtn} onPress={syncNutrition}>
                <Text style={styles.syncBtnText}>{t('nutrition.register').toUpperCase()}</Text>
                <Text style={styles.ntkVal}>+{scanResult.ntkReward} NTK</Text>
             </TouchableOpacity>

             <TouchableOpacity style={{ marginTop: 15, alignSelf: 'center' }} onPress={() => setScanResult(null)}>
                <Text style={AppStyles.textGray}>CANCEL</Text>
             </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: AppColors.primaryOrange,
    shadowColor: AppColors.primaryOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  hudContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudTop: {
    position: 'absolute',
    top: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  hudTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    fontStyle: 'italic'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  statusText: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  viewfinder: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  sidebarLeft: {
    position: 'absolute',
    left: 20,
    top: height / 3,
  },
  sidebarRight: {
    position: 'absolute',
    right: 20,
    top: height / 3,
  },
  miniData: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 8,
    marginBottom: 5,
    fontFamily: 'monospace'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 30,
    alignItems: 'center'
  },
  scanBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 5,
    marginBottom: 20
  },
  scanBtnInner: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanningText: {
    color: AppColors.primaryOrange,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1
  },
  macroLabel: {
    color: AppColors.textGray,
    fontSize: 11,
    marginTop: 15,
    marginBottom: 15,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  macroItem: {
    alignItems: 'center',
    flex: 1
  },
  macroVal: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  macroType: {
    color: AppColors.textGray,
    fontSize: 9,
    marginTop: 4
  },
  syncBtn: {
    backgroundColor: AppColors.primaryNeonBlue,
    height: 60,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  syncBtnText: {
    color: 'black',
    fontWeight: '900',
    letterSpacing: 1
  },
  ntkVal: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12
  }
});
