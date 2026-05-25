import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEIGHTS = {
  medical: 1.0,
  nutrition: 0.85,
  fitness: 0.7,
  sleep: 0.75,
  stress: 0.8,
  biometric: 0.9
};

interface NotebookSource {
  id: string;
  type: string;
  data: any;
  weight: number;
}

export function useNotebookLM() {
  const [sources, setSources] = useState<NotebookSource[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      const stored = await AsyncStorage.getItem('notebooks');
      if (stored) {
        setSources(JSON.parse(stored));
      }
      setIsReady(true);
    } catch (e) {
      console.error('Error loading notebooks:', e);
    }
  };

  const ingestSource = async (notebookId: string, type: string, data: any) => {
    const weight = WEIGHTS[type as keyof typeof WEIGHTS] || 0.5;
    const newSource = { id: notebookId, type, data, weight };
    const updated = [...sources, newSource];
    setSources(updated);
    await AsyncStorage.setItem('notebooks', JSON.stringify(updated));
  };

  const query = (prompt: string, priorityTypes?: string[]) => {
    let results = sources.map(s => ({
      ...s,
      score: calculateRelevance(prompt, s) * s.weight
    }));

    if (priorityTypes && priorityTypes.length > 0) {
      results = results.filter(r => priorityTypes!.includes(r.type));
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  };

  const calculateRelevance = (prompt: string, source: NotebookSource) => {
    const keywords = prompt.toLowerCase().split(' ');
    let score = 0;
    keywords.forEach(kw => {
      if (JSON.stringify(source.data).toLowerCase().includes(kw)) score++;
    });
    return Math.min(score / keywords.length, 1);
  };

  const generateMicroIntervention = useCallback((userContext: any) => {
    const relevant = query(userContext.prompt, userContext.priority);
    
    const intervention = {
      type: determineInterventionType(userContext),
      duration: '10 minutes',
      sources: relevant.map(r => r.id),
      content: synthesizeContent(relevant, userContext),
      hapticPattern: mapToHaptic(userContext.state),
      timestamp: Date.now()
    };

    return intervention;
  }, [sources]);

  const determineInterventionType = (ctx: any) => {
    if (ctx.hrv < 30 || ctx.cortisol > 70) return 'meditation';
    if (ctx.inactivity > 120) return 'exercise';
    if (ctx.hour >= 20) return 'sleepPrep';
    return 'focus';
  };

  const synthesizeContent = (sources: any[], ctx: any) => {
    return {
      recommendation: sources[0]?.data?.recommendation || 'Micro-intervención personalizada',
      confidence: sources.reduce((a, s) => a + s.score, 0) / (sources.length || 1)
    };
  };

  const mapToHaptic = (state: string) => {
    const map: Record<string, string> = {
      stress: 'stress',
      sedentary: 'sedentary',
      sleepPrep: 'sleepPrep',
      focus: 'meditationStart'
    };
    return map[state] || 'meditationStart';
  };

  return {
    isReady,
    sources,
    ingestSource,
    query,
    generateMicroIntervention
  };
}