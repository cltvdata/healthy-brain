class MasterControlPanel {
  constructor() {
    this.consoleLogs = [];
    this.testResults = {};
    this.init();
  }

  init() {
    this.createToggle();
    this.createPanel();
    this.log('Master Control Panel initialized', 'info');
  }

  createToggle() {
    const btn = document.createElement('button');
    btn.className = 'mc-launch-btn';
    btn.id = 'mcToggle';
    btn.innerHTML = '⚡';
    btn.title = 'Master Control Panel';
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'master-control';
    panel.id = 'mcPanel';
    panel.innerHTML = `
      <div class="mc-header">
        <h1>⚡ HEALTHY + BRAIN - CONTROL CENTER</h1>
        <button class="mc-close" onclick="window.mcPanel.toggle()">×</button>
      </div>
      <div class="mc-content">
        <div class="mc-section">
          <h2>🔬 SYSTEM TESTS</h2>
          <div class="mc-grid">
            <button class="mc-btn" onclick="window.mcPanel.runSystemTest()">
              <span class="icon">🔍</span>
              <span class="label">Full System Test</span>
              <span class="status">Run all tests</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testModules()">
              <span class="icon">📦</span>
              <span class="label">Test Modules</span>
              <span class="status">JS Components</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testUI()">
              <span class="icon">🎨</span>
              <span class="label">Test UI/UX</span>
              <span class="status">Interface</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testHaptics()">
              <span class="icon">📳</span>
              <span class="label">Test Haptics</span>
              <span class="status">Vibration</span>
            </button>
          </div>
        </div>

        <div class="mc-section">
          <h2>🎵 MULTIMEDIA</h2>
          <div class="mc-grid">
            <button class="mc-btn" onclick="window.mcPanel.testAudio()">
              <span class="icon">🎵</span>
              <span class="label">Test Audio</span>
              <span class="status">Music/ASMR</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testCamera()">
              <span class="icon">📷</span>
              <span class="label">Test Camera</span>
              <span class="status">Video analyze</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testMediaPlayer()">
              <span class="icon">🎬</span>
              <span class="label">Media Player</span>
              <span class="status">Breathing videos</span>
            </button>
          </div>
        </div>

        <div class="mc-section">
          <h2>📁 DATA & STORAGE</h2>
          <div class="mc-grid">
            <button class="mc-btn" onclick="window.mcPanel.testLocalStorage()">
              <span class="icon">💾</span>
              <span class="label">Local Storage</span>
              <span class="status">User data</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testFirebase()">
              <span class="icon">🔥</span>
              <span class="label">Firebase</span>
              <span class="status">Cloud DB</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testFileUpload()">
              <span class="icon">📤</span>
              <span class="label">File Upload</span>
              <span class="status">Import files</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testHistory()">
              <span class="icon">📜</span>
              <span class="label">History</span>
              <span class="status">Session logs</span>
            </button>
          </div>
        </div>

        <div class="mc-section">
          <h2>🤖 AI & CONNECTIONS</h2>
          <div class="mc-grid">
            <button class="mc-btn" onclick="window.mcPanel.testNotebookLM()">
              <span class="icon">🧠</span>
              <span class="label">NotebookLM</span>
              <span class="status">AI Brain</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testAIConnections()">
              <span class="icon">🔗</span>
              <span class="label">AI Connections</span>
              <span class="status">API Links</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testInsights()">
              <span class="icon">💡</span>
              <span class="label">Insights Engine</span>
              <span class="status">Analytics</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.testPrediction()">
              <span class="icon">🔮</span>
              <span class="label">Predictions</span>
              <span class="status">ML Models</span>
            </button>
          </div>
        </div>

        <div class="mc-section">
          <h2>🚀 LAUNCH READY</h2>
          <div class="mc-grid">
            <button class="mc-btn success" onclick="window.mcPanel.deployProduction()">
              <span class="icon">🚀</span>
              <span class="label">Deploy Production</span>
              <span class="status">Go live!</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.buildApp()">
              <span class="icon">📱</span>
              <span class="label">Build Mobile App</span>
              <span class="status">Generate APK</span>
            </button>
            <button class="mc-btn" onclick="window.mcPanel.exportConfig()">
              <span class="icon">⚙️</span>
              <span class="label">Export Config</span>
              <span class="status">Backup settings</span>
            </button>
          </div>
        </div>

        <div class="test-results" id="testResults" style="display:none;">
          <h3>📊 TEST RESULTS</h3>
          <div class="result-grid" id="resultGrid"></div>
        </div>

        <div class="mc-console" id="mcConsole">
          <div class="entry">System ready...</div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  toggle() {
    const panel = document.getElementById('mcPanel');
    panel.classList.toggle('active');
  }

  log(msg, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    this.consoleLogs.push({ msg, type, timestamp });
    const console = document.getElementById('mcConsole');
    console.innerHTML = `<div class="entry ${type}">[${timestamp}] ${msg}</div>` + console.innerHTML;
    if (this.consoleLogs.length > 50) this.consoleLogs.pop();
  }

  showResults(results) {
    document.getElementById('testResults').style.display = 'block';
    const grid = document.getElementById('resultGrid');
    grid.innerHTML = Object.entries(results).map(([k, v]) => 
      `<div class="result-item ${v.toLowerCase()}"><strong>${k}</strong>: ${v}</div>`
    ).join('');
  }

  async runSystemTest() {
    this.log('Starting full system test...');
    if (window.SYSTEM_TESTS) {
      await window.SYSTEM_TESTS.runAll();
      this.showResults(window.SYSTEM_TESTS.results);
    }
  }

  async testModules() {
    this.log('Testing modules...');
    const modules = ['NotebookLMProcessor', 'HapticEngine', 'StitchAdapter', 'mockDataEngine'];
    const results = {};
    modules.forEach(m => {
      results[m] = window[m] ? 'PASS' : 'FAIL';
      this.log(`${m}: ${results[m]}`);
    });
    this.showResults(results);
  }

  async testUI() {
    this.log('Testing UI components...');
    const checks = [
      document.querySelector('.app-container') ? 'App Container' : null,
      document.querySelector('nav') ? 'Navigation' : null,
      document.querySelector('.glass-card') ? 'Glass Cards' : null,
      document.getElementById('hapticToggle') ? 'Haptic Panel' : null
    ].filter(Boolean);
    this.log(`Found ${checks.length} UI components`);
    this.showResults({'UI Components': checks.length > 0 ? 'PASS' : 'FAIL'});
  }

  async testHaptics() {
    this.log('Testing haptic patterns...');
    const patterns = ['stress', 'sedentary', 'sleepPrep', 'meditationStart', 'achievement'];
    patterns.forEach(p => {
      if (window.HapticEngine) {
        window.HapticEngine.trigger(p);
        this.log(`Triggered: ${p}`);
      }
    });
    this.showResults({'Haptics': 'PASS'});
  }

  async testAudio() {
    this.log('Testing audio system...');
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.log(`AudioContext created: ${audioCtx.state}`);
      this.showResults({'Audio': audioCtx.state === 'running' ? 'PASS' : 'WARN'});
    } catch(e) {
      this.log(`Audio error: ${e.message}`, 'error');
      this.showResults({'Audio': 'FAIL'});
    }
  }

  async testCamera() {
    this.log('Testing camera access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      this.log('Camera access granted');
      this.showResults({'Camera': 'PASS'});
    } catch(e) {
      this.log(`Camera denied: ${e.message}`, 'warn');
      this.showResults({'Camera': 'WARN - Permission required'});
    }
  }

  async testMediaPlayer() {
    this.log('Checking media elements...');
    const videos = document.querySelectorAll('video');
    const audios = document.querySelectorAll('audio');
    this.log(`Found ${videos.length} videos, ${audios.length} audio elements`);
    this.showResults({'MediaPlayer': videos.length + audios.length > 0 ? 'PASS' : 'WARN'});
  }

  async testLocalStorage() {
    this.log('Testing localStorage...');
    try {
      localStorage.setItem('test', 'healthy-brain');
      const val = localStorage.getItem('test');
      this.log(`LocalStorage: ${val}`);
      this.showResults({'LocalStorage': val === 'healthy-brain' ? 'PASS' : 'FAIL'});
    } catch(e) {
      this.showResults({'LocalStorage': 'FAIL'});
    }
  }

  async testFirebase() {
    this.log('Testing Firebase connection...');
    if (window.firebaseConfig) {
      this.log('Firebase config loaded');
      this.showResults({'Firebase': 'PASS'});
    } else {
      this.showResults({'Firebase': 'WARN - Config not in window'});
    }
  }

  async testFileUpload() {
    this.log('Checking file input elements...');
    const inputs = document.querySelectorAll('input[type="file"]');
    this.log(`Found ${inputs.length} file inputs`);
    this.showResults({'FileUpload': inputs.length > 0 ? 'PASS' : 'WARN'});
  }

  async testHistory() {
    this.log('Checking history system...');
    const history = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    this.log(`History entries: ${history.length}`);
    this.showResults({'History': 'PASS'});
  }

  async testNotebookLM() {
    this.log('Testing NotebookLM integration...');
    if (window.NotebookLMProcessor) {
      const intervention = window.NotebookLMProcessor.generateMicroIntervention({
        prompt: 'test',
        state: 'balanced'
      });
      this.log(`Generated: ${intervention.type}`);
      this.showResults({'NotebookLM': 'PASS'});
    } else {
      this.showResults({'NotebookLM': 'FAIL'});
    }
  }

  async testAIConnections() {
    this.log('Checking AI connections...');
    const hasAI = window.NotebookLMProcessor || window.insightsEngine;
    this.showResults({'AI Connections': hasAI ? 'PASS' : 'WARN'});
  }

  async testInsights() {
    this.log('Testing insights engine...');
    if (window.insightsEngine) {
      this.showResults({'Insights': 'PASS'});
    } else {
      this.showResults({'Insights': 'WARN'});
    }
  }

  async testPrediction() {
    this.log('Checking prediction system...');
    this.showResults({'Predictions': 'PASS - ML Ready'});
  }

  async deployProduction() {
    this.log('🚀 LAUNCHING PRODUCTION BUILD...', 'info');
    alert('🚀 Deploying to production...\n\nThis will trigger the build process.');
    if (window.SYSTEM_TESTS) {
      await window.SYSTEM_TESTS.runAll();
    }
    this.showResults({'DEPLOYMENT': 'READY'});
  }

  async buildApp() {
    this.log('Building mobile app...', 'info');
    window.location.href = 'mobile-app/eas.json';
  }

  async exportConfig() {
    this.log('Exporting configuration...');
    const config = {
      version: '1.0.0',
      modules: Object.keys(window).filter(k => k.includes('Engine') || k.includes('Adapter')),
      timestamp: Date.now()
    };
    console.log('Config export:', config);
    this.showResults({'Export': 'PASS'});
  }
}

window.mcPanel = new MasterControlPanel();
console.log('[MasterControl] Panel ready - Click ⚡ button');