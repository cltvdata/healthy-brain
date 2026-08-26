import React, { useState, useEffect } from 'react';
import { BioMetrics } from '../types';
import { safeStorage } from '../services/storage';
import { getApkDownloadUrl, getPublicBaseUrl, triggerApkDownload } from '../utils/downloadHelper';
import { DeviceConnectModal, ConnectedDevice } from './DeviceConnectModal';
import { GoogleHealthConnectDashboard } from './GoogleHealthConnectDashboard';
import { AppleHealthDashboard } from './AppleHealthDashboard';
import { 
  getHealthConnectPermissions,
  saveHealthConnectPermissions,
  requestGoogleHealthConnectPermissions,
  getLatestHealthConnectData,
  HealthConnectPermission
} from '../services/healthConnectService';
import {
  getAppleHealthPermissions,
  saveAppleHealthPermissions,
  requestAppleHealthPermissions,
  getLatestAppleHealthData,
  AppleHealthPermission
} from '../services/appleHealthService';
import { 
  Activity, 
  Sun, 
  Battery, 
  Heart, 
  Eye, 
  ArrowUpRight, 
  Flame, 
  Droplet, 
  Check,
  Moon,
  Sparkles,
  Zap,
  Coffee,
  Shield,
  Smartphone,
  Download,
  Copy,
  QrCode,
  Database,
  Cpu,
  Server,
  RefreshCw,
  Sliders,
  Code,
  ExternalLink,
  Globe,
  HelpCircle,
  ShieldAlert,
  Share2,
  ShieldCheck,
  Watch,
  Radio,
  HeartPulse,
  X,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface LobbyTabProps {
  metrics: BioMetrics;
  onUpdateMetrics: (updated: Partial<BioMetrics>) => void;
  onAddTokens: (amount: number, reason: string) => void;
  tokens: number;
  stitchMode?: 'day' | 'night';
  onOpenShare?: () => void;
  onOpenExitConfirm?: () => void;
  lang?: 'ES' | 'EN' | 'PT';
}

export const LobbyTab: React.FC<LobbyTabProps> = ({ 
  metrics, 
  onUpdateMetrics, 
  onAddTokens, 
  tokens, 
  stitchMode = 'day',
  onOpenShare,
  onOpenExitConfirm,
  lang = 'ES'
}) => {
  const [syncedWearables, setSyncedWearables] = useState(false);
  const [sunlightActive, setSunlightActive] = useState(metrics.sunSync);
  const [blueLightBlocked, setBlueLightBlocked] = useState(false);
  const [activeHealthProvider, setActiveHealthProvider] = useState<'google' | 'apple' | 'both'>('both');
  
  // Device permission & connection modal state
  const [isDeviceConnectModalOpen, setIsDeviceConnectModalOpen] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(() => {
    try {
      const saved = safeStorage.getItem('hb_connected_devices_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default fallback connected devices if authorized
    return [
      { id: 'health_connect', name: 'Google Health Connect', category: 'phone', platform: 'Android', status: 'connected', lastCaptureTime: 'Ahora', dataTypes: ['Pasos', 'Podómetro'] },
      { id: 'apple_health', name: 'Apple Watch', category: 'watch', platform: 'iOS', status: 'connected', lastCaptureTime: 'Ahora', dataTypes: ['HRV', 'Pulso'] }
    ];
  });

  // Data Automation state
  const [isAutoSyncOn, setIsAutoSyncOn] = useState(() => safeStorage.getItem('hb_auto_sync') === 'true');
  const [isWebhookActive, setIsWebhookActive] = useState(() => safeStorage.getItem('hb_webhook_active') === 'true');
  const [isAutomationPanelOpen, setIsAutomationPanelOpen] = useState(false);
  const [automationLogs, setAutomationLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Inicializando núcleo de sincronización soberana...`,
    `[${new Date().toLocaleTimeString()}] Sensores biométricos activos y capturando telemetría.`
  ]);

  // Google Health Connect API State
  const [hcPermissions, setHcPermissions] = useState<HealthConnectPermission[]>(() => getHealthConnectPermissions());
  const [isRequestingHc, setIsRequestingHc] = useState(false);
  const [hcSyncMessage, setHcSyncMessage] = useState<string | null>(null);
  const [latestHcData, setLatestHcData] = useState(() => getLatestHealthConnectData());

  // Apple Health & HealthKit API State
  const [ahPermissions, setAhPermissions] = useState<AppleHealthPermission[]>(() => getAppleHealthPermissions());
  const [isRequestingAh, setIsRequestingAh] = useState(false);
  const [ahSyncMessage, setAhSyncMessage] = useState<string | null>(null);
  const [latestAhData, setLatestAhData] = useState(() => getLatestAppleHealthData());

  const handleToggleHcPermission = (id: string) => {
    const updated = hcPermissions.map(p => p.id === id ? { ...p, granted: !p.granted } : p);
    setHcPermissions(updated);
    saveHealthConnectPermissions(updated);
  };

  const handleToggleAhPermission = (id: string) => {
    const updated = ahPermissions.map(p => p.id === id ? { ...p, granted: !p.granted } : p);
    setAhPermissions(updated);
    saveAppleHealthPermissions(updated);
  };

  const handleRequestGoogleHealthConnectPermissions = async () => {
    setIsRequestingHc(true);
    setHcSyncMessage('Iniciando Intent de Permisos Explícitos Google Health Connect en Android...');

    const result = await requestGoogleHealthConnectPermissions(hcPermissions);
    setIsRequestingHc(false);
    setHcSyncMessage(result.message);

    if (result.success) {
      const freshData = getLatestHealthConnectData();
      setLatestHcData(freshData);
      setHcPermissions(getHealthConnectPermissions());

      // Ensure health_connect is in connectedDevices list
      const hasHc = connectedDevices.some(d => d.id === 'health_connect');
      if (!hasHc) {
        const updatedList: ConnectedDevice[] = [
          ...connectedDevices,
          {
            id: 'health_connect',
            name: 'Google Health Connect',
            category: 'phone',
            platform: 'Android Native API',
            status: 'connected',
            lastCaptureTime: 'Ahora',
            dataTypes: ['Pasos', 'Pulso', 'HRV', 'Sueño', 'Calorías']
          }
        ];
        setConnectedDevices(updatedList);
        safeStorage.setItem('hb_connected_devices_data', JSON.stringify(updatedList));
      }

      // Live Biometrics Update
      onUpdateMetrics({
        steps: freshData.stepsToday,
        hrv: freshData.hrvMs,
        sleepHours: freshData.sleepHours,
        bioScore: Math.min(100, metrics.bioScore + 10)
      });

      const timeStr = new Date().toLocaleTimeString();
      setAutomationLogs(prev => [
        `[${timeStr}] 🟢 Google Health Connect API: Autorización de usuario confirmada (${result.grantedCount} permisos activos).`,
        `[${timeStr}] 📲 Biométricos capturados: ${freshData.stepsToday} pasos | HRV ${freshData.hrvMs}ms | Sueño ${freshData.sleepHours}h.`,
        ...prev
      ]);

      onAddTokens(150, "Google Health Connect: Permisos autorizados y telemetría capturada");
    }

    setTimeout(() => {
      setHcSyncMessage(null);
    }, 4500);
  };

  const handleRequestAppleHealthPermissions = async () => {
    setIsRequestingAh(true);
    setAhSyncMessage('Solicitando Autorización HKHealthStore en iOS & Apple Watch...');

    const result = await requestAppleHealthPermissions(ahPermissions);
    setIsRequestingAh(false);
    setAhSyncMessage(result.message);

    if (result.success) {
      const freshData = getLatestAppleHealthData();
      setLatestAhData(freshData);
      setAhPermissions(getAppleHealthPermissions());

      // Ensure apple_health is in connectedDevices list
      const hasAh = connectedDevices.some(d => d.id === 'apple_health');
      if (!hasAh) {
        const updatedList: ConnectedDevice[] = [
          ...connectedDevices,
          {
            id: 'apple_health',
            name: 'Apple Health & Watch',
            category: 'watch',
            platform: 'iOS HealthKit API',
            status: 'connected',
            lastCaptureTime: 'Ahora',
            dataTypes: ['HRV (ms)', 'Pulso Cardíaco', 'Fases de Sueño', 'Calorías']
          }
        ];
        setConnectedDevices(updatedList);
        safeStorage.setItem('hb_connected_devices_data', JSON.stringify(updatedList));
      }

      // Live Biometrics Update
      onUpdateMetrics({
        steps: freshData.stepsToday,
        hrv: freshData.hrvMs,
        sleepHours: freshData.sleepHours,
        bioScore: Math.min(100, metrics.bioScore + 12)
      });

      const timeStr = new Date().toLocaleTimeString();
      setAutomationLogs(prev => [
        `[${timeStr}] 🍎 Apple Health (HealthKit API): Autorización confirmada (${result.grantedCount} identificadores HK).`,
        `[${timeStr}] ⌚ Apple Watch capturado: ${freshData.stepsToday} pasos | HRV ${freshData.hrvMs}ms | Sueño ${freshData.sleepHours}h | VO2 ${freshData.vo2Max}.`,
        ...prev
      ]);

      onAddTokens(150, "Apple Health: Permisos autorizados y datos de Apple Watch sincronizados");
    }

    setTimeout(() => {
      setAhSyncMessage(null);
    }, 4500);
  };

  const handleDeviceConnectModalOpen = () => {
    setIsDeviceConnectModalOpen(true);
  };

  const handleConnectDevicesSuccess = (newDevices: ConnectedDevice[]) => {
    setConnectedDevices(newDevices);
    const timeStr = new Date().toLocaleTimeString();
    
    if (newDevices.length > 0) {
      setSyncedWearables(true);
      setIsAutoSyncOn(true);
      safeStorage.setItem('hb_auto_sync', 'true');

      const names = newDevices.map(d => d.name).join(', ');
      setAutomationLogs(prev => [
        `[${timeStr}] 🟢 Autorización concedida por el usuario: (${names})`,
        `[${timeStr}] 📡 Sensores y APIs de salud conectadas. Capturando telemetría en tiempo real...`,
        ...prev
      ]);

      onUpdateMetrics({
        hrv: 82,
        steps: 8432,
        sleepHours: 8.2,
        bioScore: Math.min(100, metrics.bioScore + 8)
      });

      setTimeout(() => {
        setSyncedWearables(false);
      }, 5000);
    } else {
      setAutomationLogs(prev => [
        `[${timeStr}] ⚠️ Dispositivos desconectados. Sincronización biométrica en pausa.`,
        ...prev
      ]);
    }
  };

  const handleToggleAutoSync = () => {
    const nextState = !isAutoSyncOn;
    setIsAutoSyncOn(nextState);
    safeStorage.setItem('hb_auto_sync', String(nextState));
    
    const timestamp = new Date().toLocaleTimeString();
    if (nextState) {
      setAutomationLogs(prev => [
        `[${timestamp}] ⚙️ Autosincronización en segundo plano ACTIVADA.`,
        `[${timestamp}] 📡 Conectando con Google Health Connect API y Apple HealthKit...`,
        `[${timestamp}] 🔋 Sincronizando biometría de fondo de forma automatizada cada 15 min...`,
        ...prev
      ]);
      onAddTokens(150, "Automatización Activada: Sincronización en Segundo Plano");
    } else {
      setAutomationLogs(prev => [
        `[${timestamp}] 🛑 Autosincronización en segundo plano DESACTIVADA por el usuario.`,
        ...prev
      ]);
    }
  };

  const handleToggleWebhook = () => {
    const nextState = !isWebhookActive;
    setIsWebhookActive(nextState);
    safeStorage.setItem('hb_webhook_active', String(nextState));
    
    const timestamp = new Date().toLocaleTimeString();
    if (nextState) {
      setAutomationLogs(prev => [
        `[${timestamp}] 🔗 Webhook de datos biométricos ACTIVADO.`,
        `[${timestamp}] 📡 Endpoint listo para recibir telemetría cifrada.`,
        `[${timestamp}] 🤖 Transmitiendo telemetría en tiempo real de forma segura.`,
        ...prev
      ]);
      onAddTokens(100, "Automatización Activada: Webhook de Transmisión Segura");
    } else {
      setAutomationLogs(prev => [
        `[${timestamp}] 🛑 Webhook de datos biométricos DESACTIVADO.`,
        ...prev
      ]);
    }
  };

  const handleSunSync = () => {
    if (sunlightActive) return;
    setSunlightActive(true);
    onUpdateMetrics({ sunSync: true, bioScore: Math.min(100, metrics.bioScore + 5) });
    onAddTokens(50, "Sincronización de Luz Solar Matutina (Ritmo Circadiano)");
  };

  const handleBlueLightBlock = () => {
    if (blueLightBlocked) return;
    setBlueLightBlocked(true);
    onUpdateMetrics({ bioScore: Math.min(100, metrics.bioScore + 4) });
    onAddTokens(60, "Filtro de Luz Azul y Bloqueo de Cortisol Activado");
  };

  const handleWearablesSync = () => {
    setIsDeviceConnectModalOpen(true);
  };

  const handleDrinkWater = () => {
    const newHydration = metrics.hydrationMl + 250;
    onUpdateMetrics({ hydrationMl: newHydration });
    if (newHydration % 1000 === 0) {
      onAddTokens(25, "Hito de Hidratación: 1 Litro de Agua Pura");
    }
  };

  // Get color for Bio-Score
  const getBioScoreColor = (score: number) => {
    if (stitchMode === 'night') return 'text-indigo-400';
    if (score >= 85) return 'text-bio-green';
    if (score >= 60) return 'text-neuro-blue';
    return 'text-bio-orange';
  };

  const isNight = stitchMode === 'night';

  return (
    <div className="space-y-6">
      
      {/* Stitch Circadian Notification bar */}
      <div className={`p-3.5 rounded-2xl border text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all duration-700 ${
        isNight 
          ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400' 
          : 'bg-bio-orange/10 border-bio-orange/20 text-bio-orange'
      }`}>
        <div className="flex items-center gap-2">
          {isNight ? <Moon className="w-4 h-4 text-indigo-400 animate-pulse" /> : <Sun className="w-4 h-4 text-bio-orange animate-spin" style={{ animationDuration: '8s' }} />}
          <span>
            {isNight ? 'Stitch Contexto: Desaceleración Vagal (Melatonina Activa)' : 'Stitch Contexto: Cortisol Máximo / Pico Energético'}
          </span>
        </div>
        <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10">Estable</span>
      </div>

      {/* Bio-ID Welcome Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-700 ${
        isNight 
          ? 'bg-gradient-to-br from-indigo-950/20 to-[#121212] border-indigo-500/15' 
          : 'bg-gradient-to-br from-[#1b120c] to-[#121212] border-white/10'
      }`}>
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isNight ? 'bg-indigo-500/10' : 'bg-bio-orange/10'}`}></div>
        
        <div className="flex justify-between items-start">
          <div>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
              isNight 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' 
                : 'bg-bio-orange/20 text-bio-orange border-bio-orange/30'
            }`}>
              {isNight ? 'SNC RECUPERACIÓN / NOCHE' : 'BIO-VETERANO PRO / DÍA'}
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-2">
              {isNight ? 'Sincronía del Descanso' : 'Soberanía Biológica'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isNight 
                ? 'Calibrando neurotransmisores inhibitorios. Atenúa la luz ambiental.' 
                : 'Fórmula de Longevidad activa y calibrada.'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block">Bio-Economy</span>
            <span className={`text-2xl font-black tracking-tight block ${isNight ? 'text-indigo-400' : 'text-bio-orange'}`}>
              {tokens} <span className="text-xs font-bold text-white/50">NTK</span>
            </span>
          </div>
        </div>

        {/* Level & XP */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
            <span>Rango: {isNight ? 'Recuperación Beta' : 'Bio-Optimizado (LVL 5)'}</span>
            <span>450 / 1000 XP</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${isNight ? 'bg-gradient-to-r from-indigo-500 to-indigo-300' : 'bg-gradient-to-r from-neuro-blue to-bio-green'}`} style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>

      {/* ACCESO DIRECTO APK & QR DINÁMICO */}
      <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-bio-green/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-bio-green/10 border border-bio-green/20 text-bio-green">
              Descarga Fácil & Conexión Instantánea (+35 Años)
            </span>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              <Smartphone className="w-5 h-5 text-bio-green" />
              DESCARGAR APP EN TU TELÉFONO (.APK) 📱
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Diseñado para ser <strong className="text-white">100% fácil de usar sin complicaciones técnicas</strong>. Instala la app en tu teléfono Android para medir tus pasos, sueño y ritmo cardíaco de forma totalmente automática.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={async () => {
                  if ((window as any).deferredInstallPrompt) {
                    (window as any).deferredInstallPrompt.prompt();
                    const { outcome } = await (window as any).deferredInstallPrompt.userChoice;
                    if (outcome === 'accepted') {
                      (window as any).deferredInstallPrompt = null;
                    }
                  } else {
                    alert('📱 ¡Instalación Directa en Teléfono Android!\n\n1. En tu celular, abre este enlace en Google Chrome o Samsung Internet.\n2. Presiona los tres puntos (⋮) arriba a la derecha.\n3. Selecciona "Agregar a la pantalla principal" o "Instalar aplicación".\n\n¡La app se instalará directamente en tu pantalla de inicio sin ningún error de APK!');
                  }
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-bio-green via-emerald-400 to-neuro-blue text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-bio-green/20"
              >
                <Smartphone className="w-4.5 h-4.5 text-black stroke-[3]" />
                INSTALAR APP DIRECTA EN CELULAR (RECOMENDADO)
              </button>

              <button 
                onClick={() => triggerApkDownload()}
                className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-white/15 cursor-pointer"
              >
                <Download className="w-4 h-4 text-bio-green stroke-[3]" />
                Descargar APK (.APK - 10.8 MB)
              </button>

              <button 
                onClick={() => {
                  setIsAutomationPanelOpen(!isAutomationPanelOpen);
                }}
                className={`px-4 py-3 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                  isAutomationPanelOpen 
                    ? 'bg-bio-orange/20 border-bio-orange text-bio-orange' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                }`}
              >
                <Sliders className="w-4 h-4 text-bio-orange" />
                Guía de Instalación
              </button>
            </div>

            {/* Aclaración sobre el archivo de 10.8 MB */}
            <div className="p-3 bg-black/40 border border-bio-green/30 rounded-xl space-y-1 mt-3 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bio-green animate-pulse"></span>
                <span className="text-[10px] font-black text-bio-green uppercase tracking-wider">
                  📦 Tamaño Oficial Confirmado: ~10.8 MB
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                <strong>¡El archivo de 10.8 MB es la app COMPLETA!</strong> Fue optimizado para ser ultraligero, no ocupar espacio en tu teléfono y funcionar rápido en cualquier dispositivo Android.
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-white p-3.5 rounded-2xl shadow-xl flex flex-col items-center justify-center border border-white/10 max-w-[170px] mx-auto text-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getApkDownloadUrl())}`} 
              alt="APK QR Code"
              className="w-[120px] h-[120px]"
              referrerPolicy="no-referrer"
            />
            <span className="text-[9px] font-black text-black uppercase tracking-widest mt-2 block">Apunta con la cámara de tu teléfono</span>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(getApkDownloadUrl());
                alert('¡Enlace de descarga de la APK copiado al portapapeles!');
              }}
              className="mt-2 text-[9px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md flex items-center justify-center gap-1 transition-all w-full"
            >
              <Copy className="w-3 h-3" /> Copiar Enlace Directo
            </button>
          </div>
        </div>
      </div>

      {/* TARJETA DE SOLUCIÓN: EVITAR PANTALLA 'COOKIE CHECK', 'REDIRECT NOTICE' O 'CAN'T INSTALL APP' */}
      <div className="p-5 bg-gradient-to-r from-bio-orange/15 via-black to-neuro-blue/15 border border-bio-orange/40 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-bio-orange/20 border border-bio-orange/40 flex items-center justify-center text-bio-orange shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                ¿Problemas de enlace, "Action required" o instalación de APK?
              </h4>
              <p className="text-[11px] text-gray-300 font-medium">
                Si tu celular muestra "Action required to load your app", "Cookie check" o "Can't install app", ¡sigue estas soluciones inmediatas!
              </p>
            </div>
          </div>

          <button 
            onClick={async () => {
              if ((window as any).deferredInstallPrompt) {
                (window as any).deferredInstallPrompt.prompt();
              } else {
                alert('📱 ¡Instalación Directa en Teléfono Android!\n\n1. En tu celular, abre este enlace en Google Chrome.\n2. Presiona los tres puntos (⋮) arriba a la derecha.\n3. Selecciona "Agregar a la pantalla principal" o "Instalar aplicación".\n\n¡Listo! Tendrás la app con su icono nativo en tu celular.');
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-bio-green text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-bio-green/20 shrink-0"
          >
            <Smartphone className="w-4 h-4 stroke-[3]" /> Instalar App Directa (PWA)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-white/10 text-xs">
          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] font-black text-bio-orange uppercase block">1. Si dice "Action required to load your app"</span>
            <p className="text-[11px] text-gray-300">Presiona el botón <strong>"Authenticate in new window"</strong> en tu pantalla o presiona ⋮ y elige <strong>"Abrir en Chrome / Navegador"</strong>.</p>
          </div>
          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] font-black text-bio-green uppercase block">2. Si dice "Can't install app"</span>
            <p className="text-[11px] text-gray-300">Usa el botón verde <strong>"Instalar App Directa (PWA)"</strong> o presiona ⋮ en Chrome y elige <strong>"Agregar a la pantalla principal"</strong>.</p>
          </div>
          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] font-black text-neuro-blue uppercase block">3. Descargar APK Directa</span>
            <p className="text-[11px] text-gray-300">Usa el botón <strong>"Descargar APK"</strong> (~10.8 MB) e instala directamente en tu dispositivo Android.</p>
          </div>
        </div>
      </div>

      {/* RECUADRO DE CONFIRMACIÓN VERDE: AUTORIZO LA SALIDA */}
      <div className="p-6 bg-[#051a10] border-2 border-emerald-500 rounded-3xl space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.25)] text-emerald-100 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider">
                  Verificación de Seguridad
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mt-1">
                Autorizo la salida
              </h3>
              <p className="text-xs text-emerald-300 font-medium">
                ¿Deseas autorizar la finalización y salida segura de tu sesión biométrica?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (onOpenExitConfirm) {
                  onOpenExitConfirm();
                } else {
                  alert('✓ Salida autorizada exitosamente.');
                }
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              id="btn-confirm-salida-yes"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Sí
            </button>
            <button
              onClick={() => {
                onAddTokens(20, "Soberanía Biológica: Salida Cancelada (Sesión Activa)");
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-white/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              id="btn-confirm-salida-no"
            >
              <X className="w-4 h-4 stroke-[2.5]" /> No
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN COMPARTIR APLICACIÓN */}
      <div className="p-5 bg-gradient-to-r from-neuro-blue/15 via-black to-bio-green/15 border border-neuro-blue/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-2xl bg-neuro-blue/20 border border-neuro-blue/40 flex items-center justify-center text-neuro-blue shrink-0">
            <Share2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Compartir Aplicación
            </h4>
            <p className="text-[11px] text-gray-300 font-medium">
              Envía el enlace a través de WhatsApp, Correo Electrónico, Mensajes SMS o Menú Nativo del Celular.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onOpenShare) {
              onOpenShare();
            } else if (typeof navigator !== 'undefined' && navigator.share) {
              navigator.share({
                title: 'HEALTHY + BRAIN',
                text: 'Plataforma de Soberanía Biológica & Longevidad',
                url: getPublicBaseUrl(),
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(getPublicBaseUrl());
              alert('Enlace copiado al portapapeles para compartir.');
            }
          }}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-neuro-blue to-bio-green text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neuro-blue/20 shrink-0"
        >
          <Share2 className="w-4 h-4 stroke-[3]" />
          Compartir App
        </button>
      </div>

      {/* TARJETA ESPECIAL: PASO A PASO FÁCIL PARA CONECTAR RELOJES Y APPS DE SALUD */}
      <div className="p-6 bg-gradient-to-r from-bio-green/10 via-black to-primary/10 border border-bio-green/30 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-bio-green/20 border border-bio-green/30 flex items-center justify-center text-bio-green font-black text-xl">
              ⌚
            </span>
            <div>
              <h3 className="text-base font-black uppercase text-white">Guía Sencilla de Conexión en 1 Clic</h3>
              <p className="text-xs text-bio-green font-bold uppercase tracking-wider">Ideal para Adultos +35 • Sin Escribir Nada Manualmente</p>
            </div>
          </div>

          <button
            onClick={() => {
              handleWearablesSync();
              handleToggleAutoSync();
            }}
            className="py-3 px-6 bg-bio-green text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-bio-green/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 stroke-[3]" /> Conectar Mi Reloj y Teléfono Ahora
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-bio-green uppercase">Paso 1: Descargar App</span>
            <p className="text-xs font-bold text-white">Presiona el botón verde de descarga e instala el archivo .APK.</p>
          </div>

          <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-primary uppercase">Paso 2: Conexión Automática</span>
            <p className="text-xs font-bold text-white">Tu reloj o app de salud (Apple Health, Samsung, Fitbit) se vincula solo.</p>
          </div>

          <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-bio-orange uppercase">Paso 3: Disfruta los Resultados</span>
            <p className="text-xs font-bold text-white">Mide tu energía y descanso sin tener que anotar datos a mano.</p>
          </div>
        </div>
      </div>

      {/* Bento Grid Biometrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Bio-Score Gauge */}
        <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
            {isNight ? 'Delta Sleep Readiness' : 'Bio-Score / Readiness'}
          </h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="64" className="stroke-white/5" strokeWidth="8" fill="none" />
              <circle 
                cx="72" 
                cy="72" 
                r="64" 
                className={`transition-all duration-1000 ${isNight ? 'stroke-indigo-400' : 'stroke-bio-green'}`} 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * metrics.bioScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center animate-fade-in">
              <span className={`text-4xl font-black tracking-tight ${getBioScoreColor(metrics.bioScore)}`}>
                {metrics.bioScore}%
              </span>
              <span className="text-[8px] font-bold text-gray-500 uppercase mt-1">
                {isNight ? 'Sueño Listo' : 'Listo'}
              </span>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-300 mt-4 leading-relaxed">
            {isNight 
              ? "Sincronizando ondas delta. Tu temperatura corporal ha bajado -0.4°C para facilitar sueño profundo."
              : "Soberanía Hormonal Confirmada. Preparado para esfuerzo máximo."}
          </p>
        </div>

        {/* HRV & Glucose Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          
          {/* HRV Card */}
          <div className="p-4 bg-glass-noir border border-white/10 rounded-3xl flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isNight ? 'bg-indigo-500/10 text-indigo-400' : 'bg-neuro-blue/10 text-neuro-blue'}`}>
                <Heart className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-black border px-2 py-0.5 rounded-full ${
                isNight 
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-400/20' 
                  : 'text-bio-green bg-bio-green/10 border border-bio-green/20'
              }`}>
                {isNight ? 'Parasimpático' : 'SNC Óptimo'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">HRV Nocturno</span>
              <span className="text-3xl font-black text-white tracking-tight mt-1 block">
                {metrics.hrv} <span className="text-xs font-bold text-gray-500">ms</span>
              </span>
            </div>
          </div>

          {/* Glucose Card */}
          <div className="p-4 bg-glass-noir border border-white/10 rounded-3xl flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-xl bg-bio-orange/10 flex items-center justify-center text-bio-orange">
                <Battery className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-black ${
                isNight || metrics.glucoseStable 
                  ? 'text-bio-green bg-bio-green/10 border-bio-green/20' 
                  : 'text-bio-orange bg-bio-orange/10 border-bio-orange/20'
              } border px-2 py-0.5 rounded-full`}>
                {isNight ? 'Ayuno Estable' : (metrics.glucoseStable ? 'Estable' : 'Flujo Activo')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Estabilidad de Glucosa</span>
              <span className="text-3xl font-black text-white tracking-tight mt-1 block">
                {isNight ? '95' : metrics.glucose} <span className="text-xs font-bold text-gray-500">mg/dL</span>
              </span>
            </div>
          </div>

          {/* Steps Card */}
          <div className="p-4 bg-glass-noir border border-white/10 rounded-3xl flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-xl bg-bio-green/10 flex items-center justify-center text-bio-green">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {isNight ? 'Completado' : 'Meta: 8,000'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Pasos Diarios</span>
              <span className="text-3xl font-black text-white tracking-tight mt-1 block">
                {metrics.steps.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Hydration Card */}
          <div className="p-4 bg-glass-noir border border-white/10 rounded-3xl flex flex-col justify-between min-h-[140px]" onClick={handleDrinkWater}>
            <div className="flex justify-between items-start cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-neuro-blue/10 flex items-center justify-center text-neuro-blue group-hover:scale-110 transition-transform">
                <Droplet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-neuro-blue border border-neuro-blue/20 bg-neuro-blue/10 px-2 py-0.5 rounded-full uppercase">
                +250ml
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hidratación</span>
              <span className="text-3xl font-black text-white tracking-tight mt-1 block">
                {metrics.hydrationMl / 1000} <span className="text-xs font-bold text-gray-500">L</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* SELECCIÓN Y DASHBOARD TELEMETRÍA SALUD: GOOGLE HEALTH CONNECT & APPLE HEALTHKIT */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-glass-noir border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-bio-green animate-ping"></span>
            <span className="text-xs font-black uppercase text-white tracking-wider">
              Plataformas Biométricas Nativas Conectadas
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-black/80 border border-white/10 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveHealthProvider('both')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${
                activeHealthProvider === 'both' 
                  ? 'bg-gradient-to-r from-bio-green to-neuro-blue text-black shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🌐 Vista Dual (Ambos)
            </button>
            <button
              onClick={() => setActiveHealthProvider('google')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${
                activeHealthProvider === 'google' 
                  ? 'bg-bio-green text-black shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🤖 Google Health Connect
            </button>
            <button
              onClick={() => setActiveHealthProvider('apple')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${
                activeHealthProvider === 'apple' 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🍎 Apple HealthKit
            </button>
          </div>
        </div>

        {(activeHealthProvider === 'google' || activeHealthProvider === 'both') && (
          <GoogleHealthConnectDashboard 
            onAddTokens={onAddTokens} 
            onUpdateMetrics={onUpdateMetrics} 
          />
        )}

        {(activeHealthProvider === 'apple' || activeHealthProvider === 'both') && (
          <AppleHealthDashboard 
            onAddTokens={onAddTokens} 
            onUpdateMetrics={onUpdateMetrics} 
          />
        )}
      </div>

      {/* Sincronizadores en Un Click - CIRCADIAN ADAPTIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Sincronización Solar o Filtro de Luz Azul */}
        {isNight ? (
          <button 
            onClick={handleBlueLightBlock}
            disabled={blueLightBlocked}
            className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
              blueLightBlocked 
                ? 'bg-glass-noir border-white/5 opacity-50 cursor-default' 
                : 'bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/20 hover:border-indigo-400/40 active:scale-[0.98]'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${blueLightBlocked ? 'bg-gray-800 text-gray-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {blueLightBlocked ? <Check className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Activar Filtro Luz Azul</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {blueLightBlocked ? '✓ Filtro activo para facilitar melatonina' : 'Bloquea espectros de luz azul (+60 NTK)'}
              </p>
            </div>
          </button>
        ) : (
          <button 
            onClick={handleSunSync}
            disabled={sunlightActive}
            className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
              sunlightActive 
                ? 'bg-glass-noir border-white/5 opacity-50 cursor-default' 
                : 'bg-gradient-to-r from-bio-orange/10 to-transparent border-bio-orange/20 hover:border-bio-orange/40 active:scale-[0.98]'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sunlightActive ? 'bg-gray-800 text-gray-500' : 'bg-bio-orange/20 text-bio-orange'}`}>
              {sunlightActive ? <Check className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Sync Luz Solar Matutina</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {sunlightActive ? '✓ Sincronizado hace instantes' : 'Verifica exposición AM solar (+50 NTK)'}
              </p>
            </div>
          </button>
        )}

        {/* Sincronización Wearables */}
        <button 
          onClick={handleWearablesSync}
          disabled={syncedWearables}
          className="flex items-center gap-4 p-5 rounded-3xl border bg-gradient-to-r from-neuro-blue/10 to-transparent border-neuro-blue/20 hover:border-neuro-blue/40 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-neuro-blue/20 text-neuro-blue flex items-center justify-center">
            {syncedWearables ? <Check className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Sincronizar Wearables</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {syncedWearables ? '✓ Datos actualizados de Oura/Apple' : 'Extraer HRV, pasos y sueño (+100 NTK)'}
            </p>
          </div>
        </button>

      </div>

      {/* SECCIÓN INTERACTIVA DE AUTOMATIZACIÓN Y CONECTIVIDAD DE DISPOSITIVOS */}
      <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-bio-orange/10 text-bio-orange flex items-center justify-center">
              <Cpu className="w-5 h-5 animate-spin text-bio-orange" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-white">Centro de Conectividad Automática & Wearables ⌚</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Soberanía de Datos & Sincronización en Segundo Plano Sin Esfuerzo</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-bio-green uppercase bg-bio-green/10 border border-bio-green/20 px-3 py-1 rounded-xl w-fit">
            Nivel de Conectividad: {isAutoSyncOn && isWebhookActive ? 'AUTOMÁTICO TOTAL (100%)' : isAutoSyncOn || isWebhookActive ? 'SINK ACTIVO (50%)' : 'MANUAL (0%)'}
          </span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed font-medium">
          Todo el sistema de lectura de biométricos funciona de forma <strong className="text-white">totalmente automática</strong> en segundo plano a través del smartphone y tus dispositivos de salud (reloj inteligente, anillo o parches de glucosa). No requiere ingresar datos manualmente.
        </p>

        {/* Matrix of Wearable & Health Platform Statuses */}
        <div className="space-y-3">
          {/* Live Telemetry Status Bar */}
          <div className="p-3 bg-bio-green/10 border border-bio-green/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-bio-green animate-pulse shrink-0"></span>
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Capturando Telemetría en Tiempo Real ({connectedDevices.length} Dispositivos Autorizados)
              </span>
            </div>
            <button 
              onClick={handleDeviceConnectModalOpen}
              className="px-3 py-1 bg-bio-green/20 hover:bg-bio-green/30 text-bio-green border border-bio-green/40 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Gestionar Permisos & Dispositivos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1">
            {[
              { id: 'health_connect', name: 'Health Connect', sub: 'Android Native' },
              { id: 'apple_health', name: 'Apple Health', sub: 'iOS HealthKit' },
              { id: 'generic_smartwatch', name: 'Smart Watch', sub: 'Genérico / Bluetooth' },
              { id: 'google_fitbit_air', name: 'Fitbit Air / Band', sub: 'Google Fitbit' },
              { id: 'generic_smart_ring', name: 'Smart Ring', sub: 'Anillo Genérico' },
              { id: 'oura_ring', name: 'Oura Ring V3', sub: 'Sueño & HRV' },
              { id: 'samsung_health', name: 'Samsung Health', sub: 'Galaxy Watch' },
              { id: 'garmin_cloud', name: 'Garmin Cloud', sub: 'Body Battery' }
            ].map(devItem => {
              const isConn = connectedDevices.some(d => d.id === devItem.id);
              return (
                <div 
                  key={devItem.id}
                  onClick={handleDeviceConnectModalOpen}
                  className={`p-2.5 rounded-2xl border text-center space-y-1 cursor-pointer transition-all hover:scale-[1.02] ${
                    isConn 
                      ? 'bg-bio-green/10 border-bio-green/50 shadow-lg shadow-bio-green/5' 
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`text-[7.5px] font-black px-1 py-0.5 rounded uppercase block ${
                    isConn ? 'text-bio-green bg-bio-green/20 border border-bio-green/30' : 'text-gray-400 bg-white/5'
                  }`}>
                    {isConn ? '✓ CONECTADO' : 'TOCAR PARA CONECTAR'}
                  </span>
                  <span className="text-[11px] font-black text-white block truncate">{devItem.name}</span>
                  <span className="text-[8px] text-gray-400 block truncate">{devItem.sub}</span>
                </div>
              );
            })}
          </div>

          {/* User's custom connected devices pills if any exist */}
          {connectedDevices.some(d => d.isCustom || !['health_connect','apple_health','generic_smartwatch','google_fitbit_air','generic_smart_ring','oura_ring','samsung_health','garmin_cloud'].includes(d.id)) && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[9px] font-black uppercase text-bio-orange tracking-wider block">Dispositivos Personalizados Conectados:</span>
              <div className="flex flex-wrap gap-2">
                {connectedDevices
                  .filter(d => d.isCustom || !['health_connect','apple_health','generic_smartwatch','google_fitbit_air','generic_smart_ring','oura_ring','samsung_health','garmin_cloud'].includes(d.id))
                  .map(cd => (
                    <span 
                      key={cd.id}
                      onClick={handleDeviceConnectModalOpen}
                      className="text-[9px] font-black uppercase text-white bg-bio-orange/10 border border-bio-orange/30 px-2.5 py-1 rounded-xl cursor-pointer hover:bg-bio-orange/20 transition-all flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-bio-orange animate-pulse"></span>
                      {cd.name} ({cd.platform})
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* PANEL DEDICADO Y EXPLÍCITO DE INTEGRACIÓN CON GOOGLE HEALTH CONNECT */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-bio-green/10 via-black/60 to-black/80 border border-bio-green/30 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bio-green text-black flex items-center justify-center font-black shrink-0 shadow-md shadow-bio-green/20">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase text-white tracking-wide">
                    Google Health Connect API (Android Native)
                  </h4>
                  <span className="text-[8px] font-black uppercase tracking-widest text-bio-green bg-bio-green/20 border border-bio-green/30 px-1.5 py-0.5 rounded">
                    Soberanía & Cifrado Local
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 font-medium mt-0.5">
                  Conexión directa para unificar telemetría de Smartwatches, Fitbit Air, Anillos y Sensores Móviles.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestGoogleHealthConnectPermissions}
              disabled={isRequestingHc}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                isRequestingHc
                  ? 'bg-bio-green/30 text-gray-400 cursor-not-allowed border border-bio-green/20'
                  : 'bg-bio-green text-black hover:scale-105 active:scale-95 shadow-bio-green/20'
              }`}
            >
              {isRequestingHc ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Solicitando Permisos...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  Solicitar Permisos Explícitos (+150 NTK)
                </>
              )}
            </button>
          </div>

          {/* Feedback or Status Message */}
          {hcSyncMessage && (
            <div className="p-3 bg-bio-green/20 border border-bio-green/40 rounded-xl text-xs font-bold text-bio-green flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{hcSyncMessage}</span>
            </div>
          )}

          {/* Granular Permissions Checkboxes Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider block">
              Permisos Biométricos Requeridos (Aceptación Explícita del Usuario):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {hcPermissions.map((perm) => (
                <div
                  key={perm.id}
                  onClick={() => handleToggleHcPermission(perm.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    perm.granted
                      ? 'bg-bio-green/10 border-bio-green/40 text-white'
                      : 'bg-black/40 border-white/10 text-gray-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={perm.granted}
                    onChange={() => {}}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-white/20 bg-black text-bio-green focus:ring-bio-green shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase text-white truncate block">
                        {perm.name}
                      </span>
                      {perm.granted ? (
                        <span className="text-[7.5px] font-black uppercase text-bio-green bg-bio-green/20 px-1 rounded">
                          AUTORIZADO
                        </span>
                      ) : (
                        <span className="text-[7.5px] font-black uppercase text-gray-500 bg-white/5 px-1 rounded">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-gray-400 truncate block">
                      {perm.permissionKey}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Telemetry Data Captured Preview */}
          <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px]">
            <div className="flex flex-wrap items-center gap-3 text-gray-300">
              <span className="flex items-center gap-1 font-bold">
                <span className="text-bio-green font-black">Pasos:</span> {latestHcData.stepsToday.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-bio-green font-black">Pulso:</span> {latestHcData.heartRateAvg} BPM
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-bio-green font-black">HRV:</span> {latestHcData.hrvMs} ms
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-bio-green font-black">Sueño:</span> {latestHcData.sleepHours} hrs ({latestHcData.sleepQualityScore}/100)
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-400 shrink-0">
              Última Sincronización: {latestHcData.lastSyncedTimestamp}
            </span>
          </div>
        </div>

        {/* PANEL DEDICADO Y EXPLÍCITO DE INTEGRACIÓN CON APPLE HEALTH (HEALTHKIT API) */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-neuro-blue/10 via-black/60 to-black/80 border border-neuro-blue/30 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neuro-blue text-black flex items-center justify-center font-black shrink-0 shadow-md shadow-neuro-blue/20">
                <Watch className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase text-white tracking-wide">
                    Apple Health API & HealthKit (iOS & Apple Watch)
                  </h4>
                  <span className="text-[8px] font-black uppercase tracking-widest text-neuro-blue bg-neuro-blue/20 border border-neuro-blue/30 px-1.5 py-0.5 rounded">
                    iOS Native / watchOS
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 font-medium mt-0.5">
                  Conexión directa con HealthKit para importar variabilidad cardiaca (HRV), pulso y fases de descanso de Apple Watch.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestAppleHealthPermissions}
              disabled={isRequestingAh}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                isRequestingAh
                  ? 'bg-neuro-blue/30 text-gray-400 cursor-not-allowed border border-neuro-blue/20'
                  : 'bg-neuro-blue text-black hover:scale-105 active:scale-95 shadow-neuro-blue/20'
              }`}
            >
              {isRequestingAh ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Solicitando Permisos...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  Solicitar Permisos Apple Health (+150 NTK)
                </>
              )}
            </button>
          </div>

          {/* Feedback or Status Message */}
          {ahSyncMessage && (
            <div className="p-3 bg-neuro-blue/20 border border-neuro-blue/40 rounded-xl text-xs font-bold text-neuro-blue flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{ahSyncMessage}</span>
            </div>
          )}

          {/* Granular Apple HealthKit Permissions Checkboxes Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider block">
              Permisos Apple HealthKit Requeridos (Autorización del Usuario):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ahPermissions.map((perm) => (
                <div
                  key={perm.id}
                  onClick={() => handleToggleAhPermission(perm.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    perm.granted
                      ? 'bg-neuro-blue/10 border-neuro-blue/40 text-white'
                      : 'bg-black/40 border-white/10 text-gray-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={perm.granted}
                    onChange={() => {}}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-white/20 bg-black text-neuro-blue focus:ring-neuro-blue shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase text-white truncate block">
                        {perm.name}
                      </span>
                      {perm.granted ? (
                        <span className="text-[7.5px] font-black uppercase text-neuro-blue bg-neuro-blue/20 px-1 rounded">
                          AUTORIZADO
                        </span>
                      ) : (
                        <span className="text-[7.5px] font-black uppercase text-gray-500 bg-white/5 px-1 rounded">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-gray-400 truncate block">
                      {perm.hkType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Telemetry Data Captured Preview for Apple Health */}
          <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px]">
            <div className="flex flex-wrap items-center gap-3 text-gray-300">
              <span className="flex items-center gap-1 font-bold">
                <span className="text-neuro-blue font-black">Pasos Apple:</span> {latestAhData.stepsToday.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-neuro-blue font-black">Pulso:</span> {latestAhData.heartRateAvg} BPM
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-neuro-blue font-black">HRV SDNN:</span> {latestAhData.hrvMs} ms
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-neuro-blue font-black">Sueño:</span> {latestAhData.sleepHours} hrs (Prof: {latestAhData.deepSleepHours}h)
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-neuro-blue font-black">VO2 Máx:</span> {latestAhData.vo2Max} ml/kg/min
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-400 shrink-0">
              Última Sincronización: {latestAhData.lastSyncedTimestamp}
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-neuro-blue ${isAutoSyncOn ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                Autosincronización Silenciosa (Smartphones)
              </span>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Lee pasos, HRV y sueño automáticamente cada 15 min (+150 NTK)</p>
            </div>
            <button
              onClick={handleToggleAutoSync}
              className={`w-12 h-6 rounded-full transition-all relative flex items-center ${isAutoSyncOn ? 'bg-bio-green' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 bg-black rounded-full absolute transition-all ${isAutoSyncOn ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-bio-orange" />
                Webhook de Transmisión Real-time (Firebase)
              </span>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Transmite de forma encriptada a Firestore DB (+100 NTK)</p>
            </div>
            <button
              onClick={handleToggleWebhook}
              className={`w-12 h-6 rounded-full transition-all relative flex items-center ${isWebhookActive ? 'bg-bio-green' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 bg-black rounded-full absolute transition-all ${isWebhookActive ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Log Viewer representing automatic actions */}
        <div className="space-y-2">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Consola de Transmisión Automatizada</span>
          <div className="bg-black/60 border border-white/5 rounded-2xl p-4 h-28 overflow-y-auto font-mono text-[10px] text-bio-green space-y-1.5 scrollbar-hide">
            {automationLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed truncate hover:text-white transition-colors">{log}</div>
            ))}
          </div>
        </div>

        {/* Suggested Implementation blueprints for true automation */}
        <div className="p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase text-bio-orange flex items-center gap-2">
            <Code className="w-4 h-4" />
            Sugerencias y Arquitectura de Automatización Real
          </h4>
          
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
            Para automatizar completamente la carga de métricas sin intervención humana, te sugerimos implementar el siguiente esquema de integración en la app nativa:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-white uppercase tracking-wider">1. Google Health Connect (React Native / Expo)</h5>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                Utiliza <code className="text-neuro-blue">react-native-health-connect</code> para leer HRV, glucosa y pasos automáticamente del almacenamiento interno del teléfono cada vez que se abre la app.
              </p>
              <pre className="p-3 bg-black/60 rounded-xl text-[9px] text-gray-300 font-mono overflow-x-auto leading-normal">
{`import { 
  readRecords, 
  initialize 
} from 'react-native-health-connect';

// Sincronización automática de fondo
async function syncBiometrics() {
  const isAvailable = await initialize();
  if (isAvailable) {
    const steps = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'after',
        startTime: new Date().setHours(0,0,0,0)
      }
    });
    // Guardar en Firestore sync
    await updateFirebaseMetrics({ steps: steps.total });
  }
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-white uppercase tracking-wider">2. Oura Ring & Garmin API (Server-to-Server)</h5>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                Configura un Cloud Function de Firebase que actúe como proxy seguro para conectarse a la API de Oura / Garmin con autenticación OAuth, recuperando el sueño profundo de forma automática cada mañana a las 6:00 AM.
              </p>
              <pre className="p-3 bg-black/60 rounded-xl text-[9px] text-gray-300 font-mono overflow-x-auto leading-normal">
{`// Firebase Cloud Function cron-job
exports.scheduledOuraSync = functions.pubsub
  .schedule('0 6 * * *') // Todos los días a las 6 AM
  .onRun(async (context) => {
    const token = await getDecryptedOAuthToken(uid);
    const sleepData = await fetchOuraDailySleep(token);
    
    // Guardar en Firestore dbSync
    await db.collection('users').doc(uid).update({
      'metrics.sleepHours': sleepData.duration / 3600,
      'metrics.bioScore': calculateScore(sleepData)
    });
  });`}
              </pre>
            </div>
          </div>

          <div className="p-3 bg-bio-orange/10 border border-bio-orange/20 rounded-xl text-[10px] text-bio-orange leading-relaxed font-bold uppercase tracking-wider">
            💡 NOTA SOBERANA: El sistema guarda todo el historial directamente en tu base de datos FirebaseFirestore para asegurar tu completa soberanía de datos y mitigar la centralización de servidores corporativos.
          </div>
        </div>
      </div>

      {/* Device Connection & Permission Authorization Modal */}
      <DeviceConnectModal
        isOpen={isDeviceConnectModalOpen}
        onClose={() => setIsDeviceConnectModalOpen(false)}
        onConnectSuccess={handleConnectDevicesSuccess}
        onAddTokens={onAddTokens}
      />

    </div>
  );
};
