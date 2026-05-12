// === COMMUNITY ENGINE ===
// Social features, challenges, squads, leaderboards

class CommunityEngine {
  constructor() {
    this.userId = this.getCurrentUserId();
    this.currentSquad = null;
    this.initializeFeatures();
  }

  getCurrentUserId() {
    // Get from Firebase auth or local storage
    return localStorage.getItem('hb_user_id') || 'guest_' + Date.now();
  }

  initializeFeatures() {
    // Load user's community data
    this.loadSquadMembership();
    this.loadChallenges();
  }

  // === SQUADS (GRUPOS) ===
  async getSquads() {
    return [
      { id: 1, name: 'Guerreros Biológicos', members: 24, focus: 'Longevidad', level: 5 },
      { id: 2, name: 'Neurohackers', members: 18, focus: 'Cognitive', level: 4 },
      { id: 3, name: 'Metabolic Masters', members: 31, focus: 'Metabolism', level: 6 },
      { id: 4, name: 'Sleep Optimizers', members: 15, focus: 'Recovery', level: 3 },
      { id: 5, name: 'Strength Warriors', members: 42, focus: 'Strength', level: 7 }
    ];
  }

  async joinSquad(squadId) {
    const squads = await this.getSquads();
    const squad = squads.find(s => s.id === squadId);
    this.currentSquad = squad;
    localStorage.setItem('hb_current_squad', JSON.stringify(squad));
    return { success: true, message: `Te uniste a ${squad.name}` };
  }

  loadSquadMembership() {
    const stored = localStorage.getItem('hb_current_squad');
    if (stored) {
      this.currentSquad = JSON.parse(stored);
    }
  }

  // === CHALLENGES ===
  getActiveChallenges() {
    return [
      {
        id: 1,
        title: '30 Días de Meditación',
        description: 'Medita al menos 10 min diarios durante 30 días',
        progress: 12,
        target: 30,
        reward: 500,
        participants: 1243,
        endsAt: '2026-06-10',
        type: 'mental'
      },
      {
        id: 2,
        title: 'Desafío VO2 Max',
        description: 'Mejora tu VO2 Max en 5 puntos en 60 días',
        progress: 2,
        target: 5,
        reward: 1000,
        participants: 567,
        endsAt: '2026-07-15',
        type: 'cardio'
      },
      {
        id: 3,
        title: 'Strength Starter',
        description: 'Completa 20 sesiones de fuerza en 60 días',
        progress: 8,
        target: 20,
        reward: 750,
        participants: 892,
        endsAt: '2026-07-01',
        type: 'strength'
      },
      {
        id: 4,
        title: 'Sleep Champion',
        description: 'Consigue 30 días con +80% de calidad de sueño',
        progress: 18,
        target: 30,
        reward: 600,
        participants: 734,
        endsAt: '2026-06-20',
        type: 'recovery'
      },
      {
        id: 5,
        title: 'Nutríente Master',
        description: 'Cumple tus macros de proteína 25 días',
        progress: 15,
        target: 25,
        reward: 500,
        participants: 1567,
        endsAt: '2026-06-15',
        type: 'nutrition'
      }
    ];
  }

  joinChallenge(challengeId) {
    const challenges = this.getActiveChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (challenge) {
      localStorage.setItem('hb_active_challenge', JSON.stringify(challenge));
      return { success: true, message: `Te uniste al desafío: ${challenge.title}` };
    }
    return { success: false, message: 'Desafío no encontrado' };
  }

  updateChallengeProgress() {
    // Get current challenge
    const challenge = JSON.parse(localStorage.getItem('hb_active_challenge'));
    if (!challenge) return;

    // Update progress based on actual data
    const bioData = window.bioAnalytics?.data || {};
    
    if (challenge.type === 'mental') {
      // Check meditation sessions
      challenge.progress++;
    } else if (challenge.type === 'strength') {
      // Check workout sessions
      challenge.progress = (bioData.exercise?.weekly?.sessions || 0);
    } else if (challenge.type === 'recovery') {
      // Check sleep quality
      challenge.progress = (bioData.sleep?.score || 0) > 80 ? challenge.progress + 1 : challenge.progress;
    }

    localStorage.setItem('hb_active_challenge', JSON.stringify(challenge));
    return challenge;
  }

