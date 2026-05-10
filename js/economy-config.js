/**
 * HEALTHY + BRAIN - Centralized Economy Configuration
 * Phase 42: Sustainable Neuro-Token (NTK) System
 */

const EconomyConfig = {
    // Reward values in NTK
    REWARDS: {
        SUNLIGHT: {
            AM_LOW_ANGLE: 50,    // Early morning light
            MID_DAY_VIT_D: 30,   // UV intensity peak
            PM_SUNSET: 20        // Melatonin preparation
        },
        NUTRITION: {
            FIBER_FIRST: 15,
            VINEGAR_HACK: 10,
            CAFFEINE_DELAY: 25,  // Critical for adenosine management
            MEAL_SCAN: 5         // Base reward for logging
        },
        SOCIAL: {
            GLOW: 5,            // Daily interaction
            GIFT_BONUS_XP: 10   // XP multiplier for gifting
        }
    },

    // Daily caps and interaction rules
    LIMITS: {
        DAILY_GIFT_SENT: 500,    // Max NTK user can give per day
        DAILY_AXIOM_REWARD: 1000, // Max NTK earned from bio-axioms
        INTERACTION_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in ms
    },

    // XP Multipliers
    XP_RATES: {
        BIO_SCORE_INCREASE: 100, // XP per 1 pt increase
        LEVEL_UP_BONUS: 500
    }
};

if (typeof window !== 'undefined') {
    window.EconomyConfig = EconomyConfig;
}
