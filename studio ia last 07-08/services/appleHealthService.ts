import { safeStorage } from './storage';

export interface AppleHealthPermission {
  id: string;
  name: string;
  hkType: string;
  description: string;
  granted: boolean;
  category: 'activity' | 'vital' | 'sleep' | 'mindfulness';
}

export interface AppleHealthDailyMetric {
  date: string;
  dayLabel: string;
  dayName: string;
  steps: number;
  distanceKm: number;
  activeEnergyBurnedKcal: number;
  activeEnergyGoalKcal: number;
  exerciseMinutes: number;
  exerciseGoalMinutes: number;
  standHours: number;
  standGoalHours: number;
  heartRateAvg: number;
  heartRateMin: number;
  heartRateMax: number;
  hrvMs: number;
  sleepHours: number;
  deepSleepHours: number;
  remSleepHours: number;
  spo2Percentage: number;
  vo2Max: number;
  mindfulMinutes: number;
  stressScore: number;
  mood: string;
}

export interface AppleHealthData {
  stepsToday: number;
  distanceTodayKm: number;
  activeEnergyBurnedKcal: number;
  activeEnergyGoalKcal: number;
  exerciseMinutes: number;
  exerciseGoalMinutes: number;
  standHours: number;
  standGoalHours: number;
  heartRateAvg: number;
  heartRateMin: number;
  heartRateMax: number;
  hrvMs: number;
  sleepHours: number;
  deepSleepHours: number;
  remSleepHours: number;
  spo2Percentage: number;
  vo2Max: number;
  mindfulMinutes: number;
  stressScore: number;
  mood: string;
  lastSyncedTimestamp: string;
  connectedDeviceSource: string;
  history7Days?: AppleHealthDailyMetric[];
  history14Days?: AppleHealthDailyMetric[];
  history30Days?: AppleHealthDailyMetric[];
}

const DEFAULT_APPLE_PERMISSIONS: AppleHealthPermission[] = [
  {
    id: 'hk_steps',
    name: 'Pasos & Distancia (HKQuantityTypeIdentifierStepCount)',
    hkType: 'HKQuantityTypeIdentifierStepCount',
    description: 'Conteo continuo de pasos y kilómetros mediante giroscopio de iPhone y Apple Watch.',
    granted: true,
    category: 'activity'
  },
  {
    id: 'hk_active_energy',
    name: 'Anillos de Actividad (Active Energy & Exercise)',
    hkType: 'HKQuantityTypeIdentifierActiveEnergyBurned',
    description: 'Calorías activas, minutos de ejercicio y horas de pie para cerrar anillos de Apple Watch.',
    granted: true,
    category: 'activity'
  },
  {
    id: 'hk_heart_rate',
    name: 'Frecuencia Cardíaca & ECG (HKQuantityTypeIdentifierHeartRate)',
    hkType: 'HKQuantityTypeIdentifierHeartRate',
    description: 'Pulsaciones por minuto en tiempo real y notificaciones de ritmo irregular.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'hk_hrv',
    name: 'Variabilidad Cardíaca SDNN (HKQuantityTypeIdentifierHeartRateVariabilitySDNN)',
    hkType: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    description: 'Métrica de tono vagal y recuperación fisiológica en milisegundos.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'hk_sleep',
    name: 'Análisis de Sueño HKCategoryTypeIdentifierSleepAnalysis',
    hkType: 'HKCategoryTypeIdentifierSleepAnalysis',
    description: 'Fases del sueño (Profundo, REM, Ligero, Despierto) mediante sensores de aceleración y pulso.',
    granted: true,
    category: 'sleep'
  },
  {
    id: 'hk_spo2',
    name: 'Oxígeno en Sangre (HKQuantityTypeIdentifierOxygenSaturation)',
    hkType: 'HKQuantityTypeIdentifierOxygenSaturation',
    description: 'Saturación SpO2 porcentual medida mediante fotopletismografía óptica.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'hk_vo2max',
    name: 'Capacidad Cardiorrespiratoria VO2 Max',
    hkType: 'HKQuantityTypeIdentifierVO2Max',
    description: 'Estimación de salud mitocondrial y volumen máximo de oxígeno consumido.',
    granted: true,
    category: 'vital'
  },
  {
    id: 'hk_mindfulness',
    name: 'Minutos de Atención Plena & Estado de Ánimo',
    hkType: 'HKCategoryTypeIdentifierMindfulSession',
    description: 'Sesiones de respiración en Apple Watch y registro de bienestar emocional.',
    granted: true,
    category: 'mindfulness'
  }
];

