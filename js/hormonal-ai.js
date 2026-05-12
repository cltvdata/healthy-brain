/**
 * HEALTHY + BRAIN - Hormonal AI Analysis Service
 * Analyzes hormonal data and menstrual cycle for female users
 */

// Get bio profile
const getBioProfile = () => window.BioProfile || null;

// AI Analysis for Hormonal Health
const HormonalAI = {
    // Analyze hormonal profile for women
    async analyzeHormonalHealth() {
        const profile = getBioProfile();
        if (!profile) return null;

        const bio = profile.profile;
        
        // Only analyze for female users with menstrual cycle
        if (bio.sex !== 'female' || !bio.menstrualCycle) {
            return null;
        }

        const phase = profile.getMenstrualPhase();
        const recommendations = profile.getPersonalizedRecommendations();
        
        // Get user's recent biometric data
        const hrvData = await this.getRecentHRVData();
        const sleepData = await this.getRecentSleepData();

        // AI Analysis generation
        const analysis = this.generateAnalysis(phase, bio, hrvData, sleepData, recommendations);
        
        return analysis;
    },

    // Get recent HRV data
    async getRecentHRVData() {
        try {
            const user = window.hb_auth?.currentUser;
            if (!user) return null;
            
            const snapshot = await window.hb_db.collection('users').doc(user.uid)
                .collection('metrics')
                .orderBy('date', 'desc')
                .limit(7)
                .get();
            
            const data = snapshot.docs.map(d => d.data());
            const avgHRV = data.reduce((sum, d) => sum + (d.hrv || 0), 0) / (data.length || 1);
            
            return { avg: avgHRV, data: data };
        } catch (e) {
            return null;
        }
    },

    // Get recent sleep data
    async getRecentSleepData() {
        try {
            const user = window.hb_auth?.currentUser;
            if (!user) return null;
            
            const snapshot = await window.hb_db.collection('users').doc(user.uid)
                .collection('metrics')
                .orderBy('date', 'desc')
                .limit(7)
                .get();
            
            const data = snapshot.docs.map(d => d.data());
            const avgSleep = data.reduce((sum, d) => sum + (d.sleepScore || 0), 0) / (data.length || 1);
            
            return { avg: avgSleep, data: data };
        } catch (e) {
            return null;
        }
    },

    // Generate AI analysis based on phase and biometrics
    generateAnalysis(phase, bio, hrvData, sleepData, recommendations) {
        const phaseName = phase?.name || 'No configurado';
        const cycleDay = bio.cycleDay || 1;
        
        let insights = [];
        let recommendationsList = [];
        let hormonalStatus = 'balanced';

        // Phase-specific analysis
        switch (phase?.key) {
            case 'MENSTRUAL':
                insights = [
                    `Día ${cycleDay}: Fase menstrual - tu cuerpo prioriza descanso y regeneración.`,
                    hrvData?.avg < 50 ? '⚠️ HRV bajo detectado - aumenta descanso hoy.' : '✅ HRV óptimo para recuperación.',
                    'El estrógeno y progesterona están en mínimos - prioriza sueño y nutrición rica en hierro.'
                ];
                recommendationsList = [
                    'Descanso activo: caminatas suaves only',
                    'Hierro + Vit C: espinacas, legumbres',
                    '8+ horas de sueño',
                    'Evitar ejercicios intensos'
                ];
                hormonalStatus = hrvData?.avg < 50 ? 'stressed' : 'recovering';
                break;

            case 'FOLLICULAR':
                insights = [
                    `Día ${cycleDay}: Fase folicular - tu energía asciende y la motivación aumenta.`,
                    sleepData?.avg > 75 ? '✅ Calidad de sueño excelente - listo para desafíos.' : '💡 Recupera tu sueño para máximo rendimiento.',
                    'Estrógenos subiendo - óptimo para trabajo intelectual intenso y ejercicios de fuerza.'
                ];
                recommendationsList = [
                    'Alta intensidad: entrenamiento de fuerza',
                    'Nuevos proyectos y desafíos cognitivos',
                    'Carbohidratos complejos para energía',
                    'Proteína: 1.8g/kg'
                ];
                hormonalStatus = 'rising';
                break;

            case 'OVULATORY':
                insights = [
                    `Día ${cycleDay}: Ovulación - pico de energía y fertilidad.`,
                    'Fertilidad peak - ideal para decisiones importantes y conversaciones difíciles.',
                    'Testosterona también elevada - maximize productividad.'
                ];
                recommendationsList = [
                    'Día de mayor capacidad - tareas importantes',
                    'Entrenamiento intenso permitido',
                    'Mantener hidratación extrema',
                    'Socializar y networking'
                ];
                hormonalStatus = 'peak';
                break;

            case 'LUTEAL':
                insights = [
                    `Día ${cycleDay}: Fase lútea - energía decrece, prepárate para el ciclo.`,
                    bio.hormones?.estrogen === 'declining' ? '⚠️ Estrógenos bajando - más propensa a ansiedad.' : '✅ Transición estable.',
                    'Progesterona subiendo - posible retención de líquidos y cambios de humor.'
                ];
                recommendationsList = [
                    'Reducir intensidad gradualmente',
                    'Magnesio: 400mg para retención agua',
                    'Evitar azúcares y cafeína excesivo',
                    'Meditación y reduce stress'
                ];
                hormonalStatus = 'declining';
                break;
        }

        // Add HRV-based insights
        if (hrvData?.avg) {
            if (hrvData.avg > 60) {
                insights.push('🎯 HRV excellent: Sistema nervioso optimizado para esta fase del ciclo.');
            } else if (hrvData.avg < 45) {
                insights.push('⚠️ HRV bajo: Tu cuerpo signaling necesita más recovery. Ajusta intensidad.');
            }
        }

        return {
            phase: phaseName,
            cycleDay: cycleDay,
            status: hormonalStatus,
            insights: insights,
            recommendations: recommendationsList,
            supplements: recommendations?.supplements || [],
            nextPhase: this.getNextPhase(phase?.key),
            timestamp: new Date().toISOString()
        };
    },

    // Get next phase name
    getNextPhase(currentPhase) {
        const phases = {
            'MENSTRUAL': 'Fase Folicular (Días 6-13)',
            'FOLLICULAR': 'Ovulación (Días 14-16)',
            'OVULATORY': 'Fase Lútea (Días 17-28)',
            'LUTEAL': 'Menstruación (Días 1-5)'
        };
        return phases[currentPhase] || 'Ciclo completado';
    },

    // Save analysis to history
    async saveAnalysis(analysis) {
        if (!analysis) return false;
        
        try {
            const user = window.hb_auth?.currentUser;
            if (!user) return false;
            
            await window.hb_db.collection('users').doc(user.uid)
                .collection('hormonal_analysis').add({
                    ...analysis,
                    timestamp: window.firebase?.firestore?.FieldValue?.serverTimestamp() || new Date()
                });
            return true;
        } catch (e) {
            console.error('[HormonalAI] Save error:', e);
            return false;
        }
    },

    // Get analysis history
    async getAnalysisHistory(limit = 5) {
        try {
            const user = window.hb_auth?.currentUser;
            if (!user) return [];
            
            const snapshot = await window.hb_db.collection('users').doc(user.uid)
                .collection('hormonal_analysis')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            return [];
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.HormonalAI = HormonalAI;
}