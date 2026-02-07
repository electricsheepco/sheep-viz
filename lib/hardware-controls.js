/**
 * hardware-controls.js
 * Skeuomorphic hardware controls for sheep-viz
 *
 * Usage:
 *   1. Include CSS: <link rel="stylesheet" href="../lib/hardware-controls.css">
 *   2. Include JS: <script src="../lib/hardware-controls.js"></script>
 *   3. Initialize with config:
 *
 *   const hardware = new HardwareControls({
 *       name: 'Starfield',
 *       accentColor: '#00ff88',
 *       params: params,           // Your visualizer's params object
 *       knobs: [
 *           { id: 'starCount', label: 'Stars', min: 100, max: 2000, step: 50 },
 *           { id: 'baseSpeed', label: 'Speed', min: 1, max: 50, step: 1 },
 *           // ... 8 knobs total
 *       ],
 *       faders: [
 *           { id: 'overlaySize', label: 'Size', min: 5, max: 50, step: 1, suffix: '%' },
 *           // ... 4 faders total
 *       ],
 *       presets: presets,         // Array of 8 preset slots (null or object)
 *       onParamChange: (id, value) => { ... },
 *       onPresetLoad: (index) => { ... },
 *       onPresetSave: (index) => { ... },
 *   });
 *
 *   // Later, to sync after external changes:
 *   hardware.sync();
 */

class HardwareControls {
    static DEBUG = false;

    static log(...args) {
        if (HardwareControls.DEBUG) console.log(...args);
    }

