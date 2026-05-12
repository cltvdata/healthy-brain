/**
 * HEALTHY + BRAIN - Bio-Profile & Personalization Engine (Fase 45)
 * Sistema de personalización basado en sexo, edad y ciclo hormonal
 */

const BioProfile = {
    // Datos del perfil del usuario
    profile: {
        sex: null,           // 'male' | 'female' | 'other'
        age: null,           // años
        menstrualCycle: false, // true si es mujer menstruando
        cycleDay: 1,          // Día del ciclo (1-28)
        menopause: false,    // true si está en menopausia
        hormones: {
            testosterone: 'normal',
            estrogen: 'normal',
            cortisol: 'normal'
        }
    },

    // Rangos normales por sexo y edad
    NORMALS: {
        male: {
            hrv: { min: 55, max: 85 },
            testosterone: { min: 300, max: 1000, unit: 'ng/dL' },
            cortisol: { min: 6, max: 23, unit: 'ug/dL' },
            sleepHours: { min: 7, max: 9 },
            proteinPerKg: 2.0, // g/kg
            muscleGain: true
        },
        female: {
            hrv: { min: 45, max: 75 },
            estrogen: { min: 30, max: 400, unit: 'pg/mL' },
            cortisol: { min: 5, max: 25, unit: 'ug/dL' },
            sleepHours: { min: 7, max: 9 },
            proteinPerKg: 1.6, // g/kg
            muscleGain: false
        }
    },

    // Ciclo menstrual - fases
    MENSTRUAL_PHASES: {
        MENSTRUAL: { day: [1, 5], name: 'Menstrual', color: '#ff006e' },
        FOLLICULAR: { day: [6, 13], name: 'Folicular', color: '#00fff7' },
        OVULATORY: { day: [14, 16], name: 'Ovulatoria', color: '#ff8a00' },
        LUTEAL: { day: [17, 28], name: 'Lútea', color: '#7b2cbf' }
    },

    // Inicializar perfil desde Firestore o localStorage
    async init() {
        // Cargar desde localStorage
        const saved = localStorage.getItem('hb_bio_profile');
        if (saved) {
            this.profile = { ...this.profile, ...JSON.parse(saved) };
        }

        // Si hay usuario logueado, cargar desde Firestore
        const user = window.hb_auth?.currentUser;
        if (user) {
            try {
                const doc = await window.hb_db.collection('users').doc(user.uid).get();
                const data = doc.data();
                if (data?.bioProfile) {
                    this.profile = { ...this.profile, ...data.bioProfile };
                }
            } catch (e) {
                console.log('[BioProfile] Using local data');
            }
        }

        this.save();
        return this.profile;
    },

    // Guardar perfil
    save() {
        localStorage.setItem('hb_bio_profile', JSON.stringify(this.profile));
        
        // También guardar en Firestore si hay usuario
        const user = window.hb_auth?.currentUser;
        if (user) {
            window.hb_db.collection('users').doc(user.uid).set({ bioProfile: this.profile }, { merge: true }).catch(() => {});
        }
    },

    // Establecer sexo
    setSex(sex) {
        this.profile.sex = sex;
        this.save();
    },

    // Establecer edad
    setAge(age) {
        this.profile.age = age;
        
        // Ajustar normas según edad
        if (age < 30) {
            this.profile.hormones.testosterone = 'high';
            this.profile.hormones.estrogen = 'high';
        } else if (age < 50) {
            this.profile.hormones.testosterone = 'normal';
            this.profile.hormones.estrogen = 'normal';
        } else {
            this.profile.hormones.testosterone = 'low';
            this.profile.hormones.estrogen = this.profile.sex === 'female' ? (this.profile.menopause ? 'low' : 'declining') : 'normal';
        }
        
        this.save();
    },

    // Establecer día del ciclo menstrual
    setMenstrualCycle(day, isActive = true) {
        this.profile.menstrualCycle = isActive;
        this.profile.cycleDay = day;
        this.save();
    },

    // Obtener fase actual del ciclo
    getMenstrualPhase() {
        if (!this.profile.menstrualCycle || this.profile.sex !== 'female') return null;
        
        const day = this.profile.cycleDay;
        for (const [key, phase] of Object.entries(this.MENSTRUAL_PHASES)) {
            if (day >= phase.day[0] && day <= phase.day[1]) {
                return { key, ...phase };
            }
        }
        return null;
    },

    // Obtener recomendaciones personalizadas
    getPersonalizedRecommendations(data = {}) {
        const { sex, age, hrv, cycleDay, menstrualCycle } = { ...this.profile, ...data };
        
        const recommendations = {
            nutrition: {},
            exercise: {},
            sleep: {},
            hormones: {},
            supplements: []
        };

        // Ajuste por sexo
        if (sex === 'male') {
            recommendations.nutrition = {
                proteinPerKg: 2.0,
                caloriesSurplus: 300, // para músculo
                carbsTiming: 'post-workout',
                fat: 'low' // testosterona alta puede usar más grasa
            };
            recommendations.exercise = {
                strengthFocus: 'heavy',
                restDays: 48, // horas
                cardio: 'zone 2'
            };
            recommendations.sleep = {
                minHours: 8,
                recoveryFocus: true
            };
            recommendations.hormones = {
                focus: 'testosterone',
                avoid: ['soy', 'alcohol excess']
            };
            recommendations.supplements = [
                { name: 'Creatina', dose: '5g', reason: 'Fuerza y cognición' },
                { name: 'Zinc', dose: '30mg', reason: 'Testosterona' },
                { name: 'Vitamina D', dose: '4000IU', reason: 'Testosterona' }
            ];
        } else if (sex === 'female') {
            // Ajuste por fase del ciclo
            const phase = this.getMenstrualPhase();
            
            if (phase?.key === 'MENSTRUAL') {
                recommendations.nutrition = {
                    proteinPerKg: 1.8,
                    iron: true,
                    carbs: 'normal',
                    focus: 'recuperación'
                };
                recommendations.exercise = {
                    intensity: 'low',
                    focus: 'mobility',
                    avoid: 'high-intensity'
                };
            } else if (phase?.key === 'FOLLICULAR') {
                recommendations.nutrition = {
                    proteinPerKg: 1.6,
                    carbs: 'higher', // más energía disponible
                    focus: 'building'
                };
                recommendations.exercise = {
                    intensity: 'high',
                    focus: 'strength',
                    greatFor: 'new PRs'
                };
            } else if (phase?.key === 'OVULATORY') {
                recommendations.nutrition = {
                    proteinPerKg: 1.8,
                    carbs: 'moderate',
                    focus: 'maintenance'
                };
                recommendations.exercise = {
                    intensity: 'moderate-high',
                    focus: 'mixed'
                };
            } else if (phase?.key === 'LUTEAL') {
                recommendations.nutrition = {
                    proteinPerKg: 1.6,
                    magnesium: true,
                    carbs: 'comfort', // cuerpos sensibles
                    avoid: 'sugar spikes'
                };
                recommendations.exercise = {
                    intensity: 'moderate',
                    focus: 'endurance'
                };
            }

            // Suplementos para mujeres
            recommendations.supplements = [
                { name: 'Hierro', dose: '18mg', reason: 'Si menstruando' },
                { name: 'Magnesio', dose: '400mg', reason: 'Ciclo menstrual' },
                { name: 'Omega-3', dose: '2g', reason: 'Hormonas' },
                { name: 'Vitamina D', dose: '2000IU', reason: 'Estrógenos' }
            ];
        }

        // Ajuste por edad
        if (age) {
            if (age < 25) {
                recommendations.hormones.focus = 'growth';
                recommendations.supplements.push({ name: 'Colina', dose: '550mg', reason: 'Desarrollo cerebral' });
            } else if (age < 40) {
                recommendations.hormones.focus = 'maintenance';
            } else if (age < 60) {
                recommendations.hormones.focus = 'prevention';
                recommendations.supplements.push({ name: 'NMN', dose: '250mg', reason: 'NAD+ aging' });
                recommendations.supplements.push({ name: 'Resveratrol', dose: '500mg', reason: 'Longevidad' });
            } else {
                recommendations.hormones.focus = 'longevity';
                recommendations.supplements.push({ name: 'NMN', dose: '500mg', reason: 'NAD+' });
                recommendations.supplements.push({ name: 'Ca-AKG', dose: '1g', reason: 'Autofagia' });
                recommendations.supplements.push({ name: 'Berberina', dose: '1000mg', reason: 'Metabolismo' });
            }
        }

        // Ajuste por HRV
        if (hrv) {
            if (hrv < 45) {
                recommendations.sleep.minHours = 9;
                recommendations.exercise.intensity = 'low';
                recommendations.nutrition.recovery = true;
            }
        }

        return recommendations;
    },

    // Texto personalizado según sexo
    getGenderedText(femaleText, maleText) {
        return this.profile.sex === 'female' ? femaleText : maleText;
    },

    // Mostrar fase menstrual actual (para UI)
    getCycleStatus() {
        const phase = this.getMenstrualPhase();
        if (!phase) return { active: false, text: 'No configurado' };
        
        return {
            active: true,
            phase: phase.name,
            color: phase.color,
            day: this.profile.cycleDay,
            tip: this.getPhaseTip(phase.key)
        };
    },

    getPhaseTip(phaseKey) {
        const tips = {
            MENSTRUAL: 'Descansa. Tu cuerpo necesita recuperación.',
            FOLLICULAR: 'Tu momento más energético. ¡Aprovecha!',
            OVULATORY: 'Fertilidad peak. Ejecuta tus metas importantes.',
            LUTEAL: 'Enfoque interno. Evita conflictos.'
        };
        return tips[phaseKey] || '';
    }
};

// Exportar
if (typeof window !== 'undefined') {
    window.BioProfile = BioProfile;
}