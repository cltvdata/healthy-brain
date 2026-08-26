import React, { useState } from 'react';
import { 
  QrCode, 
  Settings, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  ListTodo, 
  FileCode, 
  FileText, 
  Globe, 
  Sparkles, 
  Compass,
  Trophy,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';

interface LaunchHubTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  stitchMode: 'day' | 'night';
}

interface ChecklistItem {
  id: string;
  text: string;
  section: 'Google Play' | 'Apple App Store' | 'Pre-Submission';
  checked: boolean;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  // Google Play Console
  { id: 'gp-1', text: 'Cuenta de Google Play Developer ($25 una vez) y correos/pagos verificados', section: 'Google Play', checked: true },
  { id: 'gp-2', text: 'App Metadata: Título (80 chars), Descripción corta (80) y completa (4000)', section: 'Google Play', checked: false },
  { id: 'gp-3', text: 'Assets: Icono (512x512 PNG), Feature Graphic (1024x500 PNG) y 2-8 Screenshots', section: 'Google Play', checked: false },
  { id: 'gp-4', text: 'Configurar productos in-app (ntK_10, ntk_50, ntk_100, pro_month, elite_month)', section: 'Google Play', checked: false },
  
  // Apple App Store
  { id: 'ap-1', text: 'Apple Developer Program ($99/año) y Bank/Tax info completados', section: 'Apple App Store', checked: true },
  { id: 'ap-2', text: 'App Information: Nombre, Subtítulo y Keywords (100 chars max)', section: 'Apple App Store', checked: false },
  { id: 'ap-3', text: 'Screenshots para iPhone 6.7\" (1290x2796) y 6.5\" (1242x2688) de alta fidelidad', section: 'Apple App Store', checked: false },
  { id: 'ap-4', text: 'Subir build desde EAS / Xcode y configurar cuenta demo para revisión', section: 'Apple App Store', checked: false },
  
  // Pre-Submission QA
  { id: 'qa-1', text: 'Verificar onboarding completo y carga correcta de métricas locales', section: 'Pre-Submission', checked: true },
  { id: 'qa-2', text: 'Verificar sistema de tokens NTK offline-first y triggers de sonido/háptica', section: 'Pre-Submission', checked: true },
  { id: 'qa-3', text: 'Privacy Policy & Terms of Service accesibles y hosteados en la web', section: 'Pre-Submission', checked: false }
];

interface HTMLTemplate {
  filename: string;
  purpose: string;
  keyMetrics: string[];
}

