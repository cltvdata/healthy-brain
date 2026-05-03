/**
 * Healthy + Brain - Bio-Insights Engine (Fase 35)
 * Derived from NotebookLM Studies (Andrew Huberman, Deep Research BDNF)
 */

const InsightsEngine = {
    // Protocol Thresholds
    THRESHOLDS: {
        HRV_LOW: 70,
        GLUCOSA_HIGH: 105,
        BDNF_DECAY_DAYS: 2,
        PLASTICITY_WINDOW_HOURS: 2,
        DOPAMINE_QUICK_LIMIT: 500 // NTK earned without focus sessions
    },

    // Get Suggestion based on current state
    analyze: (data) => {
        const { hrv, glucosa, lastWorkoutAt, ntk, focusMinutes = 0 } = data;
        let protocols = [];
        const hour = new Date().getHours();

        // 1. Circadian Sync (Huberman AM Protocol)
        if (hour >= 6 && hour <= 10) {
            protocols.push({
                id: 'sunlight_sync',
                type: 'action',
                title: 'SOLAR SYNC (H-PROTOCOL)',
                body: 'La luz solar directa en este momento reinicia tu reloj circadiano y optimiza la dopamina para el resto del día.',
                cta: 'SINCRONIZAR FOTONES',
                action: 'log_sunlight',
                reward: 50,
                ref: 'Huberman / Circadian'
            });
        }

        // 2. Biological Sovereignty (Environment 3-30-300)
        if (Math.random() > 0.8) { 
            protocols.push({
                id: 'sovereignty',
                type: 'info',
                title: 'SOBERANÍA AMBIENTAL',
                body: 'Busca 3 árboles y 30% de cobertura verde ahora. Tu cerebro necesita señales de seguridad del entorno.',
                cta: 'LOG NATURAL VIEW',
                action: 'log_nature',
                reward: 10,
                ref: 'Bio-Sovereignty'
            });
        }

        // 3. Dopamine Quality Check
        if (ntk > InsightsEngine.THRESHOLDS.DOPAMINE_QUICK_LIMIT && focusMinutes < 20) {
            protocols.push({
                id: 'dopamine_fast',
                type: 'warning',
                title: 'NIVEL DE DOPAMINA BARATA',
                body: 'Detección de recompensa sin esfuerzo. Sugerencia: Ayuno de dopamina o sesión de enfoque inmediato.',
                cta: 'SESIÓN DE ENFOQUE',
                action: 'start_focus',
                reward: 25,
                ref: 'Dopamine Protocol'
            });
        }

        // 4. HRV (System Fatigue)
        if (hrv && hrv < InsightsEngine.THRESHOLDS.HRV_LOW) {
            protocols.push({
                id: 'vagal',
                type: 'warning',
                title: 'RESETEA TU TONO VAGAL',
                body: 'HRV bajo detectado. Aplica el Suspiro Fisiológico para reducir la ansiedad y el estrés sistémico.',
                cta: 'RESPIRAR (30s)',
                action: 'start_breath',
                reward: 15,
                ref: 'Huberman / Vagal'
            });
        }

        // 5. Glucose (Metabolic Load - Inchauspé)
        if (glucosa && glucosa > InsightsEngine.THRESHOLDS.GLUCOSA_HIGH) {
            protocols.push({
                id: 'glucose',
                type: 'action',
                title: 'ORDEN METABÓLICO',
                body: 'Pico de glucosa detectado. Una caminata de 10 min o vinagre antes de la ingesta aplana la curva.',
                cta: 'LOG ACCIÓN ANTI-GLUCOSA',
                action: 'log_walk',
                reward: 20,
                ref: 'Glucose Goddess'
            });
        }

        // 6. Plasticity Window (BDNF)
        if (lastWorkoutAt) {
            const diffHours = (Date.now() - new Date(lastWorkoutAt).getTime()) / (1000 * 60 * 60);
            if (diffHours < InsightsEngine.THRESHOLDS.PLASTICITY_WINDOW_HOURS) {
                protocols.push({
                    id: 'plasticity',
                    type: 'alert',
                    title: 'VENTANA DE PLASTICIDAD NEURAL',
                    body: 'BDNF elevado. Es el momento óptimo para el aprendizaje de alta densidad.',
                    cta: 'BIBLIOTECA PRO',
                    action: 'go_library',
                    reward: 30,
                    ref: 'Neuro-Sovereignty'
                });
            }
        }

        return protocols;
    },

    // Daily Viral Challenge (Fase 39)
    getDailyChallenge: () => {
        const challenges = [
            { id: 'ch_dopa', title: 'Ayuno de Dopamina', body: '4 horas sin redes sociales ni comida ultraprocesada.', reward: 150, icon: 'block', color: 'indigo' },
            { id: 'ch_meta', title: 'Sprint Metabólico', body: 'Completa 1000 pasos en menos de 10 minutos post-comida.', reward: 200, icon: 'bolt', color: 'orange' },
            { id: 'ch_arco', title: 'Agenda Arcoíris Full', body: 'Sincroniza los 4 pilares (Sueño, Social, Misión, Silencio) hoy.', reward: 300, icon: 'colors', color: 'neon' },
            { id: 'ch_cold', title: 'Exposición al Frío', body: 'Ducha de 2 minutos a temperatura mínima al despertar.', reward: 100, icon: 'ac_unit', color: 'blue' }
        ];
        
        // Deterministic daily challenge based on date
        const day = new Date().getDate();
        return challenges[day % challenges.length];
    }
};

