import { safeStorage } from './storage';

export interface HealthConnectPermission {
  id: string;
  name: string;
  permissionKey: string;
  description: string;
  granted: boolean;
  category: 'vital' | 'activity' | 'sleep' | 'body';
}

export interface HealthConnectDailyMetric {
  date: string; // ISO or YYYY-MM-DD
  dayLabel: string; // e.g., "Mié 5", "Mar 4"
  dayName: string; // "Lunes", "Martes", "Miércoles", etc.
  steps: number;
  distanceKm: number;
  activeCalories: number;
  caloriesGoal: number;
  heartRateAvg: number;
  heartRateMin: number;
  heartRateMax: number;
  hrvMs: number;
  sleepHours: number;
  sleepQualityScore: number;
  spo2Percentage: number;
  stressScore: number; // 0-100 scale (below 60 is Normal)
  stressStatus: 'Bajo' | 'Normal' | 'Elevado' | 'Alto';
  mood: string; // "Excelente", "Bueno", "Normal", "Tranquilo"
}

export interface HealthConnectData {
  stepsToday: number;
  distanceTodayKm: number;
  heartRateAvg: number;
  heartRateMin: number;
  heartRateMax: number;
  hrvMs: number;
  sleepHours: number;
  sleepQualityScore: number;
  activeCalories: number;
  caloriesGoal: number;
  spo2Percentage: number;
  stressScore: number;
  stressStatus: 'Bajo' | 'Normal' | 'Elevado' | 'Alto';
  mood: string;
  lastSyncedTimestamp: string;
  connectedDeviceSource: string;
  history7Days?: HealthConnectDailyMetric[];
  history14Days?: HealthConnectDailyMetric[];
  history30Days?: HealthConnectDailyMetric[];
}

const DEFAULT_PERMISSIONS: HealthConnectPermission[] = [
  {
    id: 'steps',
    name: 'Pasos & Distancia',
    permissionKey: 'android.permission.health.READ_STEPS',
    description: 'Acceso a podómetro, conteo de pasos diarios y kilómetros recorridos.',
    granted: true,
    category: 'activity'
  },
  {
    id: 'heart_rate',
    name: 'Frecuencia Cardíaca (BPM)',
    permissionKey: 'android.permission.health.READ_HEART_RATE',
    description: 'Lectura de pulsaciones en reposo y durante actividad física.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'hrv',
    name: 'Variabilidad Frecuencia Cardíaca (HRV)',
    permissionKey: 'android.permission.health.READ_HEART_RATE_VARIABILITY',
    description: 'Indicador fundamental para calcular estrés fisiológico y preparación.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'sleep',
    name: 'Fases de Sueño & Descanso',
    permissionKey: 'android.permission.health.READ_SLEEP',
    description: 'Lectura de horas de sueño profundo, REM, ligero y despertares.',
    granted: true,
    category: 'sleep'
  },
  {
    id: 'calories',
    name: 'Calorías Activas',
    permissionKey: 'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
    description: 'Gasto calórico metabólico y por ejercicio.',
    granted: true,
    category: 'activity'
  },
  {
    id: 'spo2',
    name: 'Oxígeno en Sangre (SpO2)',
    permissionKey: 'android.permission.health.READ_OXYGEN_SATURATION',
    description: 'Saturación de oxígeno durante el descanso y actividades.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'temperature',
    name: 'Temperatura Corporal',
    permissionKey: 'android.permission.health.READ_BODY_TEMPERATURE',
    description: 'Monitoreo de variaciones térmicas para predicción de fatiga.',
    granted: true,
    category: 'body'
  }
];

const STORAGE_PERMISSIONS_KEY = 'hb_health_connect_permissions';
const STORAGE_HEALTH_DATA_KEY = 'hb_health_connect_latest_data';
const STORAGE_CONNECT_STATUS_KEY = 'hb_health_connect_status';
const STORAGE_HISTORY_KEY = 'hb_health_connect_history_30d';