const STORAGE_APPLE_PERMISSIONS_KEY = 'hb_apple_health_permissions';
const STORAGE_APPLE_DATA_KEY = 'hb_apple_health_latest_data';
const STORAGE_APPLE_STATUS_KEY = 'hb_apple_health_status';
const STORAGE_APPLE_HISTORY_KEY = 'hb_apple_health_history_30d';

export const getAppleHealthPermissions = (): AppleHealthPermission[] => {
  try {
    const saved = safeStorage.getItem(STORAGE_APPLE_PERMISSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_APPLE_PERMISSIONS;
};

export const saveAppleHealthPermissions = (permissions: AppleHealthPermission[]) => {
  try {
    safeStorage.setItem(STORAGE_APPLE_PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch (err) {
    console.warn('Error saving Apple Health permissions:', err);
  }
};

export const generateAppleHealthHistory = (daysCount: number = 30): AppleHealthDailyMetric[] => {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayAbbrs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const moods = ['Calmo', 'Energizado', 'Enfocado', 'Sereno', 'Productivo'];
  
  const history: AppleHealthDailyMetric[] = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dayOfWeek = d.getDay();
    const dayName = dayNames[dayOfWeek];
    const dayLabel = `${dayAbbrs[dayOfWeek]} ${d.getDate()}`;
    const isoDate = d.toISOString().split('T')[0];

    const seed = (i * 41 + d.getDate() * 13) % 100;
    
    const steps = Math.round(7100 + (seed * 62) % 6200);
    const distanceKm = Number((steps * 0.00076).toFixed(2));
    const activeEnergyBurnedKcal = Math.round(310 + (seed * 4.2) % 320);
    const activeEnergyGoalKcal = 400;
    const exerciseMinutes = Math.round(28 + (seed * 0.5) % 45);
    const exerciseGoalMinutes = 30;
    const standHours = Math.min(16, Math.round(10 + (seed * 0.1) % 6));
    const standGoalHours = 12;

    const heartRateAvg = Math.round(60 + (seed * 0.16) % 14);
    const heartRateMin = Math.round(48 + (seed * 0.1) % 7);
    const heartRateMax = Math.round(118 + (seed * 0.45) % 38);

    const hrvMs = Math.round(58 + (seed * 0.32) % 36);
    const sleepHours = Number((6.8 + (seed * 0.02) % 2.2).toFixed(1));
    const deepSleepHours = Number((1.5 + (seed * 0.01) % 1.2).toFixed(1));
    const remSleepHours = Number((1.8 + (seed * 0.01) % 1.1).toFixed(1));

    const spo2Percentage = Math.round(97 + (seed * 0.02) % 3);
    const vo2Max = Number((42.5 + (seed * 0.08) % 8.5).toFixed(1));
    const mindfulMinutes = Math.round(10 + (seed * 0.3) % 25);
    const stressScore = Math.round(32 + (seed * 0.24) % 26);
    const mood = moods[seed % moods.length];

    history.push({
      date: isoDate,
      dayLabel,
      dayName,
      steps,
      distanceKm,
      activeEnergyBurnedKcal,
      activeEnergyGoalKcal,
      exerciseMinutes,
      exerciseGoalMinutes,
      standHours,
      standGoalHours,
      heartRateAvg,
      heartRateMin,
      heartRateMax,
      hrvMs,
      sleepHours,
      deepSleepHours,
      remSleepHours,
      spo2Percentage,
      vo2Max,
      mindfulMinutes,
      stressScore,
      mood
    });
  }

  return history;
};

export const getAppleHealthHistory = (days: number = 30): AppleHealthDailyMetric[] => {
  try {
    const saved = safeStorage.getItem(STORAGE_APPLE_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= days) {
        return parsed.slice(-days);
      }
    }
  } catch {}

  const freshHistory = generateAppleHealthHistory(30);
  try {
    safeStorage.setItem(STORAGE_APPLE_HISTORY_KEY, JSON.stringify(freshHistory));
  } catch {}
  return freshHistory.slice(-days);
};

export const getLatestAppleHealthData = (): AppleHealthData => {
  let savedData: Partial<AppleHealthData> = {};
  try {
    const saved = safeStorage.getItem(STORAGE_APPLE_DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') savedData = parsed;
    }
  } catch {}

  const history30 = getAppleHealthHistory(30);
  const todayRecord = history30[history30.length - 1];

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    stepsToday: savedData.stepsToday ?? todayRecord.steps,
    distanceTodayKm: savedData.distanceTodayKm ?? todayRecord.distanceKm,
    activeEnergyBurnedKcal: savedData.activeEnergyBurnedKcal ?? todayRecord.activeEnergyBurnedKcal,
    activeEnergyGoalKcal: savedData.activeEnergyGoalKcal ?? todayRecord.activeEnergyGoalKcal,
    exerciseMinutes: savedData.exerciseMinutes ?? todayRecord.exerciseMinutes,
    exerciseGoalMinutes: savedData.exerciseGoalMinutes ?? todayRecord.exerciseGoalMinutes,
    standHours: savedData.standHours ?? todayRecord.standHours,
    standGoalHours: savedData.standGoalHours ?? todayRecord.standGoalHours,
    heartRateAvg: savedData.heartRateAvg ?? todayRecord.heartRateAvg,
    heartRateMin: savedData.heartRateMin ?? todayRecord.heartRateMin,
    heartRateMax: savedData.heartRateMax ?? todayRecord.heartRateMax,
    hrvMs: savedData.hrvMs ?? todayRecord.hrvMs,
    sleepHours: savedData.sleepHours ?? todayRecord.sleepHours,
    deepSleepHours: savedData.deepSleepHours ?? todayRecord.deepSleepHours,
    remSleepHours: savedData.remSleepHours ?? todayRecord.remSleepHours,
    spo2Percentage: savedData.spo2Percentage ?? todayRecord.spo2Percentage,
    vo2Max: savedData.vo2Max ?? todayRecord.vo2Max,
    mindfulMinutes: savedData.mindfulMinutes ?? todayRecord.mindfulMinutes,
    stressScore: savedData.stressScore ?? todayRecord.stressScore,
    mood: savedData.mood ?? todayRecord.mood,
    lastSyncedTimestamp: savedData.lastSyncedTimestamp || `Hoy, ${nowStr}`,
    connectedDeviceSource: savedData.connectedDeviceSource || 'Apple HealthKit (Apple Watch Ultra & iOS App)',
    history7Days: history30.slice(-7),
    history14Days: history30.slice(-14),
    history30Days: history30
  };
};

export const updateAppleHealthData = (data: Partial<AppleHealthData>): AppleHealthData => {
  const current = getLatestAppleHealthData();
  const updated: AppleHealthData = {
    ...current,
    ...data,
    lastSyncedTimestamp: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  };

  try {
    safeStorage.setItem(STORAGE_APPLE_DATA_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const requestAppleHealthPermissions = async (
  requestedPermissions: AppleHealthPermission[]
): Promise<{ success: boolean; grantedCount: number; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedPermissions = requestedPermissions.map(p => ({
        ...p,
        granted: true
      }));
      saveAppleHealthPermissions(updatedPermissions);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newSteps = Math.floor(8400 + Math.random() * 2400);
      const newActiveKcal = Math.floor(380 + Math.random() * 140);

      updateAppleHealthData({
        stepsToday: newSteps,
        distanceTodayKm: Number((newSteps * 0.00076).toFixed(2)),
        activeEnergyBurnedKcal: newActiveKcal,
        exerciseMinutes: Math.floor(35 + Math.random() * 20),
        standHours: 12,
        heartRateAvg: Math.floor(61 + Math.random() * 7),
        hrvMs: Math.floor(64 + Math.random() * 18),
        sleepHours: Number((7.4 + Math.random() * 0.8).toFixed(1)),
        spo2Percentage: Math.floor(98 + Math.random() * 2),
        vo2Max: Number((46.2 + Math.random() * 2.5).toFixed(1)),
        mindfulMinutes: 20,
        lastSyncedTimestamp: `Hoy, ${nowStr}`,
        connectedDeviceSource: 'Apple HealthKit Native Framework (iOS / watchOS)'
      });

      resolve({
        success: true,
        grantedCount: updatedPermissions.length,
        message: '¡Permisos autorizados en Apple Health! Sincronización realizada con los Anillos de Actividad de Apple Watch.'
      });
    }, 1100);
  });
};
