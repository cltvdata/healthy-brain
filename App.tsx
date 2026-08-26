import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Bot, 
  Camera, 
  Compass, 
  Trophy, 
  ShoppingBag, 
  MessageSquare,
  Sparkles, 
  Send,
  User,
  Heart,
  Droplet,
  Zap,
  Activity,
  BookOpen,
  Moon,
  Sun,
  Smartphone,
  RefreshCw,
  Clock
} from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { generateHealthResponse } from './services/geminiService';
import { Message, BioMetrics } from './types';
import { v4 as uuidv4 } from 'uuid';

// Tab sub-components
import { LobbyTab } from './components/LobbyTab';
import { NutritionTab } from './components/NutritionTab';
import { BreathingTab } from './components/BreathingTab';
import { BioTwinTab } from './components/BioTwinTab';
import { CommunityTab } from './components/CommunityTab';
import { ShopTab } from './components/ShopTab';
import { NotebookLMTab } from './components/NotebookLMTab';
import { LaunchHubTab } from './components/LaunchHubTab';
import { RegistrationModal } from './components/RegistrationModal';
import { AuthModal } from './components/AuthModal';
import { auth, logoutUser, onAuthChange, getUserData, saveUserData } from './services/firebase';

const INITIAL_SUGGESTIONS = [
  "Como conectar MyFitnessPal con Google Health Connect?",
  "How to sync Samsung Health with Google Fit?",
  "Mis pasos no se sincronizan en Health Connect",
];

