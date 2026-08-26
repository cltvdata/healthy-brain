import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Layers, 
  Plus, 
  Sparkles, 
  Radio, 
  Smartphone, 
  Activity, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  Info, 
  Flame, 
  Clock, 
  Volume2,
  ExternalLink,
  Cpu
} from 'lucide-react';

interface NotebookLMTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateMetrics: (updated: any) => void;
  tokens: number;
  stitchMode: 'day' | 'night';
}

interface KnowledgeSource {
  id: string;
  title: string;
  type: 'PDF' | 'Voice' | 'Text' | 'Web';
  priority: number; // 1 (Highest) to 4 (Lowest)
  priorityLabel: string;
  sourceName: string;
  status: 'Sincronizado' | 'Procesando';
  extract: string;
}

const INITIAL_SOURCES: KnowledgeSource[] = [
  {
    id: 'src-1',
    title: 'Guía de Sincronización Circadiana y Cortisol en Foco Cognitivo',
    type: 'PDF',
    priority: 1,
    priorityLabel: 'Grado Médico (Prioridad 1)',
    sourceName: 'Estudio_Clinico_SNC_2026.pdf',
    status: 'Sincronizado',
    extract: 'La exposición a luz solar de espectro azul-verde (480nm) en los primeros 30 minutos al despertar estabiliza el cortisol plasmático, optimizando la capacidad de foco sostenido durante 4.5 horas y anclando el ritmo circadiano para la secreción natural de melatonina 14 horas después.'
  },
  {
    id: 'src-2',
    title: 'Dra. Rhonda Patrick & Creatina 5g + Magnesio L-Treonato',
    type: 'PDF',
    priority: 1,
    priorityLabel: 'Grado Médico (Prioridad 1)',
    sourceName: 'Rhonda_Patrick_Bioavailability_2026.pdf',
    status: 'Sincronizado',
    extract: 'La sinergia de Creatina Monohidratada (5g/día) con Magnesio L-Treonato cruza la barrera hematoencefálica, recargando las reservas de fosfocreatina en las neuronas, acelerando el reciclaje de ATP cerebral y previniendo el declive cognitivo.'
  },
  {
    id: 'src-3',
    title: 'Dra. Gabrielle Lyon: Medicina Centrada en el Músculo & mTOR',
    type: 'Web',
    priority: 2,
    priorityLabel: 'Nutrición Clínica (Prioridad 2)',
    sourceName: 'https://drgabriellelyon.com/muscle-centric-medicine',
    status: 'Sincronizado',
    extract: 'El músculo esquelético es el órgano endocrino primario de la longevidad. Consumir 30-50g de proteína de alto valor biológico por comida estimula la vía mTORC1, optimizando el metabolismo de la glucosa y la densidad muscular.'
  },
  {
    id: 'src-4',
    title: 'Dr. David Hawkins: Mapa de Consciencia & Autorregulación Vagal',
    type: 'Voice',
    priority: 3,
    priorityLabel: 'Ciencia de Longevidad (Prioridad 3)',
    sourceName: 'Hawkins_Map_Consciousness_Calibrations.wav',
    status: 'Sincronizado',
    extract: 'Transcender el estado de supervivencia (miedo/ira <200 Hz) hacia la aceptación y paz (500+ Hz) reduce drásticamente el tono simpático, estabilizando la variabilidad de frecuencia cardíaca (HRV) e induciendo coherencia neurológica.'
  },
  {
    id: 'src-5',
    title: 'Secuenciación de Nutrientes y Estabilidad de Insulina',
    type: 'Web',
    priority: 2,
    priorityLabel: 'Nutrición Clínica (Prioridad 2)',
    sourceName: 'https://metabolic-science.org/fiber-mesh',
    status: 'Sincronizado',
    extract: 'Cubrir las microvellosidades intestinales con fibra soluble viscosa antes de la ingesta de carbohidratos ralentiza la tasa de vaciado gástrico, aplanando los picos glucémicos postprandiales hasta en un 42% y previniendo la fatiga cerebral inducida por hipoglucemia reactiva.'
  },
  {
    id: 'src-6',
    title: 'Notas de Voz: Coherencia Cardíaca y Tonificación Vagal',
    type: 'Voice',
    priority: 3,
    priorityLabel: 'Ciencia de Longevidad (Prioridad 3)',
    sourceName: 'NotaDeVoz_Vagal_Reset.wav',
    status: 'Sincronizado',
    extract: 'El ciclo de respiración 4-4-8 (Inhala 4s, Retén 4s, Exhala 8s) estimula la rama aferente del nervio vago. Al prolongar la exhalación, se reduce la frecuencia cardíaca instantánea, disminuyendo la actividad de la amígdala y despejando la niebla mental en menos de 10 minutos.'
  }
];