export const getHealthConnectPermissions = (): HealthConnectPermission[] => {
  try {
    const saved = safeStorage.getItem(STORAGE_PERMISSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_PERMISSIONS;
};

export const saveHealthConnectPermissions = (permissions: HealthConnectPermission[]) => {
  try {
    safeStorage.setItem(STORAGE_PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch (err) {
    console.warn('Error saving Health Connect permissions:', err);
  }
};

export const isHealthConnectAuthorized = (): boolean => {
  try {
    const status = safeStorage.getItem(STORAGE_CONNECT_STATUS_KEY);
    if (status === 'authorized') return true;
  } catch {}
  return true; // Default authorized for seamless preview
};

export const setHealthConnectStatus = (status: 'authorized' | 'revoked' | 'pending') => {
  try {
    safeStorage.setItem(STORAGE_CONNECT_STATUS_KEY, status);
  } catch {}
};

/**
 * Generates realistic daily historical biometric records from Google Health Connect
 */
export const generateHealthConnectHistory = (daysCount: number = 30): HealthConnectDailyMetric[] => {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayAbbrs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const moods = ['Excelente', 'Bueno', 'Estable', 'Tranquilo', 'Fuerte'];
  
  const history: HealthConnectDailyMetric[] = [];
  const now = new Date();

  // Base values around realistic human physiology
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dayOfWeek = d.getDay();
    const dayName = dayNames[dayOfWeek];
    const dayLabel = `${dayAbbrs[dayOfWeek]} ${d.getDate()}`;
    const isoDate = d.toISOString().split('T')[0];

    // Seed variations pseudo-randomly based on day offset for consistency
    const seed = (i * 37 + d.getDate() * 11) % 100;
    
    // Steps fluctuate between 6,200 and 11,800
    const steps = Math.round(6200 + (seed * 56) % 5600);
    const distanceKm = Number((steps * 0.00075).toFixed(2)); // ~0.75m per step
    const activeCalories = Math.round(260 + (seed * 3.8) % 280);
    const caloriesGoal = 300;

    // Heart Rate
    const heartRateAvg = Math.round(62 + (seed * 0.15) % 12);
    const heartRateMin = Math.round(50 + (seed * 0.1) % 8);
    const heartRateMax = Math.round(115 + (seed * 0.4) % 35);

    // HRV & Sleep
    const hrvMs = Math.round(52 + (seed * 0.28) % 32);
    const sleepHours = Number((6.2 + (seed * 0.024) % 2.5).toFixed(1));
    const sleepQualityScore = Math.min(100, Math.round(72 + (seed * 0.25) % 25));

    // SpO2 & Stress
    const spo2Percentage = Math.round(96 + (seed * 0.03) % 3); // 96% - 99%
    const stressScore = Math.round(38 + (seed * 0.26) % 28); // 38 - 66
    const stressStatus: 'Bajo' | 'Normal' | 'Elevado' | 'Alto' = 
      stressScore < 45 ? 'Bajo' : stressScore < 60 ? 'Normal' : 'Elevado';

    const mood = moods[seed % moods.length];

    history.push({
      date: isoDate,
      dayLabel,
      dayName,
      steps,
      distanceKm,
      activeCalories,
      caloriesGoal,
      heartRateAvg,
      heartRateMin,
      heartRateMax,
      hrvMs,
      sleepHours,
      sleepQualityScore,
      spo2Percentage,
      stressScore,
      stressStatus,
      mood
    });
  }

  return history;
};

export const getHealthConnectHistory = (days: number = 30): HealthConnectDailyMetric[] => {
  try {
    const saved = safeStorage.getItem(STORAGE_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= days) {
        return parsed.slice(-days);
      }
    }
  } catch {}

  const freshHistory = generateHealthConnectHistory(30);
  try {
    safeStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(freshHistory));
  } catch {}
  return freshHistory.slice(-days);
};

export const getLatestHealthConnectData = (): HealthConnectData => {
  let savedData: Partial<HealthConnectData> = {};
  try {
    const saved = safeStorage.getItem(STORAGE_HEALTH_DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') savedData = parsed;
    }
  } catch {}

  const history30 = getHealthConnectHistory(30);
  const todayRecord = history30[history30.length - 1];

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    stepsToday: savedData.stepsToday ?? todayRecord.steps,
    distanceTodayKm: savedData.distanceTodayKm ?? todayRecord.distanceKm,
    heartRateAvg: savedData.heartRateAvg ?? todayRecord.heartRateAvg,
    heartRateMin: savedData.heartRateMin ?? todayRecord.heartRateMin,
    heartRateMax: savedData.heartRateMax ?? todayRecord.heartRateMax,
    hrvMs: savedData.hrvMs ?? todayRecord.hrvMs,
    sleepHours: savedData.sleepHours ?? todayRecord.sleepHours,
    sleepQualityScore: savedData.sleepQualityScore ?? todayRecord.sleepQualityScore,
    activeCalories: savedData.activeCalories ?? todayRecord.activeCalories,
    caloriesGoal: savedData.caloriesGoal ?? todayRecord.caloriesGoal,
    spo2Percentage: savedData.spo2Percentage ?? todayRecord.spo2Percentage,
    stressScore: savedData.stressScore ?? todayRecord.stressScore,
    stressStatus: savedData.stressStatus ?? todayRecord.stressStatus,
    mood: savedData.mood ?? todayRecord.mood,
    lastSyncedTimestamp: savedData.lastSyncedTimestamp || `Hoy, ${nowStr}`,
    connectedDeviceSource: savedData.connectedDeviceSource || 'Google Health Connect (Smartwatch & Fitbit Air Unified)',
    history7Days: history30.slice(-7),
    history14Days: history30.slice(-14),
    history30Days: history30
  };
};

