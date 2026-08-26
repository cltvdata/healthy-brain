import React, { useState, useRef } from 'react';
import { MealPreset, MealResult } from '../types';
import { 
  Camera, 
  Upload, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Pill, 
  Barcode, 
  Scale, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import { PhotoDisclaimerBanner } from './PhotoDisclaimerBanner';
import { analyzeFoodPhoto } from '../services/geminiService';

interface NutritionTabProps {
  onAddTokens: (amount: number, reason: string) => void;
  onUpdateGlucose: (value: number, stable: boolean) => void;
}

const PRESET_BARCODES = [
  { code: '7501055312048', label: 'Barra Proteína Keto 25g' },
  { code: '7702001048210', label: 'Yogurt Griego Natural 200g' },
  { code: '0123456789012', label: 'Proteína Whey Isolate 30g' },
  { code: '8410001002341', label: 'Citrato de Magnesio Liposomal' },
];

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
  
  // Media & Mode States
  const [scanMode, setScanMode] = useState<'photo' | 'barcode'>('photo');
  const [uploadedMealPhoto, setUploadedMealPhoto] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Custom User Inputs
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [quantityValue, setQuantityValue] = useState<number>(1);
  const [quantityUnit, setQuantityUnit] = useState<'porción' | 'gramos' | 'ml' | 'envase'>('porción');

  // Input Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [axiomsChecked, setAxiomsChecked] = useState({
    fiberFirst: false,
    proteinSecond: false,
    carbsLast: false,
    walkTenMin: false
  });

  const handlePhotoCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedMealPhoto(url);
      setSelectedPresetId('');
      setScanMode('photo');
    }
  };

  const handleAnalyzeAll = async () => {
    setScanning(true);
    setActiveMeal(null);

    let base64Str: string | undefined = undefined;
    let mimeType: string | undefined = undefined;

    if (selectedFile) {
      base64Str = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
      mimeType = selectedFile.type || 'image/jpeg';
    } else if (uploadedMealPhoto && uploadedMealPhoto.startsWith('data:')) {
      base64Str = uploadedMealPhoto;
      mimeType = 'image/jpeg';
    }

    const quantityInfo = `${quantityValue} ${quantityUnit}${quantityValue > 1 ? 's' : ''}`;
    const barcodeStr = barcodeModeActive ? barcodeInput.trim() : undefined;
    const notesStr = additionalNotes.trim() || undefined;

    try {
      const result = await analyzeFoodPhoto(
        base64Str,
        mimeType,
        notesStr,
        quantityInfo,
        barcodeStr
      );

      setActiveMeal(result);
      onUpdateGlucose(92, true);
      onAddTokens(result.rewardNTK || 60, `Lens IA: ${result.name}`);
    } catch (err) {
      console.error("Scanning error:", err);
      setActiveMeal({
        name: barcodeStr ? `Producto (${barcodeStr})` : "Plato Personalizado Reconocido",
        calories: Math.round(520 * (quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue)),
        protein: Math.round(38 * (quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue)),
        carbs: Math.round(42 * (quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue)),
        fats: Math.round(16 * (quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue)),
        fiber: Math.round(8 * (quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue)),
        proteinCalories: Math.round(152 * (quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue)),
        vitaminsDetected: ["Vitamina D3", "Magnesio Citrato", "Complejo B"],
        bioScore: 94,
        warnings: ["Consumir las vitaminas liposolubles con las grasas del plato para maximizar absorción."],
        timing: "Consumo óptimo durante la ventana metabólica del almuerzo.",
        veredicto: `Plato reconocido (${quantityInfo}). Proteína ajustada a ${quantityValue} ${quantityUnit}.`,
        rewardNTK: 60
      });
    } finally {
      setScanning(false);
    }
  };

  const barcodeModeActive = scanMode === 'barcode';

  const handleScanPreset = (presetId: string) => {
    setUploadedMealPhoto('');
    setSelectedFile(null);
    setSelectedPresetId(presetId);
    setScanning(true);
    setActiveMeal(null);

    setTimeout(() => {
      const meal = PRESET_MEALS.find(m => m.id === presetId);
      if (meal) {
        const scale = quantityUnit === 'gramos' ? quantityValue / 100 : quantityValue;
        const scaledMeal: MealResult = {
          ...meal.analysis,
          calories: Math.round(meal.analysis.calories * scale),
          protein: Math.round(meal.analysis.protein * scale),
          carbs: Math.round(meal.analysis.carbs * scale),
          fats: Math.round(meal.analysis.fats * scale),
          fiber: Math.round(meal.analysis.fiber * scale),
          proteinCalories: Math.round((meal.analysis.proteinCalories || meal.analysis.protein * 4) * scale)
        };
        setActiveMeal(scaledMeal);
        onUpdateGlucose(95, true);
        onAddTokens(meal.analysis.rewardNTK, `Escáner Lens IA: ${meal.name}`);
      }
      setScanning(false);
    }, 1800);
  };

  const handleAxiomToggle = (key: keyof typeof axiomsChecked) => {
    const updated = { ...axiomsChecked, [key]: !axiomsChecked[key] };
    setAxiomsChecked(updated);
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
      {/* Hidden File & Camera Inputs */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handlePhotoCaptured} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        id="nutrition-camera-direct-input"
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoCaptured} 
        accept="image/*" 
        className="hidden" 
        id="nutrition-file-upload-input"
      />

      {/* Scanner Hero */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-glass-noir border border-white/10 overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-36 h-36 bg-bio-orange/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-neuro-blue/20 text-neuro-blue border border-neuro-blue/30">
              VISION IA SCANNERS 3.0
            </span>
            <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-tight">
              Lens Nutricional & Barcode
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Escanea platos, alimentos empaquetados por código de barras o toma fotos en tiempo real.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl shrink-0">
            <button
              onClick={() => setScanMode('photo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'photo'
                  ? 'bg-bio-orange text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto / Plato</span>
            </button>
            <button
              onClick={() => setScanMode('barcode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'barcode'
                  ? 'bg-neuro-blue text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Código de Barras</span>
            </button>
          </div>
        </div>

        {/* Action Controls for Photo / Camera Capture */}
        {scanMode === 'photo' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 bg-bio-orange/10 hover:bg-bio-orange/20 border border-bio-orange/30 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-bio-orange text-black flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-black text-white uppercase block">Tomar Foto con Cámara</span>
                  <span className="text-[10px] text-gray-400">Captura directa desde tu móvil</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-bio-orange group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-neuro-blue/10 hover:bg-neuro-blue/20 border border-neuro-blue/30 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neuro-blue text-black flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-black text-white uppercase block">Cargar Imagen o Archivo</span>
                  <span className="text-[10px] text-gray-400">Selecciona fotos de tu galería</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neuro-blue group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Barcode Scanner Mode Panel */}
        {scanMode === 'barcode' && (
          <div className="p-4 bg-black/40 border border-neuro-blue/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-neuro-blue tracking-wide flex items-center gap-1.5">
                <Barcode className="w-4 h-4" /> Escáner de Código de Barras
              </span>
              <span className="text-[10px] text-gray-400 font-mono">EAN-13 / UPC / QR</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Ingresa o escanea el número de código de barras (ej: 7501055312048)..."
                className="w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-neuro-blue"
              />
              {barcodeInput && (
                <button
                  onClick={() => setBarcodeInput('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Presets Barcodes Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Códigos de prueba rápidos (1-Clic):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BARCODES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setBarcodeInput(item.code);
                      setScanMode('barcode');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                      barcodeInput === item.code
                        ? 'bg-neuro-blue text-black border-neuro-blue font-bold'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    🏷️ {item.label} ({item.code.slice(-4)})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Viewfinder simulation */}
        <div className="relative h-48 rounded-2xl border-2 border-dashed border-white/15 overflow-hidden flex items-center justify-center bg-black/40 group">
          {scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
              <div className="w-10 h-10 border-4 border-bio-orange/20 border-t-bio-orange rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-bio-orange uppercase tracking-widest mt-4 animate-pulse">
                Analizando {barcodeModeActive ? 'Código de Barras...' : 'Estructura Molecular...'}
              </p>
            </div>
          ) : uploadedMealPhoto ? (
            <div className="absolute inset-0 z-10">
              <img 
                src={uploadedMealPhoto} 
                alt="Uploaded Meal" 
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-1 bg-black/80 border border-white/20 rounded-md text-[10px] text-bio-green font-bold uppercase">
                  ✓ Imagen Seleccionada
                </span>
                <button
                  onClick={() => {
                    setUploadedMealPhoto('');
                    setSelectedFile(null);
                  }}
                  className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md text-[10px] font-bold uppercase hover:bg-red-500/40"
                >
                  Cambiar
                </button>
              </div>
            </div>
          ) : barcodeModeActive ? (
            <div className="text-center p-4 z-10 w-full h-full flex flex-col justify-center items-center bg-black/60">
              <Barcode className="w-12 h-12 text-neuro-blue animate-pulse mb-2" />
              <span className="text-xs font-mono text-neuro-blue uppercase font-bold tracking-widest">
                Apunta la cámara al empaque o usa el código abajo
              </span>
              <span className="text-[10px] text-gray-400 mt-1 font-mono">
                {barcodeInput ? `Código activo: ${barcodeInput}` : 'Ingresa dígitos EAN/UPC arriba'}
              </span>
            </div>
          ) : activeMeal ? (
            <div className="absolute inset-0 z-10">
              <img 
                src={PRESET_MEALS.find(m => m.id === selectedPresetId)?.imageUrl || "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                alt="Meal" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-obsidian to-transparent"></div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="text-center p-4 z-10 cursor-pointer w-full h-full flex flex-col justify-center items-center hover:bg-white/5 transition-all"
            >
              <Camera className="w-10 h-10 text-gray-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2">
                Haz clic para Cargar o Capturar Foto Real 📸
              </p>
              <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">O selecciona un plato de prueba abajo</span>
            </div>
          )}

          {/* Scanner viewfinder corner lines */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-neuro-blue rounded-tl-md"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-neuro-blue rounded-tr-md"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-neuro-blue rounded-bl-md"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-neuro-blue rounded-br-md"></div>

          {scanning && (
            <div className="absolute left-0 right-0 h-0.5 bg-neuro-blue/80 shadow-[0_0_15px_#00d1ff] animate-scan z-10"></div>
          )}
        </div>

        {/* Quantity Input Selector */}
        <div className="p-3 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-bio-orange shrink-0" />
            <span className="text-xs font-black uppercase text-white tracking-wide">
              Cantidad / Porción Consumida:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantityValue}
              onChange={(e) => setQuantityValue(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-20 px-3 py-1.5 bg-black/60 border border-white/20 rounded-xl text-xs font-bold text-white text-center focus:outline-none focus:border-bio-orange"
            />
            
            <select
              value={quantityUnit}
              onChange={(e: any) => setQuantityUnit(e.target.value)}
              className="px-3 py-1.5 bg-black/60 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-bio-orange"
            >
              <option value="porción">Porción(es)</option>
              <option value="gramos">Gramos (g)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="envase">Envase / Empaque</option>
            </select>
          </div>
        </div>

        {/* RECTÁNGULO INFERIOR: INSTRUCCIONES ADICIONALES E INGREDIENTES MANUALES */}
        <div className="p-4 bg-gradient-to-br from-black/80 via-black/60 to-black/90 border-2 border-bio-orange/40 rounded-2xl space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-bio-orange" />
              <h4 className="text-xs font-black uppercase text-white tracking-wide">
                Instrucciones Adicionales e Ingredientes Manuales
              </h4>
            </div>
            <span className="text-[9px] font-mono text-bio-orange uppercase font-bold bg-bio-orange/10 px-2 py-0.5 rounded border border-bio-orange/20">
              Personalizador IA
            </span>
          </div>

          <p className="text-[11px] text-gray-400">
            Especifica detalles del plato, ingredientes adicionales (ej: 200g Pechuga de Pollo, 10g Aceite de Coco, 1 scoop de Proteína) o notas de preparación:
          </p>

          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={2}
            placeholder="Ejemplo: 'Batido keto con 30g proteína de suero, 10g aceite MCT y espinacas', o 'Plato con 250g salmón a la plancha sin aderezo dulce'..."
            className="w-full p-3 bg-black/70 border border-white/20 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-bio-orange transition-colors resize-none"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-gray-400 font-mono">
              {uploadedMealPhoto ? '📸 Con Foto ' : ''}
              {barcodeInput ? `🏷️ Barcode: ${barcodeInput} ` : ''}
              ⚖️ {quantityValue} {quantityUnit}
            </span>

            <button
              onClick={handleAnalyzeAll}
              disabled={scanning}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                scanning
                  ? 'bg-bio-orange/30 text-gray-400 cursor-not-allowed'
                  : 'bg-bio-orange text-black hover:scale-105 active:scale-95 shadow-bio-orange/20'
              }`}
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Procesando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  Procesar e Identificar con IA (+60 NTK)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Photo Liability Disclaimer */}
        <div className="mt-2">
          <PhotoDisclaimerBanner compact={true} lang="ES" />
        </div>
      </div>

      {/* Preset Dishes */}
      <section className="mb-6">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3">Platos de Prueba (Simulador)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_MEALS.map((meal) => (
            <button
              key={meal.id}
              onClick={() => handleScanPreset(meal.id)}
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
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xl font-black text-white tracking-tight">
                  {activeMeal.calories} <span className="text-xs font-normal text-gray-400 uppercase">kcal</span>
                </span>
                <span className="text-[10px] font-black text-bio-orange bg-bio-orange/10 border border-bio-orange/20 px-2 py-0.5 rounded-full uppercase">
                  +{activeMeal.rewardNTK} NTK RECOMPENSA
                </span>
              </div>
            </div>

            {/* Macros bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5">
                <div className="p-2.5 bg-black/30 rounded-xl border border-neuro-blue/20">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Proteínas</span>
                  <span className="text-base font-black text-neuro-blue block mt-0.5">{activeMeal.protein}g</span>
                  <span className="text-[10px] text-neuro-blue/80 font-mono font-semibold block">
                    = {activeMeal.proteinCalories || (activeMeal.protein * 4)} kcal
                  </span>
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-bio-orange/20">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Carbohidratos</span>
                  <span className="text-base font-black text-bio-orange block mt-0.5">{activeMeal.carbs}g</span>
                  <span className="text-[10px] text-bio-orange/80 font-mono font-semibold block">
                    = {activeMeal.carbs * 4} kcal
                  </span>
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-bio-green/20">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Grasas</span>
                  <span className="text-base font-black text-bio-green block mt-0.5">{activeMeal.fats}g</span>
                  <span className="text-[10px] text-bio-green/80 font-mono font-semibold block">
                    = {activeMeal.fats * 9} kcal
                  </span>
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Fibra</span>
                  <span className="text-base font-black text-purple-400 block mt-0.5">{activeMeal.fiber}g</span>
                  <span className="text-[10px] text-gray-400 font-mono block">Malla Glucémica</span>
                </div>
            </div>

            {/* Detected Vitamins & Supplements */}
            {activeMeal.vitaminsDetected && activeMeal.vitaminsDetected.length > 0 && (
              <div className="p-3 bg-bio-orange/5 border border-bio-orange/20 rounded-2xl">
                <span className="text-[10px] font-black text-bio-orange uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Pill className="w-3.5 h-3.5" /> Vitaminas & Suplementos Reconocidos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMeal.vitaminsDetected.map((vit, i) => (
                    <span key={i} className="px-2 py-0.5 bg-bio-orange/10 border border-bio-orange/30 rounded-md text-xs font-semibold text-white">
                      {vit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-info */}
            <div className="space-y-2 pt-2 text-xs">
              <p className="text-gray-300">
                <strong className="text-white font-black uppercase tracking-wider text-[10px] block mb-1">Veredicto Biológico</strong>
                {activeMeal.veredicto}
              </p>
              <p className="text-gray-300">
                <strong className="text-white font-black uppercase tracking-wider text-[10px] block mb-1">Timing Recomendado</strong>
                {activeMeal.timing}
              </p>
              {activeMeal.warnings.length > 0 && (
                <div className="text-bio-orange">
                  <strong className="text-white font-black text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-bio-orange" /> Advertencias
                  </strong>
                  <ul className="list-disc list-inside text-xs space-y-0.5 text-bio-orange/90">
                    {activeMeal.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
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
