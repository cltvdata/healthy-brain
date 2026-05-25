// i18n Global - HEALTHY + BRAIN
const i18n = {
    currentLang: localStorage.getItem('hb_lang') || 'es',
    translations: {
        es: {
            'app.name': 'HEALTHY + BRAIN',
            'nav.home': 'Inicio',
            'nav.train': 'Entrenar',
            'nav.history': 'Historial',
            'nav.rest': 'Descanso',
            'nav.exercises': 'Ejercicios',
            'nav.profile': 'Perfil',
            'nav.explore': 'Explorar',
            'pricing.title': 'Precios',
            'pricing.free': 'Gratis',
            'pricing.month': '/mes',
            'pricing.year': '/año',
            'common.start': 'Comenzar',
            'common.loading': 'Cargando...',
            'common.error': 'Error',
            'auth.login': 'Iniciar Sesión',
            'auth.register': 'Crear Cuenta',
            'auth.logout': 'Cerrar Sesión',
        },
        en: {
            'app.name': 'HEALTHY + BRAIN',
            'nav.home': 'Home',
            'nav.train': 'Train',
            'nav.history': 'History',
            'nav.rest': 'Rest',
            'nav.exercises': 'Exercises',
            'nav.profile': 'Profile',
            'nav.explore': 'Explore',
            'pricing.title': 'Pricing',
            'pricing.free': 'Free',
            'pricing.month': '/mo',
            'pricing.year': '/yr',
            'common.start': 'Get Started',
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'auth.login': 'Sign In',
            'auth.register': 'Create Account',
            'auth.logout': 'Sign Out',
        }
    },
    t(key) {
        return this.translations[this.currentLang]?.[key] || key;
    },
    setLang(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('hb_lang', lang);
            document.documentElement.lang = lang;
        }
    }
};

// Auto-set on load
document.documentElement.lang = i18n.currentLang;
