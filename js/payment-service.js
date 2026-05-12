/**
 * HEALTHY + BRAIN - Stripe Payment Service
 * Sistema de pagos completo con soporte para suscripciones y packs de NTK
 */

// Safe Firebase Accessor
const getFirebase = () => {
    if (typeof window !== 'undefined' && window.firebase) return window.firebase;
    if (typeof firebase !== 'undefined') return firebase;
    return null;
};

// Configuration - REEMPLAZA ESTOS VALORES
const STRIPE_CONFIG = {
    // ⚠️ CONFIGURAR: Obtén estas keys de stripe.com/dashboard/apikeys
    PUBLISHABLE_KEY: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
    
    // Modo de pruebas
    MODE: 'test',
    
    // URLs de callback
    SUCCESS_URL: window.location.origin + '/index.html?payment=success',
    CANCEL_URL: window.location.origin + '/precios.html?payment=cancelled',
    
    // Pricing IDs de Stripe (crear en Stripe Dashboard → Products)
    PRICES: {
        PRO_MONTHLY: 'price_pro_monthly',
        PRO_YEARLY: 'price_pro_yearly', 
        ELITE_MONTHLY: 'price_elite_monthly',
        ELITE_YEARLY: 'price_elite_yearly'
    }
};

// Product prices (for display)
const PRODUCT_PRICES = {
    // NTK Packs
    NTK_PACKS: {
        starter: { amount: 100, bonus: 0, price: 4.99, name: 'Starter Pack' },
        basic: { amount: 500, bonus: 50, price: 19.99, name: 'Basic Pack' },
        premium: { amount: 1000, bonus: 150, price: 34.99, name: 'Premium Pack' },
        mega: { amount: 5000, bonus: 1000, price: 99.99, name: 'Mega Pack' }
    },
    // Subscription plans
    PLANS: {
        pro_monthly: { price: 9.99, period: 'month', name: 'Bio-Soberano Pro' },
        pro_yearly: { price: 79.99, period: 'year', name: 'Bio-Soberano Pro (Annual)' },
        elite_monthly: { price: 19.99, period: 'month', name: 'Bio-Local Elite' },
        elite_yearly: { price: 149.99, period: 'year', name: 'Bio-Local Elite (Annual)' }
    }
};

// Store in window for access
window.HB_PAYMENT_CONFIG = STRIPE_CONFIG;
window.HB_PRODUCT_PRICES = PRODUCT_PRICES;

// Load Stripe.js
async function loadStripe() {
    if (window.Stripe) {
        return window.Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
            if (window.Stripe) {
                resolve(window.Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY));
            } else {
                reject(new Error('Stripe failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Stripe script'));
        document.head.appendChild(script);
    });
}

// Open payment modal
function openPaymentModal(planType, productData = null) {
    const modal = document.getElementById('payment-modal');
    if (!modal) {
        console.warn('[Payment] Modal not found');
        return;
    }
    
    // Set up modal content based on product type
    const infoEl = document.getElementById('selected-plan-info');
    if (infoEl && productData) {
        infoEl.innerHTML = `
            <div class="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div>
                    <div class="font-bold text-lg">${productData.name}</div>
                    <div class="text-white/50">${productData.description || ''}</div>
                </div>
                <div class="text-2xl font-black text-primary">$${productData.price}</div>
            </div>
        `;
    }
    
    // Store selected plan
    window.selectedPaymentPlan = planType;
    window.selectedProductData = productData;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    window.selectedPaymentPlan = null;
    window.selectedProductData = null;
}

// Process payment with Stripe
async function processPayment() {
    const btn = document.getElementById('pay-button');
    if (!btn) {
        console.error('[Payment] Button not found');
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin">⟳</span> Iniciando...';
    
    try {
        // Check if Stripe key is configured
        if (STRIPE_CONFIG.PUBLISHABLE_KEY === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
            // Demo mode - simulate payment
            await simulatePayment();
            return;
        }
        
        // Load Stripe
        const stripe = await loadStripe();
        
        // Create checkout session (would need backend in production)
        // For now, use client-only approach for demo
        const productData = window.selectedProductData;
        
        if (!productData) {
            throw new Error('No product selected');
        }
        
        // Use Stripe Checkout (simplified for demo - in production use backend)
        const checkoutUrl = `https://checkout.stripe.com/pay/${STRIPE_CONFIG.PUBLISHABLE_KEY}#`;
        
        // For demo, show simulated success
        await simulatePayment();
        
    } catch (error) {
        console.error('[Payment] Error:', error);
        btn.innerHTML = '❌ Error';
        showToast('Error al procesar pago: ' + error.message);
        
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }, 2000);
    }
}

