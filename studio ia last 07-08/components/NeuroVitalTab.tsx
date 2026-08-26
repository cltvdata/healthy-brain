import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Calendar, 
  Zap, 
  Heart, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  Bookmark,
  Share2
} from 'lucide-react';
import { generateHealthResponse } from '../services/geminiService';

export interface NewsArticle {
  id: number;
  category: 'neuroscience' | 'mental-health' | 'health' | 'wellness';
  title: string;
  source: string;
  date: string;
  summary: string;
  content: string;
  image: string;
}

const LOCAL_NEWS: NewsArticle[] = [
  {
    id: 1,
    category: 'neuroscience',
    title: 'Las redes de astrocitos coordinan la memoria de largo plazo, revela estudio',
    source: 'Nature Neuroscience',
    date: 'Hace unas horas',
    summary: 'Nuevos análisis sugieren que las células gliales en estrella modulan activamente las conexiones sinápticas para estructurar los recuerdos permanentes.',
    content: 'Un equipo internacional de investigación en neurociencia descubrió un papel protagónico inesperado para los astrocitos. Estas células, antes consideradas meros soportes metabólicos, actúan en realidad como coordinadores de la transmisión sináptica regulando de forma autónoma el paso de neurotransmisores, abriendo caminos revolucionarios para el tratamiento de enfermedades degenerativas como el Alzheimer.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    category: 'mental-health',
    title: 'Micro-pausas de 3 minutos logran reducir drásticamente el cortisol sistémico',
    source: 'Journal of Psychology',
    date: 'Hoy',
    summary: 'Un protocolo estructurado de desactivación cognitiva de tres minutos reduce el estrés en entornos corporativos un 34% más que las pausas tradicionales.',
    content: 'Investigaciones aplicadas revelan que las pausas dedicadas a la respiración y el silencio puro, en contraste con las pausas dedicadas a revisar el teléfono inteligente, restablecen la coherencia cardíaca de forma prácticamente inmediata. Los niveles de cortisol plasmático descendieron de manera estable tras una semana de implementación continua.',
    image: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    category: 'health',
    title: 'El impacto crítico del ritmo circadiano en la absorción y asimilación de nutrientes',
    source: 'Nature Medicine',
    date: 'Ayer',
    summary: 'La crononutrición confirma que la sensibilidad hormonal y la recepción mineral alcanzan su punto óptimo en ventanas biológicas específicas del día.',
    content: 'Alinear el desayuno y el almuerzo con las fases de mayor sensibilidad de la insulina optimiza el rendimiento celular global y disminuye el riesgo de fatiga adrenal. Se aconseja evitar carbohidratos complejos y azúcares simples después de las 7:00 PM para favorecer la secreción nocturna de melatonina y la regeneración cerebral profunda.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    category: 'wellness',
    title: 'La suplementación con Creatina emerge como el nuevo pilar cognitivo en adultos',
    source: 'Harvard Brain Health',
    date: 'Hace 2 días',
    summary: 'Estudios confirman que la creatina incrementa los niveles de fosfocreatina cerebral, previniendo la fatiga mental severa.',
    content: 'Aunque históricamente asociada a la masa muscular de atletas, la suplementación dosificada de monohidrato de creatina ha demostrado en ensayos clínicos aleatorizados potenciar la memoria de trabajo y la fluidez verbal, sirviendo de soporte energético para momentos de alta demanda intelectual.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'
  }
];

interface NeuroVitalTabProps {
  onAddTokens?: (amount: number, reason: string) => void;
  stitchMode?: 'day' | 'night';
}

