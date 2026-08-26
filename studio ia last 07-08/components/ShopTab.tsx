import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Sparkles, 
  Coins, 
  Check, 
  CreditCard, 
  Shield, 
  Landmark, 
  Star, 
  Gift, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  ShieldAlert,
  Flame,
  RefreshCw,
  Lock,
  ArrowRight,
  X
} from 'lucide-react';

interface ShopTabProps {
  tokens: number;
  onAddTokens: (amount: number, reason: string) => void;
  onPurchasePremium: () => void;
  isPremium: boolean;
}

interface PlanTier {
  id: 'daily' | 'monthly' | 'annual';
  name: string;
  regularPrice: string;
  price: string;
  discount: string;
  description: string;
  popular?: boolean;
}

const STRIPE_PLANS: PlanTier[] = [
  {
    id: 'daily',
    name: "Pase Diario Bio-Hack",
    regularPrice: "$5.00 USD",
    price: "$1.00 USD / día",
    discount: "Acceso 24 Horas",
    description: "Ideal para realizar un escaneo de nutrientes inmediato y calibrar biometría puntual.",
  },
  {
    id: 'monthly',
    name: "Pase Mensual Pro",
    regularPrice: "$30.00 USD",
    price: "$25.00 USD / mes",
    discount: "16% Descuento",
    popular: true,
    description: "Acceso total e ilimitado al motor de Bio-Tracking, Vision IA Lens, Gemelo Digital y Coaching de longevidad pránica.",
  },
  {
    id: 'annual',
    name: "Soberanía Anual Pro",
    regularPrice: "$360.00 USD",
    price: "$150.00 USD / año",
    discount: "58% Descuento",
    description: "La mejor opción para tu soberanía hormonal. Incluye Bono Exclusivo de +1,000 NTK de Bienvenida y soporte prioritario.",
  }
];

const COIN_PACKS = [
  {
    id: 'tokens_100',
    name: "Pack 100 NTK",
    description: "Ideal para desbloquear guías de longevidad puntuales.",
    price: "$0.99 USD",
    tokens: 100
  },
  {
    id: 'tokens_500',
    name: "Pack 500 NTK",
    description: "Consigue la guía de desintoxicación de cortisol.",
    price: "$3.99 USD",
    tokens: 500
  },
  {
    id: 'tokens_1000',
    name: "Pack 1,000 NTK",
    description: "Paquete más popular para impulsar tu Bio-ID.",
    price: "$4.99 USD",
    popular: true,
    tokens: 1000
  },
  {
    id: 'tokens_1500',
    name: "Pack 1,500 NTK",
    description: "Maximiza tu Bio-Economy con tokens ilimitados.",
    price: "$6.99 USD",
    tokens: 1500
  }
];

