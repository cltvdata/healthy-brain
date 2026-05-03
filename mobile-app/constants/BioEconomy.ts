/**
 * Bio-Economy Core Strategy (Fase 30 - Social Mining)
 * Defines the distribution of Neuro-Tokens (NTK) for retention and growth.
 * 
 * Marketing Rationale (Scientific Retention):
 * - 35% Consistency: Focus on habit-loop reinforcement.
 * - 25% Viral Growth: Coefficient K optimization.
 * 
 * Social Mining (New):
 * - Likes and community engagement generate real micro-value.
 */

export const BioEconomy = {
  // Bio-Trial Logic
  TRIAL_INITIAL_TOKENS: 500,
  TRIAL_DURATION_DAYS: 15,

  // Referral Rewards
  REFERRAL_BONUS_FIXED: 250, // Inviter
  INVITED_BONUS_FIXED: 500,  // Invited
  REFERRAL_STORE_DISCOUNT: 20, // 20% discount for first purchase

  // Neuro-Allocation (%)
  DISTRIBUTION: {
    HABIT_STREAK: 0.35,   // Consistency (Racha diaria)
    AFFILIATION: 0.25,    // Viralidad / Referidos
    COMMUNITY: 0.20,      // Social Proof (Mining)
    DISCOVERY: 0.10,      // Onboarding / Discovery
    WIN_BACK: 0.10        // Recuperación / Anti-Churn
  },

  // Daily Activity Incentives (REDUCED: High friction rewarded with Meta)
  DAILY_SYNC_REWARD: 0.5, 
  BIO_STREAK_BONUS_7D: 150,
  REWARD_STABILITY_S: 250, // Stability > 92%
  REWARD_STABILITY_A: 100, // Stability > 85%

  // Mental Performance (Dopamine Reset)
  NEURO_DETOX_REWARD_PER_MIN: 1, 
  FOCUS_SESSION_COMPLETION_BONUS: 25,

  // Circadian Sync (Huberman Protocol)
  REWARD_SUN_SYNC: 50,           // Automated sunrise/sunset capture

  // Social Mining & Economy Governance
  REWARD_LIKE_RECEIVED: 2,      
  REWARD_LIKE_GIVEN: 1,       
  REWARD_WEEKLY_VOTE_BONUS: 1000, 
  REWARD_GOAL_ACHIEVED: 150,    // Primary source of NTK
  SQUAD_WIN_REWARD: 500,        // Bonus for champion squad members
  CHALLENGE_BURN_TAX: 0.05,     // 5% Burn for competitive 1v1 challenges

  // P2P / Economy Safeguards
  TRANSFER_TAX: 0.015,          // 1.5% Burn/Fee for P2P transfers
  MAX_DAILY_GLOWS_GIVEN: 5,     // Anti-inflation limit

  // Training Rewards
  REWARD_WORKOUT_FIXED: 25,
  REWARD_WORKOUT_CARDIO_PER_2MIN: 1,

  // Loyalty & Redemption (Phase 94)
  COST_BIO_SHIELD: 350,
  STREAK_TARGET_SCORE: 70,
  STREAK_REWARD_SHIELD_DAYS: 7, 

  // Referral Credits (Phase 96)
  REFERRAL_CREDIT_USD: 5, // Discount for inviter per friend purchase
  PASS_RANK_SOVEREIGN: 75,
  PASS_RANK_ELITE: 90,
};

/**
 * Square Payment Bundles
 */
export const NTK_PACKS = [
  { 
    id: 'starter', 
    tokens: 1000, 
    priceUsd: 9.99, 
    squareUrl: 'https://square.link/u/p1C6yuV3', 
    name: 'Bio-Beginner', 
    description: 'Acceso básico a protocolos científicos.',
    bonus: 0
  },
  { 
    id: 'pro', 
    tokens: 3500, 
    priceUsd: 24.99, 
    squareUrl: 'https://square.link/u/GIHh27Y0', 
    name: 'Neuro-Optimizer', 
    description: 'Optimización de HRV y Longevidad Avanzada.',
    bonus: 17 // 500 NTK approx 17% extra compared to starter
  },
  { 
    id: 'elite', 
    tokens: 12000, 
    priceUsd: 74.99, 
    squareUrl: 'https://square.link/u/vx2qZn8R', 
    name: 'Soberanía Elite', 
    description: 'Acceso total + Soporte Bio-Coach IA prioritario.',
    bonus: 25 // 3000 NTK extra
  },
];

/**
 * Generates a unique Bio-Referral Code.
 */
export const genReferralCode = (name: string) => {
  const clean = name.replace(/\s+/g, '').toUpperCase().substring(0, 5);
  const rand = Math.floor(1000 + Math.random() * 9000).toString();
  return `BRAIN-${clean || 'BIO'}-${rand}`;
};
