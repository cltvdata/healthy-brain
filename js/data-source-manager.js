// === DATA SOURCE MANAGER UI ===

class DataSourceManager {
  constructor() {
    this.integrator = window.healthIntegrator;
  }

  renderSettingsModal() {
    const html = `
      <div id="data-sources-modal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] hidden">
        <div class="bg-dark w-full max-w-md mx-auto mt-20 rounded-3xl border border-white/10 overflow-hidden">
          <div class="bg-gradient-to-r from-primary to-neon p-4">
            <div class="flex justify-between items-center">
              <h2 class="text-white font-black text-lg">🔗 Fuentes de Datos</h2>
              <button onclick="window.dataSourceManager.closeModal()" class="text-white/70 hover:text-white">✕</button>
            </div>
          </div>
          
          <div class="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <!-- User Profile -->
            <div class="bg-white/5 rounded-xl p-4">
              <h3 class="text-primary font-bold text-sm mb-3">👤 Perfil</h3>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-text-gray text-xs">Género</label>
                  <select id="profile-gender" class="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" 
                    onchange="window.dataSourceManager.updateProfile('gender', this.value)">
                    <option value="male" ${this.integrator.userProfile.gender === 'male' ? 'selected' : ''}>Masculino</option>
                    <option value="female" ${this.integrator.userProfile.gender === 'female' ? 'selected' : ''}>Femenino</option>
                  </select>
                </div>
                <div>
                  <label class="text-text-gray text-xs">Edad Cronológica</label>
                  <input type="number" id="profile-age" value="${this.integrator.userProfile.age}" 
                    class="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm"
                    onchange="window.dataSourceManager.updateProfile('age', parseInt(this.value))">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="text-text-gray text-xs">Altura (cm)</label>
                  <input type="number" id="profile-height" value="${this.integrator.userProfile.height}"
                    class="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm"
                    onchange="window.dataSourceManager.updateProfile('height', parseInt(this.value))">
                </div>
                <div>
                  <label class="text-text-gray text-xs">Peso (kg)</label>
                  <input type="number" id="profile-weight" value="${this.integrator.userProfile.weight}"
                    class="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm"
                    onchange="window.dataSourceManager.updateProfile('weight', parseFloat(this.value))">
                </div>
              </div>
              <div class="mt-3">
                <label class="text-text-gray text-xs">Idioma</label>
                <select id="profile-language" class="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm"
                  onchange="window.dataSourceManager.updateProfile('language', this.value)">
                  <option value="es" ${this.integrator.userProfile.language === 'es' ? 'selected' : ''}>Español</option>
                  <option value="en" ${this.integrator.userProfile.language === 'en' ? 'selected' : ''}>English</option>
                  <option value="pt" ${this.integrator.userProfile.language === 'pt' ? 'selected' : ''}>Português</option>
                  <option value="fr" ${this.integrator.userProfile.language === 'fr' ? 'selected' : ''}>Français</option>
                </select>
              </div>
            </div>

            <!-- Wearables -->
            <div class="bg-white/5 rounded-xl p-4">
              <h3 class="text-neon font-bold text-sm mb-3">⌚ Wearables</h3>
              <div class="space-y-2">
                ${this.renderSourceButton('appleHealth', '🍎 Apple Health', this.integrator.dataSources.appleHealth.connected)}
                ${this.renderSourceButton('healthConnect', '🏥 Health Connect', this.integrator.dataSources.healthConnect.connected)}
                ${this.renderSourceButton('garmin', '⌚ Garmin', this.integrator.dataSources.garmin.connected)}
                ${this.renderSourceButton('oura', '🔴 Oura', this.integrator.dataSources.oura.connected)}
                ${this.renderSourceButton('fitbit', '💚 Fitbit', this.integrator.dataSources.fitbit.connected)}
                ${this.renderSourceButton('whoop', '⚡ WHOOP', this.integrator.dataSources.whoop.connected)}
              </div>
            </div>

            <!-- Import Options -->
            <div class="bg-white/5 rounded-xl p-4">
              <h3 class="text-primary font-bold text-sm mb-3">📥 Importar Datos</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                  <span class="text-xl">📄</span>
                  <div class="flex-1">
                    <div class="text-white text-sm">Importar CSV</div>
                    <div class="text-text-gray text-xs">Resultados de laboratorio</div>
                  </div>
                  <input type="file" accept=".csv" class="hidden" onchange="window.dataSourceManager.handleCSV(this)">
                </label>
                <label class="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                  <span class="text-xl">📸</span>
                  <div class="flex-1">
                    <div class="text-white text-sm">Subir Screenshots</div>
                    <div class="text-text-gray text-xs">Análisis de sangre</div>
                  </div>
                  <input type="file" accept="image/*" class="hidden" onchange="window.dataSourceManager.handleScreenshot(this)">
                </label>
              </div>
            </div>

            <!-- Manual Input -->
            <div class="bg-white/5 rounded-xl p-4">
              <h3 class="text-primary font-bold text-sm mb-3">✏️ Entrada Manual</h3>
              <div class="space-y-2" id="manual-inputs">
                ${this.renderManualInputs()}
              </div>
              <button onclick="window.dataSourceManager.addManualBiomarker()" 
                class="mt-3 w-full py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm hover:bg-white/20">
                + Añadir Biomarcador
              </button>
            </div>

            <!-- Biological Age Display -->
            <div class="bg-gradient-to-r from-primary/20 to-neon/20 rounded-xl p-4 border border-primary/30">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-text-gray text-xs">Edad Biológica</div>
                  <div class="text-2xl font-black text-white">${this.integrator.userProfile.biologicalAge || '--'}</div>
                </div>
                <div class="text-right">
                  <div class="text-text-gray text-xs">Edad Cronológica</div>
                  <div class="text-xl font-bold text-primary">${this.integrator.userProfile.age} años</div>
                </div>
              </div>
              <button onclick="window.dataSourceManager.recalculateBioAge()" 
                class="mt-3 w-full py-2 bg-primary text-black font-bold rounded-lg text-sm hover:bg-orange-500">
                Recalcular Edad Biológica
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existing = document.getElementById('data-sources-modal');
    if (existing) existing.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', html);
  }

  renderSourceButton(id, label, connected) {
    const statusClass = connected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10';
    return `
      <button class="w-full flex items-center gap-3 p-3 ${statusClass} rounded-lg hover:bg-white/10 transition"
        onclick="window.dataSourceManager.connectSource('${id}')">
        <span>${connected ? '✅' : '⭕'}</span>
        <span class="text-white text-sm">${label}</span>
      </button>
    `;
  }

  renderManualInputs() {
    const commonBiomarkers = [
      { key: 'glucose', label: 'Glucosa (mg/dL)' },
      { key: 'hba1c', label: 'HbA1c (%)' },
      { key: 'cholesterol', label: 'Colesterol Total' },
      { key: 'hdl', label: 'HDL Colesterol' },
      { key: 'ldl', label: 'LDL Colesterol' },
      { key: 'triglycerides', label: 'Triglicéridos' },
      { key: 'cortisol', label: 'Cortisol (μg/dL)' },
      { key: 'testosterone', label: 'Testosterona (ng/dL)' },
      { key: 'vitamin_d', label: 'Vitamina D (ng/mL)' }
    ];

    const current = this.integrator.userProfile.biomarkers || {};

    return commonBiomarkers.map(b => `
      <div class="flex items-center gap-2">
        <label class="text-text-gray text-xs w-32">${b.label}</label>
        <input type="number" value="${current[b.key] || ''}" 
          class="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm"
          placeholder="--"
          onchange="window.dataSourceManager.addBiomarker('${b.key}', this.value)">
      </div>
    `).join('');
  }

  showModal() {
    this.renderSettingsModal();
    document.getElementById('data-sources-modal').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('data-sources-modal').classList.add('hidden');
  }

  async updateProfile(key, value) {
    this.integrator.updateProfile({ [key]: value });
    this.closeModal();
    setTimeout(() => this.showModal(), 100);
  }

  async connectSource(sourceId) {
    let result;
    switch (sourceId) {
      case 'appleHealth':
        result = await this.integrator.connectAppleHealth();
        break;
      case 'healthConnect':
        result = await this.integrator.connectHealthConnect();
        break;
      case 'garmin':
        result = await this.integrator.connectGarmin();
        break;
      case 'oura':
        result = await this.integrator.connectOura();
        break;
      case 'fitbit':
        result = await this.integrator.connectFitbit();
        break;
      case 'whoop':
        result = await this.integrator.connectWhoop();
        break;
    }

    alert(result.message);
    this.closeModal();
    setTimeout(() => this.showModal(), 100);
  }

  async handleCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const result = await this.integrator.importCSV(file);
    alert(`✅ Importado: ${result.rows} filas\nMétricas: ${result.metrics.join(', ')}`);
    this.closeModal();
    setTimeout(() => this.showModal(), 100);
  }

  async handleScreenshot(input) {
    const file = input.files[0];
    if (!file) return;

    // Convert to base64 for processing
    const reader = new FileReader();
    reader.onload = async () => {
      const result = await this.integrator.processScreenshot(reader.result);
      alert(`✅ Datos extraídos: ${result.extracted.join(', ')}`);
      this.closeModal();
      setTimeout(() => this.showModal(), 100);
    };
    reader.readAsDataURL(file);
  }

  addBiomarker(key, value) {
    if (value) {
      this.integrator.addManualBiomarker(key, value);
    }
  }

  recalculateBioAge() {
    const result = this.integrator.recalculateBiologicalAge();
    alert(`🎉 Edad Biológica actualizada: ${result.biologicalAge} años\n(${result.ageAcceleration > 0 ? '+' : ''}${result.ageAcceleration} vs edad cronológica)`);
    this.closeModal();
    setTimeout(() => this.showModal(), 100);
  }
}

window.dataSourceManager = new DataSourceManager();

console.log('[DataSourceManager] UI ready');