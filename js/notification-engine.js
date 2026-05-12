// === INTELLIGENT NOTIFICATIONS ENGINE ===
// Smart notifications based on health data

class NotificationEngine {
  constructor() {
    this.notifications = [];
    this.permission = 'default';
    this.init();
  }

  async init() {
    // Check permission
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }

    // Load notification history
    this.notifications = JSON.parse(localStorage.getItem('hb_notifications') || '[]');

    // Set up triggers
    this.setupTriggers();
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return { success: false, message: 'Notificaciones no soportadas' };
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    return { 
      success: permission === 'granted', 
      message: permission === 'granted' ? 'Permiso concedido' : 'Permiso denegado'
    };
  }

  setupTriggers() {
    // Check every minute
    setInterval(() => this.checkTriggers(), 60000);

    // Check on app foreground
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkTriggers();
      }
    });
  }

  checkTriggers() {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const profile = window.healthIntegrator?.userProfile || {};
    const data = window.bioAnalytics?.data || {};

    // Morning notification (7-8 AM)
    if (hour === 7) {
      this.triggerMorningRoutine(profile);
    }

    // Workout reminder (based on schedule)
    if (hour === 17 || hour === 18) {
      this.triggerWorkoutReminder(data);
    }

    // Sleep reminder (21:00)
    if (hour === 21) {
      this.triggerSleepReminder(data);
    }

    // Hydration reminder (every 2 hours during day)
    if (hour >= 8 && hour <= 20 && hour % 2 === 0) {
      this.triggerHydrationReminder(data);
    }

    // Stress check (afternoon)
    if (hour === 14) {
      this.triggerStressCheck(data);
    }

    // Weekly summary (Sunday)
    if (day === 0 && hour === 10) {
      this.triggerWeeklySummary();
    }
  }

  triggerMorningRoutine(profile) {
    if (this.hasNotifiedToday('morning')) return;

    const messages = [
      { title: '🌅 Buenos días, Guerrero!', body: 'Es hora de empezar el día con energía. Hydratación + estiramientos.' },
      { title: '☀️ Tu cuerpo te espera', body: 'Despierta tu metabolismo con un vaso de agua y 5 minutos de respiración.' },
      { title: '⚡ Energía renovada', body: 'Tienes la oportunidad de hacer de hoy un gran día. Empieza con meditación.' }
    ];

    this.sendSmartNotification(messages[Math.floor(Math.random() * messages.length)], 'morning');
  }

  triggerWorkoutReminder(data) {
    if (this.hasNotifiedToday('workout')) return;

    const exerciseScore = data.exercise?.score || 0;
    let message;

    if (exerciseScore < 40) {
      message = { 
        title: '🏋️ Hoy no has entrenado', 
        body: 'Tu cuerpo necesita movimiento. 20 min son suficientes.' 
      };
    } else if (exerciseScore < 70) {
      message = { 
        title: '💪 Oportunidad de crecer', 
        body: 'Tu cuerpo está listo para el entrenamiento. Vamos!' 
      };
    } else {
      message = { 
        title: '🔥 Buen ritmo esta semana!', 
        body: 'Ya completaste tu workout de hoy. Descansa y recupera.' 
      };
    }

    this.sendSmartNotification(message, 'workout');
  }

  triggerSleepReminder(data) {
    if (this.hasNotifiedToday('sleep')) return;

    const sleepScore = data.sleep?.score || 0;
    let message;

    if (sleepScore < 50) {
      message = { 
        title: '😴 Tu sueño te necesita', 
        body: 'La calidad de tu descanso afecta tu longevidad. A dormir antes de las 23:00.' 
      };
    } else {
      message = { 
        title: '🌙 Hora de descansar', 
        body: 'Tu cuerpo se recupera mientras duermes. Evita pantallas 30 min antes.' 
      };
    }

    this.sendSmartNotification(message, 'sleep');
  }

  triggerHydrationReminder(data) {
    if (this.hasNotifiedToday('hydration')) return;

    const waterIntake = data.nutrition?.current?.water || 0;
    const target = 2.5; // liters

    if (waterIntake < target * 0.8) {
      this.sendSmartNotification({
        title: '💧 Hydratación',
        body: `Has tomado ${waterIntake.toFixed(1)}L de ${target}L. Bebe más agua!`
      }, 'hydration');
    }
  }

  triggerStressCheck(data) {
    if (this.hasNotifiedToday('stress')) return;

    const stressLevel = data.stress?.level || 50;

    if (stressLevel > 70) {
      this.sendSmartNotification({
        title: '🧘 Nivel de estrés alto',
        body: 'Tu cuerpo te dice que necesita calma. 5 min de respiración 4-7-8 pueden ayudar.'
      }, 'stress');
    }
  }

  triggerWeeklySummary() {
    if (this.hasNotifiedThisWeek('weekly_summary')) return;

    const weekData = this.getWeekSummary();
    
    this.sendSmartNotification({
      title: '📊 Resumen Semanal',
      body: `Esta semana: ${weekData.workouts} workouts, ${weekData.sleepAvg}h sueño promedio, ${weekData.stepsAvg} pasos/día`
    }, 'weekly_summary');
  }

  getWeekSummary() {
    const data = window.bioAnalytics?.data || {};
    return {
      workouts: data.exercise?.weekly?.sessions || 0,
      sleepAvg: data.sleep?.weekly?.hours || 0,
      stepsAvg: 0 // Calculate from steps data
    };
  }

  sendSmartNotification(notification, type) {
    // Add to history
    this.notifications.push({
      ...notification,
      type,
      timestamp: Date.now(),
      shown: true
    });

    // Keep only last 100
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(-100);
    }

    localStorage.setItem('hb_notifications', JSON.stringify(this.notifications));

    // Send push notification if permitted
    if (this.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/assets/images/icon.png',
        badge: '/assets/images/badge.png',
        tag: type,
        requireInteraction: type === 'stress'
      });
    }

    // Also show in-app
    this.showInAppNotification(notification);
  }

  showInAppNotification(notification) {
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'smart-notification-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${notification.title}</div>
        <div class="toast-body">${notification.body}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  hasNotifiedToday(type) {
    const today = new Date().toDateString();
    return this.notifications.some(n => 
      n.type === type && 
      new Date(n.timestamp).toDateString() === today
    );
  }

  hasNotifiedThisWeek(type) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.notifications.some(n => 
      n.type === type && n.timestamp > weekAgo
    );
  }

  getNotificationHistory() {
    return this.notifications.slice(-50).reverse();
  }

  clearHistory() {
    this.notifications = [];
    localStorage.setItem('hb_notifications', '[]');
  }
}

window.notificationEngine = new NotificationEngine();

console.log('[Notifications] Engine loaded');