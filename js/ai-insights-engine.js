/**
 * HEALTHY + BRAIN - AI Insights Engine v3.0
 * Motor de automatización de datos biométricos y consejos personalizados
 * Integración con protocolos de longevidad para +40 (Based on David Sinclair, Matthew Walker, Gabrielle Lyon research)
 */

const AIInsightsEngine = {
    // Estado del usuario
    userProfile: {
        age: null,
        sex: null,
        weight: null,
        height: null,
        conditions: [],
        goals: [],
        cronotype: null, // matutino/vespertino
        lastUpdate: null
    },

    // Protocolos por edad (Based on Gabrielle Lyon, David Sinclair, Dr. Attia research)
    AGE_PROTOCOLS: {
        under30: {
            focus: 'growth',
            proteinPerKg: 2.0,
            proteinPerLb: 1.0,
            sleepTarget: 7.5,
            hrvTarget: 65,
            keySupplements: ['Creatina 5g', 'Vitamina D 2000IU', 'Omega-3 2g'],
            exerciseFocus: 'strength-hypertrophy',
            recoveryHours: 48,
            strengthLossPerDecade: null
        },
        '30-40': {
            focus: 'maintenance',
            proteinPerKg: 1.8,
            proteinPerLb: 0.9,
            sleepTarget: 7.5,
            hrvTarget: 60,
            keySupplements: ['Creatina 5g', 'Vitamina D 3000IU', 'Magnesio 400mg'],
            exerciseFocus: 'hypertrophy-power',
            recoveryHours: 48,
            strengthLossPerDecade: '5-8%'
        },
        '40-50': {
            focus: 'prevention',
            proteinPerKg: 1.8,
            proteinPerLb: 0.9,
            sleepTarget: 8,
            hrvTarget: 55,
            keySupplements: ['Creatina 3-5g', 'Vitamina D 4000IU', 'Magnesio 500mg', 'NMN 250mg', 'Omega-3 2g'],
            exerciseFocus: 'strength-maintenance',
            exerciseFrequency: '3-4x semana',
            recoveryHours: 72,
            strengthLossPerDecade: '8-10%',
            focusAreas: ['resistencia anabólica', 'densidad ósea', 'sensibilidad insulina'],
            criticalNotes: 'Prioridad: preservar masa muscular. Estimulos pequeños ya no activan mTOR efectivamente. 30-50g proteína por comida.'
        },
        '50-60': {
            focus: 'longevity',
            proteinPerKg: 1.6,
            proteinPerLb: 0.8,
            sleepTarget: 8,
            hrvTarget: 50,
            keySupplements: ['NMN 500mg', 'Resveratrol 500mg', 'Magnesio 600mg', 'Berberina 1000mg', 'Omega-3 3g', 'Urolitina A'],
            exerciseFocus: 'strength-low-impact',
            exerciseFrequency: '3-4x semana',
            recoveryHours: 72,
            focusAreas: ['senolíticos', 'autofagia', 'mitofagia'],
            criticalNotes: 'Incluir movimientos balísticos para reflejos. Eliminar células zombie (fisetin, quercetina).'
        },
        over60: {
            focus: 'reversal',
            proteinPerKg: 1.6,
            proteinPerLb: 0.8,
            sleepTarget: 8.5,
            hrvTarget: 45,
            keySupplements: ['NMN 500mg', 'Ca-AKG 1g', 'Resveratrol 500mg', 'Berberina 1000mg', 'Gluconato de Zinc 30mg', 'Fisetin', 'Quercetina'],
            exerciseFocus: 'mobility-strength',
            exerciseFrequency: '3-5x semana',
            recoveryHours: 96,
            focusAreas: ['reversión epigenética', 'autofagia profunda', 'proteostasis'],
            criticalNotes: 'Considerar ayuno 3 días para autofagia profunda. Factores Yamanaka para reiniciar células.'
        }
    },

    // Rangos biométricos óptimos (Based on longevity research)
    BIOMETRIC_RANGES: {
        hrv: { min: 45, max: 85, unit: 'ms', optimal: 60 },
        restingHR: { min: 50, max: 70, unit: 'bpm', optimal: 60 },
        sleepHours: { min: 7, max: 9, unit: 'hrs', optimal: 8 },
        steps: { min: 8000, max: 15000, unit: 'steps', optimal: 10000 },
        glucose: { min: 70, max: 100, unit: 'mg/dL', optimal: 85 },
        glucoseFasting: { min: 70, max: 100, optimal: 85 },
        bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 }, optimal: '120/80' },
        vo2Max: { min: 35, max: 60, unit: 'ml/kg/min', optimal: 45 },
        gripStrength: { men: { min: 40, max: 60 }, women: { min: 25, max: 40 }, unit: 'kg' },
        cholesterolLDL: { max: 100, optimal: 70, unit: 'mg/dL' },
        vitaminD: { min: 30, max: 60, optimal: 50, unit: 'ng/mL' }
    },

    // Protocolos de suplementación (Based on Dr. Sinclair, Dr. Attia)
    SUPPLEMENT_STACKS: {
        baseline: {
            name: 'Base',
            supplements: ['Vitamina D3 2000-4000IU', 'Omega-3 2g', 'Magnesio 400mg'],
            for: 'Todos'
        },
        longevity40: {
            name: 'Longevidad +40',
            supplements: ['Creatina 3-5g', 'NMN 250mg', 'Resveratrol 500mg', 'Omega-3 3g'],
            for: '40-50 años'
        },
        reversal: {
            name: 'Reversión',
            supplements: ['NMN 500mg', 'Ca-AKG 1g', 'Fisetin 100mg', 'Quercetina 500mg', 'Urolitina A 500mg'],
            for: '50+ años'
        }
    },

    // Biomarcadores críticos para biohacking
    CRITICAL_BIOMARKERS: {
        vo2Max: {
            name: 'VO2 Máximo',
            description: 'Capacidad cardiorrespiratoria - predictor #1 de longevidad',
            importance: 'critical'
        },
        hrv: {
            name: 'HRV',
            description: 'Variabilidad frecuencia cardíaca - recuperación y sistema nervioso autónomo',
            importance: 'critical'
        },
        gripStrength: {
            name: 'Fuerza de Agarre',
            description: ' biomarcador de fuerza sistémica - correlacionado con mortalidad y demencia',
            importance: 'high'
        },
        glucoseFasting: {
            name: 'Glucosa en Ayunas',
            description: 'Insulina 70-100 mg/dL - salud metabólica',
            importance: 'high'
        },
        epigeneticAge: {
            name: 'Edad Epigenética',
            description: 'Metilación ADN vs edad cronológica - medición de envejecimiento real',
            importance: 'advanced'
        }
    },

    // Inicializar con datos del usuario
    async init() {
        const saved = localStorage.getItem('hb_ai_profile');
        if (saved) {
            this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
        }
        this.save();
        return this.userProfile;
    },

    save() {
        this.userProfile.lastUpdate = new Date().toISOString();
        localStorage.setItem('hb_ai_profile', JSON.stringify(this.userProfile));
    },

    // Set cronotype (Based on Dr. Walker - MEQ)
    setCronotype(type) {
        this.userProfile.cronotype = type;
        this.save();
    },

    // Procesar screenshot de аналитики de salud
    async processHealthScreenshot(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = this.mockOCRAnalysis();
                this.updateProfileFromData(result);
                resolve(result);
            };
            reader.readAsDataURL(file);
        });
    },

    // Análisis simulado con datos realistas
    mockOCRAnalysis() {
        const mockData = {
            weight: Math.floor(Math.random() * 20) + 70,
            height: Math.floor(Math.random() * 30) + 160,
            hrv: Math.floor(Math.random() * 30) + 45,
            restingHR: Math.floor(Math.random() * 20) + 55,
            sleepHours: Math.floor(Math.random() * 2) + 6.5,
            steps: Math.floor(Math.random() * 5000) + 6000,
            glucose: Math.floor(Math.random() * 30) + 75,
            vo2Max: Math.floor(Math.random() * 20) + 30
        };
        return mockData;
    },

    // Actualizar perfil con datos extraídos
    updateProfileFromData(data) {
        if (data.weight) this.userProfile.weight = data.weight;
        if (data.height) this.userProfile.height = data.height;
        if (data.age) this.userProfile.age = data.age;
        if (data.sex) this.userProfile.sex = data.sex;
        this.save();
    },

    // Obtener protocolo según edad
    getProtocolByAge(age) {
        if (age < 30) return this.AGE_PROTOCOLS.under30;
        if (age < 40) return this.AGE_PROTOCOLS['30-40'];
        if (age < 50) return this.AGE_PROTOCOLS['40-50'];
        if (age < 60) return this.AGE_PROTOCOLS['50-60'];
        return this.AGE_PROTOCOLS.over60;
    },

    // Generar insights personalizados (Based on research)
    generateInsights(userData = {}) {
        const profile = { ...this.userProfile, ...userData };
        const age = profile.age || 40;
        const protocol = this.getProtocolByAge(age);

        const insights = {
            protocol: protocol,
            recommendations: [],
            alerts: [],
            exerciseTips: [],
            nutritionTips: [],
            biomarkers: [],
            warnings: []
        };

        // HRV Analysis
        if (profile.hrv) {
            if (profile.hrv < 40) {
                insights.alerts.push({
                    type: 'critical',
                    message: 'HRV muy bajo - sistema nervioso estresado',
                    action: 'Priorizar sueño, reducir estrés, evitar ejercicio intenso'
                });
            } else if (profile.hrv < this.BIOMETRIC_RANGES.hrv.min) {
                insights.warnings.push({
                    type: 'warning',
                    message: 'HRV por debajo del óptimo',
                    action: 'Aumentar sueño y reducir intensidad'
                });
            } else {
                insights.recommendations.push({
                    type: 'success',
                    message: 'HRV óptimo - buena recuperación'
                });
            }
        }

        // Protein analysis for +40
        if (age >= 40) {
            insights.nutritionTips.push({
                title: 'Resistencia Anabólica',
                description: 'A partir de 40, necesitas estímulos mayores para activar mTOR. Come 30-50g proteína por comida.',
                priority: 'high'
            });
            
            insights.nutritionTips.push({
                title: 'Cantidad diaria',
                description: `${profile.weight ? Math.round(profile.weight * protocol.proteinPerLb) : '1g'}g proteína por libra de peso corporal`,
                priority: 'high'
            });
        }

        // Sleep analysis (Dr. Walker protocols)
        if (profile.sleepHours) {
            if (profile.sleepHours < protocol.sleepTarget) {
                insights.alerts.push({
                    type: 'warning',
                    message: 'Sueño insuficiente',
                    action: `Dormir más ${protocol.sleepTarget - profile.sleepHours}h mejoraría tu recuperación y longevidad`
                });
            }
            
            insights.recommendations.push({
                type: 'sleep',
                message: 'QQR-T: Cantidad, Calidad, Regularidad y Timing',
                detail: 'La regularidad (+/- 30min) es más predictiva de mortalidad que la duración'
            });
        }

        // Exercise tips based on age
        insights.exerciseTips = this.getExerciseTips(age, profile);
        
        // Nutrition tips
        insights.nutritionTips = [...insights.nutritionTips, ...this.getNutritionTips(age, profile)];

        // Biomarker recommendations
        if (age >= 40) {
            insights.biomarkers = [
                { name: 'VO2 Máximo', reason: 'Predictor #1 de longevidad', action: 'Test de carrera o paso' },
                { name: 'Fuerza de Agarre', reason: 'Biomarcador de fuerza sistémica', action: 'Dynamómetro' },
                { name: 'HRV', reason: 'Sistema nervioso autónomo', action: 'Tracking diario' },
                { name: 'Glucosa Ayunas', reason: 'Salud metabólica', action: 'Medidor de glucosa' }
            ];
        }

        return insights;
    },

    getExerciseTips(age, profile) {
        const tips = [];
        
        if (age >= 40) {
            // Longevity focus (Based on Gabrielle Lyon)
            tips.push({
                title: 'Entrenamiento de Fuerza',
                description: '2-3 días/semana - Sentadillas, Peso Muerto, Press. Mantiene masa muscular y densidad ósea',
                sets: age < 50 ? '3-4 sets' : '3 sets',
                reps: age < 50 ? '8-12' : '8-10',
                rest: '90-120s'
            });

            // Power training (Dr. Attia)
            tips.push({
                title: 'Movimientos Balísticos',
                description: 'Kettlebells, saltos controlados - Mantiene reflejos y conexión neuromuscular',
                sets: '3-4',
                reps: '6-8',
                frequency: '2x semana'
            });

            tips.push({
                title: 'Cardio VO2 Max',
                description: 'Entrenamientos de alta intensidad para capacidad cardiorrespiratoria',
                duration: '20-30 min',
                frequency: '2x semana'
            });
        }

        if (age >= 50) {
            tips.push({
                title: 'Low Impact',
                description: 'Máquinas (prensa, hack squat) - menor riesgo de lesiones en tendones',
                focus: 'High Ground training'
            });

            tips.push({
                title: 'Movilidad + Core',
                description: '15 min diarios - prevenir dolor lumbar por encorvamiento',
                frequency: 'diario'
            });
        }

        // Everyone over 40
        tips.push({
            title: 'Caminata',
            description: 'Zona 2 cardio - 30-45 min diario o 5x semana',
            pace: age < 50 ? 'rápido' : 'moderado'
        });

        return tips;
    },

    getNutritionTips(age, profile) {
        const protocol = this.getProtocolByAge(age);
        const tips = [];

        // Protein ( Gabrielle Lyon)
        tips.push({
            macro: 'Proteína',
            amount: `${protocol.proteinPerLb}g por libra (${protocol.proteinPerKg}g/kg)`,
            detail: '30-50g por comida para activar mTOR',
            reason: 'Combatir resistencia anabólica'
        });

        // Fasting (Dr. Sinclair)
        if (age >= 40) {
            tips.push({
                title: 'Ayuno Intermitente',
                window: '16:8 o 18:6',
                reason: 'Activa autofagia y mejora sensibilidad a insulina',
                advanced: age >= 50 ? 'Considerar ayuno 3 días para autofagia profunda' : null
            });
        }

        // Anti-inflammatory (Dr. Attia)
        if (age >= 50) {
            tips.push({
                focus: 'Anti-inflamatorio',
                foods: ['Omega-3', 'Curcuma', 'Verduras crucíferas', 'Bayas', 'Fisetina'],
                reason: 'Combatir inflammaging - inflamación crónica del envejecimiento'
            });
        }

        // Senolytics
        if (age >= 50) {
            tips.push({
                title: 'Senolíticos',
                compounds: ['Fisetina', 'Quercetina'],
                reason: 'Eliminar células zombie que causan inflamación sistémica'
            });
        }

        return tips;
    },

    // Calcular métricas de edad biológica
    calculateMetrics(inputData) {
        const age = this.userProfile.age || 40;
        const hrv = inputData.hrv || 55;
        const sleep = inputData.sleepHours || 7;
        
        const metrics = {
            chronologicalAge: age,
            biologicalAge: this.estimateBiologicalAge(inputData),
            metabolicAge: this.estimateMetabolicAge(inputData),
            epigeneticAge: this.estimateEpigeneticAge(inputData),
            fitnessScore: this.calculateFitnessScore(inputData),
            recoveryScore: this.calculateRecoveryScore(inputData),
            longevityScore: this.calculateLongevityScore(inputData),
            recommendations: []
        };

        // Add recommendations based on gaps
        if (metrics.biologicalAge > age + 5) {
            metrics.recommendations.push({
                priority: 'high',
                action: 'Priorizar sueño, nutrición y reducir estrés para revertir edad biológica'
            });
        }

        if (metrics.longevityScore < 70) {
            metrics.recommendations.push({
                priority: 'medium',
                action: 'Incrementar VO2 max y fuerza de agarre'
            });
        }

        return metrics;
    },

    estimateBiologicalAge(data) {
        const baseAge = this.userProfile.age || 40;
        const hrv = data.hrv || 55;
        const sleep = data.sleepHours || 7;
        
        let adjustment = 0;
        
        // HRV impact
        if (hrv < 35) adjustment += 8;
        else if (hrv < 45) adjustment += 4;
        else if (hrv > 65) adjustment -= 3;
        
        // Sleep impact
        if (sleep < 6) adjustment += 3;
        else if (sleep >= 8) adjustment -= 2;
        
        // Exercise data
        if (data.steps > 10000) adjustment -= 2;
        if (data.vo2Max > 45) adjustment -= 4;
        
        return Math.max(18, Math.min(80, baseAge + adjustment));
    },

    estimateMetabolicAge(data) {
        const baseAge = this.userProfile.age || 40;
        const glucose = data.glucose || 85;
        const hrv = data.hrv || 55;
        
        let adjustment = 0;
        
        if (glucose > 100) adjustment += 5;
        else if (glucose < 90) adjustment -= 2;
        
        if (hrv < 40) adjustment += 3;
        
        return Math.max(18, Math.min(80, baseAge + adjustment));
    },

    estimateEpigeneticAge(data) {
        // Simplified estimation based on lifestyle factors
        const baseAge = this.userProfile.age || 40;
        const hrv = data.hrv || 55;
        const sleep = data.sleepHours || 7;
        
        let adjustment = 0;
        
        // Based on Dr. Sinclair's research on epigenetic aging
        if (hrv > 60) adjustment -= 5;
        if (sleep >= 8) adjustment -= 3;
        
        // Would need actual DNA methylation test for real measurement
        return Math.max(18, Math.min(80, baseAge + adjustment + Math.floor(Math.random() * 3 - 1)));
    },

    calculateFitnessScore(data) {
        let score = 50;
        
        if (data.steps >= 8000) score += 15;
        if (data.steps >= 10000) score += 5;
        
        if (data.sleepHours >= 7.5) score += 15;
        if (data.sleepHours >= 8) score += 5;
        
        if (data.hrv >= 55) score += 15;
        
        if (data.vo2Max) {
            if (data.vo2Max >= 45) score += 10;
            if (data.vo2Max >= 50) score += 5;
        }
        
        return Math.min(100, score);
    },

    calculateRecoveryScore(data) {
        const hrv = data.hrv || 50;
        const sleep = data.sleepHours || 7;
        
        const hrvScore = Math.max(0, Math.min(50, (hrv - 30) / 50 * 50));
        const sleepScore = Math.max(0, Math.min(50, (sleep / 9) * 50));
        
        return Math.round(hrvScore + sleepScore);
    },

    calculateLongevityScore(data) {
        let score = 40;
        
        // HRV - critical marker
        if (data.hrv >= 55) score += 20;
        else if (data.hrv >= 45) score += 10;
        
        // Sleep - Dr. Walker protocols
        if (data.sleepHours >= 8) score += 15;
        else if (data.sleepHours >= 7) score += 10;
        
        // Exercise
        if (data.steps >= 10000) score += 10;
        if (data.steps >= 8000) score += 5;
        
        // VO2 Max - #1 predictor
        if (data.vo2Max >= 45) score += 15;
        
        return Math.min(100, score);
    },

    // Get supplement stack recommendation
    getSupplementStack(age) {
        if (age >= 60) return this.SUPPLEMENT_STACKS.reversal;
        if (age >= 40) return this.SUPPLEMENT_STACKS.longevity40;
        return this.SUPPLEMENT_STACKS.baseline;
    }
};

if (typeof window !== 'undefined') {
    window.AIInsightsEngine = AIInsightsEngine;
}