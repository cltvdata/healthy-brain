import { Platform } from 'react-native';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, getDoc, setDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';

export type HealthProvider = 'apple_health' | 'google_health_connect' | 'none';

export type DeviceType = 
  | 'apple_watch' 
  | 'our_ring' 
  | 'garmin' 
  | 'fitbit' 
  | 'whoop' 
  | 'samsung_galaxy_watch' 
  | 'polar' 
  | 'withings' 
  | 'manual';

export interface DeviceConnection {
  deviceType: DeviceType;
  deviceName: string;
  connected: boolean;
  lastSync: Date | null;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}

export interface HealthPermissions {
  steps: boolean;
  heartRate: boolean;
  hrv: boolean;
  sleep: boolean;
  glucose: boolean;
  weight: boolean;
  workout: boolean;
}

export interface ManualDataEntry {
  id?: string;
  type: 'screenshot' | 'csv' | 'manual' | 'text';
  data: any;
  analyzedByAI: boolean;
  aiAnalysis?: string;
  createdAt: any;
}

export interface SyncResult {
  success: boolean;
  syncedFields: string[];
  errors: string[];
  timestamp: Date;
}

export class HealthConnectService {
  private static currentProvider: HealthProvider = 'none';
  private static connectedDevices: DeviceConnection[] = [];
  private static permissions: HealthPermissions = {
    steps: false,
    heartRate: false,
    hrv: false,
    sleep: false,
    glucose: false,
    weight: false,
    workout: false,
  };

  /**
   * Detectar automáticamente qué servicio de salud está disponible
   */
  static async detectAvailableProvider(): Promise<HealthProvider> {
    if (Platform.OS === 'ios') {
      // En iOS, verificar si HealthKit está disponible
      try {
        // En un app real, aquí se verificaría con react-native-health
        // Por ahora retornamos el preferido del usuario
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
        const preferredProvider = userDoc.data()?.preferredHealthProvider;
        return preferredProvider || 'apple_health';
      } catch {
        return 'apple_health';
      }
    } else if (Platform.OS === 'android') {
      try {
        // Verificar Health Connect en Android
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
        const preferredProvider = userDoc.data()?.preferredHealthProvider;
        return preferredProvider || 'google_health_connect';
      } catch {
        return 'google_health_connect';
      }
    }
    return 'none';
  }

