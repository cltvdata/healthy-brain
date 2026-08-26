import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, Coins, Check, CreditCard, Shield, Landmark } from 'lucide-react';

interface ShopTabProps {
  tokens: number;
  onAddTokens: (amount: number, reason: string) => void;
  onPurchasePremium: () => void;
  isPremium: boolean;
}

const PREMIUM_PRODUCTS: Product[] = [
  {
    id: 'monthly',
    name: "Suscripción Mensual",
    description: "Acceso total ilimitado al motor de Bio-Tracking, Vision IA y Coaching de longevidad pránica.",
    price: "$9.99 / mes",
    type: 'subscription',
    value: 1
  },
  {
    id: 'annual',
    name: "Suscripción Anual",
    description: "La mejor opción para tu soberanía hormonal. Ahorra 33% comparado con el plan mensual.",
    price: "$79.99 / año",
    type: 'subscription',
    value: 12
  }
];

const COIN_PACKS: Product[] = [
  {
    id: 'tokens_100',
    name: "Pack 100 NTK",
    description: "Ideal para desbloquear 2-3 guías de longevidad avanzadas.",
    price: "$0.99",
    type: 'tokens',
    value: 100
  },
  {
    id: 'tokens_500',
    name: "Pack 500 NTK",
    description: "Consigue la guía completa de desintoxicación del cortisol cerebral.",
    price: "$3.99",
    type: 'tokens',
    value: 500
  },
  {
    id: 'tokens_1000',
    name: "Pack 1,000 NTK",
    description: "Maximiza tu Bio-Economy con un gran volumen de tokens instantáneos.",
    price: "$6.99",
    type: 'tokens',
    value: 1000
  }
];

export const ShopTab: React.FC<ShopTabProps> = ({ tokens, onAddTokens, onPurchasePremium, isPremium }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');

  const handleOpenCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCheckoutStep('details');
  };

  const handleProcessPayment = () => {
    if (!selectedProduct) return;
    setCheckingOut(true);

    // Simulated payment processing (Stripe / Apple Pay simulation)
    setTimeout(() => {
      setCheckingOut(false);
      setCheckoutStep('success');

      if (selectedProduct.type === 'subscription') {
        onPurchasePremium();
        onAddTokens(1000, "Bono de Bienvenida Pro: +1000 NTK");
      } else {
        // Award tokens
        onAddTokens(selectedProduct.value, `Compra de ${selectedProduct.name}`);
      }
    }, 2400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-bio-orange/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-bio-orange/20 text-bio-orange border border-bio-orange/30 uppercase tracking-widest mb-3 inline-block">
          BIO-STORE Y TOKENIZACIÓN
        </span>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Planes & Recompensas</h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Acelera tu optimización biológica. Adquiere el acceso Pro Premium para desbloquear el motor completo de IA o añade tokens NTK directamente a tu Bio-ID.
        </p>
      </div>

      {/* Subscription Tier Cards */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Elegir Membresía</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PREMIUM_PRODUCTS.map((prod) => (
            <div 
              key={prod.id} 
              className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all ${
                isPremium && prod.id === 'monthly'
                  ? 'bg-gradient-to-br from-bio-green/10 to-transparent border-bio-green/40 shadow-lg shadow-bio-green/5'
                  : 'bg-glass-noir border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">{prod.name}</h4>
                  {isPremium && prod.id === 'monthly' && (
                    <span className="text-[9px] font-black text-bio-green bg-bio-green/10 border border-bio-green/20 px-2 py-0.5 rounded-full uppercase">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xl font-black text-primary">{prod.price}</span>
                <button 
                  onClick={() => handleOpenCheckout(prod)}
                  disabled={isPremium}
                  className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isPremium 
                      ? 'bg-gray-800 text-gray-500 cursor-default' 
                      : 'bg-primary text-dark shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isPremium ? 'Suscrito' : 'Elegir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Token packs shop */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-bio-orange" /> Adquirir Neuro-Tokens (NTK)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COIN_PACKS.map((prod) => (
            <div 
              key={prod.id} 
              className="p-5 bg-glass-noir border border-white/5 rounded-3xl flex flex-col justify-between min-h-[180px] hover:border-white/10 transition-all"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-white uppercase tracking-wider">{prod.name}</span>
                  <Coins className="w-5 h-5 text-bio-orange" />
                </div>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-lg font-black text-primary">{prod.price}</span>
                <button 
                  onClick={() => handleOpenCheckout(prod)}
                  className="py-2 px-3 bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/10 hover:text-primary rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout Modal (Simulated Stripe) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-6 animate-fade-in relative shadow-2xl">
            
            {checkoutStep === 'details' ? (
              <>
                <div className="text-center">
                  <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                    <CreditCard className="w-6 h-6" />
                  </span>
                  <h3 className="text-lg font-black uppercase">Pasarela de Pago</h3>
                  <p className="text-xs text-gray-400 mt-1">Simulación Segura de Stripe Checkout</p>
                </div>

                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 uppercase font-bold">Producto</span>
                    <span className="text-white font-black uppercase">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-gray-400 uppercase font-bold">Total a Pagar</span>
                    <span className="text-primary font-black text-base">{selectedProduct.price}</span>
                  </div>
                </div>

                {/* Simulated credit card input fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Número de Tarjeta</label>
                    <input 
                      type="text" 
                      placeholder="•••• •••• •••• 4242" 
                      disabled
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Vencimiento</label>
                      <input 
                        type="text" 
                        placeholder="12 / 28" 
                        disabled
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">CVV</label>
                      <input 
                        type="text" 
                        placeholder="•••" 
                        disabled
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    disabled={checkingOut}
                    className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-gray-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleProcessPayment}
                    disabled={checkingOut}
                    className="flex-1 py-3 bg-primary text-dark font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                  >
                    {checkingOut ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                        Pagando...
                      </>
                    ) : (
                      'Pagar'
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-gray-500 text-center flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Encriptación SSL certificada • 100% Confidencial
                </p>
              </>
            ) : (
              <div className="text-center space-y-4">
                <span className="w-12 h-12 rounded-full bg-bio-green/10 border border-bio-green/20 flex items-center justify-center mx-auto text-bio-green animate-bounce">
                  <Check className="w-6 h-6 stroke-[3]" />
                </span>
                <h3 className="text-lg font-black uppercase text-bio-green">¡Pago Exitoso!</h3>
                <p className="text-xs text-gray-400 leading-relaxed px-4">
                  {selectedProduct.type === 'subscription' 
                    ? `¡Felicidades! Se ha activado tu membresía Bio-Soberano Pro. Has recibido un bono adicional de 1,000 NTK.`
                    : `Has acreditado ${selectedProduct.value} NTK exitosamente a tu Bio-ID.`}
                </p>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-full py-3 bg-bio-green text-dark font-black rounded-xl text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
                >
                  Comenzar a optimizar
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
