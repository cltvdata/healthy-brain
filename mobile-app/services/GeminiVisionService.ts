// services/GeminiVisionService.ts
import { Alert } from 'react-native';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";

export interface MacroBreakdown {
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

export interface NutrientWarnings {
  highSodium: boolean;
  highSugar: boolean;
  highSaturatedFat: boolean;
  lowProtein: boolean;
}

export interface GeminiAnalysisResult {
  id?: string;
  name: string;
  description: string;
  calories: number;
  macros: MacroBreakdown;
  bioScore: number;
  ntkReward: number;
  type: 'food' | 'beverage' | 'supplement' | 'accessory' | 'unknown';
  
  // Análisis avanzado
  nutrients: {
    vitamins: string[];
    minerals: string[];
    antioxidants: string[];
  };
  
  warnings: NutrientWarnings;
  
  // Recomendaciones personalizadas
  hormonalAdvice: string;
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  
  // Procedimientos y pasos
  preparationSteps?: string[];
  pairingSuggestions?: string[];
  timingAdvice?: string;
  
  // Metadatos
  imageUrl?: string;
  createdAt?: any;
}

export class GeminiVisionService {
  static async analyzeImage(base64Image: string, cyclePhaseContext?: string): Promise<GeminiAnalysisResult> {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      console.warn("⚠️ API Key de Gemini no configurada. Usando mock data.");
      return this.generateMockResult(cyclePhaseContext);
    }

