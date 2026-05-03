export interface ExerciseMetadata {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Shoulders' | 'Legs' | 'Arms' | 'Abs';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl: string;
  efc: number; // Exercise Fatigue Coefficient (Compound > 1.0, Isolation < 1.0)
  bioInsight: string;
}

export const ExercisesDB: Record<string, ExerciseMetadata> = {
  "Press de Banca Plano (Barra)": {
    id: "bench_press_flat",
    name: "Press de Banca Plano (Barra)",
    category: 'Chest',
    primaryMuscles: ['chest_lower', 'chest_upper'],
    secondaryMuscles: ['triceps', 'shoulders_front'],
    instructions: [
      "Acuéstate sobre el banco con los pies apoyados en el suelo.",
      "Sujeta la barra con las manos más separadas que el ancho de los hombros.",
      "Baja la barra lentamente hasta que toque suavemente el centro del pecho.",
      "Empuja la barra hacia arriba con fuerza hasta extender los brazos."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGZ8YvXmZ4Vig/giphy.gif",
    efc: 1.2,
    bioInsight: "El press de banca activa el 70% de las unidades motoras del pectoral superior si mantienes los codos a 45 grados."
  },
  "Sentadilla Libre (Back Squat)": {
    id: "back_squat",
    name: "Sentadilla Libre (Back Squat)",
    category: 'Legs',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'back_lower', 'abs'],
    instructions: [
      "Coloca la barra sobre los trapecios, no sobre el cuello.",
      "Los pies deben estar al ancho de los hombros, puntas ligeramente hacia afuera.",
      "Desciende flexionando cadera y rodillas, manteniendo la espalda recta.",
      "Baja hasta que los muslos estén paralelos al suelo y sube explosivamente."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKVUn7iM8FMEU24/giphy.gif",
    efc: 1.5,
    bioInsight: "La sentadilla profunda aumenta la liberación de hormona de crecimiento un 25% más que la media sentadilla."
  },
  "Dominadas Pronas (Pull-ups)": {
    id: "pull_ups",
    name: "Dominadas Pronas (Pull-ups)",
    category: 'Back',
    primaryMuscles: ['back_lats'],
    secondaryMuscles: ['biceps', 'shoulders_rear', 'forearms'],
    instructions: [
      "Cuelga de la barra con agarre prono (palmas hacia adelante).",
      "Inicia el movimiento retrayendo las escápulas.",
      "Sube el cuerpo hasta que la barbilla supere la barra.",
      "Baja de forma controlada hasta extender completamente los brazos."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlSH2gsSrxIgz4I/giphy.gif",
    efc: 1.3,
    bioInsight: "Mantener el core tenso evita el balanceo y maximiza la activación del dorsal ancho."
  },
  "Press Militar de Pie (Barra)": {
    id: "overhead_press",
    name: "Press Militar de Pie (Barra)",
    category: 'Shoulders',
    primaryMuscles: ['shoulders_front', 'shoulders_side'],
    secondaryMuscles: ['triceps', 'abs'],
    instructions: [
      "Sujeta la barra a la altura de la parte superior del pecho.",
      "Mantén los pies al ancho de los hombros y el core muy apretado.",
      "Empuja la barra sobre la cabeza hasta bloquear los codos.",
      "Baja la barra lentamente de vuelta al pecho."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKT7lHl6U8U3FvG/giphy.gif",
    efc: 1.1,
    bioInsight: "Este es el mejor ejercicio para medir la fuerza absoluta del tren superior y la estabilidad del tronco."
  },
  "Peso Muerto Rumano (RDL)": {
    id: "rdl",
    name: "Peso Muerto Rumano (RDL)",
    category: 'Legs',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back_lower', 'forearms'],
    instructions: [
      "Sujeta la barra frente a los muslos con agarre prono.",
      "Baja la barra manteniendo las piernas casi rectas (ligera flexión).",
      "Lleva la cadera hacia atrás hasta sentir el estiramiento en los isquios.",
      "Sube empujando la cadera hacia adelante y apretando los glúteos."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKD8O4n7Z3hGq0U/giphy.gif",
    efc: 1.4,
    bioInsight: "El enfoque en la fase excéntrica lenta (bajada) es la clave para la hipertrofia de los isquiotibiales."
  },
  "Curl de Bíceps con Barra": {
    id: "barbell_curl",
    name: "Curl de Bíceps con Barra",
    category: 'Arms',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    instructions: [
      "Sujeta la barra con agarre supino (palmas hacia arriba).",
      "Mantén los codos pegados a los costados del cuerpo.",
      "Flexiona los brazos llevando la barra hacia los hombros.",
      "Baja lentamente sin balancear el torso."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/v1.Y2lkPTc5MGI3NjExMjRjZGV6M2I3ZTZmNjU1YjliNjA0MTQ2ZjkxZDY0OThlMzI4NGRlNCZlcD12MV9pbnRlcm5hbF9naWZfcmVzb3VyY2VfaWQmY3Q9Zw/v1.Y2lkPTc5MGI3NjExMjRjZGV6M2I3ZTZmNjU1YjliNjA0MTQ2ZjkxZDY0OThlMzI4NGRlNCZlcD12MV9pbnRlcm5hbF9naWZfcmVzb3VyY2VfaWQmY3Q9Zw/xT9IgvJ7D6UfF9n0mQ/giphy.gif",
    efc: 0.7,
    bioInsight: "Girar ligeramente las muñecas hacia afuera al final aumenta el pico del bíceps."
  },
  "Extensión de Tríceps en Polea": {
    id: "tricep_pushdown",
    name: "Extensión de Tríceps en Polea",
    category: 'Arms',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    instructions: [
      "Sujeta la barra o cuerda en la polea alta.",
      "Mantén los codos pegados a las costillas.",
      "Extiende los brazos hacia abajo apretando el tríceps al final.",
      "Regresa lentamente manteniendo la tensión en el músculo."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlNVN4L9fD89I6I/giphy.gif",
    efc: 0.6,
    bioInsight: "El tríceps representa el 60-70% del volumen total del brazo."
  },
  "Elevación de Piernas Colgado": {
    id: "hanging_leg_raise",
    name: "Elevación de Piernas Colgado",
    category: 'Abs',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['forearms'],
    instructions: [
      "Cuélgate de una barra de dominadas.",
      "Mantén el cuerpo estable y sin balanceos.",
      "Sube las piernas estiradas hasta que queden paralelas al suelo.",
      "Baja lentamente controlando el core."
    ],
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxYnVqdXp0ZzB6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGZ8YvXmZ4Vig/giphy.gif",
    efc: 0.8,
    bioInsight: "Este es el ejercicio con mayor activación electromiográfica para el recto abdominal inferior."
  }
};
