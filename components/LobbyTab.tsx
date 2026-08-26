import React, { useState } from 'react';
import { BioMetrics } from '../types';
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
  QrCode,
  Database,
  Cpu,
  Server,
  RefreshCw,
  Sliders,
  Code
} from 'lucide-react';

interface LobbyTabProps {
  metrics: BioMetrics;
  onUpdateMetrics: (updated: Partial<BioMetrics>) => void;
  onAddTokens: (amount: number, reason: string) => void;
  tokens: number;
  stitchMode?: 'day' | 'night';
}

export const LobbyTab: React.FC<LobbyTabProps> = ({ metrics, onUpdateMetrics, onAddTokens, tokens, stitchMode = 'day' }) => {
  const [syncedWearables, setSyncedWearables] = useState(false);
  const [sunlightActive, setSunlightActive] = useState(metrics.sunSync);
  const [blueLightBlocked, setBlueLightBlocked] = useState(false);

  // Data Automation state
  const [isAutoSyncOn, setIsAutoSyncOn] = useState(() => localStorage.getItem('hb_auto_sync') === 'true');
  const [isWebhookActive, setIsWebhookActive] = useState(() => localStorage.getItem('hb_webhook_active') === 'true');
  const [isAutomationPanelOpen, setIsAutomationPanelOpen] = useState(false);
  const [automationLogs, setAutomationLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Inicializando núcleo de sincronización soberana...`,
    `[${new Date().toLocaleTimeString()}] Esperando activación de automatización en segundo plano.`
  ]);

  const handleToggleAutoSync = () => {
    const nextState = !isAutoSyncOn;
    setIsAutoSyncOn(nextState);
    localStorage.setItem('hb_auto_sync', String(nextState));
    
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
    localStorage.setItem('hb_webhook_active', String(nextState));
    
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
    setSyncedWearables(true);
    onUpdateMetrics({
      hrv: 82,
      steps: 8432,
      sleepHours: 8.2,
      bioScore: Math.min(100, metrics.bioScore + 8)
    });
    onAddTokens(100, "Sincronización Exitosa de Apple Watch / Oura Ring");
    setTimeout(() => {
      setSyncedWearables(false);
    }, 4000);
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
              Descarga Instantánea
            </span>
            <h3 className="text-base font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              <Smartphone className="w-5 h-5 text-bio-green" />
              SOBERANÍA MÓVIL: INSTALAR APP (.APK) 📱
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Lleva tu soberanía biológica en el bolsillo de manera sencilla. Descarga el APK nativo e instala directamente en tu Android para sincronizar wearables sin intermediarios corporativos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a 
                href="/healthy-brain.apk"
                download="healthy-brain.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-gradient-to-r from-bio-green to-neuro-blue text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-bio-green/10"
              >
                <Download className="w-4 h-4 text-black stroke-[3]" />
                Descargar APK Directo
              </a>
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
                Sugerencias de Automatización
              </button>
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-white p-3.5 rounded-2xl shadow-xl flex flex-col items-center justify-center border border-white/10 max-w-[160px] mx-auto">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/healthy-brain.apk')}`} 
              alt="APK QR Code"
              className="w-[110px] h-[110px]"
              referrerPolicy="no-referrer"
            />
            <span className="text-[8px] font-black text-black uppercase tracking-widest mt-2 block">Escanea para Android</span>
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

      {/* SECCIÓN INTERACTIVA DE AUTOMATIZACIÓN DE DATOS */}
      <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-bio-orange/10 text-bio-orange flex items-center justify-center">
              <Cpu className="w-5 h-5 animate-spin text-bio-orange" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-white">Centro de Automatización de Datos</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Soberanía de Datos & Sincronización Programada</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-bio-orange uppercase bg-bio-orange/10 border border-bio-orange/20 px-2.5 py-1 rounded-xl w-fit">
            Nivel de Automatización: {isAutoSyncOn && isWebhookActive ? 'MÁXIMO (100%)' : isAutoSyncOn || isWebhookActive ? 'MEDIO (50%)' : 'MANUAL (0%)'}
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Configura background workers y webhooks descentralizados para evitar la carga manual de tus biométricos y mantener un flujo continuo de datos a tu base de datos de Firestore.
        </p>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-neuro-blue ${isAutoSyncOn ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                Background Sync Automático
              </span>
              <p className="text-[10px] text-gray-500 font-medium leading-tight">Ejecuta sincronización invisible en segundo plano (+150 NTK)</p>
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
                Webhook de Transmisión Real-time
              </span>
              <p className="text-[10px] text-gray-500 font-medium leading-tight">Transmite directamente de tu wearable a Firebase (+100 NTK)</p>
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

    </div>
  );
};