const HTML_TEMPLATES: HTMLTemplate[] = [
  { filename: 'index.html', purpose: 'Lobby principal y dashboard de control con telemetría en tiempo real.', keyMetrics: ['Bio-Score', 'HRV', 'Pasos', 'Glucosa'] },
  { filename: 'perfil-setup.html', purpose: 'Onboarding y calibración biométrica inicial del usuario.', keyMetrics: ['Edad', 'Estatura', 'Masa Corporal', 'Actividad'] },
  { filename: 'comunidad.html', purpose: 'Ranking global (Bio-Elite) y desafíos colectivos de longevidad.', keyMetrics: ['Top Guerreros', 'Desafíos Activos', 'NTK Rewards'] },
  { filename: 'recompensas.html', purpose: 'Bio-Store y canje de tokens NTK por boosts y planes.', keyMetrics: ['Balance NTK', 'Planes de Canje', 'Siguiente Nivel XP'] },
  { filename: 'ejercicios.html', purpose: 'Enciclopedia biomecánica y biblioteca técnica de movimientos.', keyMetrics: ['Foco Neural', 'Intensidad', 'Protocolo Biomecánico'] },
  { filename: 'entrenar.html', purpose: 'Gimnasio interactivo con series, repeticiones y cargas activas.', keyMetrics: ['Carga (kg)', 'Volumen (reps)', 'Sets'] },
  { filename: 'descanso.html', purpose: 'Temporizador de bio-recuperación y respiración coherente guiada.', keyMetrics: ['Timer', 'Coherencia Cardíaca', 'Pulsos Hápticos'] },
  { filename: 'nutricion-ia.html', purpose: 'Escáner molecular de platos con análisis de macros por IA.', keyMetrics: ['Calorías', 'Proteína', 'Carbohidratos', 'Grasas'] },
  { filename: 'macros.html', purpose: 'Calculadora de distribución nutricional dinámica Mifflin-St Jeor.', keyMetrics: ['TDEE', 'BMR', 'Objetivo Fitness'] },
  { filename: 'deals.html', purpose: 'Ofertas exclusivas de marcas asociadas (adidas, Garmin, WHOOP).', keyMetrics: ['Descuentos', 'Códigos Únicos', 'Costo en NTK'] },
  { filename: 'regulacion-emocional.html', purpose: 'Técnica de respiración 4-7-8 con audio binaural de 4Hz.', keyMetrics: ['Ciclos', 'Fase', 'Frecuencia Theta'] },
  { filename: 'regulacion-dopamina.html', purpose: 'Ayuno de dopamina, modo enfoque profundo y bloqueo de alertas.', keyMetrics: ['Timer', 'Foco Láser', 'Reseteo Neural'] },
  { filename: 'hacks-metabolicos.html', purpose: 'Guía de secuencia de ingesta (Fibra -> Proteína -> Carbos).', keyMetrics: ['Malla Gástrica', 'Estabilidad', 'Curva de Glucosa'] },
  { filename: 'evolucion-bioquimica.html', purpose: 'Análisis gráfico avanzado de energía y movilidad.', keyMetrics: ['Energía Biológica', 'Rango Movilidad', 'Insights de IA'] },
  { filename: 'envejecimiento-cerebral.html', purpose: 'Mitigación de declive cognitivo y glicación.', keyMetrics: ['AGEs', 'Foco Mitocondrial', 'Barrera Hematoencefálica'] },
  { filename: 'verify-email.html', purpose: 'Verificación de cuenta y activación de Bio-ID en el cloud.', keyMetrics: ['Firma Digital', 'Fórmula Premium', 'Soberanía'] }
];

