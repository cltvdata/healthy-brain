/**
 * HEALTHY + BRAIN - Bio-Validator Module (Fase 43)
 * Validación de rangos fisiológicos para datos biométricos
 */

const BioValidator = {
    // Rangos fisiológicos validos
    RANGES: {
        GLUCOSE: { min: 70, max: 250, unit: 'mg/dL', label: 'Glucosa' },
        HRV: { min: 20, max: 200, unit: 'ms', label: 'HRV' },
        HEART_RATE: { min: 40, max: 220, unit: 'bpm', label: 'Frecuencia cardíaca' },
        BLOOD_PRESSURE_SYS: { min: 80, max: 180, unit: 'mmHg', label: 'Presión sistólica' },
        BLOOD_PRESSURE_DIA: { min: 50, max: 120, unit: 'mmHg', label: 'Presión diastólica' },
        WEIGHT: { min: 30, max: 300, unit: 'kg', label: 'Peso' },
        HEIGHT: { min: 100, max: 220, unit: 'cm', label: 'Altura' },
        BODY_FAT: { min: 3, max: 60, unit: '%', label: 'Grasa corporal' },
        SLEEP_HOURS: { min: 0, max: 16, unit: 'h', label: 'Horas de sueño' },
        STEPS: { min: 0, max: 50000, unit: 'pasos', label: 'Pasos' },
        TEMPERATURE: { min: 35, max: 42, unit: '°C', label: 'Temperatura' },
        OXYGEN_SAT: { min: 90, max: 100, unit: '%', label: 'SpO2' },
        CORTISOL: { min: 5, max: 25, unit: 'ug/dL', label: 'Cortisol' }
    },

    // Validar un valor específico
    validate(key, value) {
        const range = this.RANGES[key];
        if (!range) {
            return { valid: false, error: `Parámetro desconocido: ${key}` };
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return { valid: false, error: `${range.label} debe ser un número` };
        }

        if (numValue < range.min || numValue > range.max) {
            return { 
                valid: false, 
                error: `${range.label} fuera de rango: ${numValue} ${range.unit} (normal: ${range.min}-${range.max} ${range.unit})`,
                value: numValue,
                min: range.min,
                max: range.max,
                unit: range.unit
            };
        }

        return { valid: true, value: numValue, range: range };
    },

    // Validar objeto completo de datos biométricos
    validateBiometrics(data) {
        const results = {};
        const errors = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null && value !== '') {
                const result = this.validate(key, value);
                results[key] = result;
                if (!result.valid && result.error) {
                    errors.push(result.error);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            results: results
        };
    },

    // Formatear valor con color según estado
    formatWithStatus(key, value) {
        const range = this.RANGES[key];
        if (!range) return { html: value, status: 'unknown' };

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return { html: value, status: 'invalid' };

        if (numValue < range.min || numValue > range.max) {
            return { 
                html: `<span class="text-red-400 font-bold">${value}</span>`, 
                status: 'danger' 
            };
        }

        // Estado óptimo (rango medio)
        const optimalMin = range.min + (range.max - range.min) * 0.3;
        const optimalMax = range.min + (range.max - range.min) * 0.7;

        if (numValue >= optimalMin && numValue <= optimalMax) {
            return { 
                html: `<span class="text-neon font-bold">${value}</span>`, 
                status: 'optimal' 
            };
        }

        return { html: value, status: 'normal' };
    },

    // Generar toast de advertencia
    showValidationWarning(error) {
        if (window.showToast) {
            window.showToast(`⚠️ ${error}`);
        }
    }
};

// Auto-export
if (typeof window !== 'undefined') {
    window.BioValidator = BioValidator;
}