export type Language = 'es' | 'en' | 'pt' | 'fr' | 'ko' | 'ru' | 'ar';

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
  },
  ko: {
    common: { save: '저장', cancel: '취소', back: '뒤로', loading: '로딩 중...', welcome: '환영합니다' },
    home: { bioStatus: '바이오 상태', level: '레벨', xp: 'XP', pedometer: '만보기', syncIA: 'AI 동기화' },
    community: { title: '커뮤니티', feed: '시너지 피드', giveGlow: '글로우' },
    nutrition: { title: 'AI 영양', scanning: '스캔 중...', bioScore: '장수 영향' }
  },
  ru: {
    common: { save: 'Сохранить', cancel: 'Отмена', back: 'Назад', loading: 'Загрузка...', welcome: 'Добро пожаловать' },
    home: { bioStatus: 'Био-статус', level: 'Уровень', xp: 'XP', pedometer: 'Шагомер', syncIA: 'Синхронизация ИИ' },
    community: { title: 'Сообщество', feed: 'Лента синергии', giveGlow: 'Сиять' },
    nutrition: { title: 'ИИ Питание', scanning: 'СКАНИРОВАНИЕ...', bioScore: 'Влияние на долголетие' }
  },
  ar: {
    common: { save: 'حفظ', cancel: 'إلغاء', back: 'رجوع', loading: 'جاري التحميل...', welcome: 'أهلاً بك' },
    home: { bioStatus: 'الحالة الحيوية', level: 'مستوى', xp: 'XP', pedometer: 'عداد الخطى', syncIA: 'مزامنة الذكاء الاصطناعي' },
    community: { title: 'مجتمع', feed: 'خلاصة التآزر', giveGlow: 'توهج' },
    nutrition: { title: 'ذكاء اصطناعي تغذية', scanning: 'جاري المسح...', bioScore: 'تأثير طول العمر' }
  }
};
