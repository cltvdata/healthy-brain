import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Check, Calendar, ArrowRight, Eye } from 'lucide-react';

interface BioTwinTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateBioScore: (amount: number) => void;
}

export const BioTwinTab: React.FC<BioTwinTabProps> = ({ onAddTokens, onUpdateBioScore }) => {
  const [uploading, setUploading] = useState(false);
  const [streak, setStreak] = useState(14);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setHasNewPhoto(true);
      setStreak(s => s + 1);
      onUpdateBioScore(2);
      onAddTokens(100, "Gemelo Digital: Foto de Progreso Diario Cargada");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Gemelo Digital Intro */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-bio-green/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-bio-green/20 text-bio-green border border-bio-green/30 uppercase tracking-widest mb-3 inline-block">
          Evolución Cinética
        </span>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Gemelo <span className="text-bio-green">Digital</span></h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Mapea tu evolución física 3D. El motor de IA compara tus proporciones estructurales para verificar el crecimiento muscular y la pérdida de grasa visceral.
        </p>
      </div>

      {/* Photo comparison timeline */}
      <div className="glass-card p-6 border-white/5 bg-white/2">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Línea de Evolución</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-3 text-center border-white/5 relative overflow-hidden group">
            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Semana 1</p>
            <div className="w-full h-24 bg-white/5 rounded-xl mt-2 overflow-hidden flex items-center justify-center relative">
              <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 filter grayscale" alt="Week 1" />
            </div>
          </div>

          <div className="glass-card p-3 text-center border-white/5 relative overflow-hidden group">
            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Semana 4</p>
            <div className="w-full h-24 bg-white/5 rounded-xl mt-2 overflow-hidden flex items-center justify-center relative">
              <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Week 4" />
            </div>
          </div>

          <div className="glass-card p-3 text-center border-bio-green/30 relative overflow-hidden group">
            <p className="text-[8px] text-bio-green uppercase tracking-widest font-black flex items-center justify-center gap-1">
              <span className="w-1 h-1 rounded-full bg-bio-green animate-pulse"></span> Hoy
            </p>
            <div className="w-full h-24 bg-white/5 rounded-xl mt-2 overflow-hidden flex items-center justify-center relative border border-bio-green/20">
              {hasNewPhoto ? (
                <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover animate-fade-in" alt="Today" />
              ) : (
                <div className="text-center p-2">
                  <Camera className="w-6 h-6 text-gray-500 mx-auto mb-1 animate-pulse" />
                  <span className="text-[7px] text-gray-400 font-bold block uppercase">Subir</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Trigger button */}
        <button 
          onClick={handleSimulateUpload}
          disabled={uploading}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            uploading 
              ? 'bg-white/5 border border-white/5 text-gray-500 cursor-default' 
              : 'bg-bio-green text-dark shadow-lg shadow-bio-green/20 hover:scale-[1.01] active:scale-[0.98]'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
              Sincronizando con Bio-Cloud...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              {hasNewPhoto ? 'Sincronizar Otra Foto (+100 NTK)' : 'Cargar Foto de Hoy (+100 NTK)'}
            </>
          )}
        </button>
      </div>

      {/* Evolution comparison list */}
      <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Evolución Neuronal e Inductores</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
            <span className="text-xs text-gray-400 uppercase font-bold">Racha de Consistencia (Foto)</span>
            <span className="text-sm font-black text-bio-green">{streak} días</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
            <span className="text-xs text-gray-400 uppercase font-bold">Variación de Grasa Visceral</span>
            <span className="text-sm font-black text-bio-green">-1.2%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
            <span className="text-xs text-gray-400 uppercase font-bold">Verificación Estructural IA</span>
            <span className="text-xs font-black text-neuro-blue flex items-center gap-1 uppercase">
              <Eye className="w-3.5 h-3.5" /> Calibrado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
