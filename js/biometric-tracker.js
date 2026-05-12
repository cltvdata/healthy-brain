/**
 * HEALTHY + BRAIN - Biometric Tracker
 * Sistema de seguimiento de biométricos críticos para longevidad
 */

const BiometricTracker = {
    // Historial de mediciones
    history: [],
    
    // Biométricos a rastrear
    metrics: {
        hrv: { name: 'HRV', unit: 'ms', icon: 'favorite', min: 45, max: 85, optimal: 60 },
        restingHR: { name: 'FC Reposo', unit: 'bpm', icon: 'monitor_heart', min: 50, max: 70, optimal: 60 },
        sleepHours: { name: 'Horas Sueño', unit: 'hrs', icon: 'bedtime', min: 7, max: 9, optimal: 8 },
        sleepQuality: { name: 'Calidad Sueño', unit: '%', icon: 'hotel', min: 70, max: 100, optimal: 90 },
        steps: { name: 'Pasos', unit: '', icon: 'directions_walk', min: 8000, max: 15000, optimal: 10000 },
        vo2Max: { name: 'VO2 Max', unit: 'ml/kg/min', icon: 'fitness_center', min: 35, max: 60, optimal: 45 },
        gripStrength: { name: 'Fuerza Agarre', unit: 'kg', icon: 'back_hand', min: 40, max: 60, optimal: 50 },
        glucose: { name: 'Glucosa', unit: 'mg/dL', icon: 'water_drop', min: 70, max: 100, optimal: 85 },
        weight: { name: 'Peso', unit: 'kg', icon: 'scale', min: 0, max: 0, optimal: 0 },
        bodyFat: { name: '% Grasa', unit: '%', icon: 'percent', min: 10, max: 25, optimal: 15 },
        bloodPressureSys: { name: 'PA Sistólica', unit: 'mmHg', icon: 'speed', min: 90, max: 120, optimal: 110 },
        bloodPressureDia: { name: 'PA Diastólica', unit: 'mmHg', icon: 'speed', min: 60, max: 80, optimal: 70 },
        temperature: { name: 'Temperatura', unit: '°C', icon: 'thermostat', min: 36.1, max: 37.2, optimal: 36.6 },
        spo2: { name: 'SpO2', unit: '%', icon: 'air', min: 95, max: 100, optimal: 98 }
    },

    // Inicializar
    async init() {
        const saved = localStorage.getItem('hb_biometric_history');
        if (saved) {
            this.history = JSON.parse(saved);
        }
        return this.history;
    },

    // Guardar medición
    async addMetric(metricType, value, notes = '') {
        const entry = {
            type: metricType,
            value: parseFloat(value),
            timestamp: new Date().toISOString(),
            notes: notes
        };
        
        this.history.push(entry);
        this.save();
        
        return entry;
    },

    // Guardar múltiples métricas
    async addBatch(metrics) {
        const timestamp = new Date().toISOString();
        const entries = metrics.map(m => ({
            type: m.type,
            value: parseFloat(m.value),
            timestamp: timestamp,
            notes: m.notes || ''
        }));
        
        this.history.push(...entries);
        this.save();
        
        return entries;
    },

    save() {
        localStorage.setItem('hb_biometric_history', JSON.stringify(this.history));
    },

    // Obtener métricas del último período
    getRecentMetrics(days = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        return this.history.filter(entry => new Date(entry.timestamp) >= cutoff);
    },

    // Obtener promedio de una métrica
    getAverage(metricType, days = 7) {
        const recent = this.getRecentMetrics(days).filter(e => e.type === metricType);
        if (recent.length === 0) return null;
        
        const sum = recent.reduce((acc, e) => acc + e.value, 0);
        return Math.round(sum / recent.length);
    },

    // Obtener tendencia
    getTrend(metricType, days = 30) {
        const recent = this.history
            .filter(e => e.type === metricType)
            .slice(-days);
        
        if (recent.length < 3) return 'insufficient_data';
        
        const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
        const secondHalf = recent.slice(Math.floor(recent.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (change > 5) return 'improving';
        if (change < -5) return 'declining';
        return 'stable';
    },

    // Obtener dashboard de estado
    getDashboard() {
        const metrics = ['hrv', 'restingHR', 'sleepHours', 'steps'];
        const dashboard = {};
        
        metrics.forEach(m => {
            const avg = this.getAverage(m, 7);
            const config = this.metrics[m];
            const trend = this.getTrend(m, 14);
            
            let status = 'normal';
            if (avg !== null) {
                if (avg < config.min) status = 'low';
                else if (avg > config.max) status = 'high';
                else status = 'optimal';
            }
            
            dashboard[m] = {
                value: avg,
                status: status,
                trend: trend,
                config: config
            };
        });
        
        return dashboard;
    },

    // Calcular scores compuestos
    getCompositeScores() {
        const hrv = this.getAverage('hrv', 7);
        const sleep = this.getAverage('sleepHours', 7);
        const steps = this.getAverage('steps', 7);
        
        // Recovery Score
        let recoveryScore = 0;
        if (hrv) recoveryScore += Math.min(40, (hrv / 60) * 40);
        if (sleep) recoveryScore += Math.min(30, (sleep / 8) * 30);
        if (steps) recoveryScore += Math.min(30, (steps / 10000) * 30);
        
        // Longevity Score
        let longevityScore = 0;
        if (hrv) longevityScore += hrv > 55 ? 25 : 15;
        if (sleep) longevityScore += sleep >= 8 ? 25 : 15;
        if (steps) longevityScore += steps >= 10000 ? 25 : steps >= 8000 ? 15 : 5;
        
        return {
            recovery: Math.round(recoveryScore),
            longevity: Math.round(longevityScore)
        };
    },

    // Generar insights basados en tendencias
    generateInsights() {
        const insights = [];
        const hrv = this.getAverage('hrv', 7);
        const sleep = this.getAverage('sleepHours', 7);
        const steps = this.getAverage('steps', 7);
        
        // HRV insights
        if (hrv && hrv < 40) {
            insights.push({
                type: 'critical',
                message: 'HRV muy bajo - riesgo de sobreentrenamiento o estrés',
                action: 'Reducir intensidad, priorizar sueño'
            });
        } else if (hrv && this.getTrend('hrv') === 'declining') {
            insights.push({
                type: 'warning',
                message: 'HRV en descenso - monitorear más de cerca',
                action: 'Revisar recuperación y estrés'
            });
        }
        
        // Sleep insights
        if (sleep && sleep < 7) {
            insights.push({
                type: 'warning',
                message: 'Sueño insuficiente detected',
                action: 'Priorizar higiene del sueño - regularidad más importante que duración'
            });
        }
        
        // Activity insights
        if (steps && steps < 5000) {
            insights.push({
                type: 'warning',
                message: 'Bajo nivel de actividad',
                action: 'Incrementar pasos diarios gradualmente'
            });
        }
        
        return insights;
    },

    // Exportar datos
    exportData(format = 'json') {
        if (format === 'csv') {
            const headers = 'tipo,valor,fecha,notas\n';
            const rows = this.history.map(e => 
                `${e.type},${e.value},${e.timestamp},${e.notes || ''}`
            ).join('\n');
            return headers + rows;
        }
        
        return JSON.stringify(this.history, null, 2);
    }
};

if (typeof window !== 'undefined') {
    window.BiometricTracker = BiometricTracker;
}