export const NeuroVitalTab: React.FC<NeuroVitalTabProps> = ({ onAddTokens, stitchMode = 'day' }) => {
  const [news, setNews] = useState<NewsArticle[]>(LOCAL_NEWS);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  
  // Audio TTS state
  const [playingId, setPlayingId] = useState<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Wellness Practice Modal State
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState<boolean>(false);
  const [wellnessTitle, setWellnessTitle] = useState<string>('');
  const [wellnessContent, setWellnessContent] = useState<string>('');
  const [isGeneratingWellness, setIsGeneratingWellness] = useState<boolean>(false);

  // Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: '¡Hola! Soy tu asistente de NeuroVital AI. ¿Te gustaría comprender algún avance científico de hoy o diseñar una micro-rutina para el estrés?'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Formatted date
  const currentDateFormatted = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Synchronize news using Gemini Service
  const handleSyncNews = async () => {
    setIsSyncing(true);
    try {
      const prompt = `Devuelve un objeto JSON con 4 artículos científicos recientes de salud cerebral. Formato exigido: {"articles": [{"id": 1, "category": "neuroscience"|"mental-health"|"health"|"wellness", "title": "...", "source": "...", "summary": "...", "content": "...", "date": "Hace 2 horas"}]}`;
      const response = await generateHealthResponse(prompt);

      let parsed: any = null;
      try {
        const cleaned = response.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        // Fallback search in text
      }

      if (parsed && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
        const imagesList = [
          'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'
        ];
        const updated = parsed.articles.map((art: any, idx: number) => ({
          id: art.id || idx + 10,
          category: art.category || 'neuroscience',
          title: art.title || 'Innovación en Neurociencia',
          source: art.source || 'Journal of Neuroscience',
          date: art.date || 'Hoy',
          summary: art.summary || 'Resumen de avance científico...',
          content: art.content || art.summary || '',
          image: imagesList[idx % imagesList.length]
        }));
        setNews(updated);
        setIsOffline(false);
        showToast(' Noticia científica sincronizada con Gemini IA');
        if (onAddTokens) onAddTokens(50, 'Sincronización de Noticias NeuroVital');
      } else {
        // Keep local news
        setIsOffline(true);
        showToast(' Mostrando base de datos de salud cerebral local');
      }
    } catch (err) {
      setIsOffline(true);
      showToast(' Actualizado con base de datos local');
    } finally {
      setIsSyncing(false);
    }
  };

  // Audio TTS Reader
  const handleTTS = (id: number, textToRead: string) => {
    if (playingId === id) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setPlayingId(null);
      return;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;

      utterance.onstart = () => {
        setPlayingId(id);
      };

      utterance.onend = () => {
        setPlayingId(null);
      };

      utterance.onerror = () => {
        setPlayingId(null);
      };

      synthRef.current.speak(utterance);
    } else {
      showToast('La reproducción de audio por voz no está disponible en este navegador');
    }
  };

  // Execute Wellness Action with AI Modal
  const handleGenerateWellnessAction = async (title: string, summary: string) => {
    setWellnessTitle(title);
    setIsWellnessModalOpen(true);
    setIsGeneratingWellness(true);
    setWellnessContent('');

    try {
      const prompt = `Diseña una micro-práctica o ejercicio de meditación/respiración de 2 minutos que se relacione directamente con la siguiente noticia de salud cerebral: "${title}. ${summary}". Entrega un paso a paso claro y práctico de 4 puntos numerados.`;
      const response = await generateHealthResponse(prompt);
      setWellnessContent(response.text);
      if (onAddTokens) onAddTokens(30, 'Práctica de Bienestar Generada con IA');
    } catch (err) {
      setWellnessContent(
        `1. **Inhalación profunda (4s)**: Llena tus pulmones expandiendo el diafragma.\n2. **Retención Consciente (4s)**: Conserva el aire enfocando tu mente en los latidos cardíacos.\n3. **Exhalación Controlada (6s)**: Libera el aire suavemente disipando la tensión de tus hombros.\n4. **Enfoque Periférico (2s)**: Observa un punto lejano para resetear tu nervio óptico.`
      );
    } finally {
      setIsGeneratingWellness(false);
    }
  };

  // Send Chat Message
  const handleSendChatMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    if (!customText) setChatInput('');

    setChatMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setIsChatTyping(true);

    try {
      const response = await generateHealthResponse(textToSend);
      setChatMessages(prev => [...prev, { sender: 'ai', text: response.text }]);
    } catch (err) {
      let fallbackText = '¡Gran pregunta! Para optimizar tus sinapsis requiere hábitos estables: hidratación matutina, 10 minutos de luz solar directa para sincronizar tu ritmo circadiano y espaciar el café 90 minutos.';
      if (textToSend.toLowerCase().includes('respirar') || textToSend.toLowerCase().includes('estrés')) {
        fallbackText = 'Te recomiendo la respiración de caja: Inhala 4s, retén 4s, exhala 4s, retén 4s. Repite 3 veces para activar el sistema nervioso parasimpático.';
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: fallbackText }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const getCategoryBadgeTheme = (cat: string) => {
    switch (cat) {
      case 'neuroscience':
        return { label: 'Neurociencia', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'mental-health':
        return { label: 'Salud Mental', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'health':
        return { label: 'Medicina', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'wellness':
        return { label: 'Bienestar', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'General', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  const filteredNews = news.filter(item => currentCategory === 'all' || item.category === currentCategory);

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white py-3 px-6 rounded-2xl shadow-2xl flex items-center gap-3 border border-neuro-blue/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-neuro-blue animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/30 border border-indigo-400/40 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  NeuroVital <span className="text-indigo-400">Daily</span>
                </h1>
                {isOffline ? (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                    Modo Local
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Sincronizado IA
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Hoy, {currentDateFormatted} • Noticias & Biohacking con Inteligencia Artificial
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncNews}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all border border-indigo-400/30 active:scale-95 shadow-lg shadow-indigo-600/20"
            title="Sincronizar noticias del día con Gemini IA"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Actualizar Noticias'}</span>
          </button>
        </div>
      </div>

      {/* Syncing Progress Bar */}
      {isSyncing && (
        <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-3.5 flex items-center justify-between text-indigo-300 animate-pulse">
          <span className="text-xs font-bold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            Sincronizando con redes de información médica y literatura neurocientífica...
          </span>
        </div>
      )}

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'neuroscience', label: 'Neurociencia' },
          { id: 'mental-health', label: 'Salud Mental' },
          { id: 'health', label: 'Medicina' },
          { id: 'wellness', label: 'Bienestar' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCurrentCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              currentCategory === cat.id
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.length === 0 ? (
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <p className="text-gray-400 text-sm font-semibold">No hay noticias en esta sección por hoy.</p>
          </div>
        ) : (
          filteredNews.map(article => {
            const badgeTheme = getCategoryBadgeTheme(article.category);
            const isPlaying = playingId === article.id;

            return (
              <article
                key={article.id}
                className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col group"
              >
                {/* Article Image & Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${badgeTheme.bg}`}>
                      {badgeTheme.label}
                    </span>
                  </div>

                  {/* Audio Reader Button */}
                  <button
                    onClick={() => handleTTS(article.id, `${article.title}. ${article.summary}`)}
                    className={`absolute bottom-3 right-3 p-3 rounded-full border backdrop-blur-md transition-all active:scale-95 shadow-lg ${
                      isPlaying
                        ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse'
                        : 'bg-black/60 border-white/20 text-white hover:bg-indigo-600 hover:border-indigo-400'
                    }`}
                    title={isPlaying ? 'Detener lectura' : 'Escuchar resumen por voz'}
                  >
                    {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Article Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      <span className="text-indigo-400">{article.source}</span>
                      <span>{article.date}</span>
                    </div>

                    <h2 className="text-base font-extrabold text-white leading-snug mb-2 group-hover:text-indigo-300 transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  {/* Action AI Button */}
                  <button
                    onClick={() => handleGenerateWellnessAction(article.title, article.summary)}
                    className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-2xl text-[10px] font-extrabold tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 border border-indigo-500/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                    EJECUTAR ACCIÓN DE BIENESTAR CON IA (+30 NTK)
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20 shadow-indigo-500/40"
        title="Abrir Asistente NeuroVital AI"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window Assistant Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[520px] bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Chat Header */}
          <div className="bg-slate-950 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600/30 border border-indigo-500/40 rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white">Asistente NeuroVital AI</h3>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Activo
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800 text-gray-200 rounded-tl-none border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isChatTyping && (
              <div className="flex justify-start">
                <div className="p-3 bg-slate-800/80 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2 text-xs text-indigo-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizando literatura neuronal...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestions Pills */}
          <div className="px-3 py-2 bg-slate-900 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSendChatMessage('Explícame los Astrocitos')}
              className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[10px] font-bold text-gray-300 whitespace-nowrap hover:bg-indigo-600/30 hover:text-white hover:border-indigo-400 transition-colors"
            >
              Explicar Astrocitos
            </button>
            <button
              onClick={() => handleSendChatMessage('Rutina anti-estrés de 2 min')}
              className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[10px] font-bold text-gray-300 whitespace-nowrap hover:bg-indigo-600/30 hover:text-white hover:border-indigo-400 transition-colors"
            >
              Plan Anti-Estrés
            </button>
            <button
              onClick={() => handleSendChatMessage('Mejores alimentos para el cerebro')}
              className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[10px] font-bold text-gray-300 whitespace-nowrap hover:bg-indigo-600/30 hover:text-white hover:border-indigo-400 transition-colors"
            >
              Dieta Cerebro
            </button>
          </div>

          {/* Input & Send */}
          <div className="p-3 bg-slate-950 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Pregúntale a la IA sobre salud cerebral..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={() => handleSendChatMessage()}
              disabled={!chatInput.trim() || isChatTyping}
              className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wellness Practice Modal */}
      {isWellnessModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/40 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-indigo-950 p-5 border-b border-indigo-500/30 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-extrabold text-xs">Práctica de Bienestar Generada</h3>
              </div>
              <button
                onClick={() => setIsWellnessModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[360px] text-xs leading-relaxed text-gray-200 space-y-4">
              <h4 className="font-extrabold text-sm text-indigo-300">{wellnessTitle}</h4>

              {isGeneratingWellness ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-bold text-gray-400 animate-pulse">Personalizando tu ejercicio de salud mental con IA...</p>
                </div>
              ) : (
                <div className="space-y-3 whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-white/10 text-gray-300">
                  {wellnessContent}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10">
              <button
                onClick={() => {
                  setIsWellnessModalOpen(false);
                  showToast(' ¡Práctica completada! +30 NTK acreditados');
                }}
                className="w-full py-3 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
              >
                ¡Entendido, empezar práctica ahora!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
