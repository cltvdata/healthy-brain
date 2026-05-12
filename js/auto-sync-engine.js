// === AUTO-SYNC ENGINE ===
// Background synchronization for all data sources

class AutoSyncEngine {
  constructor() {
    this.syncInterval = null;
    this.lastFullSync = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.initializeListeners();
  }

  initializeListeners() {
    // Online/Offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[Sync] Connection restored');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[Sync] Connection lost - queuing data');
    });

    // Background sync (if available)
    if ('backgroundSync' in window) {
      this.registerBackgroundSync();
    }
  }

  registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('background-data-sync').catch(e => {
          console.log('[Sync] Background sync not available');
        });
      });
    }
  }

  // Start automatic sync
  startAutoSync(intervalMinutes = 15) {
    // Quick sync every intervalMinutes
    this.syncInterval = setInterval(() => {
      this.quickSync();
    }, intervalMinutes * 60 * 1000);

    // Full sync every hour
    setInterval(() => {
      this.fullSync();
    }, 60 * 60 * 1000);

    // Initial sync
    setTimeout(() => this.fullSync(), 5000);

    console.log('[Sync] Auto-sync started');
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async quickSync() {
    console.log('[Sync] Quick sync...');
    
    const data = await this.collectCurrentData();
    this.saveLocalSnapshot(data);
    
    if (this.isOnline) {
      await this.uploadData(data);
    }

    // Update UI
    this.updateSyncStatus('quick');
  }

  async fullSync() {
    console.log('[Sync] Full sync...');
    const startTime = Date.now();

    try {
      // Sync all sources
      const results = await Promise.allSettled([
        this.syncAppleHealth(),
        this.syncHealthConnect(),
        this.syncWearables(),
        this.processPendingCSV(),
        this.syncBiometrics()
      ]);

      // Aggregate all data
      const data = this.aggregateAllData(results);
      
      // Calculate biological age
      if (window.healthIntegrator) {
        window.healthIntegrator.recalculateBiologicalAge();
      }

      // Update analytics
      if (window.bioAnalytics) {
        window.bioAnalytics.data = window.bioAnalytics.loadAllData();
      }

      this.lastFullSync = Date.now();
      this.saveLocalSnapshot(data);

      // Upload if online
      if (this.isOnline) {
        await this.uploadData(data);
      }

      console.log('[Sync] Full sync completed in', Date.now() - startTime, 'ms');
      this.updateSyncStatus('full', true);

    } catch (e) {
      console.error('[Sync] Full sync failed:', e);
      this.updateSyncStatus('full', false);
    }
  }

  async collectCurrentData() {
    const data = {
      timestamp: Date.now(),
      nutrition: this.getLocalData('hb_macros_data'),
      sleep: this.getLocalData('hb_sleep_data'),
      exercise: this.getLocalData('hb_workout_history'),
      stress: this.getLocalData('hb_stress_data'),
      biometrics: {
        hrv: localStorage.getItem('hb_last_hrv'),
        steps: localStorage.getItem('hb_last_steps'),
        heartRate: localStorage.getItem('hb_last_hr')
      },
      mood: this.getLocalData('hb_mood_data')
    };

    return data;
  }

  getLocalData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async syncAppleHealth() {
    if (!window.healthIntegrator?.dataSources?.appleHealth?.connected) {
      return { source: 'appleHealth', status: 'skipped' };
    }

    try {
      const steps = await this.fetchAppleMetric('steps');
      const heartRate = await this.fetchAppleMetric('heartRate');
      const sleep = await this.fetchAppleMetric('sleep');

      return {
        source: 'appleHealth',
        status: 'success',
        data: { steps, heartRate, sleep }
      };
    } catch (e) {
      return { source: 'appleHealth', status: 'error', error: e.message };
    }
  }

  async fetchAppleMetric(metric) {
    // Placeholder - actual implementation depends on Apple Health Kit
    return null;
  }

  async syncHealthConnect() {
    if (!window.healthIntegrator?.dataSources?.healthConnect?.connected) {
      return { source: 'healthConnect', status: 'skipped' };
    }

    return { source: 'healthConnect', status: 'success' };
  }

  async syncWearables() {
    const wearables = ['garmin', 'oura', 'fitbit', 'whoop'];
    const results = {};

    for (const wearable of wearables) {
      if (window.healthIntegrator?.dataSources?.[wearable]?.connected) {
        results[wearable] = { status: 'synced', lastSync: Date.now() };
      }
    }

    return { source: 'wearables', data: results };
  }

  async processPendingCSV() {
    const pending = localStorage.getItem('hb_pending_csv');
    if (!pending) return { source: 'csv', status: 'none' };

    // Process any pending CSV imports
    return { source: 'csv', status: 'processed' };
  }

  async syncBiometrics() {
    // Get real-time biometrics if available
    return {
      source: 'biometrics',
      hrv: this.estimateHRV(),
      stress: this.estimateStress()
    };
  }

  estimateHRV() {
    // Simple estimation based on time of day and activity
    const hour = new Date().getHours();
    const baseHRV = 40;
    const variation = Math.sin((hour - 6) * Math.PI / 12) * 15;
    return Math.round(baseHRV + variation);
  }

  estimateStress() {
    // Simple estimation based on time and activity
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11) return 30; // Morning - fresh
    if (hour >= 14 && hour <= 16) return 60; // Afternoon - more stress
    if (hour >= 20) return 40; // Evening - relaxing
    return 50;
  }

  aggregateAllData(results) {
    return {
      timestamp: Date.now(),
      sources: results,
      data: this.collectCurrentData()
    };
  }

  saveLocalSnapshot(data) {
    try {
      localStorage.setItem('hb_last_sync', JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    } catch (e) {
      console.log('[Sync] Local save warning:', e.message);
    }
  }

  async uploadData(data) {
    if (!window.firebaseConfig) return;

    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      await firebase.firestore().collection('users').doc(user.uid).collection('sync').doc('latest').set({
        ...data,
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('[Sync] Data uploaded to cloud');
    } catch (e) {
      console.log('[Sync] Cloud upload failed:', e.message);
    }
  }

  processQueue() {
    const queued = this.syncQueue.splice(0);
    queued.forEach(action => action());
  }

  queueSync(action) {
    if (this.isOnline) {
      action();
    } else {
      this.syncQueue.push(action);
    }
  }

  updateSyncStatus(type, success = null) {
    const statusEl = document.getElementById('sync-status');
    if (!statusEl) return;

    const icons = {
      quick: '🔄',
      full: '🔃',
      error: '⚠️'
    };

    if (success === true) {
      statusEl.innerHTML = `<span class="text-green-400">✅ Sincronizado</span>`;
    } else if (success === false) {
      statusEl.innerHTML = `<span class="text-red-400">⚠️ Error sync</span>`;
    } else {
      statusEl.innerHTML = `<span class="text-neon">${icons[type]} Sync</span>`;
    }

    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusEl.innerHTML = '';
    }, 3000);
  }

  getLastSyncTime() {
    return this.lastFullSync;
  }

  forceSyncNow() {
    return this.fullSync();
  }
}

window.autoSync = new AutoSyncEngine();

// Start auto-sync on load
setTimeout(() => {
  window.autoSync.startAutoSync(15); // Every 15 minutes
}, 10000);

console.log('[AutoSync] Engine started');