export const LaunchHubTab: React.FC<LaunchHubTabProps> = ({ onAddTokens, stitchMode }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [descLanguage, setDescLanguage] = useState<'ES' | 'EN'>('ES');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'build' | 'checklist' | 'assets' | 'templates'>('build');

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.checked;
        if (nextState) {
          onAddTokens(20, `Verificación completada: ${item.text.slice(0, 20)}...`);
        }
        return { ...item, checked: nextState };
      }
      return item;
    }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const totalItems = checklist.length;
  const checkedItems = checklist.filter(i => i.checked).length;
  const progressPct = Math.round((checkedItems / totalItems) * 100);

  const easConfigJson = `{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "ed868794-915b-446a-bf5a-6da90fa3d123"
      }
    }
  }
}`;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Tab Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-700 ${
        stitchMode === 'night' 
          ? 'bg-gradient-to-br from-indigo-950/40 to-black/80 border-indigo-500/20' 
          : 'bg-gradient-to-br from-bio-orange/10 to-black/80 border-bio-orange/20'
      }`}>
        <div className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
          stitchMode === 'night' ? 'bg-indigo-500' : 'bg-bio-orange'
        }`}></div>
        
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block border bg-white/5 border-white/10 text-neuro-blue">
          Ecosistema Móvil & Lanzamiento
        </span>
        
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
          Launch & <span className="text-neuro-blue">Store Hub</span> 🚀
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Monitorea el estado de compilación EAS, gestiona los assets de las tiendas (App Store & Google Play) y haz un seguimiento interactivo del checklist de publicación.
        </p>
      </div>

      {/* Sub-Navigation Pill Buttons */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('build')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'build' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-neuro-blue" />
          EAS Build & Config
        </button>
        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'checklist' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ListTodo className="w-4 h-4 text-bio-orange" />
          Checklist ({progressPct}%)
        </button>
        <button
          onClick={() => setActiveSubTab('assets')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'assets' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-bio-green" />
          Store Assets
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'templates' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4 text-indigo-400" />
          Plantillas HTML ({HTML_TEMPLATES.length})
        </button>
      </div>

      {/* VIEW 1: EAS Build & Config */}
      {activeSubTab === 'build' && (
        <div className="space-y-6">
          <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-neuro-blue" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Sincronización EAS Cloud Preview
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* QR Code container */}
              <div className="flex flex-col items-center justify-center p-4 bg-white/2 border border-white/5 rounded-2xl text-center space-y-3">
                <div className="bg-white p-3 rounded-2xl flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/healthy-brain.apk')}`} 
                    alt="EAS Build QR Code"
                    className="w-[120px] h-[120px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-black text-neuro-blue uppercase tracking-widest">EAS BUILD COMPLETED</span>
                <span className="text-[9px] text-gray-500 font-bold uppercase">PROJECT: ed868794-915b-446a-bf5a-6da90fa3d123</span>
              </div>

              {/* EAS Config details */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">EAS Project ID Config</span>
                  <button
                    onClick={() => handleCopy(easConfigJson, 'eas-config')}
                    className="text-[10px] font-black text-neuro-blue uppercase hover:text-white transition-all flex items-center gap-1"
                  >
                    {copiedText === 'eas-config' ? <Check className="w-3.5 h-3.5 text-bio-green" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText === 'eas-config' ? 'Copiado!' : 'Copiar Config'}
                  </button>
                </div>
                <pre className="p-4 bg-black/60 border border-white/5 rounded-2xl text-[10px] text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  <code>{easConfigJson}</code>
                </pre>
              </div>
            </div>

            {/* Build Instructions and Command lines */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guía de Construcción y Compilación</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cloud build */}
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black text-neuro-blue uppercase bg-neuro-blue/10 border border-neuro-blue/20 px-2 py-0.5 rounded-md w-fit block">EAS Cloud Build</span>
                  <p className="text-[11px] text-gray-400 font-medium">Ejecuta compilaciones optimizadas en la nube de Expo para producción o preview.</p>
                  <pre className="p-2 bg-black/40 rounded-xl text-[10px] font-mono text-gray-300 truncate">
                    eas build -p android --profile preview
                  </pre>
                </div>

                {/* Local build */}
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black text-bio-orange uppercase bg-bio-orange/10 border border-bio-orange/20 px-2 py-0.5 rounded-md w-fit block">Local App Build</span>
                  <p className="text-[11px] text-gray-400 font-medium">Construye la app directamente en tu máquina local para testing interno.</p>
                  <pre className="p-2 bg-black/40 rounded-xl text-[10px] font-mono text-gray-300 truncate">
                    npx expo run:android
                  </pre>
                </div>

                {/* Web build */}
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black text-bio-green uppercase bg-bio-green/10 border border-bio-green/20 px-2 py-0.5 rounded-md w-fit block">Vite Web Build</span>
                  <p className="text-[11px] text-gray-400 font-medium">Compila el dashboard web de alta fidelidad para despliegue en Vercel o Cloud Run.</p>
                  <pre className="p-2 bg-black/40 rounded-xl text-[10px] font-mono text-gray-300 truncate">
                    npm run build
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Interactive Checklist */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-bio-orange" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Checklist de Envío a Tiendas
                </h3>
              </div>
              
              <span className="text-xs font-black text-bio-orange uppercase bg-bio-orange/10 border border-bio-orange/20 px-3 py-1 rounded-xl">
                {checkedItems} / {totalItems} Completados
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Progreso de Preparación de Lanzamiento</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-bio-orange to-bio-green rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(255,138,0,0.2)]" 
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist Groups */}
            {['Google Play', 'Apple App Store', 'Pre-Submission'].map((sectionName) => (
              <div key={sectionName} className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sectionName} Requirements</h4>
                
                <div className="space-y-2">
                  {checklist.filter(item => item.section === sectionName).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        item.checked 
                          ? 'bg-bio-green/5 border-bio-green/30 text-white' 
                          : 'bg-white/2 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        item.checked ? 'text-bio-green' : 'text-gray-600'
                      }`} />
                      <span className="text-xs font-medium leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Store Descriptions & Assets */}
      {activeSubTab === 'assets' && (
        <div className="space-y-6">
          <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-bio-green" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Ficha de Tienda & Descripciones
                </h3>
              </div>
              
              {/* Language Selector */}
              <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/5">
                <button
                  onClick={() => setDescLanguage('ES')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    descLanguage === 'ES' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Español (Play Store)
                </button>
                <button
                  onClick={() => setDescLanguage('EN')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    descLanguage === 'EN' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  English (App Store)
                </button>
              </div>
            </div>

            {/* Description Render */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metadata Copy para Stores</span>
                <button
                  onClick={() => handleCopy(
                    descLanguage === 'ES' 
                      ? 'Healthy + Brain es la plataforma de bio-optimización más avanzada que combina...' 
                      : 'Healthy + Brain is the most advanced bio-optimization platform...', 
                    'store-copy'
                  )}
                  className="text-[10px] font-black text-neuro-blue uppercase hover:text-white transition-all flex items-center gap-1"
                >
                  {copiedText === 'store-copy' ? <Check className="w-3.5 h-3.5 text-bio-green" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedText === 'store-copy' ? 'Copiado!' : 'Copiar Texto'}
                </button>
              </div>

              {descLanguage === 'ES' ? (
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4 text-xs text-gray-300 leading-relaxed font-medium">
                  <p className="text-white font-bold text-sm">🔥 TRANSFORMA TU BIOLOGÍA 🔥</p>
                  <p>Healthy + Brain es la plataforma de bio-optimización más avanzada que combina el seguimiento biométrico en tiempo real con la construcción de hábitos gamificados.</p>
                  <div className="space-y-1">
                    <p className="text-white font-bold">✓ LO QUE OBTIENES:</p>
                    <p>• Seguimiento de HRV, Pasos y Sueño en tiempo real.</p>
                    <p>• Escáner nutricional con IA (toma una foto, obtén análisis instantáneo).</p>
                    <p>• Tu Gemelo Digital - seguimiento visual del progreso celular.</p>
                    <p>• Sesiones de respiración y meditación con retroalimentación háptica.</p>
                    <p>• Gana tokens NTK por hábitos saludables (dopamina retrasada).</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4 text-xs text-gray-300 leading-relaxed font-medium">
                  <p className="text-white font-bold text-sm">🔥 TRANSFORM YOUR BIOLOGY 🔥</p>
                  <p>Healthy + Brain is the most advanced bio-optimization platform that combines real-time biometric tracking with gamified habit building.</p>
                  <div className="space-y-1">
                    <p className="text-white font-bold">✓ WHAT YOU GET:</p>
                    <p>• Real-time HRV, Steps & Sleep tracking.</p>
                    <p>• AI-powered nutrition scanner (take a photo, get instant macro analysis).</p>
                    <p>• Your Digital Twin - visual progress tracking with photo evolution.</p>
                    <p>• Guided breathing & meditation sessions with haptic feedback.</p>
                    <p>• Earn NTK tokens for healthy habits (delayed dopamine system).</p>
                  </div>
                </div>
              )}
            </div>

            {/* Screenshot guide specs */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guía de Capturas de Pantalla (Screenshots Guide)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-white text-[11px] block">1. Dashboard Principal (Lobby)</span>
                  <p className="text-gray-400">Muestra el Bio-Score (85), HRV (78 ms), Pasos (7,432) y Nivel 5 de XP.</p>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-white text-[11px] block">2. Escáner Nutricional de IA</span>
                  <p className="text-gray-400">Vista de cámara analizando un plato con el desglose molecular de macronutrientes.</p>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-white text-[11px] block">3. Coherencia & Respiración</span>
                  <p className="text-gray-400">Anillo de respiración guiada interactivo con micro-vibraciones hápticas.</p>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-white text-[11px] block">4. Gemelo Digital 3D</span>
                  <p className="text-gray-400">Línea de tiempo de comparación física visual (Antes vs Ahora).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: HTML templates and files explorer */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-glass-noir border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Archivo de Plantillas HTML del Ecosistema
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              A continuación se muestra el listado de plantillas del ecosistema <strong className="text-white">healthy-brain</strong>. Estas páginas representan artefactos de interfaces con diseño hápitco que se integran con la base de datos de Firebase.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HTML_TEMPLATES.map((tmpl) => (
                <div key={tmpl.filename} className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/20 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-indigo-400 font-mono">/{tmpl.filename}</span>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-0.5 rounded">TEMPLATE</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    {tmpl.purpose}
                  </p>
                  
                  {/* Key Metrics Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tmpl.keyMetrics.map((met) => (
                      <span key={met} className="text-[8px] font-black text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-md uppercase">
                        {met}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