    try {
      const prompt = `
Eres un Nutricionista Clínico, Biohacker y Experto en Longevidad con formación en medicina funcional.
Analiza esta imagen de comida, bebida o suplemento alimenticio.

Responde en formato JSON estricto (sin markdown, sin backticks):

{
  "name": "Nombre del plato/alimento",
  "description": "Descripción breve del plato",
  "calories": <número>,
  "macros": {
    "protein": <gramos>,
    "carbs": <gramos>,
    "fats": <gramos>,
    "fiber": <gramos>
  },
  "bioScore": <0-100>,
  "ntkReward": <1-50>,
  "type": "food" | "beverage" | "supplement" | "unknown",
  "nutrients": {
    "vitamins": ["vitamina A", "vitamina C"],
    "minerals": ["hierro", "magnesio"],
    "antioxidantes": ["polifenoles", "carotenoides"]
  },
  "warnings": {
    "highSodium": <true/false>,
    "highSugar": <true/false>,
    "highSaturatedFat": <true/false>,
    "lowProtein": <true/false>
  },
  "hormonalAdvice": "Consejo basado en fase hormonal del ciclo: ${cyclePhaseContext || 'No especificada'}",
  "recommendations": [
    {
      "title": "Título de la recomendación",
      "description": "Descripción detallada",
      "priority": "high" | "medium" | "low"
    }
  ],
  "preparationSteps": ["Paso 1", "Paso 2"],
  "pairingSuggestions": ["Alimento 1", "Alimento 2"],
  "timingAdvice": "Mejor momento del día para consumir"
}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      const cleanJsonStr = textResponse.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      return this.transformResult(parsed);

    } catch (error) {
      console.error("Error al analizar imagen con Gemini:", error);
      Alert.alert("Error de IA", "No pudimos analizar la imagen, cayendo a modo simulación.");
      return this.generateMockResult(cyclePhaseContext);
    }
  }

  private static transformResult(parsed: any): GeminiAnalysisResult {
    return {
      name: parsed.name || 'Desconocido',
      description: parsed.description || '',
      calories: parsed.calories || 0,
      macros: {
        protein: parsed.macros?.protein || 0,
        carbs: parsed.macros?.carbs || 0,
        fats: parsed.macros?.fats || 0,
        fiber: parsed.macros?.fiber || 0,
      },
      bioScore: parsed.bioScore || 50,
      ntkReward: parsed.ntkReward || 5,
      type: parsed.type || 'unknown',
      nutrients: {
        vitamins: parsed.nutrients?.vitamins || [],
        minerals: parsed.nutrients?.minerals || [],
        antioxidants: parsed.nutrients?.antioxidants || [],
      },
      warnings: {
        highSodium: parsed.warnings?.highSodium || false,
        highSugar: parsed.warnings?.highSugar || false,
        highSaturatedFat: parsed.warnings?.highSaturatedFat || false,
        lowProtein: parsed.warnings?.lowProtein || false,
      },
      hormonalAdvice: parsed.hormonalAdvice || '',
      recommendations: parsed.recommendations || [],
      preparationSteps: parsed.preparationSteps || [],
      pairingSuggestions: parsed.pairingSuggestions || [],
      timingAdvice: parsed.timingAdvice || '',
    };
  }

  static generateMockResult(cyclePhaseContext?: string): GeminiAnalysisResult {
    const mockResults = [
      {
        name: 'Bowl de Proteína y Vegetales',
        description: 'Bowl completo con pollo, quinoa, vegetales asados y aguacate',
        calories: 520,
        macros: { protein: 42, carbs: 48, fats: 18, fiber: 12 },
        bioScore: 92,
        ntkReward: 15,
        type: 'food' as const,
        nutrients: { vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina B6'], minerals: ['Hierro', 'Magnesio', 'Potasio'], antioxidants: ['Licopeno', 'Beta-caroteno'] },
        warnings: { highSodium: false, highSugar: false, highSaturatedFat: false, lowProtein: false },
        hormonalAdvice: '🥗 Excelente opción para cualquier fase del ciclo. Alto contenido de proteína para recuperación muscular.',
        recommendations: [
          { title: 'Optimiza la absorción de hierro', description: 'Añade limón para aumentar absorción de hierro no hemo', priority: 'high' as const },
          { title: 'Añade fermentos', description: 'Un poco de chucrut beneficiaría tu microbiota', priority: 'medium' as const },
        ],
        preparationSteps: ['Cocina el pollo a 165°F', 'Asa vegetales a 400°F por 20 min', 'Cocina quinoa 15 min'],
        pairingSuggestions: ['Agua con limón', 'Té verde', 'Frutos rojos'],
        timingAdvice: 'Ideal para comida post-entrenamiento'
      },
      {
        name: 'Batido Verde Detox',
        description: 'Spinach, plátano, proteína, semillas de chía',
        calories: 320,
        macros: { protein: 28, carbs: 35, fats: 10, fiber: 8 },
        bioScore: 88,
        ntkReward: 12,
        type: 'beverage' as const,
        nutrients: { vitamins: ['Vitamina K', 'Vitamina C', 'Folato'], minerals: ['Manganeso', 'Magnesio', 'Potasio'], antioxidantes: ['Clorofila', 'catequinas'] },
        warnings: { highSodium: false, highSugar: true, highSaturatedFat: false, lowProtein: false },
        hormonalAdvice: '🍃 Perfecto para fase folicular. Los verdes ayudan a metabolizar estrógenos.',
        recommendations: [
          { title: 'Controla el azúcar', description: 'Usa mitad plátano o añade proteína para equilibrar índice glucémico', priority: 'high' as const },
        ],
        preparationSteps: ['Licúa hojas de espinaca con agua', 'Añade plátano congelado', 'Agrega proteína y chía'],
        pairingSuggestions: ['Egg whites', 'Nueces'],
        timingAdvice: 'Desayuno o merienda matutina'
      }
    ];

    const random = mockResults[Math.floor(Math.random() * mockResults.length)];
    return {
      ...random,
      createdAt: serverTimestamp()
    };
  }

  static async saveAnalysisToFirestore(result: GeminiAnalysisResult, imageUri: string): Promise<string | null> {
    if (!auth.currentUser) return null;

    try {
      const analysisRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'nutritional_analysis'), {
        ...result,
        imageUrl: imageUri,
        createdAt: serverTimestamp(),
      });

      // Update user's total nutrition scans
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        nutritionScans: increment(1),
        totalNTKEarned: increment(result.ntkReward)
      });

      // Check for achievements
      await this.checkNutritionAchievements();

      return analysisRef.id;
    } catch (error) {
      console.error("Error saving analysis:", error);
      return null;
    }
  }

  private static async checkNutritionAchievements() {
    if (!auth.currentUser) return;

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const scans = userDoc.data()?.nutritionScans || 0;

    const achievements = [
      { id: 'explore_nutricion_10', required: 10, reward: 75 },
      { id: 'explore_nutricion_25', required: 25, reward: 150 },
      { id: 'explore_nutricion_50', required: 50, reward: 300 },
    ];

    for (const ach of achievements) {
      if (scans >= ach.required) {
        const unlocked = userDoc.data()?.unlockedAchievements || [];
        if (!unlocked.includes(ach.id)) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            unlockedAchievements: [...unlocked, ach.id],
            ntkBalance: increment(ach.reward)
          });
        }
      }
    }
  }

  static async getAnalysisHistory(): Promise<GeminiAnalysisResult[]> {
    if (!auth.currentUser) return [];

    // This would typically fetch from Firestore
    return [];
  }
}