  // === LEADERBOARD ===
  getLeaderboard(type = 'global') {
    const today = new Date().toISOString().split('T')[0];
    
    return [
      { rank: 1, name: 'Carlos M.', xp: 15420, streak: 45, avatar: 'CM' },
      { rank: 2, name: 'Ana G.', xp: 14890, streak: 38, avatar: 'AG' },
      { rank: 3, name: 'Mario R.', xp: 13200, streak: 52, avatar: 'MR' },
      { rank: 4, name: 'Laura K.', xp: 12100, streak: 28, avatar: 'LK' },
      { rank: 5, name: 'Jorge L.', xp: 11800, streak: 31, avatar: 'JL' },
      { rank: 6, name: 'Sofia P.', xp: 10500, streak: 22, avatar: 'SP' },
      { rank: 7, name: 'David H.', xp: 9800, streak: 35, avatar: 'DH' },
      { rank: 8, name: 'María T.', xp: 9200, streak: 19, avatar: 'MT' },
      { rank: 9, name: 'Roberto C.', xp: 8700, streak: 41, avatar: 'RC' },
      { rank: 10, name: 'Tú', xp: 4500, streak: 5, avatar: 'YO', isUser: true }
    ];
  }

  getWeeklyLeaderboard() {
    return [
      { rank: 1, name: 'Carlos M.', xp: 2340, change: 'up' },
      { rank: 2, name: 'Ana G.', xp: 2180, change: 'up' },
      { rank: 3, name: 'Mario R.', xp: 1920, change: 'down' },
      { rank: 4, name: 'Laura K.', xp: 1850, change: 'up' },
      { rank: 5, name: 'Jorge L.', xp: 1720, change: 'same' }
    ];
  }

  // === ACTIVITY FEED ===
  getActivityFeed() {
    return [
      { type: 'workout', user: 'Carlos M.', action: 'completó un entrenamiento de fuerza', time: '2h', avatar: 'CM' },
      { type: 'challenge', user: 'Ana G.', action: 'se unió al desafío VO2 Max', time: '3h', avatar: 'AG' },
      { type: 'achievement', user: 'Mario R.', action: 'desbloqueó el logro de Consistency King', time: '5h', avatar: 'MR' },
      { type: 'squad', user: 'Laura K.', action: 'invita a guerreros a su escuadrón', time: '6h', avatar: 'LK' },
      { type: 'milestone', user: 'Jorge L.', action: 'alcanzó Level 25', time: '8h', avatar: 'JL' },
      { type: 'streak', user: 'Roberto C.', action: 'mantiene racha de 41 días', time: '12h', avatar: 'RC' }
    ];
  }

  // === FRIENDS ===
  getFriends() {
    return [
      { id: 1, name: 'Carlos M.', status: 'online', xp: 15420 },
      { id: 2, name: 'Ana G.', status: 'offline', xp: 14890 },
      { id: 3, name: 'Mario R.', status: 'online', xp: 13200 }
    ];
  }

  addFriend(userId) {
    return { success: true, message: 'Solicitud enviada' };
  }

  removeFriend(userId) {
    return { success: true, message: 'Amigo eliminado' };
  }

  // === STATS ===
  getCommunityStats() {
    return {
      totalUsers: 12543,
      activeToday: 3421,
      totalWorkouts: 45678,
      challengesCompleted: 8934,
      totalNTKEarned: 2345678
    };
  }
}

window.communityEngine = new CommunityEngine();
console.log('[Community] Engine loaded');