import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Check, Calendar, ArrowRight, Eye } from 'lucide-react';
import { PhotoDisclaimerBanner } from './PhotoDisclaimerBanner';

interface BioTwinTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateBioScore: (amount: number) => void;
}

export const BioTwinTab: React.FC<BioTwinTabProps> = ({ onAddTokens, onUpdateBioScore }) => {
  const [uploading, setUploading] = useState(false);
  const [streak, setStreak] = useState(14);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setUploading(false);
        setPhotoUrl(url);
        setHasNewPhoto(true);
        setStreak(s => s + 1);
        onUpdateBioScore(3);
        onAddTokens(100, "Gemelo Digital: Foto de Progreso Real Cargada");
      }, 2500);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setPhotoUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop");
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
                <img src={photoUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop"} className="w-full h-full object-cover animate-fade-in" alt="Today" />
              ) : (
                <div onClick={triggerFileInput} className="text-center p-2 cursor-pointer hover:bg-white/5 w-full h-full flex flex-col justify-center items-center">
                  <Camera className="w-6 h-6 text-gray-500 mx-auto mb-1 animate-pulse" />
                  <span className="text-[7px] text-gray-400 font-bold block uppercase">Subir / Capturar</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
          id="bio-twin-camera-input"
        />

        {/* Upload Trigger button */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button 
            onClick={triggerFileInput}
            disabled={uploading}
            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              uploading 
                ? 'bg-white/5 border border-white/5 text-gray-500 cursor-default' 
                : 'bg-bio-green text-dark shadow-lg shadow-bio-green/20 hover:scale-[1.01] active:scale-[0.98]'
            }`}
            id="bio-twin-take-photo-btn"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                Sincronizando con Bio-Cloud...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                {hasNewPhoto ? 'Tomar Otra Foto Real' : 'Tomar Foto Real con Cámara (+100 NTK)'}
              </>
            )}
          </button>
          
          <button 
            onClick={handleSimulateUpload}
            disabled={uploading}
            className="py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/10 hover:bg-white/5 text-gray-400 transition-all"
            id="bio-twin-simulate-btn"
          >
            Simular Demo
          </button>
        </div>

        {/* Photo Liability Disclaimer */}
        <div className="mt-4">
          <PhotoDisclaimerBanner compact={false} lang="ES" />
        </div>
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