  /**
   * Establecer proveedor de salud preferido del usuario
   */
  static async setPreferredProvider(provider: HealthProvider): Promise<boolean> {
    if (!auth.currentUser) return false;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferredHealthProvider: provider,
        healthProviderUpdatedAt: serverTimestamp()
      });
      this.currentProvider = provider;
      return true;
    } catch (error) {
      console.error("Error setting preferred provider:", error);
      return false;
    }
  }

  /**
   * Solicitar permisos de salud según la plataforma
   */
  static async requestPermissions(provider: HealthProvider): Promise<HealthPermissions> {
    console.log(`[HealthConnect] Requesting permissions for ${provider}...`);

    try {
      if (provider === 'apple_health') {
        // En un app real: HealthKit.requestAuthorization(readPermissions, writePermissions)
        // Simulamos permisos concedidos
        this.permissions = {
          steps: true,
          heartRate: true,
          hrv: true,
          sleep: true,
          glucose: true,
          weight: true,
          workout: true,
        };
      } else if (provider === 'google_health_connect') {
        // En un app real: HealthConnectClient.requestPermissions(readPermissions)
        this.permissions = {
          steps: true,
          heartRate: true,
          hrv: true,
          sleep: true,
          glucose: true,
          weight: true,
          workout: true,
        };
      }

      // Guardar permisos en Firestore
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          healthPermissions: this.permissions,
          healthPermissionsGrantedAt: serverTimestamp()
        });
      }

      return this.permissions;
    } catch (error) {
      console.error("[HealthConnect] Permission error:", error);
      return this.permissions;
    }
  }

  /**
   * Sincronizar datos desde el proveedor de salud
   */
  static async syncFromHealthProvider(provider: HealthProvider): Promise<SyncResult> {
    console.log(`[HealthConnect] Syncing data from ${provider}...`);
    const syncedFields: string[] = [];
    const errors: string[] = [];

    try {
      if (provider === 'apple_health') {
        // En app real: Fetch desde HealthKit
        // Datos simulados
        const mockData = await this.getSimulatedHealthData();
        
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            latestSteps: mockData.steps,
            latestHRV: mockData.hrv,
            latestSleepHours: mockData.sleepHours,
            lastHealthSync: serverTimestamp(),
            healthProvider: provider
          });
        }
        
        syncedFields.push('steps', 'hrv', 'sleep', 'heartRate');
      } 
      else if (provider === 'google_health_connect') {
        // En app real: Fetch desde Health Connect
        const mockData = await this.getSimulatedHealthData();
        
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            latestSteps: mockData.steps,
            latestHRV: mockData.hrv,
            latestSleepHours: mockData.sleepHours,
            lastHealthSync: serverTimestamp(),
            healthProvider: provider
          });
        }
        
        syncedFields.push('steps', 'hrv', 'sleep', 'heartRate', 'glucose');
      }

      // Registrar sync en historial
      if (auth.currentUser) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'health_syncs'), {
          provider,
          syncedFields,
          timestamp: serverTimestamp()
        });
      }

      return {
        success: true,
        syncedFields,
        errors,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("[HealthConnect] Sync error:", error);
      return {
        success: false,
        syncedFields,
        errors: [(error as Error).message],
        timestamp: new Date()
      };
    }
  }

  /**
   * Conectar un dispositivo wearable
   */
  static async connectDevice(deviceType: DeviceType): Promise<boolean> {
    console.log(`[HealthConnect] Connecting device: ${deviceType}`);
    
    if (!auth.currentUser) return false;

    try {
      const deviceNames: Record<DeviceType, string> = {
        apple_watch: 'Apple Watch',
        our_ring: 'Oura Ring',
        garmin: 'Garmin',
        fitbit: 'Fitbit',
        whoop: 'Whoop',
        samsung_galaxy_watch: 'Samsung Galaxy Watch',
        polar: 'Polar',
        withings: 'Withings',
        manual: 'Entrada Manual',
      };

      const newDevice: DeviceConnection = {
        deviceType,
        deviceName: deviceNames[deviceType],
        connected: true,
        lastSync: new Date(),
        syncFrequency: deviceType === 'apple_watch' ? 'realtime' : 'hourly'
      };

      // Añadir a lista de dispositivos
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const existingDevices = userDoc.data()?.connectedDevices || [];
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        connectedDevices: [...existingDevices, newDevice],
        lastDeviceSync: serverTimestamp()
      });

      this.connectedDevices.push(newDevice);

      // Recompensa por conectar dispositivo
      const deviceRewards: Record<DeviceType, number> = {
        apple_watch: 100,
        our_ring: 150,
        garmin: 100,
        fitbit: 75,
        whoop: 75,
        samsung_galaxy_watch: 75,
        polar: 75,
        withings: 50,
        manual: 25,
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ntkBalance: increment(deviceRewards[deviceType])
      });

      console.log(`[HealthConnect] Device ${deviceNames[deviceType]} connected successfully!`);
      return true;
    } catch (error) {
      console.error("[HealthConnect] Device connection error:", error);
      return false;
    }
  }

  /**
   * Desconectar un dispositivo
   */
  static async disconnectDevice(deviceType: DeviceType): Promise<boolean> {
    if (!auth.currentUser) return false;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const existingDevices: DeviceConnection[] = userDoc.data()?.connectedDevices || [];
      
      const updatedDevices = existingDevices.filter(d => d.deviceType !== deviceType);
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        connectedDevices: updatedDevices
      });

      this.connectedDevices = this.connectedDevices.filter(d => d.deviceType !== deviceType);
      return true;
    } catch (error) {
      console.error("[HealthConnect] Device disconnect error:", error);
      return false;
    }
  }

  /**
   * Obtener lista de dispositivos conectados
   */
  static async getConnectedDevices(): Promise<DeviceConnection[]> {
    if (!auth.currentUser) return [];

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      return userDoc.data()?.connectedDevices || [];
    } catch {
      return this.connectedDevices;
    }
  }

  /**
   * Procesar entrada manual de datos (CSV, screenshot, texto)
   */
  static async processManualEntry(entry: ManualDataEntry): Promise<boolean> {
    if (!auth.currentUser) return false;

    try {
      // Guardar entrada original
      const entryRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'manual_entries'), {
        ...entry,
        createdAt: serverTimestamp(),
        processed: false
      });

      // Si es screenshot o texto, análisis básico (sin IA real por ahora)
      let analyzedData: any = entry.data;
      
      if (entry.type === 'screenshot' || entry.type === 'text') {
        try {
          // Si es screenshot o texto, usamos Gemini para análisis real si hay datos base64 o texto
          const context = `Análisis de métricas de salud desde ${entry.type === 'screenshot' ? 'captura de pantalla' : 'entrada de texto'}.`;
          
          if (entry.type === 'screenshot' && entry.data.base64) {
            const aiResult = await GeminiVisionService.analyzeImage(entry.data.base64, context);
            analyzedData = {
              ...entry.data,
              ...aiResult.healthData,
              aiAnalysis: aiResult.description,
              analyzedByAI: true,
              // Mapear métricas de Gemini a campos conocidos con extracción robusta de números
              steps: aiResult.healthData?.metricName.toLowerCase().includes('pasos') ? this.extractNumber(aiResult.healthData.value) : undefined,
              hrv: aiResult.healthData?.metricName.toLowerCase().includes('hrv') ? this.extractNumber(aiResult.healthData.value) : undefined,
              sleep: aiResult.healthData?.metricName.toLowerCase().includes('sueño') ? this.extractNumber(aiResult.healthData.value) : undefined,
            };
          } else {
            analyzedData = {
              ...entry.data,
              aiAnalysis: this.generateMockAIAnalysis(entry.data),
              analyzedByAI: true
            };
          }
        } catch (e) {
          console.error("Error analyzing with Gemini:", e);
          analyzedData = {
            ...entry.data,
            aiAnalysis: "Error en análisis de IA. Procesado como datos manuales.",
            analyzedByAI: false
          };
        }
      }

      // Actualizar entrada con análisis
      await updateDoc(entryRef, {
        processed: true,
        aiAnalysis: analyzedData.aiAnalysis
      });

      // Si tiene datos procesables, actualizar métricas del usuario
      if (analyzedData.steps || analyzedData.hrv || analyzedData.sleep) {
        const updates: any = {};
        
        if (analyzedData.steps) updates.latestSteps = analyzedData.steps;
        if (analyzedData.hrv) updates.latestHRV = analyzedData.hrv;
        if (analyzedData.sleep) updates.latestSleepHours = analyzedData.sleep;
        
        if (Object.keys(updates).length > 0) {
          updates.lastManualEntryAt = serverTimestamp();
          await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
        }
      }

      // Recompensa por entrada manual + Bono Veterano
      let reward = entry.type === 'screenshot' ? 10 : entry.type === 'csv' ? 15 : 5;
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      // VETERAN BONUS: +15 NTK if account older than 6 months
      if (userData?.createdAt) {
        let registrationDate: Date;
        if (userData.createdAt instanceof Date) {
          registrationDate = userData.createdAt;
        } else if (typeof userData.createdAt.toDate === 'function') {
          registrationDate = userData.createdAt.toDate();
        } else {
          registrationDate = new Date(userData.createdAt);
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        if (registrationDate < sixMonthsAgo) {
          reward += 15;
          console.log(`[HealthConnectService] Veteran Bonus Applied (+15 NTK) for manual entry`);
        }
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ntkBalance: increment(reward),
        totalNTKEarned: increment(reward)
      });

      return true;
    } catch (error) {
      console.error("[HealthConnect] Manual entry error:", error);
      return false;
    }
  }

  /**
   * Extraer número de un string de forma robusta (ej: "65ms" -> 65)
   */
  private static extractNumber(value: string): number {
    if (!value) return 0;
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Análisis mock para datos manuales
   */
  private static generateMockAIAnalysis(data: any): string {
    const insights: string[] = [];
    
    if (data.steps) {
      if (data.steps < 5000) {
        insights.push("Tu actividad física está por debajo de la recomendación mínima. Considera aumentar tus pasos diarios.");
      } else if (data.steps > 10000) {
        insights.push("¡Excelente actividad física! Estás cumpliendo holgadamente la meta de pasos.");
      }
    }
    
    if (data.hrv) {
      if (data.hrv < 40) {
        insights.push("Tu HRV indica posible estrés. Considera técnicas de respiración y descanso.");
      } else if (data.hrv > 70) {
        insights.push("Tu HRV muestra excelente recuperación y estado físico.");
      }
    }
    
    if (data.sleep) {
      if (data.sleep < 6) {
        insights.push("Tu sueño está por debajo de lo recomendado. Prioriza tu descanso.");
      } else if (data.sleep >= 7 && data.sleep <= 9) {
        insights.push("Tu patrón de sueño es óptimo para tu recuperación.");
      }
    }
    
    return insights.join(" ") || "Datos analizados correctamente. Continúa registrando tu progreso.";
  }

  /**
   * Datos simulados de salud para desarrollo
   */
  private static async getSimulatedHealthData() {
    const hour = new Date().getHours();
    const isNight = hour >= 22 || hour < 6;
    
    return {
      steps: Math.floor(3000 + Math.random() * 7000),
      hrv: Math.floor(45 + Math.random() * 35),
      heartRate: Math.floor(60 + Math.random() * 30),
      sleepHours: isNight ? 6 + Math.random() * 2 : 0,
      sleepStages: {
        deepMinutes: Math.floor(60 + Math.random() * 40),
        remMinutes: Math.floor(80 + Math.random() * 40),
        lightMinutes: Math.floor(180 + Math.random() * 60),
      },
      glucose: Math.floor(80 + Math.random() * 30),
      weight: 70 + Math.random() * 10,
      timestamp: new Date()
    };
  }

  /**
   * Obtener estado de sincronización
   */
  static async getSyncStatus(): Promise<{
    provider: HealthProvider;
    lastSync: Date | null;
    connectedDevices: number;
    permissions: HealthPermissions;
  }> {
    if (!auth.currentUser) {
      return {
        provider: 'none',
        lastSync: null,
        connectedDevices: 0,
        permissions: this.permissions
      };
    }

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const data = userDoc.data();

    return {
      provider: data?.preferredHealthProvider || this.currentProvider,
      lastSync: data?.lastHealthSync?.toDate() || null,
      connectedDevices: data?.connectedDevices?.length || 0,
      permissions: data?.healthPermissions || this.permissions
    };
  }
}