export const NotebookLMTab: React.FC<NotebookLMTabProps> = ({ onAddTokens, onUpdateMetrics, tokens, stitchMode }) => {
  const [sources, setSources] = useState<KnowledgeSource[]>(INITIAL_SOURCES);
  const [newTitle, setNewTitle] = useState('');
  const [newExtract, setNewExtract] = useState('');
  const [newType, setNewType] = useState<'PDF' | 'Voice' | 'Text' | 'Web'>('Text');
  const [newPriority, setNewTypePriority] = useState<number>(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Haptic simulation state
  const [hapticStatus, setHapticStatus] = useState<string>('Inactivo');
  const [activeWavePattern, setActiveWavePattern] = useState<number[]>([]);
  const [isVibratingVisual, setIsVibratingVisual] = useState(false);

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExtract.trim()) return;

    setIsProcessing(true);
    onAddTokens(25, 'Procesando archivo en el cluster de NotebookLM...');

    setTimeout(() => {
      const priorityLabels: Record<number, string> = {
        1: 'Grado Médico (Prioridad 1)',
        2: 'Nutrición Clínica (Prioridad 2)',
        3: 'Ciencia de Longevidad (Prioridad 3)',
        4: 'Fitness General (Prioridad 4)'
      };

      const newSource: KnowledgeSource = {
        id: `src-${Date.now()}`,
        title: newTitle,
        type: newType,
        priority: newPriority,
        priorityLabel: priorityLabels[newPriority] || 'Información General',
        sourceName: newType === 'Web' ? 'https://notebooklm.google/user-source' : `Archivo_Importado_${Math.floor(Math.random() * 1000)}.txt`,
        status: 'Sincronizado',
        extract: newExtract
      };

      // Sort sources by priority so that Priority 1 comes first
      const updated = [...sources, newSource].sort((a, b) => a.priority - b.priority);
      setSources(updated);
      setNewTitle('');
      setNewExtract('');
      setIsProcessing(false);

      onAddTokens(150, `NotebookLM: Sincronización Exitosa de "${newSource.title.slice(0, 20)}..."`);
      
      // Dynamically improve metrics if a higher priority source is added
      if (newPriority <= 2) {
        onUpdateMetrics({ glucoseStable: true });
      }
    }, 2000);
  };

  // Real Web Haptic triggering with visual feedback
  const triggerHapticPattern = (patternName: string, pattern: number[]) => {
    setHapticStatus(`Activo: ${patternName}`);
    setActiveWavePattern(pattern);
    setIsVibratingVisual(true);

    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }

    // Calc total duration of pattern to turn off visual vibration
    const totalDuration = pattern.reduce((acc, val) => acc + val, 0);
    setTimeout(() => {
      setIsVibratingVisual(false);
      setHapticStatus('Inactivo');
    }, Math.max(totalDuration, 800));
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: '1. Integración con NotebookLM API (Python / NodeJS Mock)',
      language: 'typescript',
      code: `// Flujo de datos unificado y priorizado
interface UnifiedProfile {
  medicalFindings: string[];
  nutritionalShields: string[];
  vagalGuides: string[];
}

export async function processNotebookLMSource(sourceText: string, category: 'medical' | 'nutrition' | 'exercise') {
  // Envía el extracto al modelo de lenguaje con el prompt de Stitch/Pomelli
  const response = await fetch('/api/notebook-lm/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceText, category, priorityRules: "Medical > Nutrition > Longevity > Fitness" })
  });
  return await response.json();
}`
    },
    {
      title: '2. Disparador de Alertas Hápticas Sutiles (Web/Android/iOS)',
      language: 'typescript',
      code: `// Matriz de patrones háticos físicos
export const HapticMatrix = {
  // Sedentarismo: pulso de alerta largo
  sedentaryWarning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([400, 200, 400]);
    }
  },
  // Respiración: simulación de onda sinusoidal (suave)
  breathCoherence: () => {
    if (navigator.vibrate) {
      navigator.vibrate([150, 150, 150, 150, 150]);
    }
  },
  // Noche: decaimiento progresivo de frecuencia
  nightDecay: () => {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 200, 100, 100]);
    }
  }
};`
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Stitch Dynamic Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-700 ${
        stitchMode === 'night' 
          ? 'bg-gradient-to-br from-indigo-950/40 to-black/80 border-indigo-500/20' 
          : 'bg-gradient-to-br from-bio-orange/10 to-black/80 border-bio-orange/20'
      }`}>
        <div className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
          stitchMode === 'night' ? 'bg-indigo-500' : 'bg-bio-orange'
        }`}></div>
        
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-3 inline-block border ${
          stitchMode === 'night' 
            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-400/30' 
            : 'bg-bio-orange/20 text-bio-orange border-bio-orange/30'
        }`}>
          {stitchMode === 'night' ? 'MODO STITCH: CALMA DE NOCHE' : 'MODO STITCH: ENERGÍA DE DÍA'}
        </span>
        
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
          NotebookLM <span className={stitchMode === 'night' ? 'text-indigo-400' : 'text-bio-orange'}>Core</span>
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Módulo de Inteligencia de Fuentes Vivientes. Cruza datos clínicos estructurados y dispara micro-intervenciones de 10 minutos guiadas por haptics en el hardware del dispositivo.
        </p>
      </div>

      {/* SECCIÓN 1: Mapa de Lógica y Flujo de Datos */}
      <section className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-neuro-blue" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Sección 1: Mapa de Lógica y Sincronización de Fuentes
          </h3>
        </div>

        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-xs space-y-3 leading-relaxed">
          <p className="text-gray-300">
            Para evitar la colisión de datos en el perfil del usuario, el motor de <strong className="text-neuro-blue">Google Stitch</strong> prioriza las fuentes sincronizadas en tiempo real utilizando la jerarquía estricta de <strong className="text-white">Pomelli</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold">
            <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl">
              1. Médica Clínica
            </div>
            <div className="p-3 bg-bio-orange/10 border border-bio-orange/20 text-bio-orange rounded-xl">
              2. Nutrición Científica
            </div>
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
              3. Longevidad Pránica
            </div>
            <div className="p-3 bg-bio-green/10 border border-bio-green/20 text-bio-green rounded-xl">
              4. Fitness General
            </div>
          </div>
          <p className="text-[11px] text-gray-400 italic">
            * Si una recomendación de nivel 1 entra en conflicto con una de nivel 4 (ej. restringir esfuerzo cardíaco por cortisol elevado), la app atenúa dinámicamente las rutinas deportivas.
          </p>
        </div>

        {/* Existing sources list */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fuentes de Verdad Activas ({sources.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {sources.map(src => (
              <div key={src.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-lg text-black ${
                      src.priority === 1 ? 'bg-red-500' :
                      src.priority === 2 ? 'bg-bio-orange' :
                      src.priority === 3 ? 'bg-indigo-400' : 'bg-bio-green'
                    }`}>
                      <FileText className="w-4 h-4 text-black" />
                    </span>
                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-tight">{src.title}</h5>
                      <span className="text-[9px] text-gray-500 font-bold uppercase">{src.sourceName} • {src.priorityLabel}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-bio-green/15 text-bio-green border border-bio-green/30 uppercase tracking-wider">
                    {src.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                  "{src.extract}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Add Source Form */}
        <form onSubmit={handleAddSource} className="p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-4 h-4 text-bio-orange" /> Sincronizar Nueva Fuente en NotebookLM
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[9px] font-black text-gray-500 uppercase block">Título de la Fuente Científica</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej. Estudio de Autofagia y Ayuno Intermitente"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-bio-orange/50 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase block">Tipo de Archivo</label>
              <select 
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-bio-orange/50"
              >
                <option value="PDF">Documento PDF</option>
                <option value="Voice">Audio / Voz</option>
                <option value="Text">Texto Libre / Nota</option>
                <option value="Web">Enlace Web</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[9px] font-black text-gray-500 uppercase block">Extracto Clave / Texto Científico</label>
              <textarea 
                value={newExtract}
                onChange={e => setNewExtract(e.target.value)}
                placeholder="Pega aquí el contenido científico o transcríbelo..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-bio-orange/50 transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase block">Prioridad Algorítmica</label>
              <select 
                value={newPriority}
                onChange={e => setNewTypePriority(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-bio-orange/50"
              >
                <option value={1}>1 - Médica Clínica</option>
                <option value={2}>2 - Nutrición Clínica</option>
                <option value={3}>3 - Ciencia de Longevidad</option>
                <option value={4}>4 - Fitness General</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isProcessing 
                ? 'bg-white/5 border border-white/5 text-gray-500 cursor-default' 
                : 'bg-bio-orange text-dark shadow-md shadow-bio-orange/10 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                Cruzando datos en NotebookLM...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black stroke-[3]" />
                Sincronizar e Inyectar Fuente (+150 NTK)
              </>
            )}
          </button>
        </form>
      </section>

      {/* SECCIÓN 2: Protocolo de Intervenciones de 10 min y Matriz Háptica */}
      <section className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-bio-orange" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Sección 2: Protocolo Háptico & Intervenciones
            </h3>
          </div>
          
          {/* Real-time vibration visual status */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${isVibratingVisual ? 'bg-bio-green animate-ping' : 'bg-gray-600'}`}></span>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{hapticStatus}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Las notificaciones auditivas provocan picos de cortisol cerebral. Para mantener la calma neurológica, la app estimula suavemente mediante el motor de vibración física de tu móvil.
        </p>

        {/* Interactive Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase text-gray-500 tracking-wider">
                <th className="pb-3 pr-2">Micro-Acción (10 min)</th>
                <th className="pb-3 px-2">Gatillo Algorítmico</th>
                <th className="pb-3 px-2">Patrón Háptico</th>
                <th className="pb-3 pl-2 text-right">Probar Estímulo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              <tr>
                <td className="py-4 pr-2">
                  <span className="text-white font-bold block">Descompresión Espinal</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Estiramiento torácico express</span>
                </td>
                <td className="py-4 px-2 text-[10px] text-bio-orange font-bold uppercase">
                  Sedentarismo {'>'} 60m
                </td>
                <td className="py-4 px-2">
                  <span className="px-2 py-0.5 rounded bg-bio-orange/15 border border-bio-orange/30 text-[9px] font-black text-bio-orange uppercase block w-fit">
                    PULSO LARGO (400ms)
                  </span>
                </td>
                <td className="py-4 pl-2 text-right">
                  <button 
                    onClick={() => triggerHapticPattern('Pulso Largo Warning', [400, 200, 400])}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-bio-orange/40 hover:bg-bio-orange/10 hover:text-bio-orange transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr>
                <td className="py-4 pr-2">
                  <span className="text-white font-bold block">Coherencia de Aire</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Respiración 4-4-8 anti-estrés</span>
                </td>
                <td className="py-4 px-2 text-[10px] text-neuro-blue font-bold uppercase">
                  HRV {'<'} 50ms (Estrés)
                </td>
                <td className="py-4 px-2">
                  <span className="px-2 py-0.5 rounded bg-neuro-blue/15 border border-neuro-blue/30 text-[9px] font-black text-neuro-blue uppercase block w-fit">
                    ONDA SUAVE (150ms)
                  </span>
                </td>
                <td className="py-4 pl-2 text-right">
                  <button 
                    onClick={() => triggerHapticPattern('Onda Rítmica Suave', [150, 150, 150, 150, 150])}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-neuro-blue/40 hover:bg-neuro-blue/10 hover:text-neuro-blue transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr>
                <td className="py-4 pr-2">
                  <span className="text-white font-bold block">Apagado de Dopamina</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Visualización y relax antes de dormir</span>
                </td>
                <td className="py-4 px-2 text-[10px] text-indigo-400 font-bold uppercase">
                  Hora de Noche (22:00)
                </td>
                <td className="py-4 px-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[9px] font-black text-indigo-400 uppercase block w-fit">
                    DECAIMIENTO (300ms)
                  </span>
                </td>
                <td className="py-4 pl-2 text-right">
                  <button 
                    onClick={() => triggerHapticPattern('Decaimiento Progresivo', [300, 100, 200, 100, 100])}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Desktop interactive visualization of the vibration wave */}
        {activeWavePattern.length > 0 && (
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Onda de Estimulación Hápitca Activa</span>
            <div className="flex items-center gap-1 h-8 bg-black/60 rounded-xl overflow-hidden px-3">
              {activeWavePattern.map((v, i) => (
                <div 
                  key={i} 
                  className={`rounded-full transition-all duration-300 ${
                    isVibratingVisual 
                      ? 'bg-bio-green' 
                      : 'bg-gray-600'
                  }`}
                  style={{ 
                    width: `${Math.max(10, (v / 400) * 100)}%`, 
                    height: i % 2 === 0 ? '80%' : '20%',
                    animation: isVibratingVisual ? `pulse ${v}ms infinite` : 'none'
                  }}
                ></div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 italic">
              * Si estás probando la app desde un teléfono móvil compatible, habrás sentido la vibración física exacta en tu mano.
            </p>
          </div>
        )}
      </section>

      {/* SECCIÓN 3: Reporte de Rediseño de Interfaz (Pomelli & Stitch) */}
      <section className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-bio-green" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Sección 3: Auditoría Estética (Pomelli & Stitch)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 text-[11px]">
              ❌ UI Tradicional Estática
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-gray-400 text-[11px]">
              <li>Menús de hamburguesa masivos y laberínticos.</li>
              <li>Estilo visual plano y aburrido con alertas sonoras estridentes.</li>
              <li>No se adapta al ciclo circadiano del usuario (funde la retina a las 11 PM).</li>
              <li>Información desconectada sin correlación médica.</li>
            </ul>
          </div>

          <div className="p-4 bg-bio-green/10 border border-bio-green/20 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-bio-green uppercase tracking-wider flex items-center gap-1 text-[11px]">
              ✓ Interfaz Líquida (Stitch + Pomelli)
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-gray-300 text-[11px]">
              <li>Bento grid adaptable que prioriza lo que necesitas en tiempo real.</li>
              <li>Diseño "Deep Obsidian & Slate" ultra pulido y amigable para el ojo.</li>
              <li>Alertas háticas sutiles de baja frecuencia integradas al flujo diario.</li>
              <li>La interfaz muta de día (enérgica/médica) a noche (calma absoluta).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Snippets de Código de Arquitectura */}
      <section className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-neuro-blue" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Sección 4: Snippets de Arquitectura de Código
          </h3>
        </div>

        <div className="space-y-4">
          {codeSnippets.map((snippet, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-gray-300">{snippet.title}</span>
                <button
                  onClick={() => handleCopyCode(snippet.code, idx)}
                  className="text-[10px] font-black uppercase text-neuro-blue hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-bio-green" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Código
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-black/60 border border-white/5 rounded-2xl text-[10px] text-gray-300 overflow-x-auto font-mono leading-relaxed">
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