export const ShopTab: React.FC<ShopTabProps> = ({ 
  tokens, 
  onAddTokens, 
  onPurchasePremium, 
  isPremium 
}) => {
  // Stripe Modal State
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stripeSuccess, setStripeSuccess] = useState(false);

  // Stripe Checkout Form Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('Soberano Bio-Hacker');

  // Streak Shield Purchase State
  const [streakShieldBought, setStreakShieldBought] = useState(false);
  const [shieldError, setShieldError] = useState<string | null>(null);

  // Generic Product Purchase (Zelle / BTC / Square)
  const [selectedTokenPack, setSelectedTokenPack] = useState<any | null>(null);

  // Trigger Stripe Checkout for 'daily' | 'monthly' | 'annual'
  const handleStripeCheckout = (planId: 'daily' | 'monthly' | 'annual') => {
    const plan = STRIPE_PLANS.find(p => p.id === planId) || STRIPE_PLANS[1];
    setSelectedPlan(plan);
    setStripeSuccess(false);
    setStripeModalOpen(true);
  };

  const handleConfirmStripePayment = () => {
    if (!selectedPlan) return;
    setStripeProcessing(true);

    setTimeout(() => {
      setStripeProcessing(false);
      setStripeSuccess(true);
      onPurchasePremium();
      if (selectedPlan.id === 'annual') {
        onAddTokens(1000, "Bono Anual Soberano: +1,000 NTK");
      } else if (selectedPlan.id === 'monthly') {
        onAddTokens(300, "Bono Mensual Pro: +300 NTK");
      } else {
        onAddTokens(100, "Pase Diario: +100 NTK");
      }
    }, 2200);
  };

  const handleBuyStreakShield = () => {
    setShieldError(null);
    if (tokens < 300) {
      setShieldError("Requiere al menos 300 NTK. Participa en los retos o compra un paquete para conseguir tokens.");
      return;
    }
    onAddTokens(-300, "Canje de Escudo de Racha (Streak Shield)");
    setStreakShieldBought(true);
  };

  const handleBuyTokenPack = (pack: any) => {
    setSelectedTokenPack(pack);
  };

  const handleConfirmTokenPack = () => {
    if (!selectedTokenPack) return;
    onAddTokens(selectedTokenPack.tokens, `Compra de ${selectedTokenPack.name}`);
    setSelectedTokenPack(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Valor & Seguridad */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-bio-green/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-bio-green/20 text-bio-green border border-bio-green/30 uppercase tracking-widest inline-block">
            OFERTA DE SUSCRIPCIÓN & BIO-TIENDA
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-bio-green bg-bio-green/10 border border-bio-green/20 px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-bio-green text-bio-green" />
            <span>4.9/5★ (+12,450 Bio-Hackers)</span>
          </div>
        </div>

        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
          Soberanía Hormonal & Bio-Store 💎
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed font-medium mt-1 max-w-2xl">
          Protege tu racha de hábitos, adquiere Neuro-Tokens (NTK) o activa tu Membresía Pro mediante la pasarela segura de Stripe o métodos de pago aprobados.
        </p>

        {/* Balance bar */}
        <div className="mt-5 p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bio-orange/20 border border-bio-orange/30 flex items-center justify-center text-bio-orange">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tu Balance de Neuro-Tokens</span>
              <span className="text-lg font-black text-white font-mono">{tokens.toLocaleString()} NTK</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-bio-green bg-bio-green/10 border border-bio-green/30 px-3 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-bio-green" />
            <span>Garantía de 30 Días Incluida</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PLANES DE MEMBRESÍA STRIPE */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap className="w-4 h-4 text-neuro-blue" />
          Membresías & Pases de Acceso (Stripe SSL)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STRIPE_PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between min-h-[280px] transition-all ${
                plan.popular 
                  ? 'bg-gradient-to-br from-neuro-blue/15 via-black/80 to-purple-950/20 border-neuro-blue/50 shadow-xl shadow-neuro-blue/10' 
                  : 'bg-glass-noir border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-neuro-blue text-black font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                  Más Popular
                </div>
              )}

              <div>
                <span className="text-[10px] font-black text-neuro-blue uppercase tracking-wider block mb-1">
                  {plan.discount}
                </span>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">{plan.name}</h4>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed font-medium">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="mb-3">
                  <span className="text-xs text-gray-500 line-through font-mono block">{plan.regularPrice}</span>
                  <span className="text-xl font-black text-white tracking-tight">{plan.price}</span>
                </div>

                {/* CRITICAL QA REQUIREMENT: onClick={() => handleStripeCheckout('daily' | 'monthly' | 'annual')} */}
                <button
                  onClick={() => handleStripeCheckout(plan.id)}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                    plan.popular
                      ? 'bg-neuro-blue text-black shadow-neuro-blue/20 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Activar con Stripe
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: CANJE DE STREAK SHIELD (ESCUDO DE RACHA - 300 NTK) */}
      <section className="p-6 rounded-3xl bg-glass-noir border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-bio-orange" />
              Bio-Economía: Escudo de Racha (Streak Shield)
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Protección Anti-Interrupción de Hábitos Biométricos
            </p>
          </div>
          <span className="text-xs font-black text-bio-orange bg-bio-orange/10 px-3 py-1 rounded-xl border border-bio-orange/20">
            300 NTK
          </span>
        </div>

        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase">Escudo de Protección de Racha de 24 Horas</h4>
            <p className="text-xs text-gray-300 leading-relaxed font-medium max-w-lg">
              Evita perder tu racha de hábitos ante viajes, imprevistos o descansos no planificados. Al activarlo, congela tu racha actual por 1 día entero sin penalización.
            </p>
          </div>

          <button
            onClick={handleBuyStreakShield}
            disabled={streakShieldBought}
            className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              streakShieldBought
                ? 'bg-bio-green/20 text-bio-green border border-bio-green/30 cursor-default'
                : 'bg-bio-orange text-black shadow-lg shadow-bio-orange/20 hover:scale-105 active:scale-95'
            }`}
          >
            {streakShieldBought ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Escudo Activo
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" /> Canjear por 300 NTK
              </>
            )}
          </button>
        </div>

        {shieldError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{shieldError}</span>
          </div>
        )}
      </section>

      {/* SECTION 3: PAQUETES DE TOKENS NTK (PAQUETES DE 1,000 NTK POR $4.99 USD, etc.) */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <Coins className="w-4 h-4 text-bio-orange" />
          Tienda de Neuro-Tokens NTK Directos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {COIN_PACKS.map((pack) => (
            <div 
              key={pack.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between min-h-[200px] transition-all ${
                pack.popular 
                  ? 'bg-bio-orange/10 border-bio-orange/40 shadow-lg shadow-bio-orange/5' 
                  : 'bg-glass-noir border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-black text-white uppercase tracking-wider">{pack.name}</span>
                  <Coins className="w-5 h-5 text-bio-orange" />
                </div>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  {pack.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-lg font-black text-white font-mono">{pack.price}</span>
                <button
                  onClick={() => handleBuyTokenPack(pack)}
                  className="py-2 px-3.5 bg-bio-orange/20 hover:bg-bio-orange/30 border border-bio-orange/40 text-bio-orange hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL 1: STRIPE CHECKOUT MODAL INTERACTIVO */}
      {stripeModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative bg-[#0d0d0d] border border-neuro-blue/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_0_60px_rgba(0,209,255,0.2)]">
            
            <button 
              onClick={() => setStripeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            {!stripeSuccess ? (
              <>
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-neuro-blue/15 border border-neuro-blue/30 flex items-center justify-center mx-auto text-neuro-blue mb-2">
                    <Lock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">Checkout Seguro de Stripe</h3>
                  <p className="text-xs text-gray-400">Procesamiento encriptado SSL de 256 bits</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 uppercase font-bold">Plan Seleccionado</span>
                    <span className="text-white font-black uppercase">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-gray-400 uppercase font-bold">Total a Cobrar</span>
                    <span className="text-neuro-blue font-black text-base">{selectedPlan.price}</span>
                  </div>
                </div>

                {/* Form Card Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nombre en la Tarjeta</label>
                    <input 
                      type="text" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-neuro-blue"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Número de Tarjeta (Stripe Sandbox)</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-neuro-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Expira</label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-neuro-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">CVC / CVV</label>
                      <input 
                        type="text" 
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-neuro-blue"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmStripePayment}
                  disabled={stripeProcessing}
                  className="w-full py-3.5 bg-neuro-blue hover:bg-neuro-blue/90 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-neuro-blue/20 transition-all flex items-center justify-center gap-2"
                >
                  {stripeProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Procesando Pago Seguro...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Pagar {selectedPlan.price} con Stripe
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center space-y-4 py-3">
                <div className="w-14 h-14 rounded-full bg-bio-green/20 border border-bio-green/40 flex items-center justify-center mx-auto text-bio-green animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-lg font-black uppercase text-bio-green tracking-tight">¡Suscripción Activada Exitosamente!</h3>
                <p className="text-xs text-gray-300 leading-relaxed px-2">
                  Se ha confirmado tu membresía <strong className="text-white">{selectedPlan.name}</strong>. Tu Bio-ID cuenta ahora con estatus PRO activo y la acreditación de tus Neuro-Tokens.
                </p>
                <button
                  onClick={() => setStripeModalOpen(false)}
                  className="w-full py-3 bg-bio-green text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-bio-green/20"
                >
                  Continuar a la App
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: TOKEN PACK CONFIRMATION */}
      {selectedTokenPack && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative bg-[#0d0d0d] border border-bio-orange/40 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-[0_0_50px_rgba(255,100,0,0.2)] text-center">
            <div className="w-12 h-12 rounded-2xl bg-bio-orange/20 border border-bio-orange/30 flex items-center justify-center mx-auto text-bio-orange">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white">{selectedTokenPack.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Acredita +{selectedTokenPack.tokens} NTK instantáneos por {selectedTokenPack.price}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTokenPack(null)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 font-bold text-xs uppercase rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmTokenPack}
                className="flex-1 py-3 bg-bio-orange text-black font-black text-xs uppercase rounded-xl shadow-lg shadow-bio-orange/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
