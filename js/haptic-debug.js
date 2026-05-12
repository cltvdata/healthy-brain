class HapticDebugPanel {
  constructor() {
    this.logs = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createToggle();
    this.createPanel();
    this.setupEventListeners();
    this.updateContext();
    setInterval(() => this.updateContext(), 5000);
  }

  createToggle() {
    const btn = document.createElement('button');
    btn.className = 'haptic-toggle show';
    btn.id = 'hapticToggle';
    btn.innerHTML = '⬡';
    btn.title = 'Haptic Debug Panel';
    document.body.appendChild(btn);
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'haptic-debug-panel';
    panel.id = 'hapticPanel';
    panel.innerHTML = `
      <button class="close-debug" onclick="window.hapticDebugPanel.toggle()">×</button>
      <h3>Haptic Engine</h3>
      <div class="haptic-grid">
        <button class="haptic-btn" data-pattern="sedentary">
          <span class="icon">⚠</span>
          <span>Sedentary</span>
        </button>
        <button class="haptic-btn" data-pattern="stress">
          <span class="icon">◐</span>
          <span>Stress</span>
        </button>
        <button class="haptic-btn" data-pattern="sleepPrep">
          <span class="icon">☾</span>
          <span>Sleep</span>
        </button>
        <button class="haptic-btn" data-pattern="meditationStart">
          <span class="icon">◈</span>
          <span>Meditate</span>
        </button>
        <button class="haptic-btn" data-pattern="mealReminder">
          <span class="icon">◉</span>
          <span>Meal</span>
        </button>
        <button class="haptic-btn" data-pattern="achievement">
          <span class="icon">★</span>
          <span>Win</span>
        </button>
      </div>
      <div class="haptic-status">
        <div class="haptic-status-dot" id="hapticStatusDot"></div>
        <span id="hapticStatusText">Ready - Vibration API available</span>
      </div>
      <div class="context-display" id="contextDisplay"></div>
      <div class="haptic-log" id="hapticLog"></div>
      <div class="scenario-panel">
        <h4>Test Scenarios</h4>
        <div class="scenario-btns">
          <button class="scenario-btn" onclick="window.testScenarios.stressed()">Stressed</button>
          <button class="scenario-btn" onclick="window.testScenarios.sedentary()">Sedentary</button>
          <button class="scenario-btn" onclick="window.testScenarios.sleepPrep()">Sleep Prep</button>
          <button class="scenario-btn" onclick="window.testScenarios.balanced()">Balanced</button>
          <button class="scenario-btn" onclick="window.testScenarios.trigger()">Trigger AI</button>
        </div>
      </div>
      <div class="intervention-result" id="interventionResult"></div>
    `;
    document.body.appendChild(panel);
    panel.style.display = 'none';
  }

  setupEventListeners() {
    document.getElementById('hapticToggle').addEventListener('click', () => this.toggle());
    
    document.querySelectorAll('.haptic-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pattern = e.currentTarget.dataset.pattern;
        this.triggerPattern(pattern);
      });
    });

    window.addEventListener('hapticFeedback', (e) => {
      this.log(e.detail.pattern);
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('hapticPanel');
    const toggle = document.getElementById('hapticToggle');
    
    panel.style.display = this.isOpen ? 'block' : 'none';
    toggle.style.display = this.isOpen ? 'none' : 'flex';
  }

  triggerPattern(pattern) {
    if (window.HapticEngine) {
      window.HapticEngine.trigger(pattern);
      this.log(pattern, true);
    } else {
      this.log('HapticEngine not loaded', false);
    }
  }

  log(message, active = false) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ message, active, timestamp });
    if (this.logs.length > 10) this.logs.pop();
    this.renderLogs();
  }

  renderLogs() {
    const container = document.getElementById('hapticLog');
    container.innerHTML = this.logs.map(l => 
      `<div class="haptic-log-entry ${l.active ? 'active' : ''}">[${l.timestamp}] ${l.message}</div>`
    ).join('');
  }

  updateContext() {
    if (!window.StitchAdapter) return;
    
    const ctx = window.StitchAdapter.getContextState();
    const display = document.getElementById('contextDisplay');
    
    display.innerHTML = `
      <div class="context-display-row"><span>Time</span><span>${ctx.timeOfDay}</span></div>
      <div class="context-display-row"><span>Biometric</span><span>${ctx.biometricState}</span></div>
      <div class="context-display-row"><span>Activity</span><span>${ctx.activityState}</span></div>
      <div class="context-display-row"><span>HRV</span><span>${ctx.hrv}</span></div>
      <div class="context-display-row"><span>Cortisol</span><span>${ctx.cortisol}</span></div>
    `;
  }

  setStatus(available) {
    const dot = document.getElementById('hapticStatusDot');
    const text = document.getElementById('hapticStatusText');
    
    if (available) {
      dot.classList.remove('offline');
      text.textContent = 'Ready - Vibration API available';
    } else {
      dot.classList.add('offline');
      text.textContent = 'Desktop mode - Visual feedback only';
    }
  }
}

window.hapticDebugPanel = new HapticDebugPanel();

document.addEventListener('DOMContentLoaded', () => {
  if (window.HapticEngine) {
    window.hapticDebugPanel.setStatus(window.HapticEngine.isSupported);
  }
});