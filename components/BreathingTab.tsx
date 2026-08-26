import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

interface BreathingTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateBioScore: (amount: number) => void;
}

export const BreathingTab: React.FC<BreathingTabProps> = ({ onAddTokens, onUpdateBioScore }) => {
  const [isPlaying, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'Inhala' | 'Retén' | 'Exhala' | 'Espera'>('Inhala');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [soundEnabled, setSoundActive] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Solfeggio audio simulation frequency
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startSound = () => {
    try {
      if (!soundEnabled) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Solfeggio Frequency for mental clarity (528 Hz)
      osc.frequency.value = 528;
      osc.type = 'sine';
      
      // Calming low volume
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Audio Context init failed:", e);
    }
  };

  const stopSound = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch (e) {}
  };

  const toggleBreathing = () => {
    if (isPlaying) {
      setIsRunning(false);
      stopSound();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsRunning(true);
      setPhase('Inhala');
      setPhaseSeconds(4);
      startSound();
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setPhaseSeconds(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhase(curr => {
            switch (curr) {
              case 'Inhala':
                // Move to Retén (Hold)
                setPhaseSeconds(4); // Huberman 4s hold
                // Simulate soft haptic beep
                triggerMockHaptic();
                return 'Retén';
              case 'Retén':
                // Move to Exhala
                setPhaseSeconds(4); // 4s exhale
                triggerMockHaptic();
                return 'Exhala';
              case 'Exhala':
                // Move to Espera (Hold empty)
                setPhaseSeconds(4); // 4s hold empty
                triggerMockHaptic();
                return 'Espera';
              case 'Espera':
                // Completed one complete cycle!
                setCompletedCycles(c => {
                  const updated = c + 1;
                  if (updated % 4 === 0) {
                    onAddTokens(40, "Coherencia Cardíaca: 4 Ciclos Completados");
                    onUpdateBioScore(3);
                  }
                  return updated;
                });
                setPhaseSeconds(4);
                triggerMockHaptic();
                return 'Inhala';
              default:
                return 'Inhala';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const triggerMockHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // double pulse
    }
  };

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  const handleReset = () => {
    setIsRunning(false);
    stopSound();
    setPhase('Inhala');
    setPhaseSeconds(4);
    setCompletedCycles(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const getBreatheStyles = () => {
    if (!isPlaying) return 'scale-100 bg-neuro-blue/10 border-neuro-blue/30';
    if (phase === 'Inhala') return 'scale-125 bg-neuro-blue/20 border-neuro-blue/50 duration-[4000ms]';
    if (phase === 'Exhala') return 'scale-90 bg-bio-orange/10 border-bio-orange/30 duration-[4s]';
    if (phase === 'Retén') return 'scale-125 bg-bio-orange/20 border-bio-orange/50 duration-[4s]';
    return 'scale-90 bg-white/5 border-white/10 duration-[4s]'; // Espera
  };

  const getPhaseInst = () => {
    switch (phase) {
      case 'Inhala': return 'Llena tus pulmones expandiendo el diafragma';
      case 'Retén': return 'Mantén el oxígeno, relaja los hombros';
      case 'Exhala': return 'Suelta el aire lentamente por la boca';
      case 'Espera': return 'Espera en vacío absoluto';
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive breathing card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-bio-orange/20 text-bio-orange border border-bio-orange/30">
          COHERENCIA CARDÍACA V4
        </span>
        <h2 className="text-2xl font-black text-white mt-2 uppercase tracking-tight">
          Silenciador Neural
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          Sincroniza tus latidos para disminuir el cortisol y activar tu sistema nervioso parasimpático.
        </p>

        {/* Breathing Circle Container */}
        <div className="my-12 h-64 flex items-center justify-center relative w-full">
          <div className="absolute inset-0 bg-radial-gradient from-neuro-blue/5 to-transparent blur-2xl"></div>
          
          {/* Main Breathing Circle */}
          <div className={`w-40 h-40 rounded-full border-2 flex flex-col items-center justify-center transition-all ease-in-out select-none shadow-2xl relative z-10 ${getBreatheStyles()}`}>
            <div className="absolute inset-2 border border-white/5 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              {isPlaying ? phase : 'Listo'}
            </span>
            <span className="text-4xl font-black text-white tracking-tight mt-1 font-mono">
              {isPlaying ? `${phaseSeconds}s` : '--'}
            </span>
            <span className="text-[9px] font-bold text-gray-500 mt-2 uppercase">
              {completedCycles} Ciclos
            </span>
          </div>

          {/* Sutil pulse ring */}
          {isPlaying && (
            <div className="absolute w-44 h-44 rounded-full border border-neuro-blue/40 animate-breathe pointer-events-none"></div>
          )}
        </div>

        {/* Status / Instructions */}
        <div className="h-12 flex flex-col items-center justify-center">
          <p className="text-sm font-bold text-white transition-colors duration-500">
            {isPlaying ? getPhaseInst() : 'Haz clic en el botón de abajo para iniciar'}
          </p>
          {isPlaying && (
            <p className="text-[10px] font-black text-bio-orange uppercase tracking-widest mt-2 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> HAPTICS PULSE ACTIVE
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-4 w-full max-w-xs">
          <button 
            onClick={toggleBreathing}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isPlaying 
                ? 'bg-white text-dark shadow-xl active:scale-[0.98]' 
                : 'bg-bio-orange text-dark shadow-lg shadow-bio-orange/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pausar' : 'Iniciar'}
          </button>

          <button 
            onClick={handleReset}
            className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-2xl transition-all"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setSoundActive(!soundEnabled)}
            className={`p-4 rounded-2xl border transition-all ${soundEnabled ? 'bg-neuro-blue/10 border-neuro-blue/30 text-neuro-blue' : 'bg-white/5 border-white/10 text-gray-500'}`}
            title="Toggle Solfeggio Tone"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
