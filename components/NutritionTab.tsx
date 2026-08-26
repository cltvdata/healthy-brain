import React, { useState } from 'react';
import { MealPreset, MealResult } from '../types';
import { Camera, Check, ShieldAlert, Sparkles, ChevronRight, HelpCircle, Utensils } from 'lucide-react';

interface NutritionTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateGlucose: (value: number, stable: boolean) => void;
}

const PRESET_MEALS: MealPreset[] = [
  {
    id: 'salmon',
    name: "Bowl de Salmón y Quinoa",
    description: "Salmón a la plancha, quinoa orgánica, aguacate hass, espinacas y aderezo de limón y aceite de oliva virgen extra.",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    analysis: {
      name: "Bowl de Salmón y Quinoa",
      calories: 620,
      protein: 42,
      carbs: 48,
      fats: 28,
      fiber: 9,
      bioScore: 94,
      warnings: ["Ninguno. Alta densidad nutricional."],
      timing: "Consumo óptimo en la ventana de almuerzo (fase circadiana alta).",
      veredicto: "Excelente fuente de grasas saludables (Omega-3) y aminoácidos completos. La fibra de las espinacas y el aguacate crea la malla perfecta de protección glucémica.",
      rewardNTK: 50
    }
  },
  {
    id: 'avocado_egg',
    name: "Aguacate con Huevo Poché",
    description: "Dos huevos poché sobre tostada de masa madre integral, aguacate triturado y brotes de alfalfa.",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    analysis: {
      name: "Aguacate con Huevo Poché",
      calories: 450,
      protein: 22,
      carbs: 26,
      fats: 24,
      fiber: 7,
      bioScore: 89,
      warnings: ["Controlar el tamaño de la rebanada de masa madre."],
      timing: "Excelente para el desayuno o pre-entreno largo.",
      veredicto: "Combinación de proteínas y grasas saludables que retardan el vaciado gástrico, asegurando energía estable sin picos de insulina.",
      rewardNTK: 35
    }
  },
  {
    id: 'shake',
    name: "Batido de Proteína y Berries",
    description: "Whey protein aislada, leche de almendras sin azúcar, frutos rojos silvestres (arándanos, frambuesas) y semillas de chía.",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    analysis: {
      name: "Batido de Proteína y Berries",
      calories: 280,
      protein: 30,
      carbs: 18,
      fats: 6,
      fiber: 6,
      bioScore: 91,
      warnings: ["Absorción rápida debido al estado líquido. Se sugiere consumir despacio."],
      timing: "Post-entreno inmediato o snack de media tarde.",
      veredicto: "Los antioxidantes de los frutos rojos combinados con la proteína líquida detienen el catabolismo muscular instantáneamente sin desestabilizar la glucosa.",
      rewardNTK: 30
    }
  }
];

