/**
 * HEALTHY + BRAIN - Haptic Breath Engine (Fase 40)
 * AI-driven haptic feedback + personalized breathing patterns
 * Integrates with InsightsEngine for biometric context
 */

const HapticBreathEngine = {
    isSupported: 'vibrate' in navigator,

    // === VIBRATION PATTERNS ===
    PATTERNS: {
        SEDENTARISM: {
            name: 'Sedentarismo',
            pattern: [0, 800, 200, 800, 200, 800],
            description: 'Alerta de inactividad - 3 vibraciones largas',
            priority: 'high',
            trigger: 'inactivity_2h'
        },
        STRESS: {
            name: 'Estrés / Ansiedad',
            pattern: [0, 200, 400, 200, 400, 200, 400],
            description: 'Rítmico suave -诱导 respiración',
            priority: 'medium',
            trigger: 'hrv_low OR cortisol_high'
        },
        SLEEP_PREP: {
            name: 'Preparación Sueño',
            pattern: [0, 100, 800, 100, 800, 100, 1500],
            description: 'Baja frecuencia - transición a sueño',
            priority: 'low',
            trigger: 'circadian_sunset + no_sleep_log'
        },
        FOCUS: {
            name: 'Sesión Enfoque',
            pattern: [0, 50, 100],
            description: 'Micropulso para inicio de sesión Pomodoro',
            priority: 'medium',
            trigger: 'session_start'
        },
        DOPAMINE_ALERT: {
            name: 'Alerta Dopamina',
            pattern: [0, 150, 100, 150, 100, 300],
            description: 'Patrón de alerta para dopamina rápida',
            priority: 'high',
            trigger: 'ntk_excess'
        },
        BREATH_GUIDE: {
            name: 'Guía Respiratoria',
            pattern: null,
            description: 'Vibración sincronizada con respiración',
            priority: 'medium',
            trigger: 'active_breath_session'
        },
        CRITICAL: {
            name: 'Emergencia / Pánico',
            pattern: [0, 100, 100, 100, 100, 100, 100, 100, 100],
            description: 'Alerta crítica - requiere atención inmediata',
            priority: 'critical',
            trigger: 'panic | stress_extreme'
        },
        MEDITATION: {
            name: 'Meditación',
            pattern: [0, 50, 600, 50, 600, 50, 600],
            description: 'Pulse suave para inicio de sesión de meditación',
            priority: 'low',
            trigger: 'meditation_start'
        },
        COLD_EXPOSURE: {
            name: 'Frío / Tummo',
            pattern: [0, 200, 100, 200, 100, 200],
            description: 'Vibración ascendente para generación de calor',
            priority: 'medium',
            trigger: 'cold_exposure_active'
        },
        ATHLETIC: {
            name: 'Rendimiento',
            pattern: [0, 100, 50, 100, 50],
            description: 'Micro-pulsos para activación atlética',
            priority: 'low',
            trigger: 'pre_workout'
        }
    },

    // === BREATHING TECHNIQUES (EXPANDED) ===
    TECHNIQUES: {
        BOX_BREATHING: {
            name: 'Box Breathing (4-4-4-4)',
            inhale: 4,
            hold1: 4,
            exhale: 4,
            hold2: 4,
            cycles: 4,
            useCase: 'STRESS | FOCUS | PRE_SPEECH',
            hrvBenefit: 'high',
            description: 'Navy SEAL technique para control vagal'
        },
        PHYSIOLOGICAL_SIGH: {
            name: 'Physiological Sigh',
            inhale: 5,
            hold1: 0,
            exhale: 5,
            hold2: 0,
            cycles: 3,
            useCase: 'ANXIETY | ACUTE_STRESS',
            hrvBenefit: 'very_high',
            description: 'Doble inhale + exhale - reduce ansiedad en 30s'
        },
        COHERENCE: {
            name: 'Coherencia Cardíaca (5.5/min)',
            inhale: 5.5,
            hold1: 0,
            exhale: 5.5,
            hold2: 0,
            cycles: 6,
            useCase: 'HRV_LOW | RECOVERY',
            hrvBenefit: 'very_high',
            description: 'Optimiza variabilidad cardíaca'
        },
        RELAXATION: {
            name: '4-7-8 Breathing',
            inhale: 4,
            hold1: 7,
            exhale: 8,
            hold2: 0,
            cycles: 4,
            useCase: 'SLEEP | INSOMNIA',
            hrvBenefit: 'high',
            description: 'Dr. Weil - induce sueño naturalmente'
        },
        ENERGY: {
            name: 'Wim Hof (Hyperventilation)',
            inhale: 2,
            hold1: 0,
            exhale: 1,
            hold2: 0,
            cycles: 30,
            useCase: 'LOW_ENERGY | COLD_EXPOSURE',
            hrvBenefit: 'medium',
            description: 'Potencia sistema nervioso simpático'
        },
        TUMMO: {
            name: 'Tummo (Respiratory Bioheat)',
            inhale: 2,
            hold1: 2,
            exhale: 2,
            hold2: 2,
            cycles: 20,
            useCase: 'CORE_TEMP | COLD_EXPOSURE | WILLPOWER',
            hrvBenefit: 'high',
            description: 'Tibetan monks - genera calor corporal intencional'
        },
        NADISHODHANA: {
            name: 'Nadi Shodhana (Alternate Nostril)',
            inhale: 4,
            hold1: 4,
            exhale: 4,
            hold2: 4,
            cycles: 10,
            useCase: 'BALANCE | MEDITATION | CORTISOL',
            hrvBenefit: 'very_high',
            description: 'Yogic - equilibra hemisferios cerebrales'
        },
        EXTENDED_EXHALE: {
            name: 'Extended Exhale (1:2)',
            inhale: 4,
            hold1: 0,
            exhale: 8,
            hold2: 0,
            cycles: 8,
            useCase: 'ANXIETY | PANIC | RUMINATION',
            hrvBenefit: 'very_high',
            description: 'Reduce CO2 y activa parasimpático'
        },
        CYCLIC_SIGHING: {
            name: 'Cyclic Sighing (Huberman)',
            inhale: 5,
            hold1: 0,
            exhale: 5,
            hold2: 0,
            cycles: 40,
            useCase: 'MOOD | ANTI_DEPRESS | STRESS',
            hrvBenefit: 'very_high',
            description: 'Huberman protocol - 2x más efectivo que meditación'
        },
        PAPWORTH: {
            name: 'Papworth Method',
            inhale: 3,
            hold1: 0,
            exhale: 3,
            hold2: 2,
            cycles: 15,
            useCase: 'ASTHMA | HYPERVENTILATION |Anxiety',
            hrvBenefit: 'high',
            description: 'Controla hiperventilación - reduce síntomas físicos de ansiedad'
        },
        BUTEYKO: {
            name: 'Buteyko (Reduced Breathing)',
            inhale: 2,
            hold1: 4,
            exhale: 2,
            hold2: 4,
            cycles: 5,
            useCase: 'SLEEP_APNEA | ASTHMA | BLOOD_PRESSURE',
            hrvBenefit: 'high',
            description: 'Entrena respiración nasal - reduce apneas'
        },
        POWER_BREATH: {
            name: 'Power Breathing (Athletic)',
            inhale: 2,
            hold1: 1,
            exhale: 2,
            hold2: 0,
            cycles: 10,
            useCase: 'PERFORMANCE | ENDURANCE | FATIGUE',
            hrvBenefit: 'medium',
            description: 'Optimiza O2 pre-entrenamiento'
        },
        MEMORY: {
            name: 'Squeeze Breathing (Memory)',
            inhale: 4,
            hold1: 4,
            exhale: 4,
            hold2: 6,
            cycles: 6,
            useCase: 'MEMORY_CONSOLIDATION | CREATIVITY',
            hrvBenefit: 'high',
            description: 'Extiende consolidación de memoria - ideal post-learning'
        },
        PANIC_RELIEF: {
            name: '7-7-7 Panic Protocol',
            inhale: 7,
            hold1: 7,
            exhale: 7,
            hold2: 0,
            cycles: 5,
            useCase: 'PANIC_ATTACK | ACUTE_ANXIETY | OVERWHELM',
            hrvBenefit: 'very_high',
            description: 'Detiene ataques de pánico en 35 segundos'
        },
        CREATIVE_FLOW: {
            name: 'Skip Breathing (Creative)',
            inhale: 1,
            hold1: 0,
            exhale: 1,
            hold2: 0,
            cycles: 30,
            useCase: 'CREATIVITY | INSIGHT | BRAINSTORM',
            hrvBenefit: 'medium',
            description: 'Induce estados de flujo y conexión de ideas'
        },
        BLOOD_PRESSURE: {
            name: 'BP Reduction Protocol',
            inhale: 4,
            hold1: 8,
            exhale: 4,
            hold2: 0,
            cycles: 12,
            useCase: 'HYPERTENSION | TENSION | HEADACHE',
            hrvBenefit: 'high',
            description: 'Hipertensión - reduce sistólica 10-15 mmHg'
        },
        RESISTANCE: {
            name: 'IPSA (Limbic Resets)',
            inhale: 2,
            hold1: 0,
            exhale: 4,
            hold2: 0,
            cycles: 20,
            useCase: 'TRAUMA | EMOTIONAL_REG | GRIEF',
            hrvBenefit: 'high',
            description: 'Resetea amygdala - procesar emociones difíciles'
        }
    },

    // === AI DECISION ENGINE ===
    async analyzeAndRecommend(data) {
        const recommendation = {
            haptic: null,
            breath: null,
            reason: '',
            urgency: 'low'
        };

        const hour = new Date().getHours();
        const { hrv, ntk, lastActivityAt, focusActive, stressLevel, moodScore, postLearning, creativityMode, bloodPressure, panicDetected } = data;

        // 1. PANIC ATTACK (Highest Priority)
        if (panicDetected || stressLevel > 90) {
            recommendation.haptic = this.PATTERNS.STRESS;
            recommendation.breath = this.TECHNIQUES.PANIC_RELIEF;
            recommendation.reason = 'Detección de ataque de pánico / estrés agudo';
            recommendation.urgency = 'critical';
            return recommendation;
        }

        // 2. Check Sedentarism (2h inactivity)
        if (lastActivityAt) {
            const inactiveMinutes = (Date.now() - lastActivityAt) / (1000 * 60);
            if (inactiveMinutes > 120) {
                recommendation.haptic = this.PATTERNS.SEDENTARISM;
                recommendation.breath = this.TECHNIQUES.BOX_BREATHING;
                recommendation.reason = `${Math.floor(inactiveMinutes)} min inactivo`;
                recommendation.urgency = 'high';
                return recommendation;
            }
        }

        // 3. Emotional/Difficult Process (TRAUMA | GRIEF)
        if (stressLevel > 70 && moodScore < 3) {
            recommendation.haptic = this.PATTERNS.STRESS;
            recommendation.breath = this.TECHNIQUES.RESISTANCE;
            recommendation.reason = 'Procesamiento emocional detectado';
            recommendation.urgency = 'high';
            return recommendation;
        }

        // 4. Post-Learning Memory Consolidation
        if (postLearning || focusActive === 'post_study') {
            recommendation.haptic = this.PATTERNS.FOCUS;
            recommendation.breath = this.TECHNIQUES.MEMORY;
            recommendation.reason = 'Post-aprendizaje - consolidación de memoria';
            recommendation.urgency = 'medium';
            return recommendation;
        }

        // 5. Creativity Mode
        if (creativityMode || focusActive === 'brainstorming') {
            recommendation.haptic = this.PATTERNS.FOCUS;
            recommendation.breath = this.TECHNIQUES.CREATIVE_FLOW;
            recommendation.reason = 'Modo creatividad activado';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // 6. Blood Pressure / Tension
        if (bloodPressure && bloodPressure.systolic > 140) {
            recommendation.haptic = this.PATTERNS.STRESS;
            recommendation.breath = this.TECHNIQUES.BLOOD_PRESSURE;
            recommendation.reason = `Presión arterial elevada: ${bloodPressure.systolic}/${bloodPressure.diastolic}`;
            recommendation.urgency = 'medium';
            return recommendation;
        }

        // 7. HRV Low → Vagal Reset
        if (hrv && hrv < 70) {
            recommendation.haptic = this.PATTERNS.STRESS;
            recommendation.breath = this.TECHNIQUES.PHYSIOLOGICAL_SIGH;
            recommendation.reason = `HRV crítico: ${hrv}ms`;
            recommendation.urgency = 'high';
            return recommendation;
        }

        // 3. Dopamina alta sin focus → Alerta
        if (ntk > 500 && !focusActive) {
            recommendation.haptic = this.PATTERNS.DOPAMINE_ALERT;
            recommendation.breath = this.TECHNIQUES.COHERENCE;
            recommendation.reason = 'Dopamina rápida detectada';
            recommendation.urgency = 'medium';
            return recommendation;
        }

        // 4. Circadian: Prepare for sleep (1h before sunset)
        const circadian = window.CircadianService?.getCurrentWindow();
        if (circadian === 'PM_SUNSET' || hour >= 20) {
            recommendation.haptic = this.PATTERNS.SLEEP_PREP;
            recommendation.breath = this.TECHNIQUES.RELAXATION;
            recommendation.reason = 'Ventana circadiana de sueño';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // 8. Cold Exposure Triggered
        if (data.coldExposureActive) {
            recommendation.haptic = this.PATTERNS.FOCUS;
            recommendation.breath = this.TUMMO;
            recommendation.reason = 'Exposición al frío activa - generar calor';
            recommendation.urgency = 'medium';
            return recommendation;
        }

        // 9. Pre-Meditation / Balance
        if (data.meditationPrep || data.aim === 'balance') {
            recommendation.haptic = this.PATTERNS.BREATH_GUIDE;
            recommendation.breath = this.TECHNIQUES.NADISHODHANA;
            recommendation.reason = 'Preparación para meditación - equilibrio de canales';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // 10. Sleep Apnea / Respiratory Issues
        if (data.sleepApneaRisk || data.asthmaActive) {
            recommendation.haptic = this.PATTERNS.SLEEP_PREP;
            recommendation.breath = this.TECHNIQUES.BUTEYKO;
            recommendation.reason = 'Riesgo de apnea del sueño detectado';
            recommendation.urgency = 'medium';
            return recommendation;
        }

        // 11. Pre-Workout / Athletic
        if (data.preWorkout || data.aim === 'performance') {
            recommendation.haptic = this.PATTERNS.FOCUS;
            recommendation.breath = this.TECHNIQUES.POWER_BREATH;
            recommendation.reason = 'Optimización pre-entrenamiento';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // 12. Cyclic Sighing (Daily Anti-Stress)
        if (stressLevel > 40 && stressLevel <= 70) {
            recommendation.haptic = this.PATTERNS.STRESS;
            recommendation.breath = this.TECHNIQUES.CYCLIC_SIGHING;
            recommendation.reason = 'Estrés moderado - protocolo diario Huberman';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // 13. Extended Exhale (Rumination / Overthinking)
        if (moodScore >= 3 && moodScore <= 5 && stressLevel > 30) {
            recommendation.haptic = this.PATTERNS.STRESS;
            recommendation.breath = this.TECHNIQUES.EXTENDED_EXHALE;
            recommendation.reason = 'Rumiación / pensamientos repetitivos';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // Default: Morning Energy
        if (hour >= 6 && hour <= 10) {
            recommendation.haptic = this.PATTERNS.FOCUS;
            recommendation.breath = this.TECHNIQUES.ENERGY;
            recommendation.reason = 'Morning energy boost';
            recommendation.urgency = 'low';
            return recommendation;
        }

        // 6. Fallback: Coherence for maintenance
        recommendation.haptic = this.PATTERNS.BREATH_GUIDE;
        recommendation.breath = this.TECHNIQUES.COHERENCE;
        recommendation.reason = 'Mantenimiento HRV';
        recommendation.urgency = 'low';
        return recommendation;
    },

    // === HAPTIC EXECUTION ===
    trigger(patternKey) {
        if (!this.isSupported) {
            console.log('[Haptic] No soportado en este dispositivo');
            return false;
        }

        const pattern = this.PATTERNS[patternKey];
        if (!pattern || !pattern.pattern) {
            console.log('[Haptic] Patrón no válido:', patternKey);
            return false;
        }

        try {
            navigator.vibrate(pattern.pattern);
            console.log('[Haptic] Activado:', pattern.name);
            return true;
        } catch (e) {
            console.error('[Haptic] Error:', e);
            return false;
        }
    },

    // === BREATHING SESSION ===
    startBreathSession(techniqueKey, onPhaseChange) {
        const tech = this.TECHNIQUES[techniqueKey];
        if (!tech) return null;

        let cycle = 0;
        let phase = 'inhale';
        let seconds = 0;

        const interval = setInterval(() => {
            seconds++;

            // Phase transitions
            const phaseDuration = this.getPhaseDuration(phase, tech);
            if (seconds >= phaseDuration) {
                phase = this.nextPhase(phase, tech);
                seconds = 0;
                cycle = (phase === 'inhale') ? cycle + 1 : cycle;

                // Vibrate on phase change (subtle)
                this.trigger('BREATH_GUIDE');

                if (onPhaseChange) {
                    onPhaseChange({
                        phase,
                        cycle: cycle + 1,
                        totalCycles: tech.cycles,
                        technique: tech.name
                    });
                }

                // End session
                if (cycle >= tech.cycles) {
                    clearInterval(interval);
                    if (onPhaseChange) onPhaseChange({ done: true });
                }
            }
        }, 1000);

        return { interval, technique: tech };
    },

    getPhaseDuration(phase, tech) {
        switch (phase) {
            case 'inhale': return tech.inhale;
            case 'hold1': return tech.hold1 || 0;
            case 'exhale': return tech.exhale;
            case 'hold2': return tech.hold2 || 0;
            default: return 0;
        }
    },

    nextPhase(phase, tech) {
        const flow = ['inhale', 'hold1', 'exhale', 'hold2'];
        let idx = flow.indexOf(phase);
        while (idx < flow.length - 1) {
            idx++;
            const next = flow[idx];
            if (tech[next === 'hold1' ? 'hold1' : next === 'hold2' ? 'hold2' : next] > 0) {
                return next;
            }
        }
        return 'inhale';
    }
};

// === UI COMPONENT ===
function renderHapticBreathPanel(data) {
    const panel = document.getElementById('haptic-breath-panel');
    if (!panel) return;

    HapticBreathEngine.analyzeAndRecommend(data).then(rec => {
        panel.innerHTML = `
            <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div class="flex items-center gap-2 mb-3">
                    <span class="material-symbols-outlined text-neon">vibration</span>
                    <span class="text-[10px] font-black text-white uppercase">AI Bio-Recommendation</span>
                    <span class="text-[8px] px-2 py-0.5 rounded-full ${rec.urgency === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-neon/20 text-neon'}">${rec.urgency}</span>
                </div>
                
                <div class="mb-3">
                    <div class="text-[8px] text-white/40 uppercase mb-1">Haptic Pattern</div>
                    <div class="text-[12px] text-white font-bold">${rec.haptic?.name || 'None'}</div>
                    <div class="text-[10px] text-white/60">${rec.reason}</div>
                </div>

                <div class="mb-4">
                    <div class="text-[8px] text-white/40 uppercase mb-1">Breathing Technique</div>
                    <div class="text-[12px] text-primary font-bold">${rec.breath?.name || 'None'}</div>
                    <div class="text-[10px] text-white/60">${rec.breath?.description}</div>
                </div>

                <button onclick="HapticBreathEngine.trigger('${Object.keys(HapticBreathEngine.PATTERNS).find(k => HapticBreathEngine.PATTERNS[k] === rec.haptic)}')" 
                        class="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white hover:bg-neon hover:text-black transition-all">
                    <span class="material-symbols-outlined text-sm mr-1">vibration</span>
                    Test Haptic
                </button>

                <button onclick="startBreathSession('${Object.keys(HapticBreathEngine.TECHNIQUES).find(k => HapticBreathEngine.TECHNIQUES[k] === rec.breath)}')" 
                        class="w-full mt-2 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary hover:bg-primary hover:text-black transition-all">
                    <span class="material-symbols-outlined text-sm mr-1">air</span>
                    Iniciar Respiración
                </button>
            </div>
        `;
    });
}

function startBreathSession(techniqueKey) {
    const ui = {
        phaseEl: document.getElementById('breath-phase'),
        cycleEl: document.getElementById('breath-cycle')
    };

    HapticBreathEngine.startBreathSession(techniqueKey, (state) => {
        if (state.done) {
            if (ui.phaseEl) ui.phaseEl.textContent = 'COMPLETADO';
            if (ui.cycleEl) ui.cycleEl.textContent = '+30 NTK';
            triggerBioProtocol('breath_complete', 30, 'breath_session');
            return;
        }

        if (ui.phaseEl) ui.phaseEl.textContent = state.phase.toUpperCase();
        if (ui.cycleEl) ui.cycleEl.textContent = `Ciclo ${state.cycle}/${state.totalCycles}`;
    });
}

// === AUTO-TRIGGER ===
function checkAndTriggerHaptics() {
    const user = window.hb_userData;
    if (!user) return;

    HapticBreathEngine.analyzeAndRecommend({
        hrv: user.hrv,
        ntk: user.ntkBalance,
        lastActivityAt: user.lastActivityAt,
        focusActive: user.focusActive
    }).then(rec => {
        // Auto-trigger for high urgency only
        if (rec.urgency === 'high' && !sessionStorage.getItem(`hb_haptic_${rec.haptic.name}`)) {
            HapticBreathEngine.trigger(Object.keys(HapticBreathEngine.PATTERNS).find(k => 
                HapticBreathEngine.PATTERNS[k] === rec.haptic
            ));
            sessionStorage.setItem(`hb_haptic_${rec.haptic.name}`, Date.now());
        }
    });
}

// Export
window.HapticBreathEngine = HapticBreathEngine;
window.renderHapticBreathPanel = renderHapticBreathPanel;
window.checkAndTriggerHaptics = checkAndTriggerHaptics;