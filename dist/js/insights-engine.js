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
        AGE_THRESHOLD_ANABOLIC: 40
    },

    // Get Suggestion based on current state
    analyze: (data) => {
        const { hrv, glucosa, lastWorkoutAt, ntk } = data;
        let protocols = [];

        // 1. Check Plasticity Window (BDNF)
        if (lastWorkoutAt) {
            const diffHours = (Date.now() - new Date(lastWorkoutAt).getTime()) / (1000 * 60 * 60);
            if (diffHours < InsightsEngine.THRESHOLDS.PLASTICITY_WINDOW_HOURS) {
                protocols.push({
                    id: 'plasticity',
                    type: 'alert',
                    title: 'VENTANA DE PLASTICIDAD ACTIVA',
                    body: 'Tus niveles de BDNF e IGF-1 están en su pico máximo. Es el momento ideal para aprendizaje profundo o enfoque cognitivo.',
                    ref: 'Deep Research Report (NotebookLM)'
                });
            }
        }

        // 2. HRV (System Fatigue)
        if (hrv && hrv < InsightsEngine.THRESHOLDS.HRV_LOW) {
            protocols.push({
                id: 'vagal',
                type: 'warning',
                title: 'BAJO TONO VAGAL DETECTADO',
                body: 'Tu HRV indica estrés en el CNS. Aplica el "Physiological Sigh" de Huberman: doble inhalación por nariz, exhalación larga por boca.',
                ref: 'Huberman Lab Protocol'
            });
        }

        // 3. Glucose (Metabolic Load)
        if (glucosa && glucosa > InsightsEngine.THRESHOLDS.GLUCOSA_HIGH) {
            protocols.push({
                id: 'glucose',
                type: 'action',
                title: 'CARGA GLUCÉMICA ELEVADA',
                body: 'Para achatar la curva, realiza 1000 pasos (10 min) o consume fibra si aún no lo has hecho. Activa tus transportadores GLUT4.',
                ref: 'Bio-Axiom (Inchauspé)'
            });
        }

        // 4. BDNF Decay
        if (!lastWorkoutAt || ((Date.now() - new Date(lastWorkoutAt).getTime()) / (1000 * 60 * 60 * 24)) > InsightsEngine.THRESHOLDS.BDNF_DECAY_DAYS) {
            protocols.push({
                id: 'bdnf_low',
                type: 'training',
                title: 'DECAIMIENTO DE BDNF',
                body: 'Han pasado >48h desde tu última sobrecarga funcional. El cerebro requiere de lactato y mioquinas para mantener la neurofísica.',
                ref: 'Neuro-Sovereignty Report'
            });
        }

        // 5. Anabolic Resistance (+40 Age)
        if (data.age && data.age >= InsightsEngine.THRESHOLDS.AGE_THRESHOLD_ANABOLIC) {
            protocols.push({
                id: 'anabolic',
                type: 'longevity',
                title: 'RESISTENCIA ANABÓLICA DETECTADA',
                body: 'Por tu edad (+40), tus músculos requieren dosis más altas de leucina. Asegura 30-50g de proteína en cada comida principal.',
                ref: 'Longevity Protocol (+40)'
            });
        }

        // 6. Chronotype Optimization
        if (data.cronotype === 'morning' && new Date().getHours() > 19) {
            protocols.push({
                id: 'cronotype_sleep',
                type: 'alert',
                title: 'OPTIMIZACIÓN CIRCADIANA',
                body: 'Eres un León (Matutino). Tu ventana de melatonina está abriéndose. Evita luces azules y comidas pesadas para un sueño reparador.',
                ref: 'Circadian Biology'
            });
        }

        // 7. Grip Strength (Grip)
        if (!data.gripStrength) {
            protocols.push({
                id: 'grip_check',
                type: 'longevity',
                title: 'BIOMARCADOR DE VITALIDAD',
                body: 'No hemos medido tu fuerza de agarre. Es el predictor #1 de mortalidad sistémica. Realiza un test de agarre pronto.',
                ref: 'Longevity Metric'
            });
        }

        // 8. Environmental Health (3-30-300 Rule)
        protocols.push({
            id: 'environment',
            type: 'action',
            title: 'REGLA 3-30-300 (SALUD MENTAL)',
            body: 'Asegura ver 3 árboles, vivir en una zona con 30% de verde y a <300m de un parque. Reduce drásticamente el cortisol.',
            ref: 'Environmental Neuro-Science'
        });

        // 9. Liver Support (Cytochrome P450)
        if (data.supplementsCount > 3) {
            protocols.push({
                id: 'liver',
                type: 'warning',
                title: 'SOPORTE HEPÁTICO REQUERIDO',
                body: 'Estás usando múltiples suplementos. Considera Glutatión o Silimarina para proteger el Citocromo P450 en tu hígado.',
                ref: 'Metabolic Guardrails'
            });
        }

        // 10. Social Connection (+40)
        if (data.age >= 40 && (!data.lastSocialContact || data.lastSocialContact > 2)) {
            protocols.push({
                id: 'social',
                type: 'longevity',
                title: 'DÉFICIT DE OXITOCINA',
                body: 'La soledad en +40 es tan letal como 15 cigarrillos al día. Prioriza un encuentro cara a cara hoy.',
                ref: 'Social Biohacking'
            });
        }

        return protocols;
    }
};

// UI Component for Desktop
function updateAIInsightsPanel(data) {
    const panel = document.getElementById('ai-insights-container');
    if (!panel) return;

    const activeProtocols = InsightsEngine.analyze(data);
    
    if (activeProtocols.length === 0) {
        panel.innerHTML = `
            <div class="flex items-center gap-3 text-white/30 italic text-[11px] py-4 px-2">
                <span class="material-symbols-outlined text-[16px] animate-pulse">radar</span>
                Escaneando bio-firmas... Estado de Homeostasis detectado.
            </div>
        `;
        return;
    }

    panel.innerHTML = activeProtocols.map(p => `
        <div class="mb-4 last:mb-0 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group fade-in-up">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full ${getProtocolColor(p.type)}"></span>
                    <h4 class="text-[10px] font-black text-white uppercase tracking-wider">${p.title}</h4>
                </div>
                <span class="text-[8px] font-bold text-white/20 uppercase tracking-tighter">${p.ref}</span>
            </div>
            <p class="text-[12px] text-text-gray leading-tight mb-2">${p.body}</p>
            <div class="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
    `).join('');
}

function getProtocolColor(type) {
    switch(type) {
        case 'alert': return 'bg-neon shadow-[0_0_8px_rgba(0,209,255,0.8)]';
        case 'warning': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
        case 'action': return 'bg-primary shadow-[0_0_8px_rgba(255,138,0,0.8)]';
        case 'longevity': return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]';
        default: return 'bg-white/20';
    }
}

// Global Export
window.InsightsEngine = InsightsEngine;
window.updateAIInsightsPanel = updateAIInsightsPanel;
