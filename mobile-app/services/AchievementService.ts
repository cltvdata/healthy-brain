import { doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from '@/constants/FirebaseConfig';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';
  requirement: number;
  category: 'streak' | 'score' | 'social' | 'exploration' | 'tournament';
  reward: number;
  unlockedAt?: any;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  { id: 'streak_3', title: 'Iniciación Biológica', description: '3 días de racha', icon: 'leaf', tier: 'bronze', requirement: 3, category: 'streak', reward: 50 },
  { id: 'streak_7', title: 'Consistencia Semanal', description: '7 días de racha', icon: 'calendar', tier: 'bronze', requirement: 7, category: 'streak', reward: 150 },
  { id: 'streak_14', title: 'Resistencia Bio-Orgánica', description: '14 días de racha', icon: 'fitness', tier: 'silver', requirement: 14, category: 'streak', reward: 300 },
  { id: 'streak_30', title: 'Maestría Circadiana', description: '30 días de racha', icon: 'time', tier: 'gold', requirement: 30, category: 'streak', reward: 750 },
  { id: 'streak_100', title: 'Soberano de la Perseverancia', description: '100 días de racha', icon: 'trophy', tier: 'legend', requirement: 100, category: 'streak', reward: 2500 },

  // Score Achievements
  { id: 'score_50', title: 'Neurona Activada', description: 'Alcanza Bio-Score 50', icon: 'pulse', tier: 'bronze', requirement: 50, category: 'score', reward: 25 },
  { id: 'score_70', title: 'Optimización Cardíaca', description: 'Alcanza Bio-Score 70', icon: 'heart', tier: 'silver', requirement: 70, category: 'score', reward: 100 },
  { id: 'score_85', title: 'Elite Biológica', description: 'Alcanza Bio-Score 85', icon: 'star', tier: 'gold', requirement: 85, category: 'score', reward: 250 },
  { id: 'score_95', title: 'Pico de Soberanía', description: 'Alcanza Bio-Score 95', icon: 'diamond', tier: 'diamond', requirement: 95, category: 'score', reward: 500 },

  // HRV Achievements
  { id: 'hrv_50', title: 'Coherencia Básica', description: 'HRV mayor a 50', icon: 'analytics', tier: 'bronze', requirement: 50, category: 'score', reward: 50 },
  { id: 'hrv_75', title: 'Resonancia Cardiaca', description: 'HRV mayor a 75', icon: 'heart-half', tier: 'gold', requirement: 75, category: 'score', reward: 200 },
  { id: 'hrv_100', title: 'Dominio Neuro-Vagal', description: 'HRV mayor a 100', icon: 'infinite', tier: 'legend', requirement: 100, category: 'score', reward: 1000 },

  // Social Achievements
  { id: 'social_refer_1', title: 'Embajador Inicial', description: 'Referir 1 amigo', icon: 'person-add', tier: 'bronze', requirement: 1, category: 'social', reward: 100 },
  { id: 'social_refer_5', title: 'Célula Leader', description: 'Referir 5 amigos', icon: 'people', tier: 'silver', requirement: 5, category: 'social', reward: 400 },
  { id: 'social_refer_25', title: 'Fundador de Colonia', description: 'Referir 25 amigos', icon: 'earth', tier: 'gold', requirement: 25, category: 'social', reward: 1500 },

  // Exploration Achievements
  { id: 'explore_nutricion', title: 'Explorador Nutricional', description: 'Usar escáner IA 10 veces', icon: 'camera', tier: 'bronze', requirement: 10, category: 'exploration', reward: 75 },
  { id: 'explore_sueno', title: 'Analista del Sueño', description: 'Completar análisis de sueño', icon: 'moon', tier: 'bronze', requirement: 1, category: 'exploration', reward: 50 },
  { id: 'explore_enfoque', title: 'Maestro del Enfoque', description: '10 sesiones de enfoque completadas', icon: 'brain', tier: 'silver', requirement: 10, category: 'exploration', reward: 200 },

  // Tournament Achievements
  { id: 'tournament_1', title: 'Primera Batalla', description: 'Participar en 1 torneo', icon: 'tennisball', tier: 'bronze', requirement: 1, category: 'tournament', reward: 50 },
  { id: 'tournament_win', title: 'Victorioso', description: 'Ganar 1 torneo', icon: 'medal', tier: 'silver', requirement: 1, category: 'tournament', reward: 300 },
  { id: 'tournament_10', title: 'Gladiador Bio-Elite', description: 'Ganar 10 torneos', icon: 'ribbon', tier: 'legend', requirement: 10, category: 'tournament', reward: 2000 },
];

