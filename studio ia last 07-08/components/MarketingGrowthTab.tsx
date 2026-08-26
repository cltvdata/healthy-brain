import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Award, 
  ShieldCheck, 
  Filter, 
  BookOpen, 
  Gift, 
  Brain, 
  Sparkles, 
  Users, 
  CheckCircle, 
  Flame, 
  Clock, 
  Heart, 
  DollarSign, 
  ChevronRight, 
  Copy, 
  Check, 
  BarChart2, 
  Zap, 
  Compass, 
  Star,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface MarketingGrowthTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  stitchMode: 'day' | 'night';
}

interface MarketingPillar {
  id: number;
  title: string;
  category: string;
  summary: string;
  videoQuote: string;
  appImplementation: string;
  actionableTool: string;
  impactScore: number; // 1-100
  status: 'implemented' | 'optimizing' | 'ready';
}

const PILLARS_DATA: MarketingPillar[] = [
  {
    id: 1,
    title: 'Propuesta de Valor Única',
    category: 'Estrategia Core',
    summary: 'La razón clara y contundente por la que la gente elige tu app sobre la competencia. Responde a: ¿Qué haces tú mejor o diferente?',
    videoQuote: 'Un error carísimo es decir "ofrecemos calidad, buena atención y buen precio". Eso lo promete todo el mundo.',
    appImplementation: 'Healthy + Brain no es otro contador de calorías: es un motor de Soberanía Biológica con IA local, Gemelo Digital y Recompensas NTK.',
    actionableTool: 'Matriz de Diferenciación Radical vs Apps Genéricas de Fitness',
    impactScore: 98,
    status: 'implemented'
  },
  {
    id: 2,
    title: 'Posicionamiento en la Mente',
    category: 'Estrategia Core',
    summary: 'No es lo que tú dices que eres, sino lo que el consumidor cree que eres en su mente automáticamente (Volvo = Seguridad).',
    videoQuote: 'El posicionamiento se construye única y exclusivamente sobre lo que los consumidores creen de verdad.',
    appImplementation: 'Healthy + Brain = "Soberanía y Longevidad Hormonal Privada" en la mente del usuario.',
    actionableTool: 'Benchmark de Posicionamiento Mental de Marca',
    impactScore: 95,
    status: 'implemented'
  },
  {
    id: 3,
    title: 'Branding e Identidad Coherente',
    category: 'Identidad',
    summary: 'Personalidad completa que permite ser reconocido al instante por un color, tono de voz o interfaz sin cambiar cada 6 meses.',
    videoQuote: 'Cambiar de identidad constantemente garantiza una sola cosa: que nadie se va a acordar de ese negocio.',
    appImplementation: 'Diseño háptico, paleta cian/verde/oscura unificada, estética futurista en modo Stitch de Google.',
    actionableTool: 'Auditoría de Coherencia Visual y Tono de Voz',
    impactScore: 90,
    status: 'implemented'
  },
  {
    id: 4,
    title: 'Ventaja Competitiva de Servicio',
    category: 'Diferenciación',
    summary: 'Ser el más barato es la peor estrategia. El verdadero valor viene de ofrecer un servicio extraordinario y garantías de hierro.',
    videoQuote: 'Construir una ventaja basándonos solo en ser los más baratos es la estrategia más débil de todas.',
    appImplementation: 'Coach IA personalizado con respuesta inmediata + Garantía de Satisfacción Total de 30 Días + Gemelo Digital 1-a-1.',
    actionableTool: 'Calculadora de Valor Añadido vs Competencia de Bajo Costo',
    impactScore: 96,
    status: 'implemented'
  },
  {
    id: 5,
    title: 'Embudo de Ventas (Funnel Completo)',
    category: 'Adquisición',
    summary: 'Proceso paso a paso: Descubrir -> Confiar -> Comparar -> Comprar. No pidas "matrimonio" (compra) en la primera cita.',
    videoQuote: 'Intentar vender de forma agresiva a alguien que apenas acaba de descubrirnos es como pedir matrimonio en la primera cita.',
    appImplementation: '1) Acceso libre a herramientas de respiración -> 2) Test de Bio-Score gratis -> 3) Bono 100 NTK -> 4) Upgrade a Soberano Pro.',
    actionableTool: 'Simulador de Tasa de Conversión y Retención de Clientes',
    impactScore: 94,
    status: 'implemented'
  },
  {
    id: 6,
    title: 'Storytelling Emocional',
    category: 'Conexión',
    summary: 'Las personas olvidan datos fríos e ingredientes, pero recuerdan historias donde se ven reflejados sus propios problemas.',
    videoQuote: 'Nadie recuerda la lista exacta de ingredientes de Coca-Cola, pero todos recuerdan sus camiones navideños.',
    appImplementation: 'Casos reales de transformación biométrica: "Cómo Carlos recuperó su HRV de 32ms a 68ms en 21 días con Prana".',
    actionableTool: 'Generador de Historias de Transformación Biológica',
    impactScore: 92,
    status: 'implemented'
  },
  {
    id: 7,
    title: 'Inbound Marketing (Aportar Valor Primero)',
    category: 'Adquisición',
    summary: 'Atraer ofreciendo contenido y recursos de inmenso valor por adelantado sin pedir nada a cambio, haciendo la compra natural.',
    videoQuote: 'Dar ese valor inicial construye un puente espectacular hacia la venta, sintiéndose como algo ganado.',
    appImplementation: 'Guías de sincronización de wearables, protocolos circadianos e historial biométrico 100% gratuitos.',
    actionableTool: 'Arsenal de Lead Magnets y Protocolos Liberados',
    impactScore: 93,
    status: 'implemented'
  },
  {
    id: 8,
    title: 'Neuromarketing y Emoción',
    category: 'Psicología',
    summary: 'Las decisiones de compra las impulsa la emoción primero; luego la lógica solo las justifica. La experiencia sensorial es clave.',
    videoQuote: 'Nos encanta pensar que tomamos decisiones usando pura lógica matemática. Pero qué va, la emoción va primero.',
    appImplementation: 'Estímulos hápticos, audio de coherencia cardíaca pránica, interfaz oscura tipo centro de comando futurista.',
    actionableTool: 'Inspección de Triggers Sensoriales y Dopaminérgicos',
    impactScore: 91,
    status: 'implemented'
  },
  {
    id: 9,
    title: 'Oferta Irresistible (Bundles & Garantías)',
    category: 'Conversión',
    summary: 'No es bajar precios con descuentos desesperados, sino empaquetar tanto valor percibido que el precio parezca una ganga.',
    videoQuote: 'Hacer descuentos a cada rato solo entrena al público para que nunca pague el precio completo.',
    appImplementation: 'Paquete Soberano Pro: App + Gemelo Digital + Lens IA + 1,000 NTK + Guías Exclusivas ($199 valor -> $9.99/mes).',
    actionableTool: 'Construcción del Paquete de Alto Valor Percibido',
    impactScore: 97,
    status: 'implemented'
  },
  {
    id: 10,
    title: 'Prueba Social (Social Proof)',
    category: 'Confianza',
    summary: 'El cerebro busca atajos y confía en lo que otros ya probaron para reducir la incertidumbre de compra.',
    videoQuote: 'Si vemos dos restaurantes, uno vacío y otro a rebosar, confiamos instantáneamente en el que está lleno.',
    appImplementation: 'Métricas en vivo (+12,450 bio-hackers activos), testimonios verificados de la comunidad y calificación 4.9★.',
    actionableTool: 'Panel de Testimonios y Transmisión en Vivo de Actividad',
    impactScore: 96,
    status: 'implemented'
  },
  {
    id: 11,
    title: 'Autoridad de Marca',
    category: 'Credibilidad',
    summary: 'La autoridad real no se compra con seguidores falsos u oficinas de lujo; se construye resolviendo problemas reales con consistencia.',
    videoQuote: 'La autoridad es una fachada de cartón que se cae al primer soplido si se compra con apariencias.',
    appImplementation: 'Alineamiento con directrices de salud, estudios de longevidad citados, encriptación privada de soberanía.',
    actionableTool: 'Certificación de Soberanía y Descargo Científico',
    impactScore: 94,
    status: 'implemented'
  },
  {
    id: 12,
    title: 'Escasez Real y Exclusividad',
    category: 'Urgencia',
    summary: 'El cerebro le da muchísimo más valor a lo que percibe como limitado o exclusivo. Debe ser 100% auténtica para no destruir la confianza.',
    videoQuote: 'Fingir escasez con falsos carteles es una mentira que el consumidor pilla rápido y destruye la confianza.',
    appImplementation: 'Cohortes mensuales de Optimización Hormonal limitadas a 50 cupos activos con seguimiento dedicado del Bio-Coach.',
    actionableTool: 'Monitor de Cupos Limitados por Cohorte',
    impactScore: 89,
    status: 'implemented'
  },
  {
    id: 13,
    title: 'Urgencia Honesta (Antídoto a la Procrastinación)',
    category: 'Acción',
    summary: 'Fechas límite auténticas que ayudan al consumidor paralizado a dar el paso hoy mismo sin rodeos.',
    videoQuote: 'La urgencia es el antídoto contra la procrastinación. La clave es ser auténticos.',
    appImplementation: 'Bonos diarios de tiempo limitado: +50% extra de NTK al completar la caminata o foto de comida antes de medianoche.',
    actionableTool: 'Reloj de Multiplicador Diario de Recompensas NTK',
    impactScore: 88,
    status: 'implemented'
  },
  {
    id: 14,
    title: 'Reciprocidad Inducida',
    category: 'Fidelización',
    summary: 'Entregar herramientas y ayuda desinteresada crea un deseo profundo en el cliente de corresponder cuando está listo para comprar.',
    videoQuote: 'Es como ayudar a un vecino a subir un mueble pesado. Queda con ganas naturales de devolverte el favor.',
    appImplementation: 'Regalo inmediato de 100 NTK al iniciar + escaneo de comida ilimitado en modo básico.',
    actionableTool: 'Balance de Generosidad e Incentivos Gratuitos',
    impactScore: 95,
    status: 'implemented'
  },
  {
    id: 15,
    title: 'Anclaje de Precios (Price Anchoring)',
    category: 'Conversión',
    summary: 'Establecer un precio alto de referencia al principio ($200) hace que el precio final ($120 o $9.99) se celebre como una victoria.',
    videoQuote: 'Si ves un producto a $200 y luego resulta que el precio final es $120, tu cerebro lo celebra como una victoria espectacular.',
    appImplementation: 'Membresía Pro valorada en $199 USD al mes -> Ofrecida a sólo $9.99 USD ($0.22/día) para miembros de la comunidad.',
    actionableTool: 'Widget Comparativo de Anclaje de Precios y Ahorro',
    impactScore: 98,
    status: 'implemented'
  }
];

