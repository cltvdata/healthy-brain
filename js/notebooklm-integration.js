const NOTEBOOKLM_WEIGHTS = {
  medical: 1.0,
  nutrition: 0.85,
  fitness: 0.7,
  sleep: 0.75,
  stress: 0.8,
  biometric: 0.9
};

class NotebookLMProcessor {
  constructor() {
    this.sources = {};
    this.contextWindow = [];
    this.maxContextItems = 10;
  }

  async ingestSource(notebookId, sourceData) {
    this.sources[notebookId] = {
      data: sourceData,
      type: this.detectSourceType(sourceData),
      weight: this.assignWeight(sourceData),
      timestamp: Date.now(),
      embeddings: await this.generateEmbeddings(sourceData)
    };
    console.log(`[NotebookLM] Ingested ${notebookId} with weight ${this.sources[notebookId].weight}`);
  }

  detectSourceType(data) {
    if (data.medicalRecord) return 'medical';
    if (data.nutritionData) return 'nutrition';
    if (data.workoutLog) return 'fitness';
    if (data.sleepData) return 'sleep';
    if (data.biomarkers) return 'biometric';
    return 'general';
  }

  assignWeight(data) {
    if (data.medicalRecord?.length > 0) return NOTEBOOKLM_WEIGHTS.medical;
    if (data.nutritionData?.calories) return NOTEBOOKLM_WEIGHTS.nutrition;
    if (data.workoutLog?.exercises) return NOTEBOOKLM_WEIGHTS.fitness;
    return 0.5;
  }

  async generateEmbeddings(data) {
    return data;
  }

  query(prompt, priorityFilters = []) {
    let scoredResults = [];

    for (const [notebookId, source] of Object.entries(this.sources)) {
      const relevanceScore = this.calculateRelevance(prompt, source);
      const finalScore = relevanceScore * source.weight;
      
      if (priorityFilters.length > 0 && !priorityFilters.includes(source.type)) {
        continue;
      }

      scoredResults.push({
        notebookId,
        source,
        score: finalScore,
        data: source.data
      });
    }

    scoredResults.sort((a, b) => b.score - a.score);

    this.contextWindow = scoredResults.slice(0, this.maxContextItems);
    
    return this.contextWindow;
  }

  calculateRelevance(prompt, source) {
    const keywords = prompt.toLowerCase().split(' ');
    let relevance = 0;
    
    keywords.forEach(kw => {
      const sourceStr = JSON.stringify(source.data).toLowerCase();
      if (sourceStr.includes(kw)) {
        relevance += 1;
      }
    });
    
    return Math.min(relevance / keywords.length, 1.0);
  }

  generateMicroIntervention(userContext) {
    const relevantData = this.query(userContext.prompt, userContext.priority);
    
    const intervention = {
      type: this.determineInterventionType(userContext),
      duration: '10 minutes',
      sources: relevantData.map(r => r.notebookId),
      content: this.synthesizeContent(relevantData, userContext),
      hapticPattern: this.mapToHaptic(userContext.state),
      timestamp: Date.now()
    };

    return intervention;
  }

  determineInterventionType(context) {
    if (context.hrv < 30 || context.cortisol > 70) return 'meditation';
    if (context.inactivityMinutes > 60) return 'exercise';
    if (context.caloriesRemaining > 300) return 'nutrition';
    if (context.hour >= 20) return 'sleepPrep';
    return 'focus';
  }

  synthesizeContent(sources, context) {
    return {
      recommendation: this.generateRecommendation(sources, context),
      confidence: sources.reduce((acc, s) => acc + s.score, 0) / sources.length,
      dataPoints: sources.length
    };
  }

  generateRecommendation(sources, context) {
    const highPriority = sources.filter(s => s.source.weight >= 0.85);
    
    if (highPriority.length > 0) {
      return highPriority[0].source.data.recommendation || 
             'Basado en tus datos de salud, te sugiero una intervención de 10 min.';
    }
    return 'Micro-intervención personalizada basada en tu perfil.';
  }

  mapToHaptic(state) {
    const mapping = {
      stress: 'stress',
      sedentary: 'sedentarismo',
      sleepPrep: 'sleepPrep',
      focus: 'meditationStart'
    };
    return mapping[state] || 'subtle';
  }

  detectConflicts() {
    const conflicts = [];
    const sources = Object.values(this.sources);
    
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        if (this.hasConflict(sources[i], sources[j])) {
          conflicts.push({
            sourceA: sources[i].type,
            sourceB: sources[j].type,
            resolution: this.resolveConflict(sources[i], sources[j])
          });
        }
      }
    }
    
    return conflicts;
  }

  hasConflict(sourceA, sourceB) {
    if (sourceA.type === 'medical' && sourceB.type === 'fitness') {
      return true;
    }
    return false;
  }

  resolveConflict(sourceA, sourceB) {
    if (sourceA.weight > sourceB.weight) {
      return { winner: sourceA.type, priority: 'medical' };
    }
    return { winner: sourceB.type, priority: sourceB.weight >= 0.8 ? 'medical' : 'fitness' };
  }
}

const notebookLM = new NotebookLMProcessor();

window.NotebookLMProcessor = notebookLM;