export const TIERS = {
  bronze: { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)', name: 'Bronce' },
  silver: { color: '#c0c0c0', bg: 'rgba(192, 192, 192, 0.1)', name: 'Plata' },
  gold: { color: '#ffd700', bg: 'rgba(255, 215, 0, 0.1)', name: 'Oro' },
  diamond: { color: '#b9f2ff', bg: 'rgba(185, 242, 255, 0.1)', name: 'Diamante' },
  legend: { color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.1)', name: 'Leyenda' },
};

export class AchievementService {
  static async checkAndUnlockAchievements(userId: string, stats: {
    currentStreak: number;
    bioScore: number;
    hrv: number;
    referalsCount: number;
    nutritionScans: number;
    focusSessions: number;
    sleepAnalyses: number;
    tournamentsJoined: number;
    tournamentsWon: number;
  }): Promise<Achievement[]> {
    const unlocked: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      const unlockedAchievements = userData.unlockedAchievements || [];
      
      if (unlockedAchievements.includes(achievement.id)) continue;
      
      let shouldUnlock = false;
      
      switch (achievement.category) {
        case 'streak':
          shouldUnlock = stats.currentStreak >= achievement.requirement;
          break;
        case 'score':
          if (achievement.id.includes('hrv')) {
            shouldUnlock = stats.hrv >= achievement.requirement;
          } else {
            shouldUnlock = stats.bioScore >= achievement.requirement;
          }
          break;
        case 'social':
          shouldUnlock = stats.referalsCount >= achievement.requirement;
          break;
        case 'exploration':
          if (achievement.id.includes('nutricion')) {
            shouldUnlock = stats.nutritionScans >= achievement.requirement;
          } else if (achievement.id.includes('enfoque')) {
            shouldUnlock = stats.focusSessions >= achievement.requirement;
          } else if (achievement.id.includes('sueno')) {
            shouldUnlock = stats.sleepAnalyses >= achievement.requirement;
          }
          break;
        case 'tournament':
          if (achievement.id.includes('win')) {
            shouldUnlock = stats.tournamentsWon >= achievement.requirement;
          } else {
            shouldUnlock = stats.tournamentsJoined >= achievement.requirement;
          }
          break;
      }
      
      if (shouldUnlock) {
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const currentData = userDoc.data() || {};
          const currentUnlocked = currentData.unlockedAchievements || [];
          const currentBalance = currentData.ntkBalance || 0;
          
          transaction.update(userRef, {
            unlockedAchievements: [...currentUnlocked, achievement.id],
            ntkBalance: currentBalance + achievement.reward
          });
        });
        
        unlocked.push(achievement);
      }
    }
    
    return unlocked;
  }

  static getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
  }

  static getTierProgress(unlockedIds: string[]): { current: string, next: string, progress: number } {
    const unlockedCount = unlockedIds.length;
    const totalCount = ACHIEVEMENTS.length;
    const progress = (unlockedCount / totalCount) * 100;
    
    let current = 'Ninguno';
    if (progress >= 80) current = 'Leyenda';
    else if (progress >= 60) current = 'Diamante';
    else if (progress >= 40) current = 'Oro';
    else if (progress >= 20) current = 'Plata';
    else if (progress > 0) current = 'Bronce';
    
    return { current, next: 'Siguiente nivel', progress };
  }
}