    constructor(config) {
        HardwareControls.log('HardwareControls: Constructor starting...');
        try {
            this.config = {
                name: 'Visualizer',
                accentColor: '#00ff88',
                accentColorDim: null,
                params: {},
                knobs: [],
                faders: [],
                presets: new Array(8).fill(null),
                onParamChange: () => {},
                onPresetLoad: () => {},
                onPresetSave: () => {},
                onAudioFile: () => {},
                onMicToggle: () => {},
                onPlayPause: () => {},
                onSystemAudio: () => {},
                logoUrl: null,  // Path to logo image (bottom-right watermark)
                logoText: 'sheep-viz',  // Fallback text if no logo image
                midi: {
                    knobCCs: [74, 71, 76, 77, 93, 18, 19, 16],
                    faderCCs: [82, 83, 85, 17],
                    padNotes: [36, 37, 38, 39, 40, 41, 42, 43],
                    padChannel: 9
                },
                ...config
            };
            HardwareControls.log('HardwareControls: Config merged');

            if (!this.config.accentColorDim) {
                this.config.accentColorDim = this._dimColor(this.config.accentColor);
            }

            this.visible = false;
            this.popoutWindow = null;
            this.activeKnob = null;
            this.activeFader = null;
            this.dragStartY = 0;
            this.dragStartValue = 0;
            this.midiAccess = null;
            this.midiInputs = [];
            this.activeMidiInput = null;
            this.selectedPresetSlot = -1;
            this.isPlaying = false;
            HardwareControls.log('HardwareControls: State initialized');

            HardwareControls.log('HardwareControls: Creating UI...');
            this._createHardwareBar();
            this._createToggleButton();
            this._createWatermark();
            this._setupEventListeners();
            this._applyAccentColor();
            HardwareControls.log('HardwareControls: UI created');

            HardwareControls.log('HardwareControls: Initializing MIDI...');
            this._initMIDI();
            HardwareControls.log('HardwareControls: Ready!');
        } catch (err) {
            console.error('HardwareControls: Constructor failed:', err);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MIDI
    // ═══════════════════════════════════════════════════════════════════

    _initMIDI() {
        HardwareControls.log('MIDI: Initializing...');

        if (!navigator.requestMIDIAccess) {
            HardwareControls.log('MIDI: Not supported in this browser');
            return;
        }

        navigator.requestMIDIAccess({ sysex: false }).then(access => {
            HardwareControls.log('MIDI: Access granted');
            this.midiAccess = access;
            this.midiInputs = Array.from(access.inputs.values());

            if (this.midiInputs.length === 0) {
                HardwareControls.log('No MIDI devices found');
                this.setMidiStatus('No devices', false);
                return;
            }

            HardwareControls.log(`MIDI: ${this.midiInputs.length} device(s) found`);
            const controller = this.midiInputs.find(i => i.name.includes('MiniLab')) || this.midiInputs[0];
            this.setMidiStatus(controller.name.substring(0, 12), true);

            this.midiInputs.forEach(input => {
                HardwareControls.log(`MIDI: Connecting to ${input.name}...`);
                input.onmidimessage = (e) => this._handleMIDI(e);
                HardwareControls.log(`MIDI: Connected to ${input.name}`);
            });

            access.onstatechange = (e) => {
                if (e.port.type === 'input') {
                    if (e.port.state === 'connected') {
                        e.port.onmidimessage = (ev) => this._handleMIDI(ev);
                        HardwareControls.log(`MIDI: ${e.port.name} connected`);
                    } else {
                        HardwareControls.log(`MIDI: ${e.port.name} disconnected`);
                    }
                }
            };

        }).catch(err => {
            console.error('MIDI: Access denied or error:', err);
        });

        HardwareControls.log('MIDI: Waiting for permission...');
    }

    _handleMIDI(e) {
        const [status, data1, data2] = e.data;
        const channel = status & 0x0F;
        const msgType = status & 0xF0;

        // Flash MIDI indicator
        this.flashMidi();

        HardwareControls.log(`MIDI: ch=${channel + 1} type=${msgType.toString(16)} data1=${data1} data2=${data2}`);

        // Control Change (0xB0 = 176)
        if (msgType === 0xB0) {
            const cc = data1;
            const value = data2;

            // Check if it's a knob
            const knobIndex = this.config.midi.knobCCs.indexOf(cc);
            if (knobIndex !== -1 && knobIndex < this.config.knobs.length) {
                const knobConfig = this.config.knobs[knobIndex];
                const normalized = value / 127;
                const newValue = knobConfig.min + normalized * (knobConfig.max - knobConfig.min);
                const snapped = this._snapToStep(newValue, knobConfig);

                this.config.params[knobConfig.id] = snapped;
                this.config.onParamChange(knobConfig.id, snapped);
                this.sync();
                return;
            }

            // Check if it's a fader
            const faderIndex = this.config.midi.faderCCs.indexOf(cc);
            if (faderIndex !== -1 && faderIndex < this.config.faders.length) {
                const faderConfig = this.config.faders[faderIndex];
                const normalized = value / 127;
                const newValue = faderConfig.min + normalized * (faderConfig.max - faderConfig.min);
                const snapped = this._snapToStep(newValue, faderConfig);

                this.config.params[faderConfig.id] = snapped;
                this.config.onParamChange(faderConfig.id, snapped);
                this.sync();
                return;
            }
        }

        // Note On (0x90 = 144) - for pads
        if (msgType === 0x90 && data2 > 0) {
            const note = data1;
            const padIndex = this.config.midi.padNotes.indexOf(note);

            // Check channel for drum pads (usually channel 10 = index 9)
            if (padIndex !== -1 && (channel === this.config.midi.padChannel || this.config.midi.padChannel === -1)) {
                this.selectedPresetSlot = padIndex;
                this.config.onPresetLoad(padIndex);
                this.sync();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Toggle hardware bar visibility
     */
    toggle() {
        this.visible = !this.visible;
        this.bar.classList.toggle('visible', this.visible);
        document.body.classList.toggle('hardware-mode', this.visible);
        this.toggleBtn.textContent = this.visible ? 'Sidebar View' : 'Hardware View';

        if (this.visible) {
            this.sync();
        }

        // Trigger resize for canvas adjustment
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Sync all control visuals from current param values
     */
    sync() {
        this._syncKnobs();
        this._syncFaders();
        this._syncPads();

        if (this.popoutWindow && !this.popoutWindow.closed) {
            this._syncPopout();
        }
    }

    /**
     * Open controls in popout window (for fullscreen mode)
     */
    popout() {
        if (this.popoutWindow && !this.popoutWindow.closed) {
            this.popoutWindow.focus();
            return;
        }

        const winWidth = window.screen.availWidth;
        const winHeight = 200;
        const winTop = window.screen.availHeight - winHeight;

        this.popoutWindow = window.open(
            '',
            `${this.config.name}Hardware`,
            `width=${winWidth},height=${winHeight},left=0,top=${winTop},menubar=no,toolbar=no`
        );

        this._buildPopoutContent();
        this._setupPopoutListeners();

        this.popoutWindow.addEventListener('beforeunload', () => {
            this.popoutWindow = null;
        });
    }

    /**
     * Enter fullscreen and pop out controls
     */
    enterFullscreen() {
        if (!document.fullscreenElement) {
            this.popout();
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Clean up all DOM elements, event listeners, and resources
     */
    destroy() {
        // Remove global event listeners
        document.removeEventListener('mousemove', this._boundMouseMove);
        document.removeEventListener('mouseup', this._boundMouseUp);
        document.removeEventListener('keydown', this._boundKeyDown);

        // Close popout window
        if (this.popoutWindow && !this.popoutWindow.closed) {
            this.popoutWindow.close();
        }
        this.popoutWindow = null;

        // Disconnect MIDI
        if (this.midiInputs) {
            this.midiInputs.forEach(input => { input.onmidimessage = null; });
        }
        if (this.midiAccess) {
            this.midiAccess.onstatechange = null;
        }

        // Remove DOM elements
        if (this.bar && this.bar.parentNode) {
            this.bar.parentNode.removeChild(this.bar);
        }
        if (this.toggleBtn && this.toggleBtn.parentNode) {
            this.toggleBtn.parentNode.removeChild(this.toggleBtn);
        }
        if (this.watermark && this.watermark.parentNode) {
            this.watermark.parentNode.removeChild(this.watermark);
        }

        document.body.classList.remove('hardware-mode');
    }

    /**
     * Update presets array (call after loading/saving)
     */
    setPresets(presets) {
        this.config.presets = presets;
        this._syncPads();
        if (this.popoutWindow && !this.popoutWindow.closed) {
            this._syncPopout();
        }
    }

    /**
     * Set selected preset slot
     */
    setSelectedPreset(index) {
        this.selectedPresetSlot = index;
        this._syncPads();
    }

    /**
     * Update audio status display
     */
    setAudioStatus(text, active = false) {
        const status = this.bar.querySelector('.hardware-audio-status');
        if (status) {
            status.textContent = text;
            status.classList.toggle('active', active);
        }
        if (this.popoutWindow && !this.popoutWindow.closed) {
            const popStatus = this.popoutWindow.document.querySelector('.hardware-audio-status');
            if (popStatus) {
                popStatus.textContent = text;
                popStatus.classList.toggle('active', active);
            }
        }
    }

    /**
     * Update MIDI status display
     */
    setMidiStatus(name, connected = false) {
        const dot = this.bar.querySelector('.hardware-midi-dot');
        const nameEl = this.bar.querySelector('.hardware-midi-name');
        if (dot) dot.classList.toggle('connected', connected);
        if (nameEl) nameEl.textContent = name;
        if (this.popoutWindow && !this.popoutWindow.closed) {
            const popDot = this.popoutWindow.document.querySelector('.hardware-midi-dot');
            const popName = this.popoutWindow.document.querySelector('.hardware-midi-name');
            if (popDot) popDot.classList.toggle('connected', connected);
            if (popName) popName.textContent = name;
        }
    }

    /**
     * Flash MIDI indicator (call on MIDI activity)
     */
    flashMidi() {
        const dot = this.bar.querySelector('.hardware-midi-dot');
        if (dot) {
            dot.classList.add('active');
            setTimeout(() => dot.classList.remove('active'), 100);
        }
    }

    /**
     * Set play button state
     */
    setPlaying(playing) {
        this.isPlaying = playing;
        const playBtn = this.bar.querySelector('.hardware-play-btn');
        if (playBtn) {
            playBtn.textContent = playing ? '⏸' : '▶';
            playBtn.classList.toggle('active', playing);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // UI CREATION
    // ═══════════════════════════════════════════════════════════════════

    _createHardwareBar() {
        this.bar = document.createElement('div');
        this.bar.className = 'hardware-bar';
        this.bar.id = 'hardware-bar';
        this.bar.innerHTML = this._generateBarHTML();
        document.body.appendChild(this.bar);
    }

    _createToggleButton() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'hardware-toggle';
        this.toggleBtn.textContent = 'Hardware View';
        this.toggleBtn.onclick = () => this.toggle();
        document.body.appendChild(this.toggleBtn);
    }

    _createWatermark() {
        this.watermark = document.createElement('div');
        this.watermark.className = 'sheep-watermark';

        if (this.config.logoUrl) {
            // Use logo image
            const img = document.createElement('img');
            img.src = this.config.logoUrl;
            img.alt = this.config.logoText || 'Logo';
            this.watermark.appendChild(img);
        } else {
            // Use text fallback
            this.watermark.textContent = this.config.logoText || 'sheep-viz';
        }

        document.body.appendChild(this.watermark);
    }

    /**
     * Update watermark logo
     */
    setLogo(url, text) {
        if (url) {
            this.config.logoUrl = url;
            this.watermark.innerHTML = '';
            const img = document.createElement('img');
            img.src = url;
            img.alt = text || 'Logo';
            this.watermark.appendChild(img);
        } else if (text) {
            this.config.logoText = text;
            this.config.logoUrl = null;
            this.watermark.innerHTML = '';
            this.watermark.textContent = text;
        }
    }

    /**
     * Show/hide watermark
     */
    showWatermark(visible) {
        this.watermark.style.display = visible ? 'flex' : 'none';
    }

    _generateBarHTML() {
        // Knobs in 2x4 grid to match MiniLab 3 physical layout
        const knobsRow1 = this.config.knobs.slice(0, 4).map((k, i) => this._knobHTML(k, i)).join('');
        const knobsRow2 = this.config.knobs.slice(4, 8).map((k, i) => this._knobHTML(k, i + 4)).join('');

        // Pads in 2x4 grid to match MiniLab 3 physical layout
        const padsRow1 = [0,1,2,3].map(i => this._padHTML(i)).join('');
        const padsRow2 = [4,5,6,7].map(i => this._padHTML(i)).join('');

        return `
            <div class="hardware-row">
                <!-- AUDIO INPUT Section -->
                <div class="hardware-section audio-section">
                    <span class="hardware-section-label">Audio</span>
                    <div class="hardware-audio-controls">
                        <label class="hardware-audio-btn" title="Load Audio File">
                            <span>📁</span>
                            <input type="file" class="hardware-audio-file" accept="audio/*" style="display:none">
                        </label>
                        <button class="hardware-audio-btn hardware-mic-btn" title="Use Microphone">🎤</button>
                        <button class="hardware-audio-btn hardware-system-btn" title="System/Tab Audio">🖥</button>
                        <button class="hardware-audio-btn hardware-play-btn" title="Play/Pause">▶</button>
                    </div>
                    <div class="hardware-audio-status">Ready</div>
                </div>

                <div class="hardware-divider"></div>

                <!-- MIDI Status Section -->
                <div class="hardware-section midi-section">
                    <span class="hardware-section-label">MIDI</span>
                    <div class="hardware-midi-status">
                        <span class="hardware-midi-dot"></span>
                        <span class="hardware-midi-name">Scanning...</span>
                    </div>
                </div>

                <div class="hardware-divider"></div>

                <!-- Knobs Section (2x4 grid like MiniLab 3) -->
                <div class="hardware-section knobs-section">
                    <span class="hardware-section-label">Parameters</span>
                    <div class="hardware-knob-grid">
                        <div class="hardware-knob-row">${knobsRow1}</div>
                        <div class="hardware-knob-row">${knobsRow2}</div>
                    </div>
                </div>

                <div class="hardware-divider"></div>

                <!-- Faders Section -->
                <div class="hardware-section">
                    <span class="hardware-section-label">Faders</span>
                    ${this.config.faders.map((f, i) => this._faderHTML(f, i)).join('')}
                </div>

                <div class="hardware-divider"></div>

                <!-- Pads Section (2x4 grid like MiniLab 3) -->
                <div class="hardware-section pads-section">
                    <span class="hardware-section-label">Presets</span>
                    <div class="hardware-pad-grid">
                        <div class="hardware-pad-row">${padsRow1}</div>
                        <div class="hardware-pad-row">${padsRow2}</div>
                    </div>
                </div>
            </div>
        `;
    }

    _knobHTML(knob, index) {
        const value = this.config.params[knob.id] ?? knob.min;
        return `
            <div class="sknob" data-param="${knob.id}" data-index="${index}">
                <span class="sknob-label">${knob.label}</span>
                <div class="sknob-outer">
                    <div class="sknob-ring"></div>
                    <div class="sknob-inner">
                        <div class="sknob-indicator"></div>
                    </div>
                </div>
                <span class="sknob-value">${this._formatValue(knob, value)}</span>
            </div>
        `;
    }

    _faderHTML(fader, index) {
        const value = this.config.params[fader.id] ?? fader.min;
        const pct = Math.max(0, Math.min(100, this._normalize(value, fader) * 100));
        return `
            <div class="sfader" data-param="${fader.id}" data-index="${index}">
                <span class="sfader-label">${fader.label}</span>
                <div class="sfader-track">
                    <div class="sfader-slot"></div>
                    <div class="sfader-fill" style="height: ${pct}%;"></div>
                    <div class="sfader-handle" style="bottom: calc(${pct}% - 8px);"></div>
                </div>
                <span class="sfader-value">${this._formatValue(fader, value)}</span>
            </div>
        `;
    }

    _padHTML(index) {
        const filled = this.config.presets[index] !== null;
        return `
            <div class="spad" data-preset="${index}">
                <div class="spad-btn${filled ? ' filled' : ''}">${index + 1}</div>
                <span class="spad-label">P${index + 1}</span>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════════

    _setupEventListeners() {
        HardwareControls.log('HardwareControls: Setting up event listeners...');

        // Knob interactions
        this.bar.querySelectorAll('.sknob').forEach(knob => {
            const outer = knob.querySelector('.sknob-outer');

            outer.addEventListener('mousedown', (e) => {
                this.activeKnob = knob;
                this.dragStartY = e.clientY;
                const param = knob.dataset.param;
                this.dragStartValue = this.config.params[param] ?? 0;
                knob.classList.add('active');
                e.preventDefault();
            });

            outer.addEventListener('wheel', (e) => {
                this._handleKnobWheel(knob, e);
                e.preventDefault();
            });
        });

        // Fader interactions
        this.bar.querySelectorAll('.sfader').forEach(fader => {
            const track = fader.querySelector('.sfader-track');

            track.addEventListener('mousedown', (e) => {
                this.activeFader = fader;
                this._updateFaderFromMouse(fader, e);
                e.preventDefault();
            });
        });

        // Pad interactions
        this.bar.querySelectorAll('.spad-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                this.selectedPresetSlot = i;
                this.config.onPresetLoad(i);
                this._syncPads();
            });
        });

        // Audio controls
        const audioFile = this.bar.querySelector('.hardware-audio-file');
        const micBtn = this.bar.querySelector('.hardware-mic-btn');
        const playBtn = this.bar.querySelector('.hardware-play-btn');

        if (audioFile) {
            audioFile.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.config.onAudioFile(e.target.files[0]);
                    this.setAudioStatus(e.target.files[0].name, true);
                }
            });
        }

        if (micBtn) {
            micBtn.addEventListener('click', () => {
                micBtn.classList.toggle('active');
                this.config.onMicToggle(micBtn.classList.contains('active'));
                if (micBtn.classList.contains('active')) {
                    this.setAudioStatus('Mic active', true);
                }
            });
        }

        const systemBtn = this.bar.querySelector('.hardware-system-btn');
        if (systemBtn) {
            systemBtn.addEventListener('click', async () => {
                try {
                    // Request display media with audio
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,  // Required, but we only use audio
                        audio: true
                    });

                    // Check if audio track exists
                    const audioTracks = stream.getAudioTracks();
                    if (audioTracks.length === 0) {
                        this.setAudioStatus('No audio', false);
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }

                    systemBtn.classList.add('active');
                    this.setAudioStatus('System audio', true);
                    this.config.onSystemAudio(stream);

                    // Stop video track (we only need audio)
                    stream.getVideoTracks().forEach(t => t.stop());

                } catch (err) {
                    console.error('System audio error:', err);
                    this.setAudioStatus('Denied', false);
                }
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.isPlaying = !this.isPlaying;
                playBtn.textContent = this.isPlaying ? '⏸' : '▶';
                playBtn.classList.toggle('active', this.isPlaying);
                this.config.onPlayPause(this.isPlaying);
            });
        }

        // Global mouse events - store references for cleanup
        this._boundMouseMove = (e) => this._handleMouseMove(e);
        this._boundMouseUp = () => this._handleMouseUp();
        this._boundKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key.toLowerCase() === 'f') {
                this.enterFullscreen();
            }
        };

        document.addEventListener('mousemove', this._boundMouseMove);
        document.addEventListener('mouseup', this._boundMouseUp);
        document.addEventListener('keydown', this._boundKeyDown);
    }

    _handleMouseMove(e) {
        if (this.activeKnob) {
            const param = this.activeKnob.dataset.param;
            const knobConfig = this._getKnobConfig(param);
            if (!knobConfig) return;

            const sensitivity = 0.5;
            const deltaY = this.dragStartY - e.clientY;
            const range = knobConfig.max - knobConfig.min;
            const delta = (deltaY * sensitivity * range) / 100;

            let newValue = this.dragStartValue + delta;
            newValue = Math.max(knobConfig.min, Math.min(knobConfig.max, newValue));
            newValue = this._snapToStep(newValue, knobConfig);

            this.config.params[param] = newValue;
            this.config.onParamChange(param, newValue);
            this._updateKnobVisual(this.activeKnob, knobConfig);
        }

        if (this.activeFader) {
            this._updateFaderFromMouse(this.activeFader, e);
        }
    }

    _handleMouseUp() {
        if (this.activeKnob) {
            this.activeKnob.classList.remove('active');
            this.activeKnob = null;
        }
        this.activeFader = null;
    }

    _handleKnobWheel(knob, e) {
        const param = knob.dataset.param;
        const knobConfig = this._getKnobConfig(param);
        if (!knobConfig) return;

        const step = knobConfig.step || 1;
        const delta = e.deltaY > 0 ? -step : step;
        let newValue = (this.config.params[param] ?? knobConfig.min) + delta;
        newValue = Math.max(knobConfig.min, Math.min(knobConfig.max, newValue));

        this.config.params[param] = newValue;
        this.config.onParamChange(param, newValue);
        this._updateKnobVisual(knob, knobConfig);
    }

    _updateFaderFromMouse(fader, e) {
        const track = fader.querySelector('.sfader-track');
        const rect = track.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const normalized = 1 - Math.max(0, Math.min(1, y / height));

        const param = fader.dataset.param;
        const faderConfig = this._getFaderConfig(param);
        if (!faderConfig) return;

        let newValue = faderConfig.min + normalized * (faderConfig.max - faderConfig.min);
        newValue = this._snapToStep(newValue, faderConfig);

        this.config.params[param] = newValue;
        this.config.onParamChange(param, newValue);
        this._updateFaderVisual(fader, faderConfig);
    }

    // ═══════════════════════════════════════════════════════════════════
    // VISUAL UPDATES
    // ═══════════════════════════════════════════════════════════════════

    _syncKnobs() {
        this.bar.querySelectorAll('.sknob').forEach(knob => {
            const param = knob.dataset.param;
            const config = this._getKnobConfig(param);
            if (config) this._updateKnobVisual(knob, config);
        });
    }

    _syncFaders() {
        this.bar.querySelectorAll('.sfader').forEach(fader => {
            const param = fader.dataset.param;
            const config = this._getFaderConfig(param);
            if (config) this._updateFaderVisual(fader, config);
        });
    }

    _syncPads() {
        this.bar.querySelectorAll('.spad').forEach((pad, i) => {
            const btn = pad.querySelector('.spad-btn');
            btn.classList.toggle('filled', this.config.presets[i] !== null);
            btn.classList.toggle('active', i === this.selectedPresetSlot);
        });
    }

    _updateKnobVisual(knob, config) {
        const value = this.config.params[config.id] ?? config.min;
        const normalized = this._normalize(value, config);
        const rotation = -135 + (normalized * 270);

        const inner = knob.querySelector('.sknob-inner');
        if (inner) inner.style.transform = `rotate(${rotation}deg)`;

        const valueEl = knob.querySelector('.sknob-value');
        if (valueEl) valueEl.textContent = this._formatValue(config, value);
    }

    _updateFaderVisual(fader, config) {
        const value = this.config.params[config.id] ?? config.min;
        const pct = Math.max(0, Math.min(100, this._normalize(value, config) * 100));

        const fill = fader.querySelector('.sfader-fill');
        const handle = fader.querySelector('.sfader-handle');
        if (fill) fill.style.height = pct + '%';
        if (handle) handle.style.bottom = `calc(${pct}% - 8px)`;

        const valueEl = fader.querySelector('.sfader-value');
        if (valueEl) valueEl.textContent = this._formatValue(config, value);
    }

    // ═══════════════════════════════════════════════════════════════════
    // POPOUT WINDOW
    // ═══════════════════════════════════════════════════════════════════

    _buildPopoutContent() {
        const accent = this.config.accentColor;
        const accentDim = this.config.accentColorDim;

        this.popoutWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.config.name} - Controls</title>
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --hw-accent: ${accent};
                        --hw-accent-dim: ${accentDim};
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'JetBrains Mono', monospace;
                        background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
                        color: #e0e0e0;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 12px 20px;
                        user-select: none;
                    }
                    .title {
                        position: absolute;
                        top: 8px;
                        left: 20px;
                        font-size: 11px;
                        color: var(--hw-accent);
                        font-weight: 600;
                        letter-spacing: 1px;
                    }
                    .hardware-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
                    .hardware-section { display: flex; align-items: flex-end; gap: 6px; padding: 8px 12px; background: linear-gradient(180deg, #252525 0%, #1a1a1a 100%); border-radius: 8px; border: 1px solid #333; position: relative; }
                    .hardware-section-label { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
                    .hardware-divider { width: 1px; height: 120px; background: linear-gradient(180deg, transparent, #333, transparent); margin: 0 10px; }
                    /* Grid layout for knobs and pads (matches MiniLab 3 physical layout) */
                    .hardware-knob-grid, .hardware-pad-grid { display: flex; flex-direction: column; gap: 4px; }
                    .hardware-knob-row, .hardware-pad-row { display: flex; gap: 6px; justify-content: center; }
                    .sknob { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                    .sknob-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; max-width: 50px; text-align: center; line-height: 1.1; height: 18px; overflow: hidden; }
                    .sknob-outer { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(145deg, #2a2a2a, #1a1a1a); box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; }
                    .sknob-inner { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(145deg, #333, #222); box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05); position: relative; transition: transform 0.05s ease-out; }
                    .sknob-indicator { position: absolute; width: 3px; height: 10px; background: var(--hw-accent); border-radius: 2px; top: 4px; left: 50%; transform: translateX(-50%); box-shadow: 0 0 6px var(--hw-accent); }
                    .sknob-ring { position: absolute; width: 50px; height: 50px; border-radius: 50%; border: 2px solid transparent; border-top-color: #444; top: -3px; left: -3px; }
                    .sknob-value { font-size: 9px; color: var(--hw-accent); font-weight: 500; }
                    .sknob:hover .sknob-outer { box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 10px rgba(0,255,136,0.2); }
                    .sknob.active .sknob-indicator { background: #fff; box-shadow: 0 0 10px #fff, 0 0 20px var(--hw-accent); }
                    .sfader { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                    .sfader-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
                    .sfader-track { width: 30px; height: 80px; background: linear-gradient(90deg, #1a1a1a, #252525, #1a1a1a); border-radius: 4px; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03); cursor: pointer; }
                    .sfader-slot { position: absolute; width: 4px; height: 70px; background: #111; left: 50%; top: 5px; transform: translateX(-50%); border-radius: 2px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.8); }
                    .sfader-fill { position: absolute; width: 4px; left: 50%; bottom: 5px; transform: translateX(-50%); background: linear-gradient(180deg, var(--hw-accent), var(--hw-accent-dim)); border-radius: 2px; box-shadow: 0 0 8px var(--hw-accent); max-height: 70px; }
                    .sfader-handle { position: absolute; width: 26px; height: 16px; background: linear-gradient(180deg, #444, #333, #222); left: 2px; border-radius: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1); cursor: grab; }
                    .sfader-handle::after { content: ''; position: absolute; width: 16px; height: 2px; background: #555; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 1px; }
                    .sfader-value { font-size: 9px; color: var(--hw-accent); font-weight: 500; }
                    .spad { display: flex; flex-direction: column; align-items: center; gap: 2px; }
                    .spad-btn { width: 36px; height: 36px; border-radius: 4px; background: linear-gradient(180deg, #2a2a2a, #1a1a1a); border: 1px solid #333; box-shadow: 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #666; transition: all 0.1s; }
                    .spad-btn:hover { background: linear-gradient(180deg, #333, #252525); }
                    .spad-btn:active, .spad-btn.active { background: linear-gradient(180deg, var(--hw-accent-dim), var(--hw-accent)); color: #000; box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 0 15px var(--hw-accent), inset 0 1px 0 rgba(255,255,255,0.2); transform: translateY(1px); }
                    .spad-btn.filled { border-color: var(--hw-accent-dim); color: var(--hw-accent); }
                    .spad-label { font-size: 7px; color: #555; text-transform: uppercase; }
                    /* Audio section */
                    .hardware-audio-controls { display: flex; gap: 6px; margin-bottom: 6px; }
                    .hardware-audio-btn { width: 36px; height: 36px; border-radius: 4px; background: linear-gradient(180deg, #2a2a2a, #1a1a1a); border: 1px solid #333; color: #888; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                    .hardware-audio-btn:hover { border-color: var(--hw-accent-dim); color: var(--hw-accent); }
                    .hardware-audio-btn.active { background: linear-gradient(180deg, var(--hw-accent-dim), var(--hw-accent)); border-color: var(--hw-accent); color: #000; }
                    .hardware-audio-status { font-size: 8px; color: #555; text-align: center; max-width: 100px; overflow: hidden; text-overflow: ellipsis; }
                    .hardware-audio-status.active { color: var(--hw-accent); }
                    /* MIDI section */
                    .hardware-midi-status { display: flex; align-items: center; gap: 6px; font-size: 9px; color: #555; }
                    .hardware-midi-dot { width: 8px; height: 8px; border-radius: 50%; background: #333; }
                    .hardware-midi-dot.connected { background: var(--hw-accent); box-shadow: 0 0 6px var(--hw-accent); }
                    .hardware-midi-dot.active { background: #fff; box-shadow: 0 0 10px #fff; }
                    .hardware-midi-name { max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                </style>
            </head>
            <body>
                <span class="title">${this.config.name.toUpperCase()}</span>
                <div class="hardware-row" id="hardware-content">
                    ${this._generateBarHTML()}
                </div>
            </body>
            </html>
        `);
        this.popoutWindow.document.close();

        // Sync after a brief delay to ensure DOM is ready
        setTimeout(() => this._syncPopout(), 50);
    }

    _setupPopoutListeners() {
        if (!this.popoutWindow || this.popoutWindow.closed) return;

        const doc = this.popoutWindow.document;
        let popActiveKnob = null;
        let popActiveFader = null;
        let popDragStartY = 0;
        let popDragStartValue = 0;

        // Knob interactions
        doc.querySelectorAll('.sknob').forEach(knob => {
            const outer = knob.querySelector('.sknob-outer');

            outer.addEventListener('mousedown', (e) => {
                popActiveKnob = knob;
                popDragStartY = e.clientY;
                const param = knob.dataset.param;
                popDragStartValue = this.config.params[param] ?? 0;
                knob.classList.add('active');
                e.preventDefault();
            });

            outer.addEventListener('wheel', (e) => {
                const param = knob.dataset.param;
                const config = this._getKnobConfig(param);
                if (!config) return;

                const step = config.step || 1;
                const delta = e.deltaY > 0 ? -step : step;
                let newValue = (this.config.params[param] ?? config.min) + delta;
                newValue = Math.max(config.min, Math.min(config.max, newValue));

                this.config.params[param] = newValue;
                this.config.onParamChange(param, newValue);
                this.sync();
                e.preventDefault();
            });
        });

        // Fader interactions
        doc.querySelectorAll('.sfader').forEach(fader => {
            const track = fader.querySelector('.sfader-track');

            track.addEventListener('mousedown', (e) => {
                popActiveFader = fader;
                this._updatePopoutFader(fader, e);
                e.preventDefault();
            });
        });

        // Pad clicks
        doc.querySelectorAll('.spad-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                this.selectedPresetSlot = i;
                this.config.onPresetLoad(i);
                this.sync();
            });
        });

        // Mouse move/up
        doc.addEventListener('mousemove', (e) => {
            if (popActiveKnob) {
                const param = popActiveKnob.dataset.param;
                const config = this._getKnobConfig(param);
                if (!config) return;

                const sensitivity = 0.5;
                const deltaY = popDragStartY - e.clientY;
                const range = config.max - config.min;
                const delta = (deltaY * sensitivity * range) / 100;

                let newValue = popDragStartValue + delta;
                newValue = Math.max(config.min, Math.min(config.max, newValue));
                newValue = this._snapToStep(newValue, config);

                this.config.params[param] = newValue;
                this.config.onParamChange(param, newValue);
                this.sync();
            }

            if (popActiveFader) {
                this._updatePopoutFader(popActiveFader, e);
            }
        });

        doc.addEventListener('mouseup', () => {
            if (popActiveKnob) {
                popActiveKnob.classList.remove('active');
                popActiveKnob = null;
            }
            popActiveFader = null;
        });

        // Audio controls in popout
        const audioFile = doc.querySelector('.hardware-audio-file');
        const micBtn = doc.querySelector('.hardware-mic-btn');
        const playBtn = doc.querySelector('.hardware-play-btn');

        if (audioFile) {
            audioFile.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.config.onAudioFile(e.target.files[0]);
                    this.setAudioStatus(e.target.files[0].name, true);
                }
            });
        }

        if (micBtn) {
            micBtn.addEventListener('click', () => {
                // Sync with main window mic button
                const mainMic = this.bar.querySelector('.hardware-mic-btn');
                if (mainMic) mainMic.click();
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                // Sync with main window play button
                const mainPlay = this.bar.querySelector('.hardware-play-btn');
                if (mainPlay) mainPlay.click();
            });
        }
    }

    _updatePopoutFader(fader, e) {
        const track = fader.querySelector('.sfader-track');
        const rect = track.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const normalized = 1 - Math.max(0, Math.min(1, y / height));

        const param = fader.dataset.param;
        const config = this._getFaderConfig(param);
        if (!config) return;

        let newValue = config.min + normalized * (config.max - config.min);
        newValue = this._snapToStep(newValue, config);

        this.config.params[param] = newValue;
        this.config.onParamChange(param, newValue);
        this.sync();
    }

    _syncPopout() {
        if (!this.popoutWindow || this.popoutWindow.closed) return;

        const doc = this.popoutWindow.document;

        // Sync knobs
        doc.querySelectorAll('.sknob').forEach(knob => {
            const param = knob.dataset.param;
            const config = this._getKnobConfig(param);
            if (!config) return;

            const value = this.config.params[param] ?? config.min;
            const normalized = this._normalize(value, config);
            const rotation = -135 + (normalized * 270);

            const inner = knob.querySelector('.sknob-inner');
            if (inner) inner.style.transform = `rotate(${rotation}deg)`;

            const valueEl = knob.querySelector('.sknob-value');
            if (valueEl) valueEl.textContent = this._formatValue(config, value);
        });

        // Sync faders
        doc.querySelectorAll('.sfader').forEach(fader => {
            const param = fader.dataset.param;
            const config = this._getFaderConfig(param);
            if (!config) return;

            const value = this.config.params[param] ?? config.min;
            const pct = Math.max(0, Math.min(100, this._normalize(value, config) * 100));

            const fill = fader.querySelector('.sfader-fill');
            const handle = fader.querySelector('.sfader-handle');
            if (fill) fill.style.height = pct + '%';
            if (handle) handle.style.bottom = `calc(${pct}% - 8px)`;

            const valueEl = fader.querySelector('.sfader-value');
            if (valueEl) valueEl.textContent = this._formatValue(config, value);
        });

        // Sync pads
        doc.querySelectorAll('.spad').forEach((pad, i) => {
            const btn = pad.querySelector('.spad-btn');
            if (btn) {
                btn.classList.toggle('filled', this.config.presets[i] !== null);
                btn.classList.toggle('active', i === this.selectedPresetSlot);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    _getKnobConfig(param) {
        return this.config.knobs.find(k => k.id === param);
    }

    _getFaderConfig(param) {
        return this.config.faders.find(f => f.id === param);
    }

    _normalize(value, config) {
        return (value - config.min) / (config.max - config.min);
    }

    _snapToStep(value, config) {
        if (!config.step) return value;
        return Math.round(value / config.step) * config.step;
    }

    _formatValue(config, value) {
        const suffix = config.suffix || '';
        if (Number.isInteger(config.step) || config.step >= 1) {
            return Math.round(value) + suffix;
        }
        return value.toFixed(config.decimals ?? 1) + suffix;
    }

    _dimColor(hex) {
        // Darken a hex color by ~30%
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const dim = (c) => Math.round(c * 0.7).toString(16).padStart(2, '0');
        return `#${dim(r)}${dim(g)}${dim(b)}`;
    }

    _applyAccentColor() {
        document.documentElement.style.setProperty('--hw-accent', this.config.accentColor);
        document.documentElement.style.setProperty('--hw-accent-dim', this.config.accentColorDim);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HardwareControls;
}
