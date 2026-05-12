/**
 * HEALTHY + BRAIN - Pricing Strategy Analysis
 * Comparativa de precios vs competidores del mercado
 */

const PRICING_ANALYSIS = {
    // Precios actuales de la app
    currentPricing: {
        free: { price: 0, period: 'forever', name: 'Guerrero' },
        premium: { price: 9.99, period: 'monthly', name: 'Bio-Soberano' },
        elite: { price: 19.99, period: 'monthly', name: 'Bio-Local Elite' },
        annual: { price: 79.99, period: 'yearly', name: 'Bio-Soberano Annual', discount: '33%' }
    },

    // Precios del mercado (competidores)
    marketPricing: [
        {
            name: 'Purovitalis Aura',
            price: 9.99,
            currency: 'EUR',
            type: 'subscription',
            features: ['50+ biomarcadores', 'edad biológica', 'IA'],
            convertedUSD: 10.99
        },
        {
            name: 'Mindvalley',
            price: 41.58,
            currency: 'USD',
            type: 'subscription',
            features: ['longevity', 'biohacking', 'Ben Greenfield'],
            convertedUSD: 41.58
        },
        {
            name: 'Humanity',
            price: 129.99,
            currency: 'USD',
            type: 'lifetime',
            features: ['H-Score', 'rate of aging', 'lifetime'],
            convertedUSD: 129.99
        },
        {
            name: 'Ketocis Pro',
            price: 0,
            currency: 'USD',
            type: 'freemium',
            features: ['nutrición', 'ayuno', 'glucosa']
        },
        {
            name: 'AgeTest Plus',
            price: 850,
            currency: 'USD',
            type: 'one-time',
            features: ['epigenético', 'telómeros', '120 días programa']
        },
        {
            name: 'VitalExplore',
            price: 299,
            currency: 'EUR',
            type: 'one-time',
            features: ['test genético', 'longevidad'],
            convertedUSD: 330
        }
    ],

    // Análisis de posicionamiento
    getPositioning() {
        const myPremium = 9.99;
        const marketAvg = 10.99; // Purovitalis es el más comparable
        
        return {
            position: myPremium < marketAvg ? 'competitive' : 'premium',
            difference: ((myPremium - marketAvg) / marketAvg * 100).toFixed(1) + '%',
            recommendation: 'El precio de $9.99 está bien posicionado vs Purovitalis (€9.99)'
        };
    },

    // Recomendaciones de precios para LATAM (México)
    latamPricing: {
        premium: 149, // pesos mexicanos (~9 USD)
        elite: 299,   // pesos mexicanos (~18 USD)
        annual: 1199, // pesos mexicanos (~72 USD)
        lifetime: 1499 // pesos mexicanos (~90 USD)
    },

    // Comparativa de features
    featureComparison: {
        ourApp: [
            '✅ Bio-Sync IA (screenshot, cámara, manual)',
            '✅ Análisis nutricional por foto',
            '✅ Protocolos +40 (Sinclair, Lyon, Walker)',
            '✅ Tracker biométricos',
            '✅ Edad biológica',
            '✅ Comunidad y Squads',
            '✅ Gamificación (NTK tokens)',
            '✅ Ejercicios guiados',
            '✅ Sueño y recuperación'
        ],
        competitors: {
            'Purovitalis': ['50+ biomarcadores', 'edad biológica', 'IA'],
            'Humanity': ['H-Score', 'rate of aging', ' wearables'],
            'Ketocis': ['CGM glucose', 'nutrición', 'ayuno'],
            'Mindvalley': ['Cursos premium', 'Ben Greenfield', 'bienestar']
        }
    },

    // Estrategias de pricing recomendadas
    recommendations: [
        {
            action: 'Mantener precio $9.99/mes',
            reason: 'Competitivo vs Purovitalis',
            impact: 'Alto'
        },
        {
            action: 'Agregar plan Lifetime $129',
            reason: 'Competir con Humanity - muy popular',
            impact: 'Medio'
        },
        {
            action: 'Agregar precios en MXN para LATAM',
            reason: 'Mercado clave - $149/mes',
            impact: 'Alto'
        },
        {
            action: 'Plan trimestral con 15% descuento',
            reason: 'Reducir churn, más ingresos',
            impact: 'Medio'
        },
        {
            action: 'Bundle con suplementos',
            reason: 'Generar ingresos recurrentes extras',
            impact: 'Alto'
        }
    ],

    // Calcular revenue proyectado
    projectedRevenue(users = 1000) {
        return {
            free: users * 0.7,
            premium: users * 0.25 * 9.99,
            elite: users * 0.05 * 19.99,
            annual: users * 0.1 * 79.99,
            monthlyRevenue: (users * 0.25 * 9.99) + (users * 0.05 * 19.99),
            annualRevenue: (users * 0.25 * 9.99 * 12) + (users * 0.05 * 19.99 * 12)
        };
    }
};

if (typeof window !== 'undefined') {
    window.PRICING_ANALYSIS = PRICING_ANALYSIS;
}