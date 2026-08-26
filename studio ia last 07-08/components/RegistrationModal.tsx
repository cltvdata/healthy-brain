import React, { useState, useEffect } from 'react';
import { PhotoDisclaimerBanner } from './PhotoDisclaimerBanner';
import { getApkDownloadUrl, triggerApkDownload } from '../utils/downloadHelper';
import { 
  Shield, 
  Globe, 
  Mail, 
  CreditCard, 
  Coins, 
  Landmark, 
  Download, 
  QrCode, 
  Check, 
  AlertTriangle, 
  X,
  Copy,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Lock,
  ShieldAlert
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, lang: 'ES' | 'EN' | 'PT', approved: boolean) => void;
  initialLang?: 'ES' | 'EN' | 'PT';
  initialEmail?: string;
  initialApproved?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialLang = 'ES',
  initialEmail = '',
  initialApproved = false
}) => {
  const [lang, setLang] = useState<'ES' | 'EN' | 'PT'>(initialLang);
  const [email, setEmail] = useState<string>(initialEmail);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'bitcoin' | 'square' | null>(null);
  
  // Payment Details States
  const [zelleTxId, setZelleTxId] = useState<string>('');
  const [btcAddress] = useState<string>('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy');
  const [btcCopied, setBtcCopied] = useState<boolean>(false);
  const [squareCard, setSquareCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  
  // Progress states
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(initialApproved);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  useEffect(() => {
    setLang(initialLang);
    setEmail(initialEmail);
    setIsApproved(initialApproved);
  }, [initialLang, initialEmail, initialApproved]);

  if (!isOpen) return null;

  const handleCopyBtc = () => {
    navigator.clipboard.writeText(btcAddress);
    setBtcCopied(true);
    setTimeout(() => setBtcCopied(false), 2000);
  };

  const handleProcessMockPayment = (methodName: string) => {
    if (!email || !email.includes('@')) {
      const errorMsg = lang === 'ES' 
        ? 'Por favor introduce un correo válido.' 
        : lang === 'PT' 
          ? 'Por favor insira um e-mail válido.' 
          : 'Please enter a valid email.';
      setPaymentError(errorMsg);
      return;
    }
    if (!acceptedDisclaimer) {
      const errorMsg = lang === 'ES' 
        ? 'Debes aceptar el descargo de responsabilidad.' 
        : lang === 'PT' 
          ? 'Você deve aceitar a isenção de responsabilidade.' 
          : 'You must accept the disclaimer.';
      setPaymentError(errorMsg);
      return;
    }

    setPaymentError(null);
    setIsProcessingPayment(true);

    // Simulate payment validation / approval
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsApproved(true);
      setRegistrationSuccess(true);
      onSuccess(email, lang, true);
    }, 2500);
  };

  // Dynamic Translations helper to avoid nesting and add Português (PT)
  const getTranslation = (key: string): string => {
    const translations: Record<string, Record<'ES' | 'EN' | 'PT', string>> = {
      title: {
        ES: 'Sincronización de Bio-ID & Descarga de APK',
        EN: 'Bio-ID Sync & APK Download Hub',
        PT: 'Sincronização de Bio-ID & Central de Download APK'
      },
      subtitle: {
        ES: 'Registra tu correo, aprueba el pago de tu licencia y obtén el enlace directo de descarga para tu celular.',
        EN: 'Register your email, approve your license payment, and get your direct download link for your cell phone.',
        PT: 'Registre seu e-mail, aprove o pagamento de sua licença e obtenha o link de download direto para o seu celular.'
      },
      langLabel: {
        ES: 'Idioma de Aplicación:',
        EN: 'App Language:',
        PT: 'Idioma do Aplicativo:'
      },
      disclaimerTitle: {
        ES: 'Descargo de Responsabilidad Médica, Fotos y Soberanía de Datos',
        EN: 'Medical, Photo Upload & Data Sovereignty Disclaimer',
        PT: 'Isenção de Responsabilidade Médica, Fotos e Soberania de Dados'
      },
      disclaimerBody: {
        ES: 'INFORMACIÓN DE SALUD Y RESPONSABILIDAD DE FOTOS: La plataforma Healthy + Brain procesa datos biométricos de forma privada. Esta aplicación es una herramienta de bio-optimización y autogestión, y NO constituye asesoramiento ni diagnóstico médico. RESPONSABILIDAD DE FOTOS: El usuario declara y garantiza responsabilidad exclusiva sobre todo el contenido y fotografías que suba o capture, declarando expresamente que son para su uso estrictamente personal. La empresa se deslinda de toda responsabilidad por filtros, pérdidas de datos, almacenamiento o envío de fotos. La empresa NO es responsable bajo ninguna circunstancia de ninguna de las fotos subidas a la plataforma.',
        EN: 'HEALTH INFORMATION & PHOTO UPLOAD RESPONSIBILITY: Healthy + Brain processes biometric data privately. This app is a bio-optimization tool and DOES NOT constitute medical advice or diagnosis. PHOTO RESPONSIBILITY: The user accepts sole responsibility for all content and photos uploaded or captured, stating that media is for strictly personal use. The company disclaims all liability for photo filters, data loss, storage, or transmission issues. The company is NOT responsible under any circumstances for any photos uploaded on the platform.',
        PT: 'INFORMAÇÃO DE SAÚDE E RESPONSABILIDADE DE FOTOS: A plataforma Healthy + Brain processa dados biométricos de forma privada. Este aplicativo é uma ferramenta de auto-otimização e NÃO constitui aconselhamento médico. RESPONSABILIDADE DE FOTOS: O usuário aceita responsabilidade exclusiva por todo o conteúdo e fotos enviadas, declarando que são para seu uso estritamente pessoal. A empresa isenta-se de toda responsabilidade por filtros, perda de dados, envio ou armazenamento. A empresa NÃO é responsável por qualquer foto enviada na plataforma.'
      },
      acceptDisclaimer: {
        ES: 'Acepto la Declaración de Uso Personal de Fotos y Términos de Responsabilidad',
        EN: 'I Accept the Personal Photo Responsibility & Usage Terms',
        PT: 'Aceito a Declaração de Uso Pessoal de Fotos e Termos de Responsabilidade'
      },
      emailLabel: {
        ES: 'Correo Electrónico para Descarga:',
        EN: 'Email Address for Download Link:',
        PT: 'E-mail para Link de Download:'
      },
      emailPlaceholder: {
        ES: 'tu-correo@dominio.com',
        EN: 'your-email@domain.com',
        PT: 'seu-email@dominio.com'
      },
      paymentTitle: {
        ES: 'Aprobación de Pago de Licencia (Pro)',
        EN: 'License Payment Approval (Pro)',
        PT: 'Aprovação de Pagamento de Licença (Pro)'
      },
      paymentSubtitle: {
        ES: 'Elige una de las pasarelas aprobadas (Zelle, Bitcoin o Square) para habilitar la descarga instantánea de la APK:',
        EN: 'Choose one of the approved gateways (Zelle, Bitcoin, or Square) to enable instant APK download:',
        PT: 'Escolha um dos gateways aprovados (Zelle, Bitcoin ou Square) para habilitar o download instantâneo do APK:'
      },
      cardNum: {
        ES: 'Número de Tarjeta',
        EN: 'Card Number',
        PT: 'Número do Cartão'
      },
      cardExp: {
        ES: 'Vencimiento',
        EN: 'Expiry',
        PT: 'Validade'
      },
      cardCvc: {
        ES: 'CVV',
        EN: 'CVC',
        PT: 'CVV'
      },
      cardName: {
        ES: 'Nombre en Tarjeta',
        EN: 'Name on Card',
        PT: 'Nome no Cartão'
      },
      btnPay: {
        ES: 'Procesar Pago',
        EN: 'Process Payment',
        PT: 'Processar Pagamento'
      },
      btnPaying: {
        ES: 'Procesando Transacción...',
        EN: 'Processing Transaction...',
        PT: 'Processando Transação...'
      },
      btnVerify: {
        ES: 'Verificar Transacción',
        EN: 'Verify Transaction',
        PT: 'Verificar Transação'
      },
      approvedTitle: {
        ES: '¡Suscripción & Pago Aprobado!',
        EN: 'Subscription & Payment Approved!',
        PT: 'Assinatura & Pagamento Aprovado!'
      },
      approvedBody: {
        ES: 'Tu Bio-ID ha sido verificado con éxito. Hemos enviado una copia del enlace a tu correo. Ya puedes instalar la app móvil en tu celular.',
        EN: 'Your Bio-ID has been successfully verified. We have sent a copy of the link to your email. You can now install the mobile app on your cell phone.',
        PT: 'Seu Bio-ID foi verificado com sucesso. Enviamos uma cópia do link para o seu e-mail. Você já pode instalar o aplicativo móvel em seu celular.'
      },
      apkTitle: {
        ES: 'Descarga la APK Directamente',
        EN: 'Download APK Directly',
        PT: 'Baixe o APK Diretamente'
      },
      apkLinkText: {
        ES: 'Descargar APK Móvil (v1.0.0)',
        EN: 'Download Mobile APK (v1.0.0)',
        PT: 'Baixar APK Móvel (v1.0.0)'
      },
      qrTitle: {
        ES: 'Escanea para Descargar en tu Celular',
        EN: 'Scan to Download on Your Phone',
        PT: 'Escaneie para Baixar no seu Celular'
      },
      qrTip: {
        ES: 'Abre la cámara de tu celular para escanear este código y descargar directamente.',
        EN: 'Open your phone camera to scan this code and download directly.',
        PT: 'Abra a câmera do seu celular para escanear este código e baixar diretamente.'
      },
      closeBtn: {
        ES: 'Volver al Dashboard',
        EN: 'Back to Dashboard',
        PT: 'Voltar ao Dashboard'
      },
      zelleInstructions: {
        ES: 'Realiza tu pago vía Zelle enlace directo de Chase. Aplica para membresía mensual ($9.99 USD descuento acordado), membresía anual ($79.99 USD) o paquetes de tokens NTK. Haz clic abajo para abonar e ingresa tu ID de transacción:',
        EN: 'Make your payment via direct Chase Zelle link. Valid for monthly membership ($9.99 USD agreed discount), annual membership ($79.99 USD) or NTK token packages. Click below to pay and enter your transaction ID:',
        PT: 'Faça seu pagamento via link direto Zelle do Chase. Válido para assinatura mensal ($9.99 USD com desconto), assinatura anual ($79.99 USD) ou tokens NTK. Clique abaixo para pagar e insira o ID da transação:'
      },
      btcInstructions: {
        ES: 'Envía exactamente 0.00018 BTC a la siguiente dirección. El sistema verificará la red de forma inmediata:',
        EN: 'Send exactly 0.00018 BTC to the following address. The system will verify the blockchain immediately:',
        PT: 'Envie exatamente 0.00018 BTC para a seguinte carteira. O sistema verificará a rede imediatamente:'
      },
      squareInstructions: {
        ES: 'Utiliza el formulario encriptado de Square para ingresar tu tarjeta de crédito o débito:',
        EN: 'Use the secure encrypted Square form to enter your credit or debit card:',
        PT: 'Use o formulário criptografado do Square para inserir seu cartão de crédito ou débito:'
      }
    };
    return translations[key]?.[lang] || translations[key]?.['ES'] || '';
  };

  const t = {
    title: getTranslation('title'),
    subtitle: getTranslation('subtitle'),
    langLabel: getTranslation('langLabel'),
    disclaimerTitle: getTranslation('disclaimerTitle'),
    disclaimerBody: getTranslation('disclaimerBody'),
    acceptDisclaimer: getTranslation('acceptDisclaimer'),
    emailLabel: getTranslation('emailLabel'),
    emailPlaceholder: getTranslation('emailPlaceholder'),
    paymentTitle: getTranslation('paymentTitle'),
    paymentSubtitle: getTranslation('paymentSubtitle'),
    cardNum: getTranslation('cardNum'),
    cardExp: getTranslation('cardExp'),
    cardCvc: getTranslation('cardCvc'),
    cardName: getTranslation('cardName'),
    btnPay: getTranslation('btnPay'),
    btnPaying: getTranslation('btnPaying'),
    btnVerify: getTranslation('btnVerify'),
    approvedTitle: getTranslation('approvedTitle'),
    approvedBody: getTranslation('approvedBody'),
    apkTitle: getTranslation('apkTitle'),
    apkLinkText: getTranslation('apkLinkText'),
    qrTitle: getTranslation('qrTitle'),
    qrTip: getTranslation('qrTip'),
    closeBtn: getTranslation('closeBtn'),
    zelleInstructions: getTranslation('zelleInstructions'),
    btcInstructions: getTranslation('btcInstructions'),
    squareInstructions: getTranslation('squareInstructions')
  };

  const btcQrSvg = (
    <svg width="100" height="100" viewBox="0 0 29 29" fill="none" className="bg-white p-1 rounded-lg">
      <path d="M0 0h9v9H0V0zm1 1v7h7V1H1zm11 0h5v1h-5V1zm6 0h1v1h-1V1zm2 0h5v1h-5V1zm-8 2h1v4h-1V3zm2 0h1v2h-1V3zm2 0h1v1h-1V3zm2 0h1v3h-1V3zm2 0h1v1h-1V3zm2 0h1v2h-1V3zm-14 8h5v1H6v-1zm11 0h1v1h-1v-1zm2 0h3v1h-3v-1zm4 0h1v1h-1v-1zm-18 2h1v1H0v-1zm2 0h1v1H2v-1zm4 0h1v1H6v-1zm6 0h1v2h-1v-2zm4 0h1v1h-1v-1zm2 0h2v1h-2v-1zm4 0h1v1h-1v-1zm-18 2h3v1H2v-1zm4 0h1v1H6v-1zm2 0h1v1H8v-1zm11 0h1v1h-1v-1zm2 0h1v1h-1v-1zm4 0h1v1h-1v-1zm-18 2h1v1H2v-1zm4 0h3v1H6v-1zm6 0h1v1h-1v-1zm4 0h1v1h-1v-1zm2 0h3v1h-3v-1zm4 0h1v1h-1v-1zm-18 2h1v1H2v-1zm2 0h1v1H4v-1zm2 0h1v1H6v-1zm6 0h1v1h-1v-1zm4 0h1v1h-1v-1zm2 0h1v1h-1v-1zm4 0h1v1h-1v-1zm-14 2h1v1h-1v-1zm4 0h1v1H8v-1zm4 0h1v1h-1v-1zm4 0h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1z" fill="#000"/>
      <path d="M0 20h9v9H0v-9zm1 1v7h7v-7H1zm11 0h3v1h-3v-1zm6 0h1v1h-1v-1zm2 0h1v1h-1v-1zm4 0h1v1h-1v-1zm-14 2h1v1h-1v-1zm4 0h1v1H8v-1zm6 0h2v1h-2v-1zm6 0h1v1h-1v-1zm4 0h1v1h-1v-1zm-20 2h1v1H0v-1zm2 0h1v1H2v-1zm4 0h1v1H6v-1zm6 0h1v1h-1v-1zm4 0h1v1h-1v-1zm2 0h2v1h-2v-1zm4 0h1v1h-1v-1zm-18 2h1v1H2v-1zm4 0h3v1H6v-1zm6 0h1v1h-1v-1zm4 0h1v1h-1v-1zm2 0h3v1h-3v-1zm4 0h1v1h-1v-1zm-18 2h1v1H2v-1zm2 0h1v1H4v-1zm2 0h1v1H6v-1zm6 0h1v1h-1v-1zm4 0h1v1h-1v-1zm2 0h1v1h-1v-1zm4 0h1v1h-1v-1z" fill="#000"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0c10] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-fade-in relative shadow-2xl my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          id="close-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-neuro-blue/10 border border-neuro-blue/20 flex items-center justify-center mx-auto text-neuro-blue shadow-lg shadow-neuro-blue/10">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">{t.title}</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">{t.subtitle}</p>
        </div>

        {/* Step 1: Language & Registration */}
        {!isApproved && (
          <div className="space-y-4">
            
            {/* Language Selection */}
            <div className="flex items-center justify-between p-3.5 bg-white/2 border border-white/5 rounded-2xl">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-neuro-blue" />
                {t.langLabel}
              </span>
              <div className="flex bg-black p-0.5 rounded-xl border border-white/5 gap-1">
                <button
                  type="button"
                  onClick={() => setLang('ES')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    lang === 'ES' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Español 🇪🇸
                </button>
                <button
                  type="button"
                  onClick={() => setLang('EN')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    lang === 'EN' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  English 🇺🇸
                </button>
                <button
                  type="button"
                  onClick={() => setLang('PT')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    lang === 'PT' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Português 🇵🇹
                </button>
              </div>
            </div>

            {/* Disclaimer block */}
            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-bio-orange flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> {t.disclaimerTitle}
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                {t.disclaimerBody}
              </p>

              {/* Explicit Photo Upload Disclaimer Banner */}
              <PhotoDisclaimerBanner compact={true} lang={lang} />
              
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer group border-t border-white/5">
                <input 
                  type="checkbox"
                  checked={acceptedDisclaimer}
                  onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-black/40 text-neuro-blue focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wide group-hover:text-white transition-colors">
                  {t.acceptDisclaimer}
                </span>
              </label>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                {t.emailLabel}
              </label>
              <div className="relative flex items-center bg-white/2 border border-white/5 rounded-2xl focus-within:border-neuro-blue/50 transition-all">
                <span className="pl-4 text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-transparent border-none focus:ring-0 py-3.5 px-3 text-xs text-white placeholder-gray-600 outline-none"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <div className="text-left">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t.paymentTitle}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{t.paymentSubtitle}</p>
              </div>

              {/* Grid of payment options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'zelle', name: 'Zelle', icon: <Landmark className="w-4 h-4" />, color: 'hover:border-purple-500/40 hover:text-purple-400' },
                  { id: 'bitcoin', name: 'Bitcoin', icon: <Coins className="w-4 h-4" />, color: 'hover:border-yellow-500/40 hover:text-yellow-400' },
                  { id: 'square', name: 'Square', icon: <Lock className="w-4 h-4" />, color: 'hover:border-emerald-500/40 hover:text-emerald-400' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                      paymentMethod === p.id 
                        ? 'bg-white/10 border-neuro-blue text-neuro-blue shadow-lg shadow-neuro-blue/5'
                        : 'bg-black/50 border-white/5 text-gray-500 ' + p.color
                    }`}
                  >
                    {p.icon}
                    <span className="text-[10px] font-black uppercase tracking-wider">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Payment Details Area */}
              {paymentMethod && (
                <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-4 animate-fade-in text-xs">
                  {paymentMethod === 'zelle' && (
                    <div className="space-y-3">
                      <p className="text-gray-400 leading-relaxed font-medium">{t.zelleInstructions}</p>
                      
                      {/* Direct Chase Zelle Link Button */}
                      <a 
                        href="https://payments.chase.com?invid=KG4NDGF1423C" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
                      >
                        <ExternalLink className="w-4 h-4" /> Abrir Zelle en Chase ↗
                      </a>

                      <div className="p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1 text-[10px]">
                        <span className="text-purple-400 font-bold block uppercase">Planes Aprobados vía Zelle:</span>
                        <div className="text-gray-300 space-y-0.5">
                          <p>• Membresía Mensual Pro: <strong className="text-white">$9.99 USD</strong> (Descuento Acordado)</p>
                          <p>• Membresía Anual Soberana: <strong className="text-white">$79.99 USD</strong></p>
                          <p>• Packs de Tokens NTK: <strong className="text-white">$0.99 / $3.99 / $6.99 USD</strong></p>
                        </div>
                      </div>

                      <div className="flex bg-white/2 rounded-xl border border-white/5 p-1.5 focus-within:border-purple-500/50 transition-all">
                        <input
                          type="text"
                          placeholder="ID de Transacción Zelle (Ej: TXN-9847239)"
                          value={zelleTxId}
                          onChange={(e) => setZelleTxId(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 py-2 px-3 text-xs text-white placeholder-gray-600 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bitcoin' && (
                    <div className="space-y-3">
                      <p className="text-gray-400 leading-relaxed font-medium">{t.btcInstructions}</p>
                      
                      <div className="flex items-center gap-3 bg-white/2 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-300 font-mono select-all break-all flex-1">{btcAddress}</span>
                        <button
                          type="button"
                          onClick={handleCopyBtc}
                          className="p-2 bg-white/5 hover:bg-white/10 text-neuro-blue hover:text-white rounded-lg transition-colors"
                        >
                          {btcCopied ? <Check className="w-3.5 h-3.5 text-bio-green" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex justify-center pt-2">
                        {btcQrSvg}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'square' && (
                    <div className="space-y-3">
                      <p className="text-gray-400 leading-relaxed font-medium">{t.squareInstructions}</p>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={squareCard.number}
                          onChange={(e) => setSquareCard({ ...squareCard, number: e.target.value })}
                          className="w-full bg-white/2 border border-white/5 rounded-xl py-2 px-4 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={squareCard.expiry}
                            onChange={(e) => setSquareCard({ ...squareCard, expiry: e.target.value })}
                            className="bg-white/2 border border-white/5 rounded-xl py-2 px-4 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            value={squareCard.cvc}
                            onChange={(e) => setSquareCard({ ...squareCard, cvc: e.target.value })}
                            className="bg-white/2 border border-white/5 rounded-xl py-2 px-4 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission triggers */}
                  <button
                    type="button"
                    onClick={() => handleProcessMockPayment(paymentMethod)}
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-neuro-blue text-dark font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-neuro-blue/10"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                        {t.btnPaying}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        {paymentMethod === 'zelle' || paymentMethod === 'bitcoin' ? t.btnVerify : t.btnPay}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Error alerts */}
            {paymentError && (
              <div className="p-3 bg-bio-orange/10 border border-bio-orange/20 text-bio-orange rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{paymentError}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Payment approved / Display Download links */}
        {isApproved && (
          <div className="space-y-6 text-center py-4">
            <span className="w-14 h-14 rounded-full bg-bio-green/15 border border-bio-green/30 flex items-center justify-center mx-auto text-bio-green animate-bounce">
              <Check className="w-7 h-7 stroke-[3]" />
            </span>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase text-bio-green">{t.approvedTitle}</h3>
              <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">{t.approvedBody}</p>
            </div>

            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl max-w-md mx-auto">
              <div className="flex items-center gap-2.5 text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                <Smartphone className="w-4 h-4 text-bio-green" />
                <span>{t.apkTitle}</span>
              </div>

              {/* PWA Direct Installation Button */}
              <button 
                onClick={async () => {
                  if ((window as any).deferredInstallPrompt) {
                    (window as any).deferredInstallPrompt.prompt();
                  } else {
                    alert('📱 ¡Instalación Directa en Teléfono Android!\n\n1. En tu celular, abre este enlace en Google Chrome.\n2. Presiona los tres puntos (⋮) arriba a la derecha.\n3. Selecciona "Agregar a la pantalla principal" o "Instalar aplicación".\n\n¡La app se instalará directamente en tu pantalla de inicio sin ningún error de APK!');
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-bio-green via-emerald-400 to-neuro-blue text-dark font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-bio-green/20 mb-2.5"
              >
                <Smartphone className="w-4 h-4 stroke-[3]" />
                Instalar App Directa en Celular (PWA)
              </button>

              {/* Official APK Direct Download Button */}
              <button 
                onClick={() => triggerApkDownload()}
                className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/15 cursor-pointer"
                id="direct-apk-download-link"
              >
                <Download className="w-4 h-4 text-bio-green stroke-[3]" />
                {t.apkLinkText}
              </button>

              {/* QR Code section for direct mobile download */}
              <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-neuro-blue" /> {t.qrTitle}
                </span>
                
                <div className="bg-white p-3.5 rounded-2xl w-fit mx-auto shadow-xl flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getApkDownloadUrl())}`} 
                    alt="APK Download QR Code"
                    className="w-[120px] h-[120px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium max-w-xs mx-auto">
                  {t.qrTip}
                </p>

                {/* Cookie Check Troubleshooting Note */}
                <div className="p-3 bg-bio-orange/15 border border-bio-orange/30 rounded-xl text-left space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-bio-orange text-[10px] font-black uppercase">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> ¿Te aparece "Page not found" o "Cookie Check"?
                  </div>
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    Si te aparece ese mensaje en el celular, presiona los 3 puntos (⋮) arriba a la derecha y selecciona <strong>"Abrir en Chrome / Navegador"</strong> o usa la opción <strong>"Authenticate in new window"</strong>.
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(getApkDownloadUrl());
                      alert('¡Enlace directo de la APK copiado al portapapeles!');
                    }}
                    className="w-full mt-1 py-1.5 px-2 bg-bio-orange/20 hover:bg-bio-orange/30 border border-bio-orange/40 text-bio-orange font-bold text-[10px] uppercase rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <Copy className="w-3 h-3" /> Copiar Enlace Directo APK
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              {t.closeBtn}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
