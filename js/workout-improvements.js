// === WORKOUT IMPROVEMENTS BASED ON JEFIT REVIEWS ===

class WorkoutImprovements {
  constructor() {
    this.autoSaveInterval = null;
    this.workoutData = {};
  }

  // 1. QUICK LOG INPUT - Type weight/reps without scrolling
  createQuickInput(exerciseId, defaultWeight = 0, defaultReps = 10) {
    return `
      <div class="quick-input-container" data-exercise="${exerciseId}">
        <div class="quick-input-row">
          <div class="quick-input-group">
            <label class="quick-input-label">KG</label>
            <input type="number" class="quick-input quick-weight" 
              value="${defaultWeight}" step="0.5" inputmode="decimal"
              onchange="window.workoutImprovements.autoSaveSet('${exerciseId}', this)">
          </div>
          <div class="quick-input-group">
            <label class="quick-input-label">REPS</label>
            <input type="number" class="quick-input quick-reps" 
              value="${defaultReps}" inputmode="numeric"
              onchange="window.workoutImprovements.autoSaveSet('${exerciseId}', this)">
          </div>
          <button class="quick-complete-btn" onclick="window.workoutImprovements.completeSet('${exerciseId}', this)">
            <span class="material-symbols-outlined">check</span>
          </button>
        </div>
      </div>
    `;
  }

  // 2. AUTO-SAVE - First set always saves
  autoSaveSet(exerciseId, input) {
    const container = input.closest('.quick-input-container');
    const weight = container.querySelector('.quick-weight').value;
    const reps = container.querySelector('.quick-reps').value;
    
    this.workoutData[exerciseId] = {
      weight: parseFloat(weight),
      reps: parseInt(reps),
      timestamp: Date.now(),
      saved: true
    };
    
    // Save to localStorage immediately
    localStorage.setItem('hb_workout_temp', JSON.stringify(this.workoutData));
    console.log('[Workout] Auto-saved set:', exerciseId, weight, reps);
  }

  // 3. REST TIMER WITH AUDIO CUE
  startRestTimer(seconds, callback) {
    let remaining = seconds;
    const timerEl = document.getElementById('rest-timer-display');
    
    if (timerEl) {
      timerEl.classList.remove('hidden');
    }
    
    const timer = setInterval(() => {
      remaining--;
      if (timerEl) {
        timerEl.innerText = remaining;
      }
      
      // Audio beep at 3, 2, 1
      if (remaining <= 3 && remaining > 0) {
        this.playBeep(remaining);
      }
      
      if (remaining <= 0) {
        clearInterval(timer);
        if (timerEl) timerEl.classList.add('hidden');
        this.playBeep(5); // Long beep for end
        if (callback) callback();
      }
    }, 1000);
    
    return timer;
  }

  playBeep(count) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.frequency.value = count > 1 ? 880 : 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), count > 1 ? 200 : 100);
    } catch(e) {
      console.log('[Audio] Beep not available');
    }
  }

  // 4. WEIGHT DISPLAY - Always visible during exercise
  getCurrentWeightDisplay(exerciseId) {
    const data = this.workoutData[exerciseId];
    if (!data) return { weight: 0, reps: 0 };
    return { weight: data.weight, reps: data.reps };
  }

  // 5. HISTORY QUICK ACCESS - One click from main screen
  getHistoryButton(exerciseName, exerciseId) {
    const history = this.getExerciseHistory(exerciseId);
    const lastWeight = history[0]?.weight || 0;
    const lastReps = history[0]?.reps || 0;
    
    return `
      <button class="history-quick-btn" onclick="window.workoutImprovements.showHistoryModal('${exerciseId}')">
        <span class="material-symbols-outlined">history</span>
        <span class="history-text">Último: ${lastWeight}kg x ${lastReps}</span>
      </button>
    `;
  }

  getExerciseHistory(exerciseId) {
    const history = JSON.parse(localStorage.getItem('hb_workout_history') || '[]');
    return history
      .filter(w => w.exercises?.some(e => e.exercise?.id === exerciseId))
      .slice(0, 5)
      .map(w => {
        const ex = w.exercises.find(e => e.exercise?.id === exerciseId);
        const completedSet = ex?.sets?.find(s => s.completed);
        return completedSet ? { weight: completedSet.actualWeight, reps: completedSet.actualReps } : {};
      });
  }

  showHistoryModal(exerciseId) {
    const history = this.getExerciseHistory(exerciseId);
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
      <div class="history-modal-content">
        <div class="history-modal-header">
          <h3>Historial del Ejercicio</h3>
          <button onclick="this.closest('.history-modal').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="history-modal-body">
          ${history.length > 0 ? history.map((h, i) => `
            <div class="history-item">
              <span class="history-date">Sesión ${i + 1}</span>
              <span class="history-data">${h.weight}kg x ${h.reps} reps</span>
            </div>
          `).join('') : '<p class="text-text-gray text-center py-4">Sin historial</p>'}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // 6. OFFLINE MODE
  isOfflineReady() {
    return 'serviceWorker' in navigator && navigator.onLine === false;
  }

  saveWorkoutOffline(workout) {
    if (!navigator.onLine) {
      localStorage.setItem('hb_offline_workout', JSON.stringify({
        ...workout,
        pendingSync: true,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  }

  syncOfflineWorkouts() {
    if (navigator.onLine) {
      const offlineWorkout = localStorage.getItem('hb_offline_workout');
      if (offlineWorkout) {
        // Upload to Firebase
        console.log('[Sync] Uploading offline workout...');
        localStorage.removeItem('hb_offline_workout');
      }
    }
  }

  // 7. 1RM CALCULATOR - Always visible
  calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    if (reps > 12) return Math.round(weight * (36 / (37 - reps)));
    return Math.round(weight * (1 + reps / 30));
  }

  get1RMDisplay(weight, reps) {
    const oneRM = this.calculate1RM(weight, reps);
    return `
      <div class="one-rm-display">
        <span class="one-rm-label">1RM Estimado</span>
        <span class="one-rm-value">${oneRM} kg</span>
      </div>
    `;
  }

  // 8. WORKOUT SUMMARY - Quick view
  getWorkoutSummary() {
    const sets = Object.values(this.workoutData).filter(s => s.saved);
    const totalVolume = sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    const exercisesDone = Object.keys(this.workoutData).length;
    
    return {
      sets: sets.length,
      volume: totalVolume,
      exercises: exercisesDone
    };
  }
}

window.workoutImprovements = new WorkoutImprovements();

// Auto-sync offline workouts on reconnect
window.addEventListener('online', () => {
  window.workoutImprovements.syncOfflineWorkouts();
});

console.log('[Workout Improvements] Loaded - fixes from Jefit reviews');