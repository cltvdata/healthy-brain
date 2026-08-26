import React, { useState } from 'react';
import { 
  getLatestAppleHealthData, 
  requestAppleHealthPermissions, 
  getAppleHealthPermissions,
  AppleHealthDailyMetric, 
  AppleHealthData 
} from '../services/appleHealthService';
import { 
  Activity, 
  Heart, 
  Moon, 
  Flame, 
  Footprints, 
  RefreshCw, 
  LineChart, 
  BarChart3, 
  Smile, 
  CheckCircle2, 
  Watch, 
  Zap, 
  Timer, 
  Compass, 
  Wind,
  Apple
} from 'lucide-react';

interface AppleHealthDashboardProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateMetrics?: (metrics: any) => void;
}

type TimeframeOption = 7 | 14 | 30;
type MetricCategory = 'steps' | 'rings' | 'heart' | 'sleep' | 'vitals';

export const AppleHealthDashboard: React.FC<AppleHealthDashboardProps> = ({
  onAddTokens,
  onUpdateMetrics
}) => {
  const [data, setData] = useState<AppleHealthData>(() => getLatestAppleHealthData());
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(7);
  const [activeMetric, setActiveMetric] = useState<MetricCategory>('rings');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Selected history dataset based on timeframe
  const historyList: AppleHealthDailyMetric[] = 
    selectedTimeframe === 7 
      ? (data.history7Days || [])
      : selectedTimeframe === 14 
        ? (data.history14Days || [])
        : (data.history30Days || []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncNotice('Sincronizando con los Anillos de Actividad y datos de Apple HealthKit...');

    const perms = getAppleHealthPermissions();
    const result = await requestAppleHealthPermissions(perms);
    
    setIsSyncing(false);
    setSyncNotice(result.message);

    const fresh = getLatestAppleHealthData();
    setData(fresh);

    if (onUpdateMetrics) {
      onUpdateMetrics({
        steps: fresh.stepsToday,
        hrv: fresh.hrvMs,
        sleepHours: fresh.sleepHours,
        bioScore: Math.min(100, Math.round(88 + Math.random() * 8))
      });
    }

    onAddTokens(150, "Apple HealthKit: Sincronización de Anillos de Actividad e Histórico Completo");

    setTimeout(() => {
      setSyncNotice(null);
    }, 4000);
  };

  // Helper calculation for metrics plot
  const getMetricValues = (metric: MetricCategory, item: AppleHealthDailyMetric) => {
    switch (metric) {
      case 'steps':
        return { main: item.steps, unit: 'pasos', label: 'Pasos', secondary: `${item.distanceKm} km` };
      case 'rings':
        return { main: item.activeEnergyBurnedKcal, unit: 'kcal', label: 'Energía Activa (Move)', secondary: `${item.exerciseMinutes}m Ejercicio • ${item.standHours}h De Pie` };
      case 'heart':
        return { main: item.heartRateAvg, unit: 'BPM', label: 'Frecuencia Cardíaca', secondary: `HRV ${item.hrvMs}ms` };
      case 'sleep':
        return { main: item.sleepHours, unit: 'horas', label: 'Horas de Sueño', secondary: `Profundo ${item.deepSleepHours}h • REM ${item.remSleepHours}h` };
      case 'vitals':
        return { main: item.spo2Percentage, unit: '% SpO2', label: 'Oxígeno & VO2 Max', secondary: `VO2 Max ${item.vo2Max} mL/kg/min` };
    }
  };

  // Calculate Chart Extents
  const rawValues = historyList.map(item => getMetricValues(activeMetric, item).main);
  const minVal = Math.min(...rawValues, 0);
  const maxVal = Math.max(...rawValues, 10);
  const range = maxVal - minVal || 1;

  const avgVal = rawValues.length > 0 ? (rawValues.reduce((a, b) => a + b, 0) / rawValues.length) : 0;
  const currentTodayVal = rawValues[rawValues.length - 1] || 0;
  const prevVal = rawValues[rawValues.length - 2] || currentTodayVal;
  const pctChange = prevVal > 0 ? (((currentTodayVal - prevVal) / prevVal) * 100).toFixed(1) : '0';

  // SVG dimensions
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 35;
  const paddingY = 25;

  const points = historyList.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, historyList.length - 1)) * (chartWidth - paddingX * 2);
    const val = getMetricValues(activeMetric, item).main;
    const y = chartHeight - paddingY - ((val - minVal) / range) * (chartHeight - paddingY * 2);
    return { x, y, val, item, idx };
  });

  const linePath = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${point.x},${point.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
    : '';

  // Apple Ring progress ratios
  const moveRatio = Math.min(100, Math.round((data.activeEnergyBurnedKcal / data.activeEnergyGoalKcal) * 100));
  const exerciseRatio = Math.min(100, Math.round((data.exerciseMinutes / data.exerciseGoalMinutes) * 100));
  const standRatio = Math.min(100, Math.round((data.standHours / data.standGoalHours) * 100));

  return (
    <div className="space-y-6">
      
      {/* HEADER: APPLE HEALTHKIT SATELLITE STATUS */}
      <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 via-pink-500/20 to-rose-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/20">
              <Watch className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Apple className="w-3 h-3 fill-current" />
                  Apple HealthKit Framework
                </span>
                <span className="text-[9px] font-black text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md uppercase">
                  iOS / watchOS Native
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                Telemetría & Anillos de Actividad Apple 🍎
              </h2>
              <p className="text-xs text-gray-400">
                Origen: <strong className="text-white">{data.connectedDeviceSource}</strong> • Sinc: {data.lastSyncedTimestamp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                isSyncing 
                  ? 'bg-red-500/30 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:scale-105 active:scale-95 shadow-red-500/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 stroke-[3] ${isSyncing ? 'animate-spin text-white' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Apple Health (+150 NTK)'}
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* APPLE WATCH ACTIVITY RINGS VISUAL DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/50 border border-white/10 rounded-2xl">
          
          {/* Ring 1: Move / Active Energy */}
          <div className="p-3 bg-black/40 border border-red-500/20 rounded-xl space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1">
                <Flame className="w-4 h-4" /> Moverse (Move)
              </span>
              <span className="text-[10px] font-mono text-gray-400">{moveRatio}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{data.activeEnergyBurnedKcal}</span>
              <span className="text-xs text-gray-400 font-bold">/ {data.activeEnergyGoalKcal} kcal</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${moveRatio}%` }} />
            </div>
          </div>

          {/* Ring 2: Exercise Minutes */}
          <div className="p-3 bg-black/40 border border-lime-500/20 rounded-xl space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-lime-400 flex items-center gap-1">
                <Zap className="w-4 h-4" /> Ejercicio (Exercise)
              </span>
              <span className="text-[10px] font-mono text-gray-400">{exerciseRatio}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{data.exerciseMinutes}</span>
              <span className="text-xs text-gray-400 font-bold">/ {data.exerciseGoalMinutes} min</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-lime-400 h-full transition-all duration-500" style={{ width: `${exerciseRatio}%` }} />
            </div>
          </div>

          {/* Ring 3: Stand Hours */}
          <div className="p-3 bg-black/40 border border-cyan-500/20 rounded-xl space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1">
                <Timer className="w-4 h-4" /> De Pie (Stand)
              </span>
              <span className="text-[10px] font-mono text-gray-400">{standRatio}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{data.standHours}</span>
              <span className="text-xs text-gray-400 font-bold">/ {data.standGoalHours} hrs</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${standRatio}%` }} />
            </div>
          </div>

        </div>

        {/* APPLE HEALTH SECONDARY METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          
          {/* Steps */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1 relative">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Pasos & Distancia</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{data.stepsToday.toLocaleString()}</span>
              <span className="text-xs text-gray-400 font-bold">pasos</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">📍 {data.distanceTodayKm} km</div>
          </div>

          {/* Heart & HRV */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1 relative">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Ritmo Cardíaco & HRV</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-400">{data.heartRateAvg}</span>
              <span className="text-xs text-gray-400 font-bold">BPM</span>
            </div>
            <div className="text-[10px] text-neuro-blue font-mono">⚡ HRV: {data.hrvMs} ms</div>
          </div>

          {/* Sleep & Stages */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1 relative">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Sueño & Fases</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-400">{data.sleepHours}</span>
              <span className="text-xs text-gray-400 font-bold">hrs</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">🌙 Prof: {data.deepSleepHours}h | REM: {data.remSleepHours}h</div>
          </div>

          {/* SpO2 & VO2 Max */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1 relative">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">SpO2 & VO2 Max</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-cyan-400">{data.spo2Percentage}%</span>
              <span className="text-xs text-gray-400 font-bold">SpO2</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">🫁 VO2 Max: {data.vo2Max}</div>
          </div>

          {/* Mindfulness & Mood */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1 relative">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Mindfulness & Ánimo</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-pink-400">{data.mindfulMinutes}</span>
              <span className="text-xs text-gray-400 font-bold">min</span>
            </div>
            <div className="text-[10px] text-bio-green font-mono">😊 Estado: {data.mood}</div>
          </div>

        </div>
      </div>

      {/* APPLE EVOLUTION GRAPH & TIMEFRAME CONTROLS */}
      <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl space-y-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">
              HISTÓRICO APPLE HEALTH
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
              Evolución Biométrica & Tendencias
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'chart' ? 'bg-red-500 text-white font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" /> Gráfico
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-red-500 text-white font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Tabla
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
              {[7, 14, 30].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf as TimeframeOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                    selectedTimeframe === tf 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf} Días
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* METRIC SELECTION CHIPS */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setActiveMetric('rings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'rings' 
                ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Flame className="w-4 h-4" /> Anillos (Energía Activa)
          </button>

          <button
            onClick={() => setActiveMetric('steps')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'steps' 
                ? 'bg-lime-500 text-black border-lime-500 shadow-lg shadow-lime-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Footprints className="w-4 h-4" /> Pasos & Distancia
          </button>

          <button
            onClick={() => setActiveMetric('heart')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'heart' 
                ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Heart className="w-4 h-4" /> Pulso & HRV
          </button>

          <button
            onClick={() => setActiveMetric('sleep')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'sleep' 
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Moon className="w-4 h-4" /> Sueño & Descanso
          </button>

          <button
            onClick={() => setActiveMetric('vitals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'vitals' 
                ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4" /> SpO2 & VO2 Max
          </button>
        </div>

        {/* METRIC HIGHLIGHT STATS CALLOUT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-black/50 border border-white/10 rounded-2xl">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Promedio ({selectedTimeframe}D)</span>
            <span className="text-xl font-black text-white mt-0.5 block">
              {avgVal.toFixed(activeMetric === 'sleep' ? 1 : 0)} {getMetricValues(activeMetric, historyList[0] || {} as any).unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Valor Actual (Hoy)</span>
            <span className="text-xl font-black text-red-400 mt-0.5 block">
              {currentTodayVal} {getMetricValues(activeMetric, historyList[0] || {} as any).unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Pico Máximo</span>
            <span className="text-xl font-black text-lime-400 mt-0.5 block">
              {maxVal} {getMetricValues(activeMetric, historyList[0] || {} as any).unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Variación Reciente</span>
            <span className={`text-xl font-black mt-0.5 block ${Number(pctChange) >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>
              {Number(pctChange) >= 0 ? `+${pctChange}%` : `${pctChange}%`}
            </span>
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE SVG EVOLUTION CHART */}
        {viewMode === 'chart' && (
          <div className="relative p-4 bg-black/60 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-2">
              <span>Máx: {maxVal}</span>
              <span>Límite Mín: {minVal}</span>
            </div>

            <div className="relative w-full h-[220px]">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="appleChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="0%" 
                      stopColor={
                        activeMetric === 'rings' ? '#ff2d55' : 
                        activeMetric === 'steps' ? '#a3e635' : 
                        activeMetric === 'heart' ? '#f43f5e' : 
                        activeMetric === 'sleep' ? '#6366f1' : '#06b6d4'
                      } 
                      stopOpacity="0.4" 
                    />
                    <stop 
                      offset="100%" 
                      stopColor={
                        activeMetric === 'rings' ? '#ff2d55' : 
                        activeMetric === 'steps' ? '#a3e635' : 
                        activeMetric === 'heart' ? '#f43f5e' : 
                        activeMetric === 'sleep' ? '#6366f1' : '#06b6d4'
                      } 
                      stopOpacity="0.0" 
                    />
                  </linearGradient>
                </defs>

                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.1)" />

                <path d={areaPath} fill="url(#appleChartGradient)" />

                <path 
                  d={linePath} 
                  fill="none" 
                  stroke={
                    activeMetric === 'rings' ? '#ff2d55' : 
                    activeMetric === 'steps' ? '#a3e635' : 
                    activeMetric === 'heart' ? '#f43f5e' : 
                    activeMetric === 'sleep' ? '#6366f1' : '#06b6d4'
                  } 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {points.map((p, idx) => {
                  const isHovered = hoveredIndex === idx;

                  return (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? "7" : "4.5"}
                        fill={
                          activeMetric === 'rings' ? '#ff2d55' : 
                          activeMetric === 'steps' ? '#a3e635' : 
                          activeMetric === 'heart' ? '#f43f5e' : 
                          activeMetric === 'sleep' ? '#6366f1' : '#06b6d4'
                        }
                        stroke="#0a0a0a"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />

                      <text
                        x={p.x}
                        y={chartHeight - 5}
                        fill={isHovered ? "#ffffff" : "rgba(255,255,255,0.5)"}
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {p.item.dayLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredIndex !== null && points[hoveredIndex] && (
                <div 
                  className="absolute z-20 p-2.5 bg-black/90 border border-white/20 rounded-xl shadow-2xl text-xs space-y-0.5 pointer-events-none transform -translate-x-1/2 -translate-y-full animate-fade-in"
                  style={{
                    left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
                    top: `${(points[hoveredIndex].y / chartHeight) * 100 - 15}px`
                  }}
                >
                  <div className="font-black text-white border-b border-white/10 pb-1 flex items-center justify-between gap-3">
                    <span>{points[hoveredIndex].item.dayName} {points[hoveredIndex].item.dayLabel}</span>
                    <span className="text-[10px] text-red-400 uppercase font-mono">Apple HealthKit</span>
                  </div>
                  <div className="text-red-400 font-black text-sm">
                    {points[hoveredIndex].val} {getMetricValues(activeMetric, points[hoveredIndex].item).unit}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {getMetricValues(activeMetric, points[hoveredIndex].item).secondary}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: HISTORICAL DATA TABLE */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl bg-black/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="p-3">Día / Fecha</th>
                  <th className="p-3">Energía Activa (kcal)</th>
                  <th className="p-3">Pasos / Dist.</th>
                  <th className="p-3">Ejercicio (m)</th>
                  <th className="p-3">De Pie (h)</th>
                  <th className="p-3">Pulso (BPM)</th>
                  <th className="p-3">HRV (ms)</th>
                  <th className="p-3">Sueño (h)</th>
                  <th className="p-3">VO2 Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyList.map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {item.dayName}, {item.dayLabel}
                    </td>
                    <td className="p-3 text-red-400 font-bold whitespace-nowrap">
                      {item.activeEnergyBurnedKcal} kcal
                    </td>
                    <td className="p-3 text-lime-400 font-bold whitespace-nowrap">
                      {item.steps.toLocaleString()} <span className="text-[10px] text-gray-400">({item.distanceKm} km)</span>
                    </td>
                    <td className="p-3 text-white font-bold whitespace-nowrap">
                      {item.exerciseMinutes} min
                    </td>
                    <td className="p-3 text-cyan-400 font-bold whitespace-nowrap">
                      {item.standHours} hrs
                    </td>
                    <td className="p-3 text-rose-400 font-bold whitespace-nowrap">
                      {item.heartRateAvg} <span className="text-[10px] text-gray-500">({item.heartRateMin}-{item.heartRateMax})</span>
                    </td>
                    <td className="p-3 text-neuro-blue font-bold whitespace-nowrap">
                      {item.hrvMs} ms
                    </td>
                    <td className="p-3 text-indigo-400 font-bold whitespace-nowrap">
                      {item.sleepHours}h
                    </td>
                    <td className="p-3 text-cyan-300 font-bold whitespace-nowrap">
                      {item.vo2Max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
