/**
 * Healthy + Brain - Internationalization (i18n) System
 * Fase 40: Global Sync & Bio-Security
 */

const i18n = {
    currentLang: localStorage.getItem('hb_language') || 'auto',

    init: async () => {
        if (i18n.currentLang === 'auto') {
            const browserLang = navigator.language.split('-')[0];
            const supported = Object.keys(i18n.translations);
            i18n.currentLang = supported.includes(browserLang) ? browserLang : 'en';
            localStorage.setItem('hb_language', i18n.currentLang);
            console.log(`[i18n] Auto-detected language: ${i18n.currentLang}`);
        }
        i18n.applyTranslations();
    },

    translations: {
        es: {
            // Header & General
            lobby: "Lobby",
            gym: "Gimnasio",
            progress: "Progreso",
            rest: "Descanso",
            library: "Biblioteca",
            bio_identity: "Bio-Identidad",
            settings: "Ajustes",
            
            // Dashboard
            greeting: "Buenos días, Guerrero",
            level: "LVL",
            streak: "Días",
            neuro_tokens: "NTK",
            neural_scanner: "Neural Scanner v3.5",
            active_sync: "Sincronización Activa",
            bio_bridge: "Bio-Bridge: Ingesta de Datos",
            manual: "Manual",
            capture: "Captura",
            csv_bio: "CSV / Bio",
            
            // Challenges
            daily_challenge: "Challenge Diario",
            complete_challenge: "Completar",
            share: "Compartir",
            
            // Auth & Security
            email_verification_sent: "Bio-Enlace de Verificación enviado a tu correo.",
            verify_email_title: "Verifica tu Soberanía",
            verify_email_body: "Hemos enviado un link a tu correo. Haz clic para activar tu Bio-ID y evitar fraudes.",
            anti_bot_check: "Prueba de Biología (Anti-Bot)",
            biometric_verification: "Verificación Biométrica",
            facial_id: "Facial ID (Escaneo)",
            
            // Legal
            disclaimer_title: "Acuerdo de Soberanía de            disclaimer_body: "Tus datos biométricos están cifrados. Al continuar, aceptas que Healthy+Brain procese tu información para optimizar tu longevidad. No somos responsables del mal uso de protocolos experimentales.",
            accept_terms: "Acepto los términos y el tratamiento bio-data.",
            
            // Visual Progress
            visual_evolution: "Evolución Visual",
            bio_mirror: "Bio-Espejo Meta",
            update_biometry: "Actualizar Biometría",
            evolution_uploads: "Cargas de Evolución",
            ai_prediction: "Predicción Bio-IA",
            
            // Community
            community: "Comunidad",
            social_ranking: "Ranking Social",
            squad_goal: "Meta Global de Escuadrón",
            live: "En Vivo"
        },
        en: {
            // ... (keeping previous en keys)
            disclaimer_body: "Your biometric data is encrypted. By continuing, you agree to Healthy+Brain processing your info to optimize longevity. We are not liable for misuse of experimental protocols.",
            accept_terms: "I accept the terms and bio-data treatment.",
            
            // Visual Progress
            visual_evolution: "Visual Evolution",
            bio_mirror: "Bio-Mirror Goal",
            update_biometry: "Update Biometry",
            evolution_uploads: "Evolution Uploads",
            ai_prediction: "Bio-AI Prediction",
            
            // Community
            community: "Community",
            social_ranking: "Social Ranking",
            squad_goal: "Global Squad Goal",
            live: "Live"
        },
        zh: {
            // ...
            accept_terms: "我接受条款和生物数据处理。",
            visual_evolution: "视觉进化",
            bio_mirror: "生物镜像目标",
            update_biometry: "更新生物特征",
            evolution_uploads: "进化上传",
            ai_prediction: "生物AI预测",
            community: "社区",
            social_ranking: "社交排名",
            squad_goal: "全球小队目标",
            live: "直播"
        },
        ru: {
            // ...
            accept_terms: "Я принимаю условия.",
            visual_evolution: "Визуальная эволюция",
            bio_mirror: "Био-Зеркало цели",
            update_biometry: "Обновить биометрию",
            evolution_uploads: "Загрузки эволюции",
            ai_prediction: "Био-ИИ Прогноз",
            community: "Сообщество",
            social_ranking: "Социальный рейтинг",
            squad_goal: "Глобальная цель отряда",
            live: "В эфире"
        },
        fr: {
            // ...
            accept_terms: "J'accepte les termes.",
            visual_evolution: "Évolution Visuelle",
            bio_mirror: "Miroir Bio Objectif",
            update_biometry: "Mettre à jour la biométrie",
            evolution_uploads: "Téléchargements d'évolution",
            ai_prediction: "Prédiction Bio-IA",
            community: "Communauté",
            social_ranking: "Classement Social",
            squad_goal: "Objectif Mondial d'Escouade",
            live: "En Direct"
        },
        ko: {
            // ...
            accept_terms: "약관 및 바이오 데이터 처리에 동의합니다.",
            visual_evolution: "시각적 진화",
            bio_mirror: "바이오 미러 목표",
            update_biometry: "생체 측정 업데이트",
            evolution_uploads: "진화 업로드",
            ai_prediction: "바이오 AI 예측",
            community: "커뮤니티",
            social_ranking: "소셜 랭킹",
            squad_goal: "글로벌 스쿼드 목표",
            live: "라이브"
        },
        pt: {
            // ...
            accept_terms: "Aceito os termos.",
            visual_evolution: "Evolução Visual",
            bio_mirror: "Bio-Espelho Meta",
            update_biometry: "Atualizar Biometria",
            evolution_uploads: "Uploads de Evolução",
            ai_prediction: "Predição Bio-IA",
            community: "Comunidade",
            social_ranking: "Ranking Social",
            squad_goal: "Meta Global de Esquadrão",
            live: "Ao Vivo"
        }
    },�� 및 바이오 데이터 처리에 동의합니다."
        },
        pt: { // Portuguese
            lobby: "Lobby", gym: "Academia", progress: "Progresso", rest: "Descanso", library: "Biblioteca", bio_identity: "Bio-Identidade", settings: "Ajustes",
            greeting: "Bom dia, Guerreiro", level: "NVL", streak: "Dias", neuro_tokens: "NTK",
            neural_scanner: "Scanner Neural v3.5", active_sync: "Sincronização Ativa", bio_bridge: "Bio-Bridge: Dados",
            manual: "Manual", capture: "Captura", csv_bio: "CSV / Bio",
            daily_challenge: "Desafio Diário", complete_challenge: "Completar", share: "Compartilhar",
            email_verification_sent: "Link de verificação enviado para o seu e-mail.", verify_email_title: "Verifique sua Soberania",
            verify_email_body: "Enviamos um link. Clique para ativar seu Bio-ID.",
            anti_bot_check: "Prova de Biologia (Anti-Bot)", biometric_verification: "Verificação Biométrica", facial_id: "Facial ID",
            disclaimer_title: "Acordo de Soberania", disclaimer_body: "Dados criptografados. Ao continuar, você aceita o tratamento de dados para longevidade.",
            accept_terms: "Aceito os termos."
        }
    },

    setLanguage: (lang) => {
        i18n.currentLang = lang;
        localStorage.setItem('hb_language', lang);
        i18n.applyTranslations();
    },

    t: (key) => {
        return i18n.translations[i18n.currentLang][key] || key;
    },

    applyTranslations: () => {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = i18n.t(key);
            } else {
                el.innerText = i18n.t(key);
            }
        });
        
        // Update document title if applicable
        const titleKey = document.querySelector('title').getAttribute('data-i18n');
        if (titleKey) document.title = i18n.t(titleKey);
    }
};

window.i18n = i18n;
document.addEventListener('DOMContentLoaded', i18n.init);
