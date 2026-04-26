export type Language = 'es' | 'en' | 'pt' | 'fr';

export const Translations: Record<Language, any> = {
  es: {
    common: { save: 'Guardar', cancel: 'Cancelar', back: 'Volver', loading: 'Cargando...', welcome: 'Bienvenido' },
    home: { bioStatus: 'Bio-Estado', level: 'Nivel', xp: 'XP', pedometer: 'Pedómetro', syncIA: 'Sincronizar IA' },
    community: { title: 'Comunidad', feed: 'Feed de Sinergia', giveGlow: 'Vibrar' },
    nutrition: { title: 'IA Nutrición', scanning: 'ESCANEO...', bioScore: 'Impacto Longevidad' }
  },
  en: {
    common: { save: 'Save', cancel: 'Cancel', back: 'Back', loading: 'Loading...', welcome: 'Welcome' },
    home: { bioStatus: 'Bio-Status', level: 'Level', xp: 'XP', pedometer: 'Pedometer', syncIA: 'Sync AI' },
    community: { title: 'Community', feed: 'Synergy Feed', giveGlow: 'Glow' },
    nutrition: { title: 'AI Nutrition', scanning: 'SCANNING...', bioScore: 'Longevity Impact' }
  },
  pt: {
    common: { save: 'Salvar', cancel: 'Cancelar', back: 'Voltar', loading: 'Carregando...', welcome: 'Bem-vindo' },
    home: { bioStatus: 'Bio-Estado', level: 'Nível', xp: 'XP', pedometer: 'Pedômetro', syncIA: 'Sincronizar IA' },
    community: { title: 'Comunidade', feed: 'Feed de Sinergia', giveGlow: 'Brilhar' },
    nutrition: { title: 'IA Nutrição', scanning: 'ESCANEO...', bioScore: 'Impacto Longevidade' }
  },
  fr: {
    common: { save: 'Sauvegarder', cancel: 'Annuler', back: 'Retour', loading: 'Chargement...', welcome: 'Bienvenue' },
    home: { bioStatus: 'Bio-Statut', level: 'Niveau', xp: 'XP', pedometer: 'Podomètre', syncIA: 'Sync IA' },
    community: { title: 'Communauté', feed: 'Flux de Synergie', giveGlow: 'Faire Briller' },
    nutrition: { title: 'IA Nutrition', scanning: 'SCAN...', bioScore: 'Impact Longévité' }
  }
};
