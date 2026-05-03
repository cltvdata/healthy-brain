import { AppColors } from '../constants/AppStyles';

export type BioCyclePhase = 'Menstrual' | 'Folicular' | 'Ovulatoria' | 'Lútea';

export interface BioCycleState {
    phase: BioCyclePhase;
    dayOfCycle: number;
    daysUntilNextPhase: number;
    color: string;
    description: string;
    nutritionAdvice: string;
    trainingAdvice: string;
    hormonalInsight: string;
}

export class BioCycleService {
    static calculateState(lastPeriodDate: string, cycleLength: number = 28): BioCycleState | null {
        if (!lastPeriodDate) return null;

        const lastDate = new Date(lastPeriodDate);
        const today = new Date();
        
        // Difference in days
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const dayOfCycle = (diffDays % cycleLength) || 1;
        
        let phase: BioCyclePhase = 'Folicular';
        let color = '#E1A7FF'; // Default Lavender
        let description = '';
        let nutritionAdvice = '';
        let trainingAdvice = '';
        let hormonalInsight = '';
        let daysUntilNextPhase = 0;

        if (dayOfCycle <= 5) {
            phase = 'Menstrual';
            color = '#FF7597'; // Soft Pink/Red
            description = 'Fase de Renovación';
            hormonalInsight = 'Niveles bajos de estrógeno y progesterona. El cuerpo prioriza la limpieza celular.';
            nutritionAdvice = 'Incrementa el consumo de Hierro y Magnesio. Caldos calientes y alimentos antiinflamatorios.';
            trainingAdvice = 'Baja intensidad: Yoga, caminatas ligeras o estiramiento activo.';
            daysUntilNextPhase = 6 - dayOfCycle;
        } else if (dayOfCycle <= 12) {
            phase = 'Folicular';
            color = '#A7C7FF'; // Soft Blue
            description = 'Fase de Apertura';
            hormonalInsight = 'El estrógeno comienza a subir. Tu neuroplasticidad está en su punto más alto.';
            nutritionAdvice = 'Alimentos probióticos y vegetales crucíferos para apoyar el metabolismo del estrógeno.';
            trainingAdvice = 'Intensidad moderada-alta. Buen momento para aprender nuevas habilidades técnicas.';
            daysUntilNextPhase = 13 - dayOfCycle;
        } else if (dayOfCycle <= 16) {
            phase = 'Ovulatoria';
            color = '#75FFBD'; // Bio-Green
            description = 'Fase de Potencia';
            hormonalInsight = 'Pico de estrógeno y testosterona. Máxima energía física y social.';
            nutritionAdvice = 'Antioxidantes y grasas saludables. Mantén la hidratación alta.';
            trainingAdvice = 'Máximo rendimiento: HIIT, levantamiento de pesas pesado o sprints.';
            daysUntilNextPhase = 17 - dayOfCycle;
        } else {
            phase = 'Lútea';
            color = '#C9A7FF'; // Violet
            description = 'Fase de Reflexión';
            hormonalInsight = 'La progesterona domina. El metabolismo basal aumenta (quemas más calorías en reposo).';
            nutritionAdvice = 'Carbohidratos complejos (camote, avena) para estabilizar el ánimo y serotonina.';
            trainingAdvice = 'Resistencia y Zona 2. Prioriza el sueño, ya que la temperatura corporal es más alta.';
            daysUntilNextPhase = cycleLength - dayOfCycle + 1;
        }

        return {
            phase,
            dayOfCycle,
            daysUntilNextPhase,
            color,
            description,
            nutritionAdvice,
            trainingAdvice,
            hormonalInsight
        };
    }
}
