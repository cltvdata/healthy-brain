import React, { useState, useEffect } from 'react';
import { Key, Shield, Check, X, Sparkles, RefreshCw, Cpu, Database } from 'lucide-react';
import { safeStorage } from '../services/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = safeStorage.getItem('hb_gemini_api_key') || '';
      setApiKey(stored);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    safeStorage.setItem('hb_gemini_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    safeStorage.removeItem('hb_gemini_api_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,209,255,0.15)] space-y-5 text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neuro-blue/15 border border-neuro-blue/30 flex items-center justify-center text-neuro-blue">
              <Key className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-tight">
                Ajustes de API Key (Gemini 2.5)
              </h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Motor Dual: Nube IA o Resguardo Científico Local
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-neuro-blue font-bold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Seguridad de Credenciales & Soberanía</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Ingresa tu <strong className="text-white">GEMINI_API_KEY</strong> personal para habilitar las consultas en tiempo real con Gemini 2.5 Flash y Grounding de búsqueda de Google. Si no ingresas clave, la app activará automáticamente el <strong className="text-bio-green">Motor Local de Resguardo</strong> respaldado por los protocolos de NotebookLM.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
            Clave API de Google AI Studio (AIZA...):
          </label>
          <div className="relative">
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-gray-600 outline-none focus:border-neuro-blue transition-colors"
            />
            {apiKey && (
              <button 
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-red-400 uppercase tracking-wider bg-white/5 px-2 py-1 rounded-lg"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Mode Indicators */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className={`p-3 rounded-xl border transition-all ${apiKey ? 'bg-neuro-blue/10 border-neuro-blue/30 text-neuro-blue' : 'bg-white/5 border-white/5 text-gray-500'}`}>
            <span className="text-[9px] font-black uppercase tracking-wider block">Modo Actual:</span>
            <span className="text-xs font-black uppercase text-white mt-0.5 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {apiKey ? 'Gemini 2.5 Cloud IA' : 'Resguardo Local Sci-DB'}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-gray-300">
            <span className="text-[9px] font-black uppercase tracking-wider block">Cifrado de Clave:</span>
            <span className="text-xs font-black uppercase text-bio-green mt-0.5 block flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Local Storage 100% Privado
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/10 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-neuro-blue hover:bg-neuro-blue/90 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-neuro-blue/20 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                ¡Guardado!
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                Guardar Ajustes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
