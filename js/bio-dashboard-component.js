// Bio-Analytics Dashboard Component

class BioDashboard {
  constructor() {
    this.containerId = 'bio-dashboard-container';
  }

  render() {
    if (!window.bioAnalytics || !window.aiStrategy) {
      console.log('[BioDashboard] Waiting for analytics engine...');
      return;
    }

    const analytics = window.bioAnalytics;
    const strategy = window.aiStrategy;
    const today = analytics.generateDailyStrategy();
    const tomorrow = strategy.generateTomorrowPlan();
    const insights = analytics.getAIInsights();
    const overall = analytics.calculateOverallScore();
    const forecast = analytics.getWeekForecast();

    const dashboard = this.createDashboard(overall, today, tomorrow, insights, forecast, analytics);
    this.insertDashboard(dashboard);
  }

  createDashboard(overall, today, tomorrow, insights, forecast, analytics) {
    return `
      <div class="bio-dashboard">
        <div class="bio-dashboard-header">
          <h2>🧠 Bio-Analytics IA</h2>
          <div class="bio-overall-score">
            <span class="score-value">${overall}</span>
            <span class="score-label">Score<br>General</span>
          </div>
        </div>

        <!-- Score Grid -->
        <div class="bio-score-grid">
          <div class="bio-score-item nutrition">
            <div class="bio-score-item-header">
              <span class="label">Nutrición</span>
              <span class="value">${analytics.data.nutrition.score || 0}%</span>
            </div>
            <div class="bio-score-bar">
              <div class="bio-score-bar-fill" style="width: ${analytics.data.nutrition.score || 0}%"></div>
            </div>
          </div>
          <div class="bio-score-item sleep">
            <div class="bio-score-item-header">
              <span class="label">Sueño</span>
              <span class="value">${analytics.data.sleep.score || 0}%</span>
            </div>
            <div class="bio-score-bar">
              <div class="bio-score-bar-fill" style="width: ${analytics.data.sleep.score || 0}%"></div>
            </div>
          </div>
          <div class="bio-score-item exercise">
            <div class="bio-score-item-header">
              <span class="label">Ejercicio</span>
              <span class="value">${analytics.data.exercise.score || 0}%</span>
            </div>
            <div class="bio-score-bar">
              <div class="bio-score-bar-fill" style="width: ${analytics.data.exercise.score || 0}%"></div>
            </div>
          </div>
          <div class="bio-score-item stress">
            <div class="bio-score-item-header">
              <span class="label">Estrés</span>
              <span class="value">${100 - (analytics.data.stress.level || 50)}%</span>
            </div>
            <div class="bio-score-bar">
              <div class="bio-score-bar-fill" style="width: ${100 - (analytics.data.stress.level || 50)}%"></div>
            </div>
          </div>
        </div>

        <!-- AI Strategy -->
        <div class="bio-strategy-section">
          <div class="bio-strategy-badge">
            <span class="material-symbols-outlined" style="font-size:14px">auto_awesome</span>
            Estrategia IA
          </div>
          <div class="bio-strategy-title">${tomorrow.strategy.name}</div>
          <div class="bio-strategy-desc">${tomorrow.strategy.focus}</div>
        </div>

        <!-- Recommendations -->
        <div class="bio-recommendations">
          ${today.recommendations.slice(0, 3).map(r => `
            <div class="bio-rec-item ${r.priority}">
              <span class="bio-rec-icon">
                ${r.type === 'nutrition' ? '🥗' : r.type === 'sleep' ? '😴' : r.type === 'exercise' ? '🏋️' : '🧘'}
              </span>
              <span class="bio-rec-text">${r.text}</span>
              <span class="bio-rec-priority ${r.priority}">${r.priority}</span>
            </div>
          `).join('')}
        </div>

        <!-- Week Forecast -->
        <div class="bio-forecast">
          <div class="bio-forecast-title">📅 Pronóstico Semanal</div>
          <div class="bio-forecast-grid">
            ${forecast.slice(0, 7).map((f, i) => `
              <div class="bio-forecast-day ${i === 0 ? 'today' : ''}">
                <div class="bio-forecast-day-name">${f.dayType === 'intense' ? '🔥' : f.dayType === 'rest' ? '😴' : '⚡'}${f.day.substring(0, 3)}</div>
                <div class="bio-forecast-day-type">${this.getDayTypeLabel(f.dayType)}</div>
                <div class="bio-forecast-day-score">${this.calculateDayScore(f)}%</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Insights -->
        <div class="bio-insights">
          <div class="bio-forecast-title">💡 Insights de IA</div>
          ${insights.slice(0, 3).map(i => `
            <div class="bio-insight-item ${i.category}">
              <span class="bio-insight-icon">
                ${i.category === 'warning' ? '⚠️' : i.category === 'opportunity' ? '🎯' : i.category === 'balance' ? '⚖️' : '👉'}
              </span>
              <div class="bio-insight-content">
                <div class="bio-insight-title">${i.title}</div>
                <div class="bio-insight-text">${i.text}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tomorrow Plan -->
        <div class="bio-next-plan">
          <div class="bio-next-plan-toggle" onclick="this.classList.toggle('expanded'); document.getElementById('bio-schedule').classList.toggle('hidden')">
            <h3>📋 Plan de Mañana</h3>
            <span class="material-symbols-outlined">expand_more</span>
          </div>
          <div id="bio-schedule" class="hidden">
            ${tomorrow.schedule.slice(0, 6).map(s => `
              <div class="bio-schedule-item">
                <span class="bio-schedule-time">${s.time}</span>
                <span class="bio-schedule-activity">${s.activity}</span>
                <span class="bio-schedule-priority ${s.priority}">${s.priority}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getDayTypeLabel(type) {
    const labels = {
      'intense': 'Intenso',
      'moderate': 'Moderado',
      'light': 'Ligero',
      'rest': 'Descanso',
      'recovery': 'Recup'
    };
    return labels[type] || type;
  }

  calculateDayScore(day) {
    const scores = {
      nutrition: day.focus === 'nutrition' ? 30 : 70,
      sleep: day.dayType === 'rest' ? 90 : 60,
      exercise: day.dayType === 'intense' ? 90 : day.dayType === 'light' ? 40 : 60,
      stress: day.dayType === 'recovery' ? 90 : 50
    };
    return Math.round((scores.nutrition + scores.sleep + scores.exercise + scores.stress) / 4);
  }

  insertDashboard(html) {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      
      // Find a good place to insert - after the hero section or main content
      const hero = document.querySelector('header') || document.querySelector('.hero') || document.querySelector('main');
      if (hero && hero.nextSibling) {
        hero.parentNode.insertBefore(container, hero.nextSibling);
      } else {
        document.body.prepend(container);
      }
    }
    container.innerHTML = html;
  }

  refresh() {
    this.render();
  }
}

window.bioDashboard = new BioDashboard();

// Auto-render when analytics is ready
setTimeout(() => window.bioDashboard.render(), 2000);

// Refresh every 5 minutes
setInterval(() => window.bioDashboard.refresh(), 5 * 60 * 1000);

console.log('[BioDashboard] Component loaded');