// UI Component for Desktop
function updateAIInsightsPanel(data) {
    const panel = document.getElementById('ai-insights-container');
    if (!panel) return;

    const activeProtocols = InsightsEngine.analyze(data).slice(0, 2); // Max 2 for elegance
    
    if (activeProtocols.length === 0) {
        panel.innerHTML = `
            <div class="flex items-center gap-3 text-white/30 italic text-[11px] py-4 px-2">
                <span class="material-symbols-outlined text-[16px] animate-pulse text-neon">radar</span>
                Escaneando bio-firmas... Estado de Homeostasis detectado.
            </div>
        `;
        return;
    }

    panel.innerHTML = activeProtocols.map(p => `
        <div class="mb-4 last:mb-0 p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all group fade-in-up">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full ${getProtocolColor(p.type)}"></span>
                    <h4 class="text-[10px] font-black text-white uppercase tracking-wider">${p.title}</h4>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[8px] font-bold text-primary uppercase tracking-tighter">+${p.reward || 10} NTK</span>
                    <span class="text-[8px] font-bold text-white/20 uppercase tracking-tighter">${p.ref}</span>
                </div>
            </div>
            <p class="text-[12px] text-text-gray leading-tight mb-3 pr-2">${p.body}</p>
            ${p.cta ? `
                <button onclick="triggerBioProtocol('${p.action}', ${p.reward || 10}, '${p.id}', this)" class="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-neon hover:text-black hover:border-neon transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-sm">${getActionIcon(p.action)}</span>
                    ${p.cta}
                </button>
            ` : ''}
        </div>
    `).join('');
}

function getActionIcon(action) {
    switch(action) {
        case 'start_breath': return 'air';
        case 'start_focus': return 'timer';
        case 'log_nature': return 'park';
        case 'log_walk': return 'directions_walk';
        case 'go_library': return 'local_library';
        default: return 'bolt';
    }
}

function getProtocolColor(type) {
    switch(type) {
        case 'alert': return 'bg-neon shadow-[0_0_8px_rgba(0,209,255,0.8)]';
        case 'warning': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
        case 'action': return 'bg-primary shadow-[0_0_8px_rgba(255,138,0,0.8)]';
        default: return 'bg-purple-500';
    }
}

// Global Export
window.InsightsEngine = InsightsEngine;
window.updateAIInsightsPanel = updateAIInsightsPanel;

// --- FCM / Notification Bridge ---
function notifyProtocol(protocol) {
    if (!protocol || Notification.permission !== 'granted') return;
    
    // Only notify for high-priority types
    if (['warning', 'alert'].includes(protocol.type)) {
        try {
            new Notification('HEALTHY + BRAIN', {
                body: protocol.body,
                icon: '/assets/images/logo-neon.png',
                badge: '/assets/images/logo-neon.png',
                tag: protocol.id, // Prevents duplicate notifications
                silent: false
            });
        } catch(e) {
            console.log('[Insights] Notification API not available:', e);
        }
    }
}

// Auto-notify on critical insights
function analyzeAndNotify(data) {
    const protocols = InsightsEngine.analyze(data);
    const critical = protocols.find(p => p.type === 'warning' || p.type === 'alert');
    
    // Only notify once per session per protocol
    if (critical) {
        const notifiedKey = `hb_notified_${critical.id}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(notifiedKey)) {
            setTimeout(() => notifyProtocol(critical), 3000);
            sessionStorage.setItem(notifiedKey, '1');
        }
    }
    
    return protocols;
}

// CTA Action Handler
async function triggerBioProtocol(action, reward, protocolId, btnElement) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">sync</span> Procesando...';
    }

    // Reward NTK
    try {
        const user = window.hb_auth?.currentUser;
        if (user) {
            const userRef = window.hb_db.collection('users').doc(user.uid);
            await window.hb_db.runTransaction(async (tx) => {
                const doc = await tx.get(userRef);
                const balance = (doc.data()?.ntkBalance || 0) + reward;
                tx.update(userRef, { ntkBalance: balance });
            });

            // Log the protocol completion
            await window.hb_db.collection('users').doc(user.uid).collection('logs').add({
                type: 'protocol',
                protocolId: protocolId,
                action: action,
                reward: reward,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Update localStorage
        const current = parseInt(localStorage.getItem('hb_token_balance') || '0');
        localStorage.setItem('hb_token_balance', current + reward);
    } catch(e) {
        console.error('[Protocol] Error:', e);
    }

    // Route action
    switch(action) {
        case 'start_breath': window.location.href = 'descanso.html'; break;
        case 'start_focus': window.location.href = 'sesion-enfoque.html'; break;
        case 'log_nature': case 'log_walk': case 'log_sunlight':
            if (btnElement) {
                btnElement.innerHTML = '<span class="material-symbols-outlined text-sm">check_circle</span> Registrado +' + reward + ' NTK';
                btnElement.className = btnElement.className.replace('hover:bg-neon', '').replace('hover:text-black', '') + ' bg-neon/20 text-neon border-neon/30';
            }
            break;
        case 'go_library': window.location.href = 'ejercicios.html'; break;
        default:
            if (btnElement) {
                btnElement.innerHTML = '<span class="material-symbols-outlined text-sm">check_circle</span> Completado +' + reward + ' NTK';
                btnElement.className = btnElement.className.replace('hover:bg-neon', '').replace('hover:text-black', '') + ' bg-neon/20 text-neon border-neon/30';
            }
    }
}

window.analyzeAndNotify = analyzeAndNotify;
window.triggerBioProtocol = triggerBioProtocol;
