// Productos y precios para HEALTHY + BRAIN

// Membership plans for payment modal
window.HB_PRODUCTS = {
    MEMBERSHIP: {
        MONTHLY: { name: 'Bio-Optimizator', price: 19.99, interval: 'month', features: ['Dashboard completo', 'IA Nutricional', 'Predicciones HRV'] },
        ANNUAL: { name: 'Bio-Optimizator Anual', price: 129.99, interval: 'year', features: ['Dashboard completo', 'IA Nutricional', 'Predicciones HRV', '2 meses gratis'] },
        ELITE: { name: 'Soberano Elite', price: 49.99, interval: 'month', features: ['Todo en Pro', 'Coach IA Prioritario', 'Análisis Genético'] }
    },
    NTK_PACKS: {
        STARTER: { id: 'ntk-starter', tokens: 1000, price: 4.99, amount: 1000, bonus: 0, name: 'Starter Pack' },
        BASIC: { id: 'ntk-basic', tokens: 5000, price: 19.99, amount: 5000, bonus: 500, name: 'Basic Pack' },
        PREMIUM: { id: 'ntk-premium', tokens: 15000, price: 49.99, amount: 15000, bonus: 2000, name: 'Premium Pack' }
    }
};

window.HB_PAYMENT_METHODS = {
    STRIPE: { publicKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' },
    SQUARE: { links: { basic: 'https://square.link/u/vx2qZn8R', premium: 'https://square.link/u/GIHh27Y0', elite: 'https://square.link/u/p1C6yuV3' } },
    ZELLE: { qr: 'assets/qr-zelle.png' },
    BITCOIN: { qr: 'assets/qr-bitcoin.png' }
};

// Productos para catálogo
const products = [
    { id: 'warrior', name: 'Guerrero', type: 'free', price: 0, currency: 'USD', features: ['Dashboard básico', '3 protocolos', 'Comunidad'], color: '#ff8a00' },
    { id: 'bio-monthly', name: 'Bio-Optimizator Mensual', type: 'subscription', price: 19.99, currency: 'USD', interval: 'month', features: ['Dashboard completo', 'IA Nutricional', 'Predicciones HRV', 'Comunidad Bio-Elite'], squareLink: 'https://square.link/u/vx2qZn8R', color: '#13ec5b' },
    { id: 'bio-annual', name: 'Bio-Optimizator Anual', type: 'subscription', price: 129.99, currency: 'USD', interval: 'year', features: ['Dashboard completo', 'IA Nutricional', 'Predicciones HRV', 'Comunidad Bio-Elite', '2 meses gratis'], color: '#13ec5b' },
    { id: 'elite', name: 'Soberano Elite', type: 'subscription', price: 49.99, currency: 'USD', interval: 'month', features: ['Todo en Pro', 'Coach IA Prioritario', 'Análisis Genético', 'Mentoría 1:1'], squareLink: 'https://square.link/u/GIHh27Y0', color: '#00d1ff' }
];
