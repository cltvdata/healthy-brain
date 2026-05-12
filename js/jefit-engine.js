const JEFIT_EXERCISES = {
  pectorales: [
    { id: 'press-banca', name: 'Press de Banca', equipment: 'Barra', level: 'Principiante', muscles: 'Pectoral mayor, tríceps', tips: 'Mantén los pies firmes en el suelo, espalda ligeramente arqueada', video: 'assets/ejercicios/fuerza/flexiones.svg' },
    { id: 'press-inclinado', name: 'Press Inclinado', equipment: 'Barra', level: 'Intermedio', muscles: 'Pectoral superior, tríceps', tips: 'Ángulo de 30-45 grados, controla el descentre' },
    { id: 'aperturas', name: 'Aperturas con Mancuernas', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Pectoral mayor', tips: 'Movimiento controlado, no uses impulso' },
    { id: 'flexiones', name: 'Flexiones', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Pectorales, tríceps', tips: 'Cuerpo recto, manos ligeramente separadas del ancho de hombros' },
    { id: 'fondos', name: 'Fondos en Paralelas', equipment: 'Bodyweight', level: 'Avanzado', muscles: 'Pectorales, tríceps', tips: 'No bajar más de 90 grados para proteger hombros' },
    { id: 'press-maquina', name: 'Press en Máquina', equipment: 'Máquina', level: 'Principiante', muscles: 'Pectorales', tips: 'Buen aislamiento, ideal para principiantes' },
    { id: 'cruces-polea', name: 'Cruces en Polea', equipment: 'Polea', level: 'Principiante', muscles: 'Pectoral inferior', tips: 'Une las manos arriba del ombligo' },
    { id: 'press-pecho-mancuernas', name: 'Press de Pecho con Mancuernas', equipment: 'Mancuernas', level: 'Intermedio', muscles: 'Pectorales, tríceps', tips: 'Rotación de muñecas al subir, controla la caída' }
  ],
  espalda: [
    { id: 'dominadas', name: 'Dominadas', equipment: 'Bodyweight', level: 'Avanzado', muscles: 'Dorsal ancho, bíceps', tips: 'Agarre amplio, evita balanceo', video: 'assets/ejercicios/fuerza/peso-muerto.svg' },
    { id: 'remo-con-barra', name: 'Remo con Barra', equipment: 'Barra', level: 'Intermedio', muscles: 'Dorsal, romboides', tips: 'Espalda plana, elimina la zona lumbar' },
    { id: 'remo-mancuerna', name: 'Remo con Mancuerna', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Dorsal, bíceps', tips: 'Apoya una mano en el banco, tronco paralelo al suelo' },
    { id: 'jalon-frontal', name: 'Jalón Frontal', equipment: 'Polea', level: 'Principiante', muscles: 'Dorsal ancho', tips: 'Lleva la barra al pecho, no detrás del cuello' },
    { id: 'pull-over', name: 'Pullover', equipment: 'Mancuerna', level: 'Intermedio', muscles: 'Dorsal, pectoral', tips: 'Movimiento de arco, codos ligeramente doblados' },
    { id: 'face-pulls', name: 'Face Pulls', equipment: 'Polea', level: 'Principiante', muscles: 'Trapecio posterior, infraespinoso', tips: 'Rota externamente los hombros al jalar' },
    { id: 'peso-muerto', name: 'Peso Muerto', equipment: 'Barra', level: 'Avanzado', muscles: 'Isquiotibiales, lumbar', tips: 'Barra pegada al cuerpo, back straight', video: 'assets/ejercicios/fuerza/peso-muerto.svg' },
    { id: 'hiperextension', name: 'Hiperextensión', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Lumbar, glúteos', tips: 'No hyperextend, controla el movimiento' }
  ],
  hombros: [
    { id: 'press-militar', name: 'Press Militar', equipment: 'Barra', level: 'Intermedio', muscles: 'Deltoides, tríceps', tips: 'Piernas stabilize, no momentum', video: 'assets/ejercicios/fuerza/sentadilla.svg' },
    { id: 'press-mancuernas', name: 'Press con Mancuernas', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Deltoides', tips: 'Rotación neutral de muñecas' },
    { id: 'elevaciones-laterales', name: 'Elevaciones Laterales', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Deltoides lateral', tips: 'Codos ligeramente arriba de las muñecas' },
    { id: 'elevaciones-frontales', name: 'Elevaciones Frontales', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Deltoides anterior', tips: 'Evita usar impulso, controla el peso' },
    { id: 'face-pull-vertical', name: 'Face Pull', equipment: 'Polea', level: 'Principiante', muscles: 'Manguito rotador', tips: 'Alta repetición, baja carga' },
    { id: 'voladas-posteriores', name: 'Voladas Posteriores', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Deltoides posterior', tips: 'Torso inclinado 45 grados' },
    { id: 'shrugs', name: 'Shrugs (Encogimientos)', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Trapecio', tips: 'Solo subir los hombros, no rotar' }
  ],
  biceps: [
    { id: 'curl-barra', name: 'Curl con Barra', equipment: 'Barra', level: 'Principiante', muscles: 'Bíceps braquial', tips: 'Codos fijos, no swing' },
    { id: 'curl-mancuernas', name: 'Curl con Mancuernas', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Bíceps', tips: 'Rotación al subir, concentración al bajar' },
    { id: 'curl-martillo', name: 'Curl Martillo', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Braquiorradial', tips: 'Palmas enfrentándose' },
    { id: 'curl-predicador', name: 'Curl en Predicador', equipment: 'Barra', level: 'Intermedio', muscles: 'Bíceps', tips: 'No completar el movimiento, mantiene tensión' },
    { id: 'curl-inclinado', name: 'Curl Inclinado', equipment: 'Mancuernas', level: 'Intermedio', muscles: 'Bíceps', tips: 'Banco a 45 grados, estiramiento máximo' },
    { id: 'concentracion', name: 'Curl de Concentración', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Bíceps', tips: 'Movimiento lento y controlado' },
    { id: 'barra-ez', name: 'Curl con Barra EZ', equipment: 'Barra EZ', level: 'Principiante', muscles: 'Bíceps', tips: 'Agarre reduce estrés en muñecas' }
  ],
  triceps: [
    { id: 'fondos-triceps', name: 'Fondos de Tríceps', equipment: 'Bodyweight', level: 'Intermedio', muscles: 'Tríceps', tips: 'Manos en banco, baja hasta 90 grados' },
    { id: 'extension-barra', name: 'Extensión de Tríceps con Barra', equipment: 'Barra', level: 'Intermedio', muscles: 'Tríceps', tips: 'Codos fijos, mover solo el antebrazo' },
    { id: 'patada-triceps', name: 'Patada (Kickbacks)', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Tríceps', tips: 'Espalda plana, extensiones completas' },
    { id: 'dips-banco', name: 'Dips de Banco', equipment: 'Bodyweight', level: 'Principiante', tips: 'Hombros retraidos, codos pegados al cuerpo' },
    { id: 'skull-crushers', name: 'Skull Crushers', equipment: 'Barra', level: 'Intermedio', tips: 'Bajar la barra a la frente, codos fijos' },
    { id: 'press-close-grip', name: 'Press Close Grip', equipment: 'Barra', level: 'Intermedio', muscles: 'Tríceps', tips: 'Manos separadas 20cm, codos pegados' }
  ],
  cuadriceps: [
    { id: 'sentadilla', name: 'Sentadilla', equipment: 'Barra', level: 'Intermedio', muscles: 'Cuádriceps, glúteos', tips: 'Rodillas fuera, core tight', video: 'assets/ejercicios/fuerza/sentadilla.svg' },
    { id: 'prensa', name: 'Prensa', equipment: 'Máquina', level: 'Principiante', muscles: 'Cuádriceps', tips: 'Pies en ancho de hombros, no bloquear rodillas' },
    { id: 'hack-squat', name: 'Hack Squat', equipment: 'Máquina', level: 'Intermedio', muscles: 'Cuádriceps', tips: 'Espalda pegada al respaldo, controla descentre' },
    { id: 'extension-cuadriceps', name: 'Extensión de Cuádriceps', equipment: 'Máquina', level: 'Principiante', muscles: 'Cuádriceps', tips: 'No usar momentum, contracción máxima arriba' },
    { id: 'lunges', name: 'Zancadas (Lunges)', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Cuádriceps, glúteos', tips: 'Paso largo, rodilla trasera casi toca el suelo' },
    { id: 'bulgarian-split', name: 'Bulgarian Split Squat', equipment: 'Mancuernas', level: 'Avanzado', muscles: 'Cuádriceps', tips: 'Pie trasero elevado en banco, controlar descentre' },
    { id: 'front-squat', name: 'Sentadilla Frontal', equipment: 'Barra', level: 'Avanzado', tips: 'Core bracing intenso, codos altos' }
  ],
  gluteos: [
    { id: 'hip-thrust', name: 'Hip Thrust', equipment: 'Barra', level: 'Intermedio', muscles: 'Glúteos', tips: 'Barra sobre las caderas, espalda en banco', video: 'assets/ejercicios/fuerza/plancha.svg' },
    { id: 'glute-bridge', name: 'Glute Bridge', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Glúteos', tips: 'Empuja las caderas, aprieta glúteos arriba' },
    { id: 'patada-gluteos', name: 'Patada de Glúteos', equipment: 'Maquina', level: 'Principiante', muscles: 'Glúteos', tips: 'Mantén la pelvis estable' },
    { id: 'step-up', name: 'Step Up', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Glúteos, cuádriceps', tips: 'Pies completos en el step, controla' },
    { id: 'sumo-deadlift', name: 'Sumo Deadlift', equipment: 'Barra', level: 'Avanzado', muscles: 'Glúteos, lumbar', tips: 'Piernas separadas, tibias verticales' }
  ],
  isquiotibiales: [
    { id: 'curl-pierna', name: 'Curl de Piernas', equipment: 'Máquina', level: 'Principiante', muscles: 'Isquiotibiales', tips: 'No levantar las caderas, contrôlate' },
    { id: 'stiff-deadlift', name: 'Stiff Leg Deadlift', equipment: 'Barra', level: 'Intermedio', muscles: 'Isquiotibiales', tips: 'Piernas casi rectas, sentir estirón' },
    { id: 'romano', name: 'Peso Muerto Rumano', equipment: 'Barra', level: 'Intermedio', muscles: 'Isquiotibiales, glúteos', tips: 'Rodillas ligeramente dobladas, bajal la barra' },
    { id: 'good-morning', name: 'Good Morning', equipment: 'Barra', level: 'Avanzado', muscles: 'Lumbar, isquiotibiales', tips: 'Caderas como bisagra, no redondear espalda' },
    { id: 'nordic-curl', name: 'Nordic Curl', equipment: 'Bodyweight', level: 'Avanzado', tips: 'Controla la caída, usa brazos para equilibrar' }
  ],
  abdominales: [
    { id: 'crunch', name: 'Crunch', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Recto abdominal', tips: 'No tire del cuello, concentra en abs' },
    { id: 'planch', name: 'Plancha', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Core', tips: 'Cuerpo recto, aprieta glúteos', video: 'assets/ejercicios/fuerza/plancha.svg' },
    { id: 'leg-raise', name: 'Elevación de Piernas', equipment: 'Bodyweight', level: 'Intermedio', muscles: 'Lower abs', tips: 'Piernas rectas, espalda baja pegada al suelo' },
    { id: 'russian-twist', name: 'Russian Twist', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Oblicuos', tips: 'Pies elevados, gira el torso' },
    { id: 'ab-wheel', name: 'Rueda Abdominal', equipment: 'Rueda', level: 'Avanzado', muscles: 'Core completo', tips: 'Extiende completamente, controla el retorno' },
    { id: 'cable-crunch', name: 'Crunch en Polea', equipment: 'Polea', level: 'Intermedio', muscles: 'Abs', tips: 'Alta carga posible, movimiento controlado' },
    { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', equipment: 'Barra', level: 'Avanzado', muscles: 'Abs completo', tips: 'No balancear, controlado' }
  ],
  trapecio: [
    { id: 'shrugs-barra', name: 'Shrugs con Barra', equipment: 'Barra', level: 'Principiante', muscles: 'Trapecio', tips: 'Solo subir hombros, no rotar' },
    { id: 'face-pull-trap', name: 'Face Pull', equipment: 'Polea', level: 'Principiante', muscles: 'Trapecio posterior', tips: 'Alta repetición, baja carga' },
    { id: 'barbell-row-shrugs', name: 'Barbell Row Shrugs', equipment: 'Barra', level: 'Intermedio', muscles: 'Trapecio', tips: 'Combina remo con encogimientos' }
  ],
  antebrazos: [
    { id: 'wrist-curl', name: 'Wrist Curl', equipment: 'Mancuernas', level: 'Principiante', muscles: 'Flexores', tips: 'Muñecas sobre el muslo' },
    { id: 'reverse-curl', name: 'Curl Inverso', equipment: 'Barra', level: 'Principiante', muscles: 'Extensores', tips: 'Agarre pronado, controla' }
  ],
  cardio: [
    { id: 'correr', name: 'Correr', equipment: 'Ninguno', level: 'Principiante', muscles: 'Sistema cardiovascular', tips: 'Mantén ritmo estable, respira profundamente' },
    { id: 'burpees', name: 'Burpees', equipment: 'Bodyweight', level: 'Avanzado', muscles: 'Cuerpo completo', tips: 'Mantén核心 engaged, movimiento fluido' },
    { id: 'saltar-soga', name: 'Saltar la Cuerda', equipment: 'Soga', level: 'Principiante', muscles: 'Cardio, pantorrillas', tips: 'Saltos pequeños, muñecas giran la soga' },
    { id: 'mountain-climbers', name: 'Mountain Climbers', equipment: 'Bodyweight', level: 'Principiante', muscles: 'Core, cardiovascular', tips: 'Manos estables, rodillas al pecho rápidamente' }
  ]
};

const JEFIT_ROUTINES = [
  { id: 'full-body-3d', name: 'Full Body 3 días', days: ['Pectorales+Tríceps', 'Espalda+Bíceps', 'Piernas+Core'], level: 'Principiante', duration: '45 min' },
  { id: 'upper-lower-4d', name: 'Upper/Lower 4 días', days: ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'], level: 'Intermedio', duration: '60 min' },
  { id: 'push-pull-4d', name: 'Push/Pull/Legs 6 días', days: ['Push (Pecho+Hombro+Tríceps)', 'Pull (Espalda+Bíceps)', 'Legs', 'Push', 'Pull', 'Legs'], level: 'Avanzado', duration: '75 min' },
  { id: 'bro-split-5d', name: 'Bro Split 5 días', days: ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas'], level: 'Intermedio', duration: '60 min' },
  { id: 'home-no-equip', name: 'Casa sin Equipo', days: ['Full Body', 'Full Body', 'Full Body'], level: 'Principiante', duration: '30 min' }
];

class JefitEngine {
  constructor() {
    this.exercises = JEFIT_EXERCISES;
    this.routines = JEFIT_ROUTINES;
    this.currentWorkout = null;
    this.workoutHistory = this.loadHistory();
  }

  loadHistory() {
    const saved = localStorage.getItem('hb_jefit_history');
    return saved ? JSON.parse(saved) : [];
  }

  saveHistory() {
    localStorage.setItem('hb_jefit_history', JSON.stringify(this.workoutHistory));
  }

  getExercisesByMuscle(muscle) {
    return this.exercises[muscle] || [];
  }

  getAllExercises() {
    let all = [];
    Object.values(this.exercises).forEach(group => {
      all = [...all, ...group.map(e => ({ ...e, muscleGroup: this.getMuscleKey(e.id) }))];
    });
    return all;
  }

  getMuscleKey(exerciseId) {
    const mapping = {
      'press-banca': 'pectorales', 'press-inclinado': 'pectorales', 'aperturas': 'pectorales',
      'dominadas': 'espalda', 'remo-con-barra': 'espalda', 'jalon-frontal': 'espalda',
      'sentadilla': 'cuadriceps', 'prensa': 'cuadriceps', 'hack-squat': 'cuadriceps',
      'hip-thrust': 'gluteos', 'glute-bridge': 'gluteos',
      'curl-pierna': 'isquiotibiales', 'romano': 'isquiotibiales',
      'crunch': 'abdominales', 'planch': 'abdominales'
    };
    return mapping[exerciseId] || 'pectorales';
  }

  getRoutines() {
    return this.routines;
  }

  startWorkout(routine) {
    this.currentWorkout = {
      routine: routine,
      startTime: Date.now(),
      exercises: [],
      sets: []
    };
    return this.currentWorkout;
  }

  addExercise(exercise, sets = 3, reps = 10, weight = 0, restTime = 90) {
    if (!this.currentWorkout) return null;
    
    const exerciseSet = {
      exercise: exercise,
      sets: [],
      restTime: restTime
    };

    for (let i = 0; i < sets; i++) {
      exerciseSet.sets.push({
        setNumber: i + 1,
        targetReps: reps,
        targetWeight: weight,
        completed: false,
        actualReps: 0,
        actualWeight: 0
      });
    }

    this.currentWorkout.exercises.push(exerciseSet);
    return exerciseSet;
  }

  logSet(exerciseIndex, setIndex, actualReps, actualWeight) {
    if (!this.currentWorkout || !this.currentWorkout.exercises[exerciseIndex]) return;

    const set = this.currentWorkout.exercises[exerciseIndex].sets[setIndex];
    set.completed = true;
    set.actualReps = actualReps;
    set.actualWeight = actualWeight;

    this.currentWorkout.sets.push({
      exerciseId: this.currentWorkout.exercises[exerciseIndex].exercise.id,
      reps: actualReps,
      weight: actualWeight,
      timestamp: Date.now()
    });
  }

  finishWorkout() {
    if (!this.currentWorkout) return null;

    const workout = {
      ...this.currentWorkout,
      endTime: Date.now(),
      duration: Date.now() - this.currentWorkout.startTime,
      totalSets: this.currentWorkout.sets.length
    };

    this.workoutHistory.unshift(workout);
    this.saveHistory();

    const completed = this.currentWorkout;
    this.currentWorkout = null;

    return completed;
  }

  getWorkoutHistory() {
    return this.workoutHistory;
  }

  calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  getProgress(exerciseId) {
    const history = this.workoutHistory.flatMap(w => w.sets.filter(s => s.exerciseId === exerciseId));
    if (history.length === 0) return null;

    const maxWeight = Math.max(...history.map(s => s.weight));
    const maxReps = Math.max(...history.map(s => s.reps));
    const estimated1RM = this.calculate1RM(maxWeight, maxReps);

    return {
      maxWeight,
      maxReps,
      estimated1RM,
      totalSets: history.length,
      lastWorkout: history[0]?.timestamp
    };
  }
}

window.jefitEngine = new JefitEngine();
console.log('[Jefit Engine] Loaded -', Object.keys(JEFIT_EXERCISES).length, 'muscle groups');