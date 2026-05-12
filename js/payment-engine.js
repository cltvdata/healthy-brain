// === PAYMENTS & SUBSCRIPTION ENGINE ===

class PaymentEngine {
  constructor() {
    this.currentPlan = 'free';
    this.initializePayments();
  }

  initializePayments() {
    const stored = localStorage.getItem('hb_subscription');
    if (stored) {
      this.currentPlan = JSON.parse(stored).plan;
    }
  }

  // === PLANS ===
  getPlans() {
    return {
      free: {
        name: 'Free',
        price: 0,
        features: [
          'Acceso básico a ejercicios',
          'Seguimiento básico de nutrición',
          'Historial limitado',
          '1 fuente de datos'
        ],
        limits: {
          workoutsPerWeek: 3,
          historyDays: 30,
          biometrics: 1
        }
      },
      premium: {
        name: 'Premium',
        price: 9.99,
        period: 'mes',
        features: [
          'Biblioteca completa de ejercicios',
          'Análisis de edad biológica',
          'Sincronización con wearables',
          'Notificaciones inteligentes',
          'Historial ilimitado',
          'Exportar datos',
          'Comunidad privada',
          'Soporte prioritario'
        ],
        limits: {
          workoutsPerWeek: 'unlimited',
          historyDays: 'unlimited',
          biometrics: 'all'
        }
      },
      elite: {
        name: 'Elite',
        price: 19.99,
        period: 'mes',
        features: [
          'Todo en Premium',
          'Análisis de sangre (IA)',
          'Plan de nutrición personalizado',
          'Entrenador IA dedicado',
          'Integración con dispositivos médicos',
          'Reportes avanzados mensuales',
          'Acceso a eventos exclusivos',
          'Mentoría mensual'
        ],
        limits: {}
      },
      lifetime: {
        name: 'Lifetime',
        price: 299.99,
        period: 'único',
        features: [
          'Todo en Elite永久',
          'Actualizaciones gratuitas de por vida',
          'Acceso beta temprano',
          'Soporte 24/7',
          'Badge exclusivo'
        ],
        limits: {}
      }
    };
  }

  getCurrentPlan() {
    return this.getPlans()[this.currentPlan];
  }

  isPremium() {
    return ['premium', 'elite', 'lifetime'].includes(this.currentPlan);
  }

  // === SUBSCRIPTION ===
  async subscribe(planId) {
    const plans = this.getPlans();
    const plan = plans[planId];
    
    if (!plan) {
      return { success: false, message: 'Plan no encontrado' };
    }

    if (planId === 'free') {
      this.currentPlan = 'free';
      this.saveSubscription();
      return { success: true, message: 'Plan gratuito activado' };
    }

    // Simulate payment processing
    return {
      success: true,
      message: `Suscripción a ${plan.name} procesada`,
      plan: planId,
      startDate: new Date().toISOString(),
      nextBilling: plan.period === 'único' ? null : this.calculateNextBilling(plan.period)
    };
  }

  calculateNextBilling(period) {
    const date = new Date();
    if (period === 'mes') {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString();
  }

  saveSubscription() {
    localStorage.setItem('hb_subscription', JSON.stringify({
      plan: this.currentPlan,
      startDate: new Date().toISOString()
    }));
  }

  async cancelSubscription() {
    this.currentPlan = 'free';
    this.saveSubscription();
    return { success: true, message: 'Suscripción cancelada' };
  }

  // === PRODUCTS (NFT-like Rewards) ===
  getProducts() {
    return [
      {
        id: 1,
        name: 'Bio-Passport NFT',
        description: 'Tu historial médico immutable',
        price: 49.99,
        type: 'nft',
        image: '🛂'
      },
      {
        id: 2,
        name: 'Achievement Badge',
        description: 'Badge exclusivo por logros',
        price: 19.99,
        type: 'badge',
        image: '🏆'
      },
      {
        id: 3,
        name: 'Custom Workout Plan',
        description: 'Plan personalizado de 12 semanas',
        price: 79.99,
        type: 'service',
        image: '📋'
      },
      {
        id: 4,
        name: '1-on-1 Coaching Session',
        description: 'Sesión con coach certificado',
        price: 99.99,
        type: 'service',
        image: '👨‍🏫'
      }
    ];
  }

  async purchaseProduct(productId) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
      return { success: false, message: 'Producto no encontrado' };
    }

    // In real app, process payment through Stripe/PayPal
    return {
      success: true,
      message: `Compra de ${product.name} completada`,
      product: product
    };
  }

  // === NTK (Currency) ===
  getNTKBalance() {
    return parseFloat(localStorage.getItem('hb_ntk_balance') || '0');
  }

  earnNTK(amount, reason) {
    const current = this.getNTKBalance();
    const newBalance = current + amount;
    localStorage.setItem('hb_ntk_balance', newBalance.toString());

    // Log transaction
    const transactions = JSON.parse(localStorage.getItem('hb_ntk_transactions') || '[]');
    transactions.unshift({
      amount,
      reason,
      timestamp: Date.now()
    });
    localStorage.setItem('hb_ntk_transactions', JSON.stringify(transactions.slice(0, 100)));

    return { success: true, newBalance };
  }

  spendNTK(amount, reason) {
    const current = this.getNTKBalance();
    if (current < amount) {
      return { success: false, message: 'Saldo insuficiente' };
    }

    const newBalance = current - amount;
    localStorage.setItem('hb_ntk_balance', newBalance.toString());

    return { success: true, newBalance };
  }

  // === PAYMENT METHODS ===
  getPaymentMethods() {
    return [
      { type: 'card', last4: '4242', brand: 'Visa', exp: '12/27' },
      { type: 'paypal', email: 'user@example.com' },
      { type: 'crypto', wallet: '0x...1234' }
    ];
  }

  async addPaymentMethod(method) {
    return { success: true, message: 'Método de pago agregado' };
  }

  // === INVOICES ===
  getInvoices() {
    return [
      { id: 1, date: '2026-04-01', amount: 9.99, status: 'paid', plan: 'Premium' },
      { id: 2, date: '2026-03-01', amount: 9.99, status: 'paid', plan: 'Premium' }
    ];
  }
}

window.paymentEngine = new PaymentEngine();
console.log('[Payments] Engine loaded');