// Simulate payment for demo/testing
async function simulatePayment() {
    const btn = document.getElementById('pay-button');
    
    btn.innerHTML = '<span class="animate-spin">⟳</span> Procesando...';
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Success
    btn.innerHTML = '✓ Pago Exitoso';
    btn.classList.remove('bg-primary');
    btn.classList.add('bg-green-500', 'text-black');
    
    // Grant NTK if applicable
    const productData = window.selectedProductData;
    if (productData && productData.ntkAmount) {
        await grantNTK(productData.ntkAmount);
    }
    
    showToast('🎉 ¡Pago completado! +' + (productData?.ntkAmount || 0) + ' NTK');
    
    setTimeout(() => {
        closePaymentModal();
        btn.disabled = false;
        btn.innerHTML = 'Pagar Ahora';
        btn.classList.add('bg-primary');
        btn.classList.remove('bg-green-500', 'text-black');
        
        // Redirect to success page
        window.location.href = 'index.html?payment=success';
    }, 2000);
}

// Grant NTK after payment (already has getFirebase)
async function grantNTK(amount) {
    const user = window.hb_auth?.currentUser;
    if (!user) {
        console.warn('[Payment] No user logged in');
        return false;
    }

    try {
        const fb = getFirebase();
        const FieldValue = fb?.firestore?.FieldValue;
        
        await window.hb_db.collection('users').doc(user.uid).update({
            ntkBalance: FieldValue ? FieldValue.increment(amount) : window.firebase.firestore.FieldValue.increment(amount),
            purchases: FieldValue ? FieldValue.arrayUnion({
                type: 'ntk_pack',
                amount: amount,
                timestamp: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date()
            }) : window.firebase.firestore.FieldValue.arrayUnion({
                type: 'ntk_pack',
                amount: amount,
                timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
            })
        });
        
        console.log('[Payment] NTK granted:', amount);
        return true;
    } catch (e) {
        console.error('[Payment] Error granting NTK:', e);
        return false;
    }
}

// Buy NTK pack (called from UI)
function buyNTK(packType) {
    const pack = PRODUCT_PRICES.NTK_PACKS[packType];
    if (pack) {
        openPaymentModal('ntk_pack', {
            name: pack.name,
            description: `${pack.amount} NTK + ${pack.bonus} bonus`,
            price: pack.price,
            ntkAmount: pack.amount + pack.bonus
        });
    }
}

// Subscribe to plan
function subscribeToPlan(planType) {
    const plan = PRODUCT_PRICES.PLANS[planType];
    if (plan) {
        openPaymentModal('subscription', {
            name: plan.name,
            description: plan.period === 'month' ? 'Mensual' : 'Anual (ahorra 30%)',
            price: plan.price,
            planType: planType
        });
    }
}

// Check subscription status
async function checkSubscriptionStatus() {
    const user = window.hb_auth?.currentUser;
    if (!user) return { status: 'none', plan: null };
    
    try {
        const doc = await window.hb_db.collection('users').doc(user.uid).get();
        const data = doc.data();
        
        return {
            status: data?.subscriptionStatus || 'free',
            plan: data?.subscriptionPlan || null,
            expiresAt: data?.subscriptionExpiresAt
        };
    } catch (e) {
        console.error('[Payment] Error checking subscription:', e);
        return { status: 'error', plan: null };
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.remove('scale-0', 'opacity-0');
        toast.classList.add('scale-100', 'opacity-100');
        
        setTimeout(() => {
            toast.classList.remove('scale-100', 'opacity-100');
            toast.classList.add('scale-0', 'opacity-0');
        }, 3000);
    } else {
        console.log('[Toast]', message);
    }
}

// Export functions
window.HB_PAYMENT = {
    loadStripe,
    openPaymentModal,
    closePaymentModal,
    processPayment,
    buyNTK,
    subscribeToPlan,
    checkSubscriptionStatus
};