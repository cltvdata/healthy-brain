import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Switch, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { HealthConnectService, HealthProvider, DeviceType, DeviceConnection, SyncResult } from '@/services/HealthConnectService';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const AVAILABLE_DEVICES: { type: DeviceType; name: string; icon: string; description: string }[] = [
  { type: 'apple_watch', name: 'Apple Watch', icon: 'apple', description: 'Sincronización automática de frecuencia cardíaca, pasos y sueño' },
  { type: 'our_ring', name: 'Oura Ring', icon: 'ellipse', description: 'Seguimiento de temperatura, HRV y fases de sueño' },
  { type: 'garmin', name: 'Garmin', icon: 'fitness', description: 'Datos de actividad, VO2 máx y recuperación' },
  { type: 'fitbit', name: 'Fitbit', icon: 'watch', description: 'Pasos, sueño y frecuencia cardíaca' },
  { type: 'whoop', name: 'Whoop', icon: 'flash', description: 'Strain, recovery y análisis de sueño' },
  { type: 'samsung_galaxy_watch', name: 'Samsung Galaxy Watch', icon: 'hardware-chip', description: 'Salud cardiovascular y oxígeno en sangre' },
  { type: 'withings', name: 'Withings', icon: 'pulse', description: 'Balanza, tensión y sueño' },
  { type: 'manual', name: 'Entrada Manual', icon: 'create', description: 'CSV, screenshots o datos manuales' },
];

