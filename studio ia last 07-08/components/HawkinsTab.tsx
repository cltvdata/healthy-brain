import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Heart, 
  Flame, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  Check, 
  Volume2, 
  Info, 
  Calculator,
  Compass,
  Smile,
  ShieldAlert,
  Brain
} from 'lucide-react';

interface HawkinsTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateMetrics: (metrics: any) => void;
  bioScore: number;
  hrv: number;
}

interface ConsciousnessLevel {
  hz: number;
  emotion: string;
  state: string;
  description: string;
  color: string;
  hrvModifier: number;
  cortisolEffect: string;
}

const HAWKINS_LEVELS: ConsciousnessLevel[] = [
  { hz: 20, emotion: 'Vergüenza', state: 'Humillación', description: 'Nivel más bajo. Degrada severamente el sistema inmune y duplica el cortisol.', color: 'text-red-500 border-red-500/30 bg-red-500/10', hrvModifier: -15, cortisolEffect: 'Cortisol Crítico High' },
  { hz: 50, emotion: 'Apatía', state: 'Desesperanza', description: 'Estado de inercia y baja energía mitocondrial. HRV plano.', color: 'text-orange-500 border-orange-500/30 bg-orange-500/10', hrvModifier: -10, cortisolEffect: 'Cortisol Elevado' },
  { hz: 100, emotion: 'Miedo', state: 'Ansiedad', description: 'Activa la amígdala constantemente y desorganiza la coherencia cardíaca.', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10', hrvModifier: -8, cortisolEffect: 'Adrenalina / Cortisol Spikes' },
  { hz: 150, emotion: 'Ira', state: 'Odio / Frustración', description: 'Aumenta presión arterial y citocinas inflamatorias (IL-6).', color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10', hrvModifier: -5, cortisolEffect: 'Estrés Agudo' },
  { hz: 200, emotion: 'Coraje / Valor', state: 'Empoderamiento', description: 'UMBRAL DE INTEGRIDAD. Comienza la regeneración epigenética y balance hormonal.', color: 'text-bio-green border-bio-green/30 bg-bio-green/10', hrvModifier: +5, cortisolEffect: 'Cortisol Estabilizado' },
  { hz: 250, emotion: 'Neutralidad', state: 'Confianza / Soltura', description: 'Tono vagal equilibrado. Reduce inflamación sistémica.', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10', hrvModifier: +10, cortisolEffect: 'Cortisol Óptimo' },
  { hz: 350, emotion: 'Aceptación', state: 'Perdón / Armonía', description: 'Acelera recuperación muscular y respuesta antioxidante celular.', color: 'text-teal-400 border-teal-400/30 bg-teal-400/10', hrvModifier: +15, cortisolEffect: 'Dopamina / Serotonina Estables' },
  { hz: 400, emotion: 'Razón', state: 'Comprensión', description: 'Claridad cognitiva superior. Estimula factor neurotrófico BDNF.', color: 'text-neuro-blue border-neuro-blue/30 bg-neuro-blue/10', hrvModifier: +20, cortisolEffect: 'Homeostasis Completa' },
  { hz: 500, emotion: 'Amor', state: 'Veneración', description: 'Coherencia cardíaca perfecta en 0.1 Hz. Libera oxitocina y DHEA.', color: 'text-purple-400 border-purple-400/30 bg-purple-400/10', hrvModifier: +25, cortisolEffect: 'DHEA Antienvejecimiento' },
  { hz: 540, emotion: 'Alegría', state: 'Serenidad', description: 'Sincronización de ondas Alfa/Gama en electroencefalograma.', color: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10', hrvModifier: +30, cortisolEffect: 'Endorfinas Elevadas' },
  { hz: 600, emotion: 'Paz', state: 'Iluminación / Quietud', description: 'Reversión epigenética máxima. Activación de sirtuinas SIRT1-7.', color: 'text-amber-300 border-amber-300/30 bg-amber-300/10', hrvModifier: +35, cortisolEffect: 'Estado Regenerativo Absoluto' },
];

export const HawkinsTab: React.FC<HawkinsTabProps> = ({
  onAddTokens,
  onUpdateMetrics,
  bioScore,
  hrv
}) => {
  // Hawkins state
  const [selectedHz, setSelectedHz] = useState<number>(200);
  const currentLevel = HAWKINS_LEVELS.find(l => l.hz === selectedHz) || HAWKINS_LEVELS[4];

  // Lyon Protein Calculator state
  const [weightKg, setWeightKg] = useState<number>(70);
  const dailyProtein = Math.round(weightKg * 1.6);

  // Exercise Snack Timer (Dra. Rhonda Patrick)
  const [timerLeft, setTimerLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedSnack, setCompletedSnack] = useState<boolean>(false);

  // Creatine + Magnesio state
  const [loggedSupplements, setLoggedSupplements] = useState<boolean>(false);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft(prev => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setCompletedSnack(true);
      onAddTokens(150, "Exercise Snack de 60s completado (Dra. Rhonda Patrick)");
      onUpdateMetrics({ bioScore: Math.min(100, bioScore + 2), hrv: Math.min(100, hrv + 3) });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerLeft]);

  const handleApplyHawkinsLevel = () => {
    const newHrv = Math.max(20, Math.min(100, hrv + currentLevel.hrvModifier));
    const newScore = Math.max(30, Math.min(100, bioScore + (currentLevel.hz >= 200 ? 3 : -3)));
    onUpdateMetrics({ hrv: newHrv, bioScore: newScore });
    onAddTokens(50, `Calibración de Frecuencia Hawkins: ${currentLevel.emotion} (${currentLevel.hz} Hz)`);
  };

  const handleLogSupplements = () => {
    if (!loggedSupplements) {
      setLoggedSupplements(true);
      onAddTokens(50, "Dosis Sinergia Creatina 5g + Magnesio 400mg logueada");
      onUpdateMetrics({ bioScore: Math.min(100, bioScore + 1) });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Intro Hawkins & Protocolos NotebookLM */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest inline-flex items-center gap-1">
            <Compass className="w-3 h-3" /> MAPA DE CONSCIENCIA & PROTOCOLOS CIENTÍFICOS
          </span>
        </div>

        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
          Frecuencias de Consciencia & Longevidad 🧠
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed font-medium mt-1 max-w-2xl">
          Integración matemática del Dr. David R. Hawkins (Power vs. Force) combinada con las investigaciones clínicas de la Dra. Gabrielle Lyon, Dra. Rhonda Patrick, Dr. Carlos Jaramillo y Eric Trexler.
        </p>
      </div>

      {/* SECTION 1: MAPA DE CONSCIENCIA DEL DR. DAVID HAWKINS */}
      <section className="p-6 rounded-3xl bg-glass-noir border border-white/10 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Mapa de Consciencia de Hawkins (20 Hz - 600 Hz)
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Calibración Psiconeuroinmunoendocrina
            </p>
          </div>
          <span className="text-xs font-black font-mono text-purple-300 bg-purple-500/20 px-3 py-1 rounded-xl border border-purple-500/30">
            {currentLevel.hz} Hz
          </span>
        </div>

        {/* Level Display */}
        <div className={`p-5 rounded-2xl border transition-all ${currentLevel.color}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block">Emoción Calibrada:</span>
              <h4 className="text-xl font-black uppercase tracking-tight">{currentLevel.emotion} ({currentLevel.state})</h4>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-black/40 border border-current">
              {currentLevel.cortisolEffect}
            </span>
          </div>
          <p className="text-xs font-medium leading-relaxed opacity-90 mt-2">
            {currentLevel.description}
          </p>
          <div className="mt-4 pt-3 border-t border-current/20 flex justify-between items-center text-xs font-bold">
            <span>Impacto en HRV: <strong className="font-mono">{currentLevel.hrvModifier > 0 ? `+${currentLevel.hrvModifier}` : currentLevel.hrvModifier} ms</strong></span>
            <span>Umbral Integridad: <strong className="font-mono">{currentLevel.hz >= 200 ? '✅ Aprobado (>200Hz)' : '⚠️ Alerta Cortisol (<200Hz)'}</strong></span>
          </div>
        </div>

        {/* Frequencies Buttons Grid */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
            Selecciona tu Frecuencia Emocional Actual:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {HAWKINS_LEVELS.map((lvl) => (
              <button
                key={lvl.hz}
                onClick={() => setSelectedHz(lvl.hz)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedHz === lvl.hz
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-[10px] font-black font-mono">{lvl.hz} Hz</div>
                <div className="text-xs font-black truncate">{lvl.emotion}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyHawkinsLevel}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-neuro-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          Sintonizar Frecuencia & Calibrar Bio-Score (+50 NTK)
        </button>
      </section>

      {/* SECTION 2: MÚSCULO COMO ÓRGANO DE LONGEVIDAD (DRA. GABRIELLE LYON) */}
      <section className="p-6 rounded-3xl bg-glass-noir border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-bio-green" />
              Músculo como Órgano de Longevidad (Dra. Gabrielle Lyon)
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Calculadora de Proteína Limpia para Prevenir Sarcopenia
            </p>
          </div>
          <span className="text-xs font-black text-bio-green bg-bio-green/10 px-3 py-1 rounded-xl border border-bio-green/20">
            1.6g / kg
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Ingresa tu Peso Corporal (KG):
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(30, Math.min(200, Number(e.target.value))))}
                className="w-28 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-lg font-black font-mono text-white outline-none focus:border-bio-green"
              />
              <span className="text-xs font-bold text-gray-400">kg ({Math.round(weightKg * 2.20462)} lbs)</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              El músculo es el sumidero endocrino de la glucosa. Mantener masa magra reduce la inflamación senescente y previene la resistencia a la insulina.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-bio-green/10 border border-bio-green/30 text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-bio-green block">
              Meta Diaria de Proteína Limpia:
            </span>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {dailyProtein} <span className="text-lg text-bio-green">gramos / día</span>
            </div>
            <div className="text-[10px] text-gray-300 font-medium pt-1 border-t border-bio-green/20">
              Distribuidos en 3 comidas de ~{Math.round(dailyProtein / 3)}g con al menos <strong className="text-white">2.5g de Leucina</strong> por plato.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: EXERCISE SNACKS DE 60 SEGUNDOS (DRA. RHONDA PATRICK) */}
      <section className="p-6 rounded-3xl bg-glass-noir border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-bio-orange" />
              Exercise Snacks de 60 Segundos (Dra. Rhonda Patrick)
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Ráfagas VILPA para Biogénesis Mitocondrial (PGC-1α)
            </p>
          </div>
          <span className="text-xs font-black text-bio-orange bg-bio-orange/10 px-3 py-1 rounded-xl border border-bio-orange/20">
            +150 NTK
          </span>
        </div>

        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-black uppercase text-white">Instrucciones de la Ráfaga:</h4>
            <p className="text-xs text-gray-300 max-w-md leading-relaxed">
              Realiza 60 segundos de intensidad máxima (salto de cuerda, escaleras o burpees). Libera miocinas antiinflamatorias IL-6.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-3xl font-black font-mono text-bio-orange w-20 text-center">
              {timerLeft}s
            </div>

            {!isTimerRunning ? (
              <button
                onClick={() => {
                  setTimerLeft(60);
                  setIsTimerRunning(true);
                  setCompletedSnack(false);
                }}
                className="py-3 px-6 bg-bio-orange hover:bg-bio-orange/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-bio-orange/20 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                Iniciar 60s
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="py-3 px-6 bg-red-500/20 border border-red-500/40 text-red-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
            )}
          </div>
        </div>

        {completedSnack && (
          <div className="p-3 bg-bio-green/10 border border-bio-green/30 rounded-xl text-xs font-bold text-bio-green flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-bio-green" />
            <span>¡Excelente! Ráfaga completada exitosamente. Se acreditaron +150 NTK y +2 pts en tu Bio-Score.</span>
          </div>
        )}
      </section>

      {/* SECTION 4: SINERGIA CREATINA + MAGNESIO (DR. CARLOS JARAMILLO / ERIC TREXLER) */}
      <section className="p-6 rounded-3xl bg-glass-noir border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-neuro-blue" />
              Sinergia Creatina + Magnesio (Dr. Carlos Jaramillo / Eric Trexler)
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Recarga de ATP Mitocondrial & Salud Neuronal
            </p>
          </div>
          <span className="text-xs font-black text-neuro-blue bg-neuro-blue/10 px-3 py-1 rounded-xl border border-neuro-blue/20">
            5g + 400mg
          </span>
        </div>

        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              5g de Monohidrato de Creatina al día acoplados con 400mg de Magnesio (Citrato/Glicinato). El magnesio actúa como cofactor esencial para la creatina kinasa en la síntesis celular de ATP.
            </p>
          </div>

          <button
            onClick={handleLogSupplements}
            disabled={loggedSupplements}
            className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              loggedSupplements
                ? 'bg-bio-green/20 text-bio-green border border-bio-green/30 cursor-default'
                : 'bg-neuro-blue text-black shadow-lg shadow-neuro-blue/20 hover:scale-105 active:scale-95'
            }`}
          >
            {loggedSupplements ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Dosis Registrada
              </>
            ) : (
              'Registrar Toma (+50 NTK)'
            )}
          </button>
        </div>
      </section>

    </div>
  );
};
