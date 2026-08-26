import React from 'react';
import { ShieldCheck, LogOut, Check, X, AlertTriangle } from 'lucide-react';

interface ExitConfirmationBoxProps {
  isOpen?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export const ExitConfirmationBox: React.FC<ExitConfirmationBoxProps> = ({
  isOpen = true,
  onConfirm,
  onCancel,
  title = "Autorizo la salida",
  subtitle = "Confirma si deseas validar la finalización de tu sesión biométrica actual."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#051a10] border-2 border-emerald-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.35)] space-y-5 text-emerald-100">
        
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 border-b border-emerald-500/30 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-xs text-emerald-300 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Highlighted Confirmation Prompt */}
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block">
            Confirmación de Salida
          </span>
          <p className="text-xl font-black text-white tracking-wide">
            "Autorizo la salida"
          </p>
          <p className="text-[11px] text-emerald-200/80 font-medium">
            ¿Estás seguro de que deseas salir?
          </p>
        </div>

        {/* Action Buttons: Sí and No */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Button "Sí" */}
          <button
            onClick={onConfirm}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            id="btn-confirm-exit-yes"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Sí
          </button>

          {/* Button "No" */}
          <button
            onClick={onCancel}
            className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider rounded-2xl border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            id="btn-confirm-exit-no"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            No
          </button>
        </div>

      </div>
    </div>
  );
};