export default function App() {
  // Tabs: 'lobby' | 'coach' | 'nutrition' | 'breathing' | 'twin' | 'community' | 'shop' | 'notebook' | 'launch'
  const [activeTab, setActiveTab] = useState<'lobby' | 'coach' | 'nutrition' | 'breathing' | 'twin' | 'community' | 'shop' | 'notebook' | 'launch'>('lobby');
  
  // Google Stitch Dynamic Adaptive mode
  const [stitchMode, setStitchMode] = useState<'day' | 'night'>('day');
  
  // Bio-Economy State (NTK tokens)
  const [tokens, setTokens] = useState<number>(1250);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [latestNotification, setLatestNotification] = useState<string | null>(null);

  // Biometrics State
  const [metrics, setMetrics] = useState<BioMetrics>({
    bioScore: 85,
    hrv: 60,
    steps: 5432,
    sleepHours: 7.5,
    glucose: 110,
    glucoseStable: false,
    sunSync: false,
    hydrationMl: 500
  });

  // Registration and APK Download states from LocalStorage
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('hb_user_email') || '');
  const [userLang, setUserLang] = useState<'ES' | 'EN' | 'PT'>(() => (localStorage.getItem('hb_user_lang') as 'ES' | 'EN' | 'PT') || 'ES');
  const [isPaymentApproved, setIsPaymentApproved] = useState<boolean>(() => localStorage.getItem('hb_payment_approved') === 'true');
  
  // Trial Days Counter
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(() => {
    const saved = localStorage.getItem('hb_trial_days');
    return saved ? parseInt(saved, 10) : 7;
  });

  // Firebase Authentication & Sync states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load data from Firestore
        try {
          const dbData = await getUserData(user.uid);
          if (dbData) {
            if (dbData.tokens !== undefined) setTokens(dbData.tokens);
            if (dbData.isPremium !== undefined) setIsPremium(dbData.isPremium);
            if (dbData.metrics !== undefined) setMetrics(dbData.metrics);
            if (dbData.isPaymentApproved !== undefined) setIsPaymentApproved(dbData.isPaymentApproved);
            if (dbData.userLang !== undefined) setUserLang(dbData.userLang);
            if (dbData.email !== undefined) setUserEmail(dbData.email);
          } else {
            // First time login, populate default state to Firestore
            await saveUserData(user.uid, {
              email: user.email || '',
              tokens,
              isPremium,
              metrics,
              isPaymentApproved,
              userLang,
            });
          }
        } catch (err) {
          console.error("Failed to load user data from Firestore on login:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save state updates to Firestore if logged in (debounced to avoid spamming Firestore on frequent changes)
  useEffect(() => {
    if (currentUser) {
      const dataToSave = {
        tokens,
        isPremium,
        metrics,
        isPaymentApproved,
        userLang,
        email: userEmail || currentUser.email || '',
      };
      
      const timer = setTimeout(() => {
        saveUserData(currentUser.uid, dataToSave).catch(err => {
          console.error("Failed to sync state to Firestore:", err);
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [tokens, isPremium, metrics, isPaymentApproved, userLang, userEmail, currentUser]);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "¡Hola! Soy tu asistente de sincronización de salud e IA Coach. Puedo ayudarte a optimizar tus hábitos, interpretar tu Bio-Score y sincronizar aplicaciones como MyFitnessPal, Google Fit y Health Connect.\n\nHello! I'm your health sync assistant & AI Coach. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'coach') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Add a temporary loading placeholder
    const loadingId = uuidv4();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }]);

    try {
      const { text: responseText, groundingMetadata } = await generateHealthResponse(text);
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, content: responseText, isLoading: false, groundingMetadata } 
          : msg
      ));
      
      // Award some tokens for chatting with the AI Coach!
      handleAddTokens(10, "Sesión de Coaching IA (Consulta Interactiva)");
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, content: "Lo siento, hubo un error al conectar con el servicio. Por favor intenta de nuevo.", isLoading: false } 
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleAddTokens = (amount: number, reason: string) => {
    setTokens(prev => prev + amount);
    setLatestNotification(`+${amount} NTK: ${reason}`);
    
    // Clear notification after 4 seconds
    setTimeout(() => {
      setLatestNotification(prev => prev?.includes(reason) ? null : prev);
    }, 4000);
  };

  const handleUpdateMetrics = (updated: Partial<BioMetrics>) => {
    setMetrics(prev => ({ ...prev, ...updated }));
  };

  return (
    <div className={`flex flex-col min-h-screen ${stitchMode === 'night' ? 'bg-[#030305]' : 'bg-[#08090a]'} text-white relative transition-colors duration-700`}>
      
      {/* Toast Notification for Bio-Economy Recompensas */}
      {latestNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#121212]/95 border border-bio-green/30 text-bio-green px-6 py-3 rounded-full text-xs font-black shadow-[0_0_30px_rgba(19,236,91,0.25)] flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-bio-green animate-ping"></span>
          {latestNotification.toUpperCase()}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#121212]/80 border-b border-white/5 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl text-dark shadow-2xl animate-pulse ${stitchMode === 'night' ? 'bg-gradient-to-br from-indigo-500 to-neuro-blue' : 'bg-gradient-to-br from-bio-orange to-neuro-blue'}`}>
              <Activity className="w-5 h-5 text-black stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-lg tracking-tight">HEALTHY + BRAIN</h1>
                {/* Trial Counter Badge */}
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bio-orange/15 border border-bio-orange/30 text-bio-orange text-[9px] font-black uppercase tracking-wider animate-pulse">
                  <Clock className="w-3 h-3 text-bio-orange" />
                  <span>Prueba: {trialDaysLeft} Días</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                Soberanía Biológica <Sparkles className="w-3 h-3 text-bio-orange filled" />
              </p>
            </div>
          </div>

          {/* Quick theme toggler for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => {
                const next = stitchMode === 'day' ? 'night' : 'day';
                setStitchMode(next);
                handleAddTokens(30, `Stitch: Mutación de Interfaz a Ciclo ${next === 'day' ? 'Diurno' : 'Nocturno'}`);
              }}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300"
              title="Toggle Stitch Circadian Mode"
            >
              {stitchMode === 'day' ? <Sun className="w-4 h-4 text-bio-orange" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* User profile & Coin count */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2">
            {/* Desktop circadian switcher */}
            <button 
              onClick={() => {
                const next = stitchMode === 'day' ? 'night' : 'day';
                setStitchMode(next);
                handleAddTokens(30, `Stitch: Mutación de Interfaz a Ciclo ${next === 'day' ? 'Diurno' : 'Nocturno'}`);
              }}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all animate-fade-in"
              title="Toggle Stitch Circadian Mode"
            >
              {stitchMode === 'day' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-bio-orange" />
                  <span className="text-[10px] uppercase font-black">Ciclo: Día</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] uppercase font-black text-indigo-300">Ciclo: Noche</span>
                </>
              )}
            </button>

            {/* NotebookLM Hub Button */}
            <button
              onClick={() => setActiveTab('notebook')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                activeTab === 'notebook'
                  ? 'bg-neuro-blue/15 border-neuro-blue text-neuro-blue shadow-[0_0_15px_rgba(0,209,255,0.15)]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-neuro-blue" />
              <span className="text-[10px] uppercase font-black">NotebookLM Core</span>
            </button>

            {/* Launch Hub Button */}
            <button
              onClick={() => setActiveTab('launch')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                activeTab === 'launch'
                  ? 'bg-bio-orange/15 border-bio-orange text-bio-orange shadow-[0_0_15px_rgba(255,138,0,0.15)]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-bio-orange" />
              <span className="text-[10px] uppercase font-black">Launch Hub 🚀</span>
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-bio-green animate-pulse"></div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
                  {userLang === 'ES' ? 'Sincronizado' : userLang === 'PT' ? 'Sincronizado' : 'Synced'}
                </span>
                <span className="text-[10px] font-bold text-white max-w-[120px] truncate" title={currentUser.email || ''}>
                  {currentUser.email || 'Usuario'}
                </span>
              </div>
              <button
                onClick={async () => {
                  const confirmMsg = userLang === 'ES' 
                    ? '¿Estás seguro de que quieres cerrar sesión?' 
                    : userLang === 'PT' 
                      ? 'Você tem certeza que deseja sair?' 
                      : 'Are you sure you want to sign out?';
                  if (confirm(confirmMsg)) {
                    await logoutUser();
                    setTokens(1250);
                    setIsPremium(false);
                    setIsPaymentApproved(false);
                  }
                }}
                className="ml-1 px-2 py-1 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors border border-white/5 hover:border-red-500/10"
              >
                {userLang === 'ES' ? 'Salir' : userLang === 'PT' ? 'Sair' : 'Exit'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neuro-blue/10 hover:bg-neuro-blue/20 text-neuro-blue hover:text-white border border-neuro-blue/25 hover:border-neuro-blue/40 rounded-xl text-xs font-black transition-all shadow-[0_0_15px_rgba(0,209,255,0.08)]"
            >
              <User className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[10px] uppercase font-black">
                {userLang === 'ES' ? 'Iniciar Sesión' : userLang === 'PT' ? 'Entrar' : 'Sign In'}
              </span>
            </button>
          )}

          {/* Global Language Selector */}
          <div className="flex items-center bg-black/40 border border-white/5 p-0.5 rounded-xl">
            <button
              onClick={() => {
                setUserLang('ES');
                localStorage.setItem('hb_user_lang', 'ES');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${userLang === 'ES' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              title="Español"
            >
              ES 🇪🇸
            </button>
            <button
              onClick={() => {
                setUserLang('EN');
                localStorage.setItem('hb_user_lang', 'EN');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${userLang === 'EN' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              title="English"
            >
              EN 🇺🇸
            </button>
            <button
              onClick={() => {
                setUserLang('PT');
                localStorage.setItem('hb_user_lang', 'PT');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${userLang === 'PT' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              title="Português"
            >
              PT 🇵🇹
            </button>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Bio-ID Balance</span>
            <span className="text-sm font-black text-bio-orange tracking-tight">{tokens.toLocaleString()} NTK</span>
          </div>

          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-all ${
              isPremium 
                ? 'bg-bio-green/10 border-bio-green/30 text-bio-green shadow-[0_0_15px_rgba(19,236,91,0.15)]' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {isPremium ? 'PRO ACTIVADO' : 'OBTENER PRO'}
          </button>

          <button 
            onClick={() => setIsRegisterOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border transition-all ${
              isPaymentApproved 
                ? 'bg-bio-green/10 border-bio-green/30 text-bio-green shadow-[0_0_15px_rgba(19,236,91,0.15)]' 
                : 'bg-neuro-blue/10 border-neuro-blue/30 text-neuro-blue hover:bg-neuro-blue/20 shadow-[0_0_15px_rgba(0,209,255,0.1)] animate-pulse'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {isPaymentApproved ? 'BIO-ID ACTIVO 📱' : 'DESCARGAR APK 📱'}
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-28">
        
        {/* Render Active Tab */}
        {activeTab === 'lobby' && (
          <LobbyTab 
            metrics={metrics} 
            onUpdateMetrics={handleUpdateMetrics} 
            onAddTokens={handleAddTokens}
            tokens={tokens}
            stitchMode={stitchMode}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab 
            onAddTokens={handleAddTokens}
            onUpdateGlucose={(val, stable) => handleUpdateMetrics({ glucose: val, glucoseStable: stable })}
          />
        )}

        {activeTab === 'breathing' && (
          <BreathingTab 
            onAddTokens={handleAddTokens}
            onUpdateBioScore={(amt) => handleUpdateMetrics({ bioScore: Math.min(100, metrics.bioScore + amt) })}
          />
        )}

        {activeTab === 'twin' && (
          <BioTwinTab 
            onAddTokens={handleAddTokens}
            onUpdateBioScore={(amt) => handleUpdateMetrics({ bioScore: Math.min(100, metrics.bioScore + amt) })}
          />
        )}

        {activeTab === 'community' && (
          <CommunityTab 
            tokens={tokens}
            onAddTokens={handleAddTokens}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab 
            tokens={tokens}
            onAddTokens={handleAddTokens}
            onPurchasePremium={() => setIsPremium(true)}
            isPremium={isPremium}
          />
        )}

        {activeTab === 'coach' && (
          <div className="flex flex-col h-[calc(100vh-14rem)] bg-glass-noir border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-bio-orange/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Coach Tab Header */}
            <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-sm font-black uppercase text-white">Bio-Coach Inteligencia Artificial</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Gemini 2.5 + Grounding de Búsqueda Activo</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-bio-green animate-pulse"></span>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />

              {/* Empty state suggestions */}
              {messages.length === 1 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-neuro-blue/30 hover:bg-white/10 transition-all group"
                    >
                      <p className="text-xs font-bold text-gray-300 group-hover:text-neuro-blue transition-colors">
                        {suggestion}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-black/40 border-t border-white/5">
              <div className="relative flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10 focus-within:border-neuro-blue/50 focus-within:ring-2 focus-within:ring-neuro-blue/15 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Pregúntale a tu Bio-Coach..."
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 px-4 text-sm text-white placeholder-gray-500"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className={`p-3 rounded-xl flex-shrink-0 transition-all ${
                    input.trim() && !isTyping
                      ? 'bg-neuro-blue text-dark shadow-lg shadow-neuro-blue/20 hover:scale-105 active:scale-95'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 text-black stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notebook' && (
          <NotebookLMTab 
            onAddTokens={handleAddTokens}
            onUpdateMetrics={handleUpdateMetrics}
            tokens={tokens}
            stitchMode={stitchMode}
          />
        )}

        {activeTab === 'launch' && (
          <LaunchHubTab 
            onAddTokens={handleAddTokens}
            stitchMode={stitchMode}
          />
        )}
      </main>

      {/* Floating Premium Navigation Bar (Mobile App UX) */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-[#121212]/95 border border-white/10 rounded-3xl py-2.5 px-3 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-40 flex items-center justify-between overflow-x-auto scrollbar-hide gap-1 sm:gap-2">
        {/* Lobby */}
        <button 
          onClick={() => setActiveTab('lobby')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'lobby' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <Home className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Lobby</span>
        </button>

        {/* AI Coach */}
        <button 
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'coach' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <Bot className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Coach</span>
        </button>

        {/* AI Lens */}
        <button 
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'nutrition' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Lens IA</span>
        </button>

        {/* Breathing */}
        <button 
          onClick={() => setActiveTab('breathing')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'breathing' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <Compass className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Prana</span>
        </button>

        {/* Digital Twin */}
        <button 
          onClick={() => setActiveTab('twin')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'twin' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <User className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Gemelo</span>
        </button>

        {/* Community */}
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'community' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <Trophy className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Squads</span>
        </button>

        {/* NotebookLM */}
        <button 
          onClick={() => setActiveTab('notebook')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'notebook' ? 'text-neuro-blue scale-105 bg-neuro-blue/10' : 'text-gray-400 hover:text-white'}`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Notebook</span>
        </button>

        {/* Launch Hub */}
        <button 
          onClick={() => setActiveTab('launch')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'launch' ? 'text-bio-orange scale-105 bg-bio-orange/10' : 'text-gray-400 hover:text-white'}`}
        >
          <Smartphone className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Launch 🚀</span>
        </button>

        {/* Shop */}
        <button 
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl shrink-0 transition-all ${activeTab === 'shop' ? 'text-bio-green scale-105 bg-bio-green/10' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Tienda</span>
        </button>
      </nav>

      {/* Registration & Download Modal */}
      <RegistrationModal 
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(email, lang, approved) => {
          localStorage.setItem('hb_user_email', email);
          localStorage.setItem('hb_user_lang', lang);
          localStorage.setItem('hb_payment_approved', 'true');
          setUserEmail(email);
          setUserLang(lang);
          setIsPaymentApproved(approved);
          handleAddTokens(200, "Sincronización de Bio-ID & Activación de Licencia Móvil (APK)");
        }}
        initialLang={userLang}
        initialEmail={userEmail}
        initialApproved={isPaymentApproved}
      />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(email) => {
          setUserEmail(email);
          handleAddTokens(100, "Sincronización de Wearables y Autenticación de Cuenta");
        }}
      />

    </div>
  );
}
