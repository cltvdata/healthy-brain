import React, { useState } from 'react';
import { 
  getLatestHealthConnectData, 
  requestGoogleHealthConnectPermissions, 
  getHealthConnectPermissions,
  updateHealthConnectData,
  HealthConnectDailyMetric, 
  HealthConnectData 
} from '../services/healthConnectService';
import { 
  Activity, 
  Heart, 
  Moon, 
  Flame, 
  Footprints, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  Sparkles, 
  ChevronRight, 
  Smile, 
  Zap, 
  BarChart3, 
  LineChart, 
  Layers, 
  CheckCircle2, 
  Smartphone,
  Watch,
  Info,
  Droplet,
  Sliders
} from 'lucide-react';

interface GoogleHealthConnectDashboardProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateMetrics?: (metrics: any) => void;
}

type TimeframeOption = 7 | 14 | 30;
type MetricCategory = 'steps' | 'heart' | 'sleep' | 'vitals' | 'calories';

export const GoogleHealthConnectDashboard: React.FC<GoogleHealthConnectDashboardProps> = ({
  onAddTokens,
  onUpdateMetrics
}) => {
  const [data, setData] = useState<HealthConnectData>(() => getLatestHealthConnectData());
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(7);
  const [activeMetric, setActiveMetric] = useState<MetricCategory>('steps');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'chart' | 'table'>('chart');

  // Selected history dataset based on timeframe
  const historyList: HealthConnectDailyMetric[] = 
    selectedTimeframe === 7 
      ? (data.history7Days || [])
      : selectedTimeframe === 14 
        ? (data.history14Days || [])
        : (data.history30Days || []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncNotice('Solicitando sincronización en tiempo real con Google Health Connect API...');

    const perms = getHealthConnectPermissions();
    const result = await requestGoogleHealthConnectPermissions(perms);
    
    setIsSyncing(false);
    setSyncNotice(result.message);

    const fresh = getLatestHealthConnectData();
    setData(fresh);

    if (onUpdateMetrics) {
      onUpdateMetrics({
        steps: fresh.stepsToday,
        hrv: fresh.hrvMs,
        sleepHours: fresh.sleepHours,
        bioScore: Math.min(100, Math.round(85 + Math.random() * 10))
      });
    }

    onAddTokens(150, "Google Health Connect: Telemetría Diaria e Histórica Sincronizada");

    setTimeout(() => {
      setSyncNotice(null);
    }, 4000);
  };

  // Helper calculation for metrics plot
  const getMetricValues = (metric: MetricCategory, item: HealthConnectDailyMetric) => {
    switch (metric) {
      case 'steps':
        return { main: item.steps, unit: 'pasos', label: 'Pasos', secondary: `${item.distanceKm} km` };
      case 'heart':
        return { main: item.heartRateAvg, unit: 'BPM', label: 'Frecuencia Cardíaca', secondary: `HRV ${item.hrvMs}ms` };
      case 'sleep':
        return { main: item.sleepHours, unit: 'horas', label: 'Horas de Sueño', secondary: `Score ${item.sleepQualityScore}/100` };
      case 'vitals':
        return { main: item.spo2Percentage, unit: '% SpO2', label: 'Oxígeno en Sangre', secondary: `Estrés ${item.stressScore}/100` };
      case 'calories':
        return { main: item.activeCalories, unit: 'kcal', label: 'Calorías Activas', secondary: `Meta ${item.caloriesGoal} kcal` };
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

  // Generate SVG Path for Evolution Graph
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

  // Smooth SVG Bezier Path
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

  return (
    <div className="space-y-6">
      
      {/* HEADER: GOOGLE HEALTH CONNECT SATELLITE STATUS */}
      <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-bio-green/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-bio-green/20 border border-bio-green/40 flex items-center justify-center text-bio-green shrink-0 shadow-lg shadow-bio-green/20">
              <Smartphone className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-bio-green/20 text-bio-green border border-bio-green/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-bio-green animate-pulse"></span>
                  Google Health Connect API
                </span>
                <span className="text-[9px] font-black text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md uppercase">
                  Android Native
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                Telemetría Diaria e Histórica 📊
              </h2>
              <p className="text-xs text-gray-400">
                Origen: <strong className="text-white">{data.connectedDeviceSource}</strong> • Última sinc: {data.lastSyncedTimestamp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                isSyncing 
                  ? 'bg-bio-green/30 text-gray-400 cursor-not-allowed'
                  : 'bg-bio-green text-black hover:scale-105 active:scale-95 shadow-bio-green/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 stroke-[3] ${isSyncing ? 'animate-spin text-black' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Google Connect (+150 NTK)'}
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="p-3 bg-bio-green/10 border border-bio-green/30 rounded-xl text-xs text-bio-green font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-bio-green shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* METRICS SUMMARY CARDS (Matching User's Google Health Connect Screenshots) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          
          {/* Blood Oxygen SpO2 Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Blood Oxygen
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{data.spo2Percentage}</span>
              <span className="text-xs font-bold text-gray-400">%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-mono">15:30</span>
              <span className="px-1.5 py-0.2 bg-bio-green/20 text-bio-green border border-bio-green/30 rounded text-[9px] font-bold uppercase">
                Normal
              </span>
            </div>
          </div>

          {/* Stress Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Stress
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{data.stressScore}</span>
              <span className="text-xs font-bold text-gray-400">/100</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-mono">15:30</span>
              <span className="px-1.5 py-0.2 bg-bio-green/20 text-bio-green border border-bio-green/30 rounded text-[9px] font-bold uppercase">
                {data.stressStatus}
              </span>
            </div>
            {/* Visual scale bar */}
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-bio-green h-full"
                style={{ width: `${Math.min(100, data.stressScore)}%` }}
              />
            </div>
          </div>

          {/* Mood Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Mood
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-bio-green/20 border border-bio-green/40 flex items-center justify-center text-bio-green">
                <Smile className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-white">{data.mood}</span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono">15:30</div>
          </div>

          {/* Active Calories Goal Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Active Calories
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-bio-orange">{data.activeCalories}</span>
              <span className="text-xs font-bold text-gray-400">/ {data.caloriesGoal} kcal</span>
            </div>
            <div className="text-[10px] text-gray-400 font-semibold">
              🔥 {data.stepsToday} pasos • {data.distanceTodayKm} km
            </div>
          </div>

          {/* Heart Rate Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Heart Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-400">{data.heartRateAvg}</span>
              <span className="text-xs font-bold text-gray-400">/min</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex items-center justify-between">
              <span>Min {data.heartRateMin} | Max {data.heartRateMax}</span>
              <span className="text-neuro-blue">HRV {data.hrvMs}ms</span>
            </div>
          </div>

          {/* Sleep Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Sleep
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-400">{data.sleepHours}</span>
              <span className="text-xs font-bold text-gray-400">h</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex items-center justify-between">
              <span>Score {data.sleepQualityScore}/100</span>
              <span className="text-indigo-300">Descanso</span>
            </div>
          </div>

        </div>
      </div>

      {/* EVOLUTION GRAPH CONTROLS & TIMEFRAME SELECTOR */}
      <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl space-y-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-neuro-blue/20 text-neuro-blue border border-neuro-blue/30">
              GRÁFICOS DE EVOLUCIÓN TEMPORAL
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
              Tendencia y Comportamiento Fisiológico
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'chart' ? 'bg-neuro-blue text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" /> Gráfico
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-neuro-blue text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Tabla
              </button>
            </div>

            {/* Timeframe Buttons */}
            <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
              {[7, 14, 30].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf as TimeframeOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                    selectedTimeframe === tf 
                      ? 'bg-bio-green text-black shadow-md' 
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
            onClick={() => setActiveMetric('steps')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'steps' 
                ? 'bg-bio-green text-black border-bio-green shadow-lg shadow-bio-green/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Footprints className="w-4 h-4" /> Pasos & Distancia
          </button>

          <button
            onClick={() => setActiveMetric('heart')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'heart' 
                ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Heart className="w-4 h-4" /> Pulso Cardíaco & HRV
          </button>

          <button
            onClick={() => setActiveMetric('sleep')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'sleep' 
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Moon className="w-4 h-4" /> Horas de Sueño
          </button>

          <button
            onClick={() => setActiveMetric('vitals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'vitals' 
                ? 'bg-neuro-blue text-black border-neuro-blue shadow-lg shadow-neuro-blue/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4" /> Oxígeno SpO2 & Estrés
          </button>

          <button
            onClick={() => setActiveMetric('calories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${
              activeMetric === 'calories' 
                ? 'bg-bio-orange text-black border-bio-orange shadow-lg shadow-bio-orange/20' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Flame className="w-4 h-4" /> Calorías Activas
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
            <span className="text-xl font-black text-bio-green mt-0.5 block">
              {currentTodayVal} {getMetricValues(activeMetric, historyList[0] || {} as any).unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Pico Máximo</span>
            <span className="text-xl font-black text-neuro-blue mt-0.5 block">
              {maxVal} {getMetricValues(activeMetric, historyList[0] || {} as any).unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Variación Reciente</span>
            <span className={`text-xl font-black mt-0.5 block ${Number(pctChange) >= 0 ? 'text-bio-green' : 'text-bio-orange'}`}>
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
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="0%" 
                      stopColor={
                        activeMetric === 'steps' ? '#00e676' : 
                        activeMetric === 'heart' ? '#ff1744' : 
                        activeMetric === 'sleep' ? '#818cf8' : 
                        activeMetric === 'vitals' ? '#00d1ff' : '#ff9100'
                      } 
                      stopOpacity="0.4" 
                    />
                    <stop 
                      offset="100%" 
                      stopColor={
                        activeMetric === 'steps' ? '#00e676' : 
                        activeMetric === 'heart' ? '#ff1744' : 
                        activeMetric === 'sleep' ? '#818cf8' : 
                        activeMetric === 'vitals' ? '#00d1ff' : '#ff9100'
                      } 
                      stopOpacity="0.0" 
                    />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.1)" />

                {/* Area under line */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Evolution Line */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke={
                    activeMetric === 'steps' ? '#00e676' : 
                    activeMetric === 'heart' ? '#ff1744' : 
                    activeMetric === 'sleep' ? '#818cf8' : 
                    activeMetric === 'vitals' ? '#00d1ff' : '#ff9100'
                  } 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {points.map((p, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const metricInfo = getMetricValues(activeMetric, p.item);

                  return (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? "7" : "4.5"}
                        fill={
                          activeMetric === 'steps' ? '#00e676' : 
                          activeMetric === 'heart' ? '#ff1744' : 
                          activeMetric === 'sleep' ? '#818cf8' : 
                          activeMetric === 'vitals' ? '#00d1ff' : '#ff9100'
                        }
                        stroke="#0a0a0a"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />

                      {/* Day Label on X Axis */}
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

              {/* Hover Tooltip Overlay */}
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
                    <span className="text-[10px] text-bio-green uppercase font-mono">Google Connect</span>
                  </div>
                  <div className="text-bio-green font-black text-sm">
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
                  <th className="p-3">Pasos / Dist.</th>
                  <th className="p-3">Pulso (BPM)</th>
                  <th className="p-3">HRV (ms)</th>
                  <th className="p-3">Sueño (h)</th>
                  <th className="p-3">SpO2 (%)</th>
                  <th className="p-3">Estrés</th>
                  <th className="p-3">Calorías</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyList.map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {item.dayName}, {item.dayLabel}
                    </td>
                    <td className="p-3 text-bio-green font-bold whitespace-nowrap">
                      {item.steps.toLocaleString()} <span className="text-[10px] text-gray-400">({item.distanceKm} km)</span>
                    </td>
                    <td className="p-3 text-red-400 font-bold whitespace-nowrap">
                      {item.heartRateAvg} <span className="text-[10px] text-gray-500">({item.heartRateMin}-{item.heartRateMax})</span>
                    </td>
                    <td className="p-3 text-neuro-blue font-bold whitespace-nowrap">
                      {item.hrvMs} ms
                    </td>
                    <td className="p-3 text-indigo-400 font-bold whitespace-nowrap">
                      {item.sleepHours}h <span className="text-[10px] text-gray-400">({item.sleepQualityScore}/100)</span>
                    </td>
                    <td className="p-3 text-white font-bold whitespace-nowrap">
                      {item.spo2Percentage}%
                    </td>
                    <td className="p-3 text-gray-300 font-bold whitespace-nowrap">
                      {item.stressScore}/100 <span className="text-[10px] text-bio-green">({item.stressStatus})</span>
                    </td>
                    <td className="p-3 text-bio-orange font-bold whitespace-nowrap">
                      {item.activeCalories} kcal
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