export default function SaludConexionesScreen() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<HealthProvider>('none');
  const [connectedDevices, setConnectedDevices] = useState<DeviceConnection[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [permissions, setPermissions] = useState<any>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const status = await HealthConnectService.getSyncStatus();
      setCurrentProvider(status.provider);
      setConnectedDevices(typeof status.connectedDevices === 'number' ? [] : status.connectedDevices);
      setLastSync(status.lastSync);
      setPermissions(status.permissions);

      // Auto-Sync si ya hay proveedor activo y no ha sido sincronizado recientemente
      if (status.provider !== 'none') {
        HealthConnectService.syncFromHealthProvider(status.provider).then(res => {
          if (res.success) setLastSync(new Date());
        }).catch(e => console.log('Auto-sync silencioso falló', e));
      }
      
      // Escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setConnectedDevices(data.connectedDevices || []);
          setCurrentProvider(data.preferredHealthProvider || 'none');
        }
      });

      setLoading(false);
      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading health data:", error);
      setLoading(false);
    }
  };

  const handleProviderChange = async (provider: HealthProvider) => {
    if (provider === currentProvider) return;
    
    Alert.alert(
      'Cambiar Proveedor de Salud',
      `¿Estás seguro de que quieres usar ${provider === 'apple_health' ? 'Apple Health' : 'Google Health Connect'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const success = await HealthConnectService.setPreferredProvider(provider);
            if (success) {
              await HealthConnectService.requestPermissions(provider);
              setCurrentProvider(provider);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('✅ Proveedor actualizado', 'Ahora puedes sincronizar datos de salud.');
            }
          }
        }
      ]
    );
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await HealthConnectService.syncFromHealthProvider(currentProvider);
      if (result.success) {
        setLastSync(new Date());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Sincronización Exitosa', `Se sincronizaron: ${result.syncedFields.join(', ')}`);
      } else {
        Alert.alert('⚠️ Sincronización Parcial', `Errores: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo completar la sincronización.');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectDevice = async (deviceType: DeviceType) => {
    if (connectedDevices.some(d => d.deviceType === deviceType)) {
      Alert.alert('Ya conectado', 'Este dispositivo ya está conectado.');
      return;
    }

    const success = await HealthConnectService.connectDevice(deviceType);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Dispositivo Conectado', '¡Tu dispositivo está sincronizado! Has ganado NTK.');
      loadHealthData();
    }
  };

  const handleDisconnectDevice = async (deviceType: DeviceType) => {
    Alert.alert(
      'Desconectar Dispositivo',
      '¿Estás seguro de que quieres desconectar este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            await HealthConnectService.disconnectDevice(deviceType);
            loadHealthData();
          }
        }
      ]
    );
  };

  const handleManualEntry = async (type: 'screenshot' | 'csv' | 'manual') => {
    if (type === 'screenshot') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setAnalyzingImage(true);
        try {
          await HealthConnectService.processManualEntry({
            type: 'screenshot',
            data: { 
              imageUri: result.assets[0].uri, 
              base64: result.assets[0].base64,
              timestamp: new Date() 
            },
            analyzedByAI: true,
            createdAt: new Date()
          });
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('📸 Análisis Completo', 'Tu screenshot ha sido analizado por IA y los datos de salud se han guardado exitosamente.');
        } catch (error) {
          Alert.alert('❌ Error', 'Hubo un problema analizando la imagen.');
        } finally {
          setAnalyzingImage(false);
        }
      }
    } else if (type === 'manual') {
      Alert.alert('Entrada Manual', 'Función de entrada manual de datos.');
      // Aquí se abriría un formulario para entrada manual
    }
  };

  if (loading) {
    return (
      <View style={[AppStyles.body, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primaryBioGreen} />
        <Text style={[AppStyles.textWhite, { marginTop: 20 }]}>Cargando conexiones...</Text>
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
            <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold' }]}>Salud Conectada</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Gestiona tus fuentes de datos</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Estado de Sincronización */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20, borderColor: AppColors.primaryBioGreen }]}>
          <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
            <View style={[AppStyles.rowCentered, { gap: 10 }]}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: currentProvider !== 'none' ? AppColors.primaryBioGreen : AppColors.primaryOrange }} />
              <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Estado de Sincronización</Text>
            </View>
            <TouchableOpacity 
              onPress={handleSync}
              disabled={syncing || currentProvider === 'none'}
              style={[styles.syncBtn, { opacity: syncing ? 0.6 : 1 }]}
            >
              {syncing ? (
                <ActivityIndicator size="small" color={AppColors.primaryNeonBlue} />
              ) : (
                <Ionicons name="sync" size={18} color={AppColors.primaryNeonBlue} />
              )}
            </TouchableOpacity>
          </View>

          <View style={{ gap: 10 }}>
            <View style={[AppStyles.rowBetween]}>
              <Text style={[AppStyles.textGray, { fontSize: 13 }]}>Proveedor activo:</Text>
              <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 13 }}>
                {currentProvider === 'apple_health' ? '🍎 Apple Health' : currentProvider === 'google_health_connect' ? '🤖 Google Health Connect' : 'No configurado'}
              </Text>
            </View>
            <View style={[AppStyles.rowBetween]}>
              <Text style={[AppStyles.textGray, { fontSize: 13 }]}>Dispositivos conectados:</Text>
              <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold', fontSize: 13 }}>
                {connectedDevices.length}
              </Text>
            </View>
            <View style={[AppStyles.rowBetween]}>
              <Text style={[AppStyles.textGray, { fontSize: 13 }]}>Última sincronización:</Text>
              <Text style={{ color: AppColors.textWhite, fontSize: 13 }}>
                {lastSync ? lastSync.toLocaleString() : 'Nunca'}
              </Text>
            </View>
          </View>
        </View>

        {/* Seleccionar Proveedor */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
          Proveedor de Salud
        </Text>
        <View style={{ gap: 10, marginBottom: 25 }}>
          <ProviderOption 
            icon="logo-apple" 
            name="Apple Health" 
            selected={currentProvider === 'apple_health'}
            onPress={() => handleProviderChange('apple_health')}
            platform="ios"
          />
          <ProviderOption 
            icon="logo-android" 
            name="Google Health Connect" 
            selected={currentProvider === 'google_health_connect'}
            onPress={() => handleProviderChange('google_health_connect')}
            platform="android"
          />
        </View>

        {/* Dispositivos Conectados */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
          Dispositivos Conectados
        </Text>
        
        {connectedDevices.length === 0 ? (
          <View style={[AppStyles.glassCard, { padding: 25, marginBottom: 25, alignItems: 'center' }]}>
            <Ionicons name="hardware-chip-outline" size={40} color={AppColors.textGray} />
            <Text style={[AppStyles.textGray, { marginTop: 10, textAlign: 'center' }]}>
              No hay dispositivos conectados.{"\n"}Conecta un wearable para sincronizar datos automáticamente.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginBottom: 25 }}>
            {connectedDevices.map((device) => (
              <View key={device.deviceType} style={[AppStyles.glassCard, { padding: 15, flexDirection: 'row', alignItems: 'center' }]}>
                <View style={styles.deviceIcon}>
                  <Ionicons name={getDeviceIcon(device.deviceType) as any} size={22} color={AppColors.primaryBioGreen} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{device.deviceName}</Text>
                  <Text style={[AppStyles.textGray, { fontSize: 11 }]}>
                    Última sync: {device.lastSync?.toLocaleDateString() || 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDisconnectDevice(device.deviceType)}
                  style={styles.disconnectBtn}
                >
                  <Ionicons name="close-circle-outline" size={22} color={AppColors.primaryOrange} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Agregar Nuevo Dispositivo */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
          Conectar Nuevo Dispositivo
        </Text>
        <View style={{ gap: 10, marginBottom: 25 }}>
          {AVAILABLE_DEVICES.filter(d => !connectedDevices.some(c => c.deviceType === d.type)).map((device) => (
            <TouchableOpacity 
              key={device.type}
              onPress={() => handleConnectDevice(device.type)}
              style={[AppStyles.glassCard, { padding: 15, flexDirection: 'row', alignItems: 'center' }]}
            >
              <View style={[styles.deviceIcon, { borderColor: AppColors.primaryNeonBlue + '50' }]}>
                <Ionicons name={device.icon as any} size={20} color={AppColors.primaryNeonBlue} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 14 }]}>{device.name}</Text>
                <Text style={[AppStyles.textGray, { fontSize: 11 }]}>{device.description}</Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color={AppColors.primaryNeonBlue} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Entrada Manual */}
        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
          Entrada Manual de Datos
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 30 }}>
          <TouchableOpacity 
            onPress={() => handleManualEntry('screenshot')}
            style={[AppStyles.glassCard, { flex: 1, padding: 20, alignItems: 'center' }]}
          >
            <Ionicons name="camera" size={28} color={AppColors.primaryOrange} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 12, marginTop: 8 }]}>Screenshot</Text>
            <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginTop: 4 }]}>Analiza métricas de pantalla</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleManualEntry('manual')}
            style={[AppStyles.glassCard, { flex: 1, padding: 20, alignItems: 'center' }]}
          >
            <Ionicons name="create" size={28} color={AppColors.primaryBioGreen} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 12, marginTop: 8 }]}>Manual</Text>
            <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginTop: 4 }]}>Ingresa datos tú mismo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleManualEntry('csv')}
            style={[AppStyles.glassCard, { flex: 1, padding: 20, alignItems: 'center' }]}
          >
            <Ionicons name="document-text" size={28} color={AppColors.primaryNeonBlue} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 12, marginTop: 8 }]}>CSV</Text>
            <Text style={[AppStyles.textGray, { fontSize: 10, textAlign: 'center', marginTop: 4 }]}>Importar archivo</Text>
          </TouchableOpacity>
        </View>

        {/* Permisos */}
        {permissions && (
          <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 20 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
              🔐 Permisos de Salud
            </Text>
            <View style={{ gap: 10 }}>
              {Object.entries(permissions).map(([key, value]) => (
                <View key={key} style={[AppStyles.rowBetween]}>
                  <Text style={[AppStyles.textGray, { fontSize: 13, textTransform: 'capitalize' }]}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <View style={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: 5, 
                    backgroundColor: value ? AppColors.primaryBioGreen : AppColors.primaryOrange 
                  }} />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Loading Overlay para IA */}
      {analyzingImage && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={AppColors.primaryNeonBlue} />
            <Text style={[AppStyles.textWhite, { marginTop: 15, fontWeight: 'bold' }]}>Analizando captura...</Text>
            <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 5, textAlign: 'center' }]}>Gemini Vision AI está procesando métricas y leyendo datos.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const ProviderOption = ({ icon, name, selected, onPress, platform }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[
      AppStyles.glassCard, 
      { padding: 15, flexDirection: 'row', alignItems: 'center', borderColor: selected ? AppColors.primaryBioGreen : AppColors.borderGlass }
    ]}
  >
    <Ionicons name={icon} size={24} color={selected ? AppColors.primaryBioGreen : AppColors.textGray} />
    <Text style={[AppStyles.textWhite, { flex: 1, marginLeft: 15, fontWeight: selected ? 'bold' : 'normal' }]}>{name}</Text>
    {selected && <Ionicons name="checkmark-circle" size={22} color={AppColors.primaryBioGreen} />}
    {!selected && platform === 'ios' && <Text style={[AppStyles.textGray, { fontSize: 10 }]}>iOS</Text>}
  </TouchableOpacity>
);

const getDeviceIcon = (type: DeviceType): string => {
  const icons: Record<DeviceType, string> = {
    apple_watch: 'logo-apple',
    our_ring: 'ellipse',
    garmin: 'fitness',
    fitbit: 'watch',
    whoop: 'flash',
    samsung_galaxy_watch: 'hardware-chip',
    polar: 'pulse',
    withings: 'pulse',
    manual: 'create',
  };
  return icons[type];
};

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primaryNeonBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: AppColors.primaryBioGreen + '10',
    borderWidth: 1,
    borderColor: AppColors.primaryBioGreen + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectBtn: {
    padding: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: AppColors.surfaceGlass,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: AppColors.primaryNeonBlue + '50',
  }
});