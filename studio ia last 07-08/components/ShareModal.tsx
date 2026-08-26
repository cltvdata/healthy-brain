import React, { useState } from 'react';
import { Share2, Mail, MessageSquare, Copy, Check, ExternalLink, X, Smartphone, Send, Download } from 'lucide-react';
import { getApkDownloadUrl, getPublicBaseUrl, triggerApkDownload } from '../utils/downloadHelper';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
  lang?: 'ES' | 'EN' | 'PT';
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, appUrl, lang = 'ES' }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const currentUrl = appUrl || getPublicBaseUrl();

  const modalTranslations = {
    ES: {
      title: 'Compartir Healthy + Brain',
      sub: 'Enlace de acceso público e invitación directa',
      native: 'Compartir Vía Aplicaciones Nativas',
      whatsapp: 'WhatsApp',
      email: 'Correo Electrónico',
      sms: 'Mensaje SMS',
      apkTitle: 'Móvil Directo',
      apkDesc: 'Descarga inmediata del archivo ejecutable de Android',
      copy: 'Copiar',
      copied: 'Listo',
      actionRequiredTitle: '¿Aparece "Action required to load your app" en el celular?',
      actionRequiredText: 'Si tus invitados abren el enlace desde WhatsApp y ven esta verificación de navegador, deben presionar el botón "Authenticate in new window" en pantalla o tocar ⋮ y seleccionar "Abrir en Chrome / Navegador".',
      shareTitleText: 'HEALTHY + BRAIN: Plataforma de Soberanía Biológica',
      shareBodyText: '¡Descubre HEALTHY + BRAIN! Plataforma de bio-tracking, optimización celular y longevidad:'
    },
    EN: {
      title: 'Share Healthy + Brain',
      sub: 'Public access link and direct invite',
      native: 'Share via Native Apps',
      whatsapp: 'WhatsApp',
      email: 'Email',
      sms: 'SMS Message',
      apkTitle: 'Direct Mobile',
      apkDesc: 'Instant download of the Android executable file',
      copy: 'Copy',
      copied: 'Done',
      actionRequiredTitle: 'Seeing "Action required to load your app" on mobile?',
      actionRequiredText: 'If your guests open the link from WhatsApp and see this browser verification, they must tap "Authenticate in new window" or tap ⋮ and select "Open in Chrome / Browser".',
      shareTitleText: 'HEALTHY + BRAIN: Biological Sovereignty Platform',
      shareBodyText: 'Discover HEALTHY + BRAIN! Bio-tracking, cellular optimization & longevity platform:'
    },
    PT: {
      title: 'Compartilhar Healthy + Brain',
      sub: 'Link de acesso público e convite direto',
      native: 'Compartilhar via Apps Nativos',
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      sms: 'SMS',
      apkTitle: 'Móvel Direto',
      apkDesc: 'Download imediato do arquivo executável do Android',
      copy: 'Copiar',
      copied: 'Pronto',
      actionRequiredTitle: 'Vê "Action required to load your app" no celular?',
      actionRequiredText: 'Se seus convidados abrirem o link pelo WhatsApp e virem essa verificação do navegador, eles devem tocar em "Authenticate in new window" ou tocar em ⋮ e selecionar "Abrir no Chrome / Navegador".',
      shareTitleText: 'HEALTHY + BRAIN: Plataforma de Soberania Biológica',
      shareBodyText: 'Descubra HEALTHY + BRAIN! Plataforma de bio-tracking, otimização celular e longevidade:'
    }
  };

  const t = modalTranslations[lang] || modalTranslations['ES'];
  const shareTitle = t.shareTitleText;
  const shareText = t.shareBodyText;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f1115] border border-bio-green/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,209,255,0.15)] space-y-5 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-bio-green/20 border border-bio-green/40 flex items-center justify-center text-bio-green">
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">{t.title}</h3>
              <p className="text-[11px] text-gray-400 font-medium">{t.sub}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary OS Native Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-bio-green via-emerald-400 to-neuro-blue text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-bio-green/20"
          >
            <Share2 className="w-4 h-4 stroke-[3]" />
            {t.native}
          </button>
        )}

        {/* Specific Channel Buttons */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
            O selecciona una aplicación de mensajería:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 hover:text-white transition-all text-xs font-bold"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-white text-[11px]">WhatsApp</span>
                <span className="text-[9px] text-emerald-300/80">Mensaje directo</span>
              </div>
            </a>

            {/* Email */}
            <a
              href={emailUrl}
              className="flex items-center gap-3 p-3 bg-neuro-blue/10 hover:bg-neuro-blue/20 border border-neuro-blue/30 rounded-2xl text-neuro-blue hover:text-white transition-all text-xs font-bold"
            >
              <div className="w-8 h-8 rounded-xl bg-neuro-blue/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-neuro-blue" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-white text-[11px]">Correo</span>
                <span className="text-[9px] text-neuro-300/80">Enviar por Email</span>
              </div>
            </a>

            {/* SMS */}
            <a
              href={smsUrl}
              className="flex items-center gap-3 p-3 bg-bio-orange/10 hover:bg-bio-orange/20 border border-bio-orange/30 rounded-2xl text-bio-orange hover:text-white transition-all text-xs font-bold"
            >
              <div className="w-8 h-8 rounded-xl bg-bio-orange/20 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-bio-orange" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-white text-[11px]">SMS / Texto</span>
                <span className="text-[9px] text-bio-orange/80">Mensaje celular</span>
              </div>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-200 hover:text-white transition-all text-xs font-bold"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                {copied ? <Check className="w-4 h-4 text-bio-green" /> : <Copy className="w-4 h-4 text-gray-300" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-white text-[11px]">
                  {copied ? t.copied : t.copy}
                </span>
                <span className="text-[9px] text-gray-400">URL</span>
              </div>
            </button>
          </div>

          {/* Direct APK Download Button */}
          <button
            onClick={() => triggerApkDownload()}
            className="w-full mt-2.5 p-3 bg-gradient-to-r from-bio-green/20 to-neuro-blue/20 hover:from-bio-green/30 hover:to-neuro-blue/30 border border-bio-green/40 rounded-2xl text-bio-green hover:text-white transition-all text-xs font-bold flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-bio-green/20 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-bio-green" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-white text-[11px]">{t.apkTitle}</span>
                <span className="text-[9px] text-bio-green/80">{t.apkDesc}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-bio-green text-black font-black text-[9px] uppercase rounded-lg">.APK</span>
          </button>
        </div>

        {/* Copy input display */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center gap-2 p-2 bg-black/60 border border-white/10 rounded-xl">
            <input 
              type="text" 
              readOnly 
              value={currentUrl} 
              className="bg-transparent text-[10px] text-gray-300 font-mono w-full px-2 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-bio-green/20 hover:bg-bio-green/30 text-bio-green font-black text-[10px] uppercase rounded-lg transition-colors shrink-0"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>

          {/* Cookie Check / Action Required Troubleshooting Note */}
          <div className="p-3 bg-bio-orange/15 border border-bio-orange/30 rounded-2xl text-left space-y-1">
            <div className="flex items-center gap-1.5 text-bio-orange text-[10px] font-black uppercase">
              <Smartphone className="w-3.5 h-3.5 shrink-0" /> {t.actionRequiredTitle}
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed">
              {t.actionRequiredText}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
