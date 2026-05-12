/**
 * HEALTHY + BRAIN - AI Exercise Coach
 * Sistema de guía de ejercicios con análisis en tiempo real
 * Basado en protocolos de longevidad para +40
 */

const AIExerciseCoach = {
    // Videos de ejercicios con instrucciones
    EXERCISE_LIBRARY: {
        squat: {
            name: 'Sentadilla',
            muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'],
            difficulty: 'intermediate',
            ageAdjustments: {
                under40: { sets: 4, reps: '8-12', rest: '90s' },
                '40-50': { sets: 3, reps: '10-12', rest: '120s' },
                over50: { sets: 3, reps: '8-10', rest: '120s' }
            },
            tips: [
                'Mantén el pecho erguido',
                'Las rodillas no pasen los toes',
                'Baja hasta paralelo o debajo',
                'Explota desde el talón'
            ],
            formCues: ['Espalda recta', 'Core activado', 'Rodillas afuera']
        },
        deadlift: {
            name: 'Peso Muerto',
            muscleGroups: ['Espalda', 'Glúteos', 'Isquiotibiales'],
            difficulty: 'advanced',
            ageAdjustments: {
                under40: { sets: 4, reps: '6-8', rest: '120s' },
                '40-50': { sets: 3, reps: '8-10', rest: '150s' },
                over50: { sets: 3, reps: '6-8', rest: '150s' }
            },
            tips: [
                'Barra pegada a las piernas',
                'Mantén la espalda neutra',
                'No redondear la lumbar',
                'Empuja con los talones'
            ],
            formCues: ['Barra cerca', 'Core braced', 'Hombros atrás']
        },
        pushup: {
            name: 'Flexiones',
            muscleGroups: ['Pecho', 'Tríceps', 'Hombros'],
            difficulty: 'beginner',
            ageAdjustments: {
                under40: { sets: 4, reps: '15-20', rest: '60s' },
                '40-50': { sets: 3, reps: '12-15', rest: '90s' },
                over50: { sets: 3, reps: '8-12', rest: '90s' }
            },
            tips: [
                'Cuerpo en línea recta',
                'Codos a 45 grados',
                'Baja controlado',
                'Explota hacia arriba'
            ],
            formCues: ['Core tight', 'No hips sag', 'Full range']
        },
        plank: {
            name: 'Plancha',
            muscleGroups: ['Core', 'Hombros', 'Espalda'],
            difficulty: 'beginner',
            ageAdjustments: {
                under40: { sets: 3, time: '60s', rest: '45s' },
                '40-50': { sets: 3, time: '45s', rest: '60s' },
                over50: { sets: 2, time: '30s', rest: '60s' }
            },
            tips: [
                'No dejar caer caderas',
                'Aprieta el core',
                'Mira el suelo',
                'Respira normalmente'
            ],
            formCues: ['Straight line', 'Glutes engaged', 'Breathe']
        },
        walking: {
            name: 'Caminata',
            muscleGroups: ['Piernas', 'Core', 'Cardio'],
            difficulty: 'beginner',
            ageAdjustments: {
                under40: { duration: '30 min', pace: 'rápido', frequency: '5x semana' },
                '40-50': { duration: '45 min', pace: 'moderado', frequency: '5x semana' },
                over50: { duration: '30 min', pace: 'ligero-moderado', frequency: 'diario' }
            },
            tips: [
                'Mantén ritmo constante',
                'Postura erguida',
                'Arms swing naturally',
                'Zona 2 para cardio'
            ],
            formCues: ['Head up', 'Shoulders back', 'Engage core']
        }
    },

    // Rutinas predefinidas por objetivo
    ROUTINES: {
        longevity: {
            name: 'Longevidad +40',
            description: 'Mantén masa muscular y densidad ósea',
            exercises: ['squat', 'pushup', 'plank', 'walking'],
            duration: '45 min',
            frequency: '3-4x semana'
        },
        strength: {
            name: 'Fuerza',
            description: 'Ganancia de potencia muscular',
            exercises: ['squat', 'deadlift', 'pushup'],
            duration: '60 min',
            frequency: '4x semana'
        },
        recovery: {
            name: 'Recuperación',
            description: 'Baja intensidad para recovery',
            exercises: ['walking', 'plank'],
            duration: '30 min',
            frequency: 'diaro'
        },
        mobility: {
            name: 'Movilidad',
            description: 'Rango de movimiento y prevención',
            exercises: ['walking', 'plank'],
            duration: '20 min',
            frequency: 'diaro'
        }
    },

    // Obtener rutina según edad y objetivo
    getRoutine(routineKey, age = 40) {
        const routine = this.ROUTINES[routineKey];
        const exercises = routine.exercises.map(ex => {
            const exercise = this.EXERCISE_LIBRARY[ex];
            const ageGroup = age < 40 ? 'under40' : age < 50 ? '40-50' : 'over50';
            return {
                ...exercise,
                protocol: exercise.ageAdjustments[ageGroup]
            };
        });
        
        return { ...routine, exercises };
    },

    // Generar variaciones de ejercicios para diferentes niveles
    getVariations(exerciseKey) {
        const exercise = this.EXERCISE_LIBRARY[exerciseKey];
        return {
            beginner: {
                ...exercise,
                name: `${exercise.name} Modificada`,
                tips: [...exercise.tips, 'Usa asistencia si es necesario']
            },
            intermediate: exercise,
            advanced: {
                ...exercise,
                name: `${exercise.name} Avanzada`,
                tips: [...exercise.tips, 'Añade peso o reps']
            }
        };
    },

    // Calcular métricas de entrenamiento
    calculateMetrics(exercise, userData) {
        const age = userData.age || 40;
        const protocol = exercise.ageAdjustments[age < 40 ? 'under40' : age < 50 ? '40-50' : 'over50'];
        
        const volume = parseInt(protocol.sets || 3) * parseInt(protocol.reps || 10);
        
        return {
            totalVolume: volume,
            estimatedCalories: Math.round(volume * 0.5),
            recoveryTime: parseInt(protocol.rest || 90),
            intensity: exercise.difficulty === 'advanced' ? 'high' : exercise.difficulty === 'beginner' ? 'low' : 'moderate'
        };
    },

    // Generar feedback en tiempo real (simulado)
    analyzeForm(poseData) {
        const feedback = [];
        
        if (poseData.kneesTooForward) {
            feedback.push({
                type: 'warning',
                message: 'Las rodillas están muy avanzadas'
            });
        }
        
        if (poseData.backRounded) {
            feedback.push({
                type: 'error',
                message: 'Espalda redondeada - peligro de lesión'
            });
        }
        
        if (poseData.goodDepth) {
            feedback.push({
                type: 'success',
                message: 'Profundidad correcta'
            });
        }
        
        return feedback;
    }
};

if (typeof window !== 'undefined') {
    window.AIExerciseCoach = AIExerciseCoach;
}