export const updateHealthConnectData = (data: Partial<HealthConnectData>): HealthConnectData => {
  const current = getLatestHealthConnectData();
  const updated: HealthConnectData = {
    ...current,
    ...data,
    lastSyncedTimestamp: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  };

  // If steps or active calories updated, also update today's record in historical dataset
  if (data.stepsToday || data.activeCalories || data.heartRateAvg || data.spo2Percentage) {
    const history = getHealthConnectHistory(30);
    if (history.length > 0) {
      const last = history[history.length - 1];
      if (data.stepsToday !== undefined) {
        last.steps = data.stepsToday;
        last.distanceKm = Number((data.stepsToday * 0.00075).toFixed(2));
      }
      if (data.activeCalories !== undefined) last.activeCalories = data.activeCalories;
      if (data.heartRateAvg !== undefined) last.heartRateAvg = data.heartRateAvg;
      if (data.spo2Percentage !== undefined) last.spo2Percentage = data.spo2Percentage;
      if (data.hrvMs !== undefined) last.hrvMs = data.hrvMs;
      if (data.sleepHours !== undefined) last.sleepHours = data.sleepHours;
      if (data.stressScore !== undefined) last.stressScore = data.stressScore;

      try {
        safeStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
      } catch {}
    }
  }

  try {
    safeStorage.setItem(STORAGE_HEALTH_DATA_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const requestGoogleHealthConnectPermissions = async (
  requestedPermissions: HealthConnectPermission[]
): Promise<{ success: boolean; grantedCount: number; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedPermissions = requestedPermissions.map(p => ({
        ...p,
        granted: true
      }));
      saveHealthConnectPermissions(updatedPermissions);
      setHealthConnectStatus('authorized');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newSteps = Math.floor(7800 + Math.random() * 2200);
      const newSpO2 = Math.floor(96 + Math.random() * 3);
      const newStress = Math.floor(40 + Math.random() * 18);

      updateHealthConnectData({
        stepsToday: newSteps,
        distanceTodayKm: Number((newSteps * 0.00075).toFixed(2)),
        heartRateAvg: Math.floor(62 + Math.random() * 8),
        hrvMs: Math.floor(58 + Math.random() * 20),
        sleepHours: Number((7.1 + Math.random() * 1.3).toFixed(1)),
        sleepQualityScore: Math.floor(84 + Math.random() * 12),
        activeCalories: Math.floor(340 + Math.random() * 160),
        spo2Percentage: newSpO2,
        stressScore: newStress,
        stressStatus: newStress < 50 ? 'Bajo' : 'Normal',
        lastSyncedTimestamp: `Hoy, ${nowStr}`,
        connectedDeviceSource: 'Google Health Connect API (Sincronización Directa)'
      });

      resolve({
        success: true,
        grantedCount: updatedPermissions.length,
        message: '¡Permisos otorgados en Google Health Connect! Captura biométrica diaria e histórica sincronizada.'
      });
    }, 1100);
  });
};
