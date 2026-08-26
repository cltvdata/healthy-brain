/**
 * HEALTHY + BRAIN — HealthSync Chat Engine v1.0
 * Gemini-powered multimodal health assistant
 * Integrates: Camera, Voice (Web Speech API), Function Calling (data_schema.json)
 */

const HealthSyncChat = {
    // ── Configuration ───────────────────────────────────────
    API_KEY: null,
    MODEL: 'gemini-2.0-flash',
    API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models',

    systemPrompt: '',
    tools: null,
    conversationHistory: [],
    isProcessing: false,
    mediaStream: null,
    speechRecognition: null,

    // ── Initialization ──────────────────────────────────────
    async init() {
        // Load API key from Firebase config or fallback
        this.API_KEY = window.__GEMINI_API_KEY || 'AIzaSyBdC_sOE6f8uPRrk7ywE2EIcVXAyl37r8c';

        // Load system instructions
        try {
            const res = await fetch('system_instructions.md');
            if (res.ok) this.systemPrompt = await res.text();
        } catch (e) {
            console.warn('Could not load system_instructions.md, using fallback.');
        }
        if (!this.systemPrompt) {
            this.systemPrompt = `Eres un Arquitecto de Longevidad y Bio-optimización (NeuroVital 2026). Evalúas métricas biológicas, nutrición, y entrenamiento con precisión científica. Responde siempre en español.`;
        }

        // Load function-calling tools (data_schema.json)
        try {
            const res = await fetch('data_schema.json');
            if (res.ok) this.tools = await res.json();
        } catch (e) {
            console.warn('Could not load data_schema.json tools.');
        }

        // Restore history from localStorage
        const saved = localStorage.getItem('hb_healthsync_history');
        if (saved) {
            try { this.conversationHistory = JSON.parse(saved); } catch (_) { }
        }

        // Init speech recognition
        this._initSpeechRecognition();

        console.log('🧬 HealthSync Chat Engine initialized');
    },

    // ── Core: Send Message ──────────────────────────────────
    /**
     * @param {string} text — User's text message
     * @param {string|null} imageBase64 — Optional base64 image (no prefix)
     * @param {string} imageMimeType — e.g. 'image/jpeg'
     * @returns {Promise<{text: string, functionCall: object|null}>}
     */
    async sendMessage(text, imageBase64 = null, imageMimeType = 'image/jpeg') {
        if (this.isProcessing) return null;
        this.isProcessing = true;

        // Build user content parts
        const parts = [];
        if (text) parts.push({ text });
        if (imageBase64) {
            parts.push({
                inlineData: {
                    mimeType: imageMimeType,
                    data: imageBase64
                }
            });
        }

        // Add to history
        this.conversationHistory.push({ role: 'user', parts });

        try {
            const response = await this._callGemini();
            this.isProcessing = false;
            return response;
        } catch (err) {
            this.isProcessing = false;
            console.error('HealthSync API Error:', err);
            const errorMsg = { text: `⚠️ Error de conexión con el motor IA: ${err.message}`, functionCall: null };
            this.conversationHistory.push({ role: 'model', parts: [{ text: errorMsg.text }] });
            this._saveHistory();
            return errorMsg;
        }
    },

    // ── Gemini API Call ──────────────────────────────────────
    async _callGemini() {
        const url = `${this.API_BASE}/${this.MODEL}:generateContent?key=${this.API_KEY}`;

        const body = {
            systemInstruction: {
                parts: [{ text: this.systemPrompt }]
            },
            contents: this.conversationHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 4096
            }
        };

        // Add function calling tools if loaded
        if (this.tools && this.tools.tools) {
            body.tools = this.tools.tools;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`API ${res.status}: ${errBody.substring(0, 200)}`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        if (!candidate?.content?.parts) {
            throw new Error('No response from model');
        }

        const modelParts = candidate.content.parts;
        this.conversationHistory.push({ role: 'model', parts: modelParts });
        this._saveHistory();

        // Extract text and function calls
        let responseText = '';
        let functionCall = null;

        for (const part of modelParts) {
            if (part.text) responseText += part.text;
            if (part.functionCall) functionCall = part.functionCall;
        }

        return { text: responseText, functionCall };
    },

    // ── Camera Capture ──────────────────────────────────────
    async startCamera(videoElement) {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            videoElement.srcObject = this.mediaStream;
            await videoElement.play();
            return true;
        } catch (err) {
            console.error('Camera error:', err);
            return false;
        }
    },

    stopCamera() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }
    },

    captureFrame(videoElement) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        // Return base64 without prefix
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        return dataUrl.split(',')[1];
    },

    // ── Voice Input (Web Speech API) ────────────────────────
    _initSpeechRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        this.speechRecognition = new SR();
        this.speechRecognition.lang = 'es-ES';
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = false;
    },

    startListening() {
        return new Promise((resolve, reject) => {
            if (!this.speechRecognition) {
                reject(new Error('Speech recognition not supported'));
                return;
            }
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            this.speechRecognition.onerror = (event) => {
                reject(new Error(event.error));
            };
            this.speechRecognition.start();
        });
    },

    stopListening() {
        if (this.speechRecognition) this.speechRecognition.stop();
    },

    // ── History ─────────────────────────────────────────────
    _saveHistory() {
        // Keep last 20 exchanges to avoid localStorage overflow
        const trimmed = this.conversationHistory.slice(-40);
        try {
            localStorage.setItem('hb_healthsync_history', JSON.stringify(trimmed));
        } catch (_) { }
    },

    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('hb_healthsync_history');
    },

    // ── Render Helpers ──────────────────────────────────────
    /**
     * Renders a function call result into premium HTML cards
     */
    renderFunctionCall(fc) {
        if (!fc || !fc.name) return '';
        const args = fc.args || {};

        if (fc.name === 'analyze_biological_input') {
            return this._renderBioAnalysis(args);
        }
        if (fc.name === 'evaluate_bio_readiness') {
            return this._renderReadiness(args);
        }
        return `<div class="glass-card p-4 mt-3"><pre class="text-xs text-gray-300 whitespace-pre-wrap">${JSON.stringify(args, null, 2)}</pre></div>`;
    },

    _renderBioAnalysis(d) {
        const bioColor = d.bioScore >= 70 ? '#13ec5b' : d.bioScore >= 40 ? '#eab308' : '#ef4444';
        const macros = d.macros || {};

        let warningsHtml = '';
        if (d.warnings) {
            const flags = [];
            if (d.warnings.highSodium) flags.push('🧂 Sodio Elevado');
            if (d.warnings.highSugar) flags.push('🍬 Azúcar Elevado');
            if (d.warnings.highSaturatedFat) flags.push('🥓 Grasa Saturada');
            if (d.warnings.lowProtein) flags.push('⚠️ Proteína Baja');
            if (flags.length) {
                warningsHtml = `
                    <div class="flex flex-wrap gap-2 mt-3">
                        ${flags.map(f => `<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold border border-red-500/30">${f}</span>`).join('')}
                    </div>`;
            }
        }

        let recsHtml = '';
        if (d.recommendations?.length) {
            recsHtml = d.recommendations.map((r, i) => {
                const priorityColor = r.priority === 'high' ? 'text-red-400' : r.priority === 'medium' ? 'text-yellow-400' : 'text-green-400';
                return `
                    <div class="flex gap-3 items-start">
                        <span class="text-[10px] font-black ${priorityColor} mt-0.5">${i + 1}</span>
                        <div>
                            <p class="text-xs font-bold text-white">${r.title || ''}</p>
                            <p class="text-[11px] text-gray-400 mt-0.5">${r.description || ''}</p>
                        </div>
                    </div>`;
            }).join('');
        }

        return `
        <div class="space-y-3 mt-3 animate-fade-in">
            <!-- Header -->
            <div class="glass-card p-4 border-white/10">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Análisis Detectado</p>
                        <h3 class="text-base font-bold text-white mt-1">${d.name || 'Elemento'}</h3>
                        <p class="text-[11px] text-gray-400 mt-0.5">${d.description || ''}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                        style="color:${bioColor}; border-color:${bioColor}33; background:${bioColor}15">
                        ${d.type || 'unknown'}
                    </span>
                </div>
            </div>

            <!-- Bio-Score + NTK -->
            <div class="flex gap-3">
                <div class="glass-card p-4 flex-1 text-center border-white/10">
                    <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Bio-Score</p>
                    <p class="text-3xl font-black" style="color:${bioColor}">${d.bioScore ?? '—'}</p>
                    <p class="text-[9px] text-gray-500 mt-1">/ 100</p>
                </div>
                <div class="glass-card p-4 flex-1 text-center border-white/10">
                    <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">NTK Reward</p>
                    <p class="text-3xl font-black text-primary">${d.ntkReward ?? '—'}</p>
                    <p class="text-[9px] text-gray-500 mt-1">tokens</p>
                </div>
            </div>

            ${d.calories != null ? `
            <!-- Macros -->
            <div class="glass-card p-4 border-white/10">
                <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Macronutrientes</p>
                <div class="text-center mb-3">
                    <span class="text-2xl font-black text-white">${d.calories}</span>
                    <span class="text-xs text-gray-500 ml-1">kcal</span>
                </div>
                <div class="flex justify-between text-center">
                    <div><span class="text-sm font-bold text-blue-400">${macros.protein ?? 0}g</span><br><span class="text-[9px] text-gray-500">Proteína</span></div>
                    <div><span class="text-sm font-bold text-green-400">${macros.carbs ?? 0}g</span><br><span class="text-[9px] text-gray-500">Carbos</span></div>
                    <div><span class="text-sm font-bold text-yellow-400">${macros.fats ?? 0}g</span><br><span class="text-[9px] text-gray-500">Grasas</span></div>
                    <div><span class="text-sm font-bold text-purple-400">${macros.fiber ?? 0}g</span><br><span class="text-[9px] text-gray-500">Fibra</span></div>
                </div>
            </div>` : ''}

            ${warningsHtml}

            ${d.timingAdvice ? `
            <div class="glass-card p-3 border-primary/20 flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-lg">schedule</span>
                <p class="text-[11px] text-gray-300"><span class="text-primary font-bold">Timing:</span> ${d.timingAdvice}</p>
            </div>` : ''}

            ${recsHtml ? `
            <div class="glass-card p-4 border-white/10 space-y-3">
                <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Recomendaciones</p>
                ${recsHtml}
            </div>` : ''}

            ${d.hormonalAdvice ? `
            <div class="glass-card p-3 border-purple-500/20 flex items-start gap-3">
                <span class="material-symbols-outlined text-purple-400 text-lg mt-0.5">science</span>
                <p class="text-[11px] text-gray-300">${d.hormonalAdvice}</p>
            </div>` : ''}
        </div>`;
    },

    _renderReadiness(d) {
        const statusColors = { OPTIMAL: '#13ec5b', MODERATE: '#eab308', REST_ADVISED: '#ef4444' };
        const color = statusColors[d.status] || '#a0a0a0';
        const statusLabels = { OPTIMAL: 'Soberanía Hormonal', MODERATE: 'Estado Estable', REST_ADVISED: 'Alerta Catabólica' };

        let notesHtml = '';
        if (d.bioNotes?.length) {
            notesHtml = d.bioNotes.map(n => `<li class="text-[11px] text-gray-400">• ${n}</li>`).join('');
        }

        return `
        <div class="space-y-3 mt-3 animate-fade-in">
            <div class="glass-card p-5 text-center border-white/10">
                <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Bio-Readiness</p>
                <p class="text-5xl font-black mb-2" style="color:${color}">${d.readinessScore ?? '—'}</p>
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style="color:${color}; background:${color}20; border:1px solid ${color}40">
                    ${statusLabels[d.status] || d.status}
                </span>
            </div>
            <div class="glass-card p-4 border-white/10">
                <p class="text-xs font-bold text-white mb-2">${d.primaryAdvise || ''}</p>
                ${notesHtml ? `<ul class="space-y-1 mt-2">${notesHtml}</ul>` : ''}
            </div>
        </div>`;
    }
};
