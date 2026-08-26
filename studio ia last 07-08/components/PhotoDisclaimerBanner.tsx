import React, { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface PhotoDisclaimerBannerProps {
  compact?: boolean;
  className?: string;
  lang?: 'ES' | 'EN' | 'PT';
}

export const PhotoDisclaimerBanner: React.FC<PhotoDisclaimerBannerProps> = ({ 
  compact = false, 
  className = '',
  lang = 'ES'
}) => {
  const [expanded, setExpanded] = useState(false);

  const content = {
    ES: {
      title: "Descargo de Responsabilidad: Fotos y Contenido del Usuario",
      short: "El usuario acepta responsabilidad exclusiva sobre las fotos subidas declarando uso personal. La empresa se deslinda de toda responsabilidad.",
      userDeclarationTitle: "1. Declaración y Responsabilidad del Usuario",
      userDeclarationBody: "El usuario declara, garantiza y acepta la responsabilidad total y exclusiva sobre todo el contenido, imágenes y fotografías que suba, cargue o capture en esta plataforma, reconociendo que dicho material es única y estrictamente para su uso personal y privado.",
      companyDisclaimerTitle: "2. Exención de Responsabilidad de la Empresa",
      companyDisclaimerBody: "Como empresa y desarrolladores, nos deslindamos expresamente de toda responsabilidad por filtros, modificaciones, pérdidas de datos, problemas de transmisión, almacenamiento, envío o cualquier inconveniente derivado de las fotos subidas por el usuario. La empresa NO es responsable bajo ninguna circunstancia de ninguna de las fotos o contenidos alojados o compartidos por los usuarios en la plataforma."
    },
    EN: {
      title: "Disclaimer: User Photos & Uploaded Content",
      short: "User accepts sole responsibility for uploaded photos declaring personal use. The company disclaims all liability for uploaded photos.",
      userDeclarationTitle: "1. User Declaration & Responsibility",
      userDeclarationBody: "The user declares, guarantees, and accepts full and sole responsibility for all content, images, and photos uploaded, captured, or stored on this platform, acknowledging that all such media is strictly for personal and private use.",
      companyDisclaimerTitle: "2. Company Non-Liability Disclaimer",
      companyDisclaimerBody: "As a company and developers, we disclaim all liability and responsibility for photo filtering, data loss, storage failures, transmission/shipment issues, or any other issues related to photos uploaded by the user. The company is NOT responsible under any circumstances for any photos or content uploaded or hosted by users on the platform."
    },
    PT: {
      title: "Isenção de Responsabilidade: Fotos e Conteúdo do Usuário",
      short: "O usuário aceita responsabilidade exclusiva pelas fotos enviadas, declarando uso pessoal. A empresa isenta-se de toda responsabilidade.",
      userDeclarationTitle: "1. Declaração e Responsabilidade do Usuário",
      userDeclarationBody: "O usuário declara, garante e aceita responsabilidade total e exclusiva por todo o conteúdo, imagens e fotos enviadas, capturadas ou armazenadas nesta plataforma, reconhecendo que tais mídias são estritamente para uso pessoal e privado.",
      companyDisclaimerTitle: "2. Isenção de Responsabilidade da Empresa",
      companyDisclaimerBody: "Como empresa e desenvolvedores, nos isentamos de qualquer responsabilidade por filtros, perda de dados, falhas de armazenamento, problemas de envio/transmissão ou qualquer inconveniente relacionado às fotos enviadas pelo usuário. A empresa NÃO é responsável por qualquer foto ou conteúdo enviado pelos usuários."
    }
  };

  const currentText = content[lang] || content['ES'];

  if (compact) {
    return (
      <div className={`p-3.5 bg-black/60 border border-bio-orange/30 rounded-2xl space-y-2 text-left ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-bio-orange font-black text-[10px] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 shrink-0 text-bio-orange" />
            <span>{currentText.title}</span>
          </div>
          <button 
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] font-bold text-gray-400 hover:text-white flex items-center gap-1 uppercase tracking-wider"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Ver Menos' : 'Detalles Legales'}
          </button>
        </div>

        <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
          {currentText.short}
        </p>

        {expanded && (
          <div className="pt-2 border-t border-white/10 space-y-2 text-[10px] text-gray-400 leading-relaxed animate-fade-in">
            <div className="space-y-0.5">
              <strong className="text-white font-black block">{currentText.userDeclarationTitle}</strong>
              <p>{currentText.userDeclarationBody}</p>
            </div>
            <div className="space-y-0.5">
              <strong className="text-bio-orange font-black block">{currentText.companyDisclaimerTitle}</strong>
              <p>{currentText.companyDisclaimerBody}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-5 bg-gradient-to-r from-bio-orange/15 via-black to-black border border-bio-orange/40 rounded-3xl space-y-3 shadow-xl ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-bio-orange/20 border border-bio-orange/40 flex items-center justify-center text-bio-orange shrink-0">
          <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            {currentText.title}
          </h4>
          <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
            {currentText.userDeclarationBody}
          </p>
        </div>
      </div>

      <div className="p-3 bg-black/60 rounded-2xl border border-white/5 space-y-1">
        <span className="text-[10px] font-black text-bio-orange uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> {currentText.companyDisclaimerTitle}
        </span>
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
          {currentText.companyDisclaimerBody}
        </p>
      </div>
    </div>
  );
};