export const NutritionTab: React.FC<NutritionTabProps> = ({ onAddTokens, onUpdateGlucose }) => {
  const [scanning, setScanning] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealResult | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [axiomsChecked, setAxiomsChecked] = useState({
    fiberFirst: false,
    proteinSecond: false,
    carbsLast: false,
    walkTenMin: false
  });

  const handleScan = (presetId: string) => {
    setSelectedPresetId(presetId);
    setScanning(true);
    setActiveMeal(null);

    // Simulated scanner animation
    setTimeout(() => {
      const meal = PRESET_MEALS.find(m => m.id === presetId);
      if (meal) {
        setActiveMeal(meal.analysis);
        onUpdateGlucose(95, true); // Stable glucose
        onAddTokens(meal.analysis.rewardNTK, `Escáner Lens IA: ${meal.name}`);
      }
      setScanning(false);
    }, 2800);
  };

  const handleAxiomToggle = (key: keyof typeof axiomsChecked) => {
    const updated = { ...axiomsChecked, [key]: !axiomsChecked[key] };
    setAxiomsChecked(updated);
    
    // Check if we checked a new one
    if (updated[key]) {
      onAddTokens(15, `Axioma Glucémico Logrado: ${getAxiomName(key)}`);
    }
  };

  const getAxiomName = (key: string) => {
    if (key === 'fiberFirst') return "Fibra Primero";
    if (key === 'proteinSecond') return "Proteínas y Grasas Segundas";
    if (key === 'carbsLast') return "Almidones y Azúcares al Final";
    return "Caminata de 10 min Post-Comida";
  };

  return (
    <div className="space-y-6">
      {/* Scanner Hero */}
      <div className="relative rounded-3xl p-6 bg-glass-noir border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-bio-orange/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-neuro-blue/20 text-neuro-blue border border-neuro-blue/30">
          VISION IA SCANNERS 2.0
        </span>
        <h2 className="text-2xl font-black text-white mt-2 uppercase tracking-tight">
          Lens Nutricional
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Análisis molecular instantáneo. Sube la foto de tu plato para medir el impacto glucémico.
        </p>

        {/* Viewfinder simulation */}
        <div className="mt-6 relative h-56 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center bg-black/30 group">
          {scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
              <div className="w-10 h-10 border-4 border-bio-orange/20 border-t-bio-orange rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-bio-orange uppercase tracking-widest mt-4 animate-pulse">
                Analizando Estructura Molecular...
              </p>
            </div>
          ) : activeMeal ? (
            <div className="absolute inset-0 z-10">
              <img 
                src={PRESET_MEALS.find(m => m.id === selectedPresetId)?.imageUrl} 
                alt="Meal" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-obsidian to-transparent"></div>
            </div>
          ) : (
            <div className="text-center p-4 z-10">
              <Camera className="w-10 h-10 text-gray-500 mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3">
                Selecciona un Plato de Prueba abajo para Escanear
              </p>
            </div>
          )}

          {/* Scanner viewfinder lines */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-neuro-blue rounded-tl-md"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-neuro-blue rounded-tr-md"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-neuro-blue rounded-bl-md"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-neuro-blue rounded-br-md"></div>

          {scanning && (
            <div className="absolute left-0 right-0 h-0.5 bg-neuro-blue/80 shadow-[0_0_15px_#00d1ff] animate-scan z-10"></div>
          )}
        </div>
      </div>

      {/* Preset Dishes */}
      <section className="mb-6">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3">Platos de Prueba (Simulador)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_MEALS.map((meal) => (
            <button
              key={meal.id}
              onClick={() => handleScan(meal.id)}
              disabled={scanning}
              className="p-3 bg-glass-noir border border-white/5 rounded-2xl text-left hover:border-neuro-blue/30 hover:bg-white/5 transition-all flex sm:flex-col gap-3 group"
            >
              <img src={meal.imageUrl} alt={meal.name} className="w-16 sm:w-full h-16 sm:h-24 object-cover rounded-xl" />
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-neuro-blue transition-colors leading-tight">
                  {meal.name}
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                  {meal.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Scan Results */}
      {activeMeal && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Analysis card */}
          <div className="p-6 bg-glass-noir border border-white/10 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-white">{activeMeal.name}</h3>
                <p className="text-[10px] font-black text-bio-green uppercase tracking-wider mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Bio-Score: {activeMeal.bioScore}/100 - Alta Densidad
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-bio-orange bg-bio-orange/10 border border-bio-orange/20 px-2 py-1 rounded-full uppercase">
                  +{activeMeal.rewardNTK} NTK RECOMPENSA
                </span>
              </div>
            </div>

            {/* Macros bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Proteínas</span>
                  <span className="text-lg font-black text-neuro-blue block mt-1">{activeMeal.protein}g</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Carbohidratos</span>
                  <span className="text-lg font-black text-bio-orange block mt-1">{activeMeal.carbs}g</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Grasas</span>
                  <span className="text-lg font-black text-bio-green block mt-1">{activeMeal.fats}g</span>
                </div>
            </div>

            {/* Sub-info */}
            <div className="space-y-2 pt-4 border-t border-white/5 text-xs">
              <p className="text-gray-300">
                <strong className="text-white font-black uppercase tracking-wider text-[10px] block mb-1">Veredicto Biológico</strong>
                {activeMeal.veredicto}
              </p>
              <p className="text-gray-300">
                <strong className="text-white font-black uppercase tracking-wider text-[10px] block mb-1">Timing Recomendado</strong>
                {activeMeal.timing}
              </p>
              {activeMeal.warnings.length > 0 && (
                <p className="text-bio-orange">
                  <strong className="text-white font-black text-[10px] uppercase tracking-wider mb-1 block flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">warning</span> Advertencias
                  </strong>
                  {activeMeal.warnings}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bio-Axioms Checklist (Glucose Revolution) */}
      <section className="p-6 bg-glass-noir border border-white/10 rounded-3xl">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Axiomas de Control Glucémico</h3>
        <p className="text-xs text-gray-400 mb-6">
          Implementar estos hábitos metabólicos reduce drásticamente los picos de insulina y la glicación celular.
        </p>

        <div className="space-y-3">
          {/* Axiom 1 */}
          <div 
            onClick={() => handleAxiomToggle('fiberFirst')}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              axiomsChecked.fiberFirst 
                ? 'bg-bio-green/5 border-bio-green/20' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
              axiomsChecked.fiberFirst ? 'bg-bio-green border-bio-green text-dark' : 'border-gray-600'
            }`}>
              {axiomsChecked.fiberFirst && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Fibra Primero</h4>
              <p className="text-xs text-gray-400 mt-1">
                La espinaca o ensalada cruda al inicio crea una malla viscosa en el intestino delgado que limita la absorción de glucosa (+15 NTK).
              </p>
            </div>
          </div>

          {/* Axiom 2 */}
          <div 
            onClick={() => handleAxiomToggle('proteinSecond')}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              axiomsChecked.proteinSecond 
                ? 'bg-bio-green/5 border-bio-green/20' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
              axiomsChecked.proteinSecond ? 'bg-bio-green border-bio-green text-dark' : 'border-gray-600'
            }`}>
              {axiomsChecked.proteinSecond && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Proteínas y Grasas Segundas</h4>
              <p className="text-xs text-gray-400 mt-1">
                Retardan el vaciado gástrico, asegurando que la asimilación sea lenta y prolongada sin picos bruscos (+15 NTK).
              </p>
            </div>
          </div>

          {/* Axiom 3 */}
          <div 
            onClick={() => handleAxiomToggle('carbsLast')}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              axiomsChecked.carbsLast 
                ? 'bg-bio-green/5 border-bio-green/20' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
              axiomsChecked.carbsLast ? 'bg-bio-green border-bio-green text-dark' : 'border-gray-600'
            }`}>
              {axiomsChecked.carbsLast && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Almidones y Azúcares al Final</h4>
              <p className="text-xs text-gray-400 mt-1">
                Consumir carbohidratos complejos o dulces como postre minimiza significativamente su impacto glucémico (+15 NTK).
              </p>
            </div>
          </div>

          {/* Axiom 4 */}
          <div 
            onClick={() => handleAxiomToggle('walkTenMin')}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              axiomsChecked.walkTenMin 
                ? 'bg-bio-green/5 border-bio-green/20' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
              axiomsChecked.walkTenMin ? 'bg-bio-green border-bio-green text-dark' : 'border-gray-600'
            }`}>
              {axiomsChecked.walkTenMin && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Caminata de 10 min Post-Comida</h4>
              <p className="text-xs text-gray-400 mt-1">
                La contracción muscular usa la glucosa libre circulante para quemarla directamente como combustible, evitando la insulina (+15 NTK).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
