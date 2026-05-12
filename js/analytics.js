// Healthy + Brain Analytics Helper
// Tracking completo para métricas de lanzamiento y funnel de conversión

window.hb_analytics = {
  // Initialize GA if available
  init: () => {
    if (typeof gtag !== 'undefined') {
      console.log('[Analytics] Initialized');
      // Track session start
      gtag('event', 'session_start', {
        session_id: Date.now()
      });
    }
  },

  // Track page views
  pageView: (pageName) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href
      });
    }
    console.log('[Analytics] Page:', pageName);
  },

  // Track user actions
  event: (category, action, label = '', value = 0) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
    console.log('[Analytics]', category, '-', action, '-', label);
  },

  // Funnel tracking - full conversion path
  funnel: (step) => {
    const funnelSteps = {
      // Awareness
      'visited_landing': 1,
      'viewed_pricing': 2,
      
      // Interest
      'started_registration': 3,
      'step_1_complete': 4,  // Account created
      'step_2_complete': 5,   // Bio info complete
      
      // Intent
      'completed_registration': 6,
      'sent_verification': 7,
      'verified_email': 8,
      
      // Action
      'completed_onboarding': 9,
      'first_ntk_earned': 10,
      'first_metric_logged': 11,
      
      // Retention
      'day_1_return': 12,
      'day_7_return': 13,
      'first_subscription': 14
    };

    const stepNum = funnelSteps[step] || 0;
    
    // Save funnel progress
    localStorage.setItem('hb_funnel_step', stepNum);
    
    // Track in GA
    if (typeof gtag !== 'undefined') {
      gtag('event', 'funnel_progress', {
        funnel_step: step,
        step_number: stepNum,
        user_id: localStorage.getItem('hb_user_id') || 'anonymous'
      });
    }
    
    console.log('[Funnel]', step, '(step', stepNum + ')');
  },

  // Specific events for launch
  track: {
    // User acquisition
    signUp: () => {
      hb_analytics.event('user', 'sign_up');
      hb_analytics.funnel('completed_registration');
    },
    signUpGoogle: () => {
      hb_analytics.event('user', 'sign_up_google');
      hb_analytics.funnel('completed_registration');
    },
    login: () => hb_analytics.event('user', 'login'),
    
    // Onboarding
    onboardingComplete: () => {
      hb_analytics.event('onboarding', 'complete');
      hb_analytics.funnel('completed_onboarding');
    },
    step1Complete: () => hb_analytics.funnel('step_1_complete'),
    step2Complete: () => hb_analytics.funnel('step_2_complete'),
    
    // First actions
    firstNTKEarned: () => {
      hb_analytics.event('ntk', 'first_earned');
      hb_analytics.funnel('first_ntk_earned');
    },
    firstMetricLogged: () => {
      hb_analytics.event('metrics', 'first_logged');
      hb_analytics.funnel('first_metric_logged');
    },
    
    // Metrics
    viewDashboard: () => hb_analytics.event('metrics', 'view_dashboard'),
    viewHRV: () => hb_analytics.event('metrics', 'view_hrv'),
    viewNutrition: () => hb_analytics.event('metrics', 'view_nutrition'),
    
    // NTK Economy
    earnNTK: (amount) => hb_analytics.event('ntk', 'earn', amount, amount),
    spendNTK: (amount) => hb_analytics.event('ntk', 'spend', amount, amount),
    
    // Features
    startFocusSession: () => hb_analytics.event('feature', 'focus_start'),
    completeFocusSession: () => hb_analytics.event('feature', 'focus_complete'),
    scanFood: () => hb_analytics.event('feature', 'food_scan'),
    joinChallenge: () => hb_analytics.event('community', 'join_challenge'),
    
    // Engagement
    share: () => hb_analytics.event('engagement', 'share'),
    inviteFriend: () => hb_analytics.event('engagement', 'invite'),
    
    // Revenue
    viewPricing: () => {
      hb_analytics.event('conversion', 'view_pricing');
      hb_analytics.funnel('viewed_pricing');
    },
    clickUpgrade: () => hb_analytics.event('conversion', 'click_upgrade'),
    startTrial: () => {
      hb_analytics.event('conversion', 'start_trial');
      hb_analytics.funnel('start_trial');
    },
    completePayment: () => {
      hb_analytics.event('conversion', 'payment_complete');
      hb_analytics.funnel('first_subscription');
    }
  }
};

// Auto-track page on load
document.addEventListener('DOMContentLoaded', () => {
  const pageName = document.title || window.location.pathname;
  window.hb_analytics.pageView(pageName);
  
  // Track funnel: landing visit
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.hb_analytics.funnel('visited_landing');
  }
  
  // Track funnel: pricing view
  if (window.location.pathname === '/precios.html') {
    window.hb_analytics.track.viewPricing();
  }
});