export const MarketingGrowthTab: React.FC<MarketingGrowthTabProps> = ({ onAddTokens }) => {
  const [selectedPillar, setSelectedPillar] = useState<MarketingPillar>(PILLARS_DATA[0]);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [simulatedUsers, setSimulatedUsers] = useState<number>(12450);
  const [conversionRate, setConversionRate] = useState<number>(4.8);

  const categories = ['Todos', 'Estrategia Core', 'Adquisición', 'Conversión', 'Fidelización', 'Psicología'];

  const filteredPillars = activeCategory === 'Todos' 
    ? PILLARS_DATA 
    : PILLARS_DATA.filter(p => p.category === activeCategory);

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleRunSimulation = () => {
    setSimulatedUsers(prev => prev + Math.floor(Math.random() * 40) + 15);
    setConversionRate(prev => Number((prev + 0.1).toFixed(1)));
    onAddTokens(50, "Auditoría de Estrategia de Crecimiento & Retención Ejecutada");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
                ACADEMIA DE CRECIMIENTO Y RETENCIÓN DE CLIENTES
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-bio-green/20 text-bio-green border border-bio-green/30 uppercase">
                15 PILARES ACTIVOS
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Estrategia de Adquisición & Fidelización 🚀
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
              Sistema integral basado en la guía maestra de marketing: optimiza la percepción de valor, conversión y retención para que los usuarios amen y valoren su suscripción.
            </p>
          </div>

          <button 
            onClick={handleRunSimulation}
            className="py-3 px-5 bg-primary text-dark font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Zap className="w-4 h-4" />
            Simular Impacto (+50 NTK)
          </button>
        </div>

        {/* Quick Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/5">
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl">
            <span className="text-[9px] font-black text-gray-500 uppercase block">Score de Retención</span>
            <span className="text-lg font-black text-bio-green">96.4%</span>
            <span className="text-[9px] text-gray-400 block mt-0.5">Alto LTV de clientes</span>
          </div>
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl">
            <span className="text-[9px] font-black text-gray-500 uppercase block">Usuarios Activos</span>
            <span className="text-lg font-black text-primary">{simulatedUsers.toLocaleString()}</span>
            <span className="text-[9px] text-bio-green block mt-0.5">+14% este mes</span>
          </div>
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl">
            <span className="text-[9px] font-black text-gray-500 uppercase block">Conversión Pro</span>
            <span className="text-lg font-black text-bio-orange">{conversionRate}%</span>
            <span className="text-[9px] text-gray-400 block mt-0.5">Optimizada con Anclaje</span>
          </div>
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl">
            <span className="text-[9px] font-black text-gray-500 uppercase block">Garantía Activa</span>
            <span className="text-lg font-black text-white">30 Días</span>
            <span className="text-[9px] text-bio-green block mt-0.5">100% Sin Riesgo</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-dark shadow-md shadow-primary/20'
                : 'bg-glass-noir border border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Pillars List + Selected Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 15 Pillars Selector */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-hide">
          {filteredPillars.map((p) => {
            const isSelected = selectedPillar.id === p.id;
            return (
              <div 
                key={p.id}
                onClick={() => setSelectedPillar(p)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/40 shadow-lg shadow-primary/5'
                    : 'bg-glass-noir border-white/5 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] flex items-center justify-center">
                      {p.id}
                    </span>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{p.title}</h4>
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase bg-white/5 px-2 py-0.5 rounded-md">
                    {p.category}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {p.summary}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[9px]">
                  <span className="text-bio-green font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Aplicado en App
                  </span>
                  <span className="text-gray-500 font-mono">Impacto: {p.impactScore}/100</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Pillar Inspector & Operational Implementation */}
        <div className="lg:col-span-7 bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-5">
            {/* Selected Pillar Header */}
            <div className="flex justify-between items-start pb-4 border-b border-white/5">
              <div>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-1">
                  PILAR #{selectedPillar.id} • {selectedPillar.category.toUpperCase()}
                </span>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                  {selectedPillar.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-bio-green">{selectedPillar.impactScore}</span>
                <span className="text-[9px] text-gray-500 font-bold block uppercase">Índice Retención</span>
              </div>
            </div>

            {/* Key Quote from Video */}
            <div className="p-4 bg-black/40 border-l-2 border-bio-orange rounded-r-2xl space-y-1">
              <span className="text-[9px] font-black text-bio-orange uppercase tracking-wider block">
                Principio Fundacional (Video):
              </span>
              <p className="text-xs italic text-gray-300 leading-relaxed">
                "{selectedPillar.videoQuote}"
              </p>
            </div>

            {/* Summary & App Implementation */}
            <div className="space-y-3">
              <div>
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Definición Estratégica:
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {selectedPillar.summary}
                </p>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1">
                <h5 className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Implementación Real en Healthy + Brain:
                </h5>
                <p className="text-xs text-white leading-relaxed font-semibold">
                  {selectedPillar.appImplementation}
                </p>
              </div>
            </div>

            {/* Practical Operational Tool / Script */}
            <div className="p-4 bg-black/50 border border-white/5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-bio-green" /> Herramienta de Adquisición / Retención:
                </span>
                <button 
                  onClick={() => handleCopyScript(`${selectedPillar.title}: ${selectedPillar.appImplementation}`)}
                  className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-bio-green" /> : <Copy className="w-3 h-3" />}
                  {copiedScript ? 'Copiado' : 'Copiar Texto'}
                </button>
              </div>
              <p className="text-xs font-mono text-bio-green bg-black/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                {selectedPillar.actionableTool}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-bio-green" />
              <span className="text-[10px] text-gray-400 font-medium">
                Optimizado para máxima retención de suscriptores y percepción de valor.
              </span>
            </div>
            <button
              onClick={() => onAddTokens(25, `Activación de Pilar #${selectedPillar.id}`)}
              className="w-full sm:w-auto py-2.5 px-4 bg-white/5 border border-white/10 hover:border-primary hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Aplicar a Mi Cuenta (+25 NTK)
            </button>
          </div>
        </div>

      </div>

      {/* 15 Pillars Summary Grid Matrix */}
      <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Matriz de Crecimiento de 15 Pasos
          </h3>
          <span className="text-[10px] font-bold text-gray-500 uppercase">
            100% Integrado en Interfaz
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PILLARS_DATA.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedPillar(item)}
              className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                selectedPillar.id === item.id 
                  ? 'bg-primary/20 border-primary text-white scale-[1.02]' 
                  : 'bg-black/30 border-white/5 hover:border-white/20 text-gray-400'
              }`}
            >
              <span className="text-[10px] font-black block text-primary">#{item.id}</span>
              <span className="text-[11px] font-bold block truncate mt-0.5">{item.title}</span>
              <span className="text-[8px] text-bio-green block mt-1 font-mono">100% Activo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
