/**
 * sheep-viz Embed Adapter
 *
 * Lightweight adapter that enables visualizers to run in embed mode
 * inside the Control Room iframe. When not in embed mode, this is
 * a complete no-op — standalone behavior is unchanged.
 *
 * Usage in visualizer:
 *   const embed = new EmbedAdapter({ name, accentColor, knobs, faders, presets });
 *   if (embed.active) {
 *     ({ audioContext, analyser, dataArray, timeDataArray, audioInitialized } = embed.audioGlobals());
 *   }
 *   // ... later, skip HardwareControls init if embed.active
 */

class EmbedAdapter {
  constructor(config) {
    this.active = new URLSearchParams(location.search).has('embed')
      || (window.parent !== window && !new URLSearchParams(location.search).has('standalone'));

    if (!this.active) return;

    this.config = config;
    this._frequencyData = null;
    this._timeData = null;
    this._params = config.params || {};

    // Pre-init audio context + analyser for embed mode
    this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this._analyser = this._audioContext.createAnalyser();
    this._analyser.fftSize = config.fftSize || 2048;
    this._analyser.smoothingTimeConstant = 0.8;
    this._dataArray = new Uint8Array(this._analyser.frequencyBinCount);
    this._timeDataArray = new Uint8Array(this._analyser.fftSize);

    // Patch analyser methods to return received data
    const self = this;
    const origGetFreq = this._analyser.getByteFrequencyData.bind(this._analyser);
    const origGetTime = this._analyser.getByteTimeDomainData.bind(this._analyser);

    this._analyser.getByteFrequencyData = function (array) {
      if (self._frequencyData) {
        const src = self._frequencyData;
        for (let i = 0; i < array.length && i < src.length; i++) {
          array[i] = src[i];
        }
      } else {
        origGetFreq(array);
      }
    };

    this._analyser.getByteTimeDomainData = function (array) {
      if (self._timeData) {
        const src = self._timeData;
        for (let i = 0; i < array.length && i < src.length; i++) {
          array[i] = src[i];
        }
      } else {
        origGetTime(array);
      }
    };

    this._hideUI();
    this._listenForMessages();

    // Report config to parent after a tick (let visualizer finish init)
    requestAnimationFrame(() => this._reportConfig());
  }

  /**
   * Returns pre-initialized audio globals for the visualizer to use.
   * Call this right after the visualizer's `let audioContext, analyser, ...` declarations.
   */
  audioGlobals() {
    return {
      audioContext: this._audioContext,
      analyser: this._analyser,
      dataArray: this._dataArray,
      timeDataArray: this._timeDataArray,
      audioInitialized: true
    };
  }

  /**
   * Hide all UI elements — only the canvas should be visible in embed mode.
   */
  _hideUI() {
    const style = document.createElement('style');
    style.textContent = `
      #sidebar,
      #click-prompt,
      .hardware-bar,
      .hardware-toggle,
      .sheep-watermark,
      .top-bar {
        display: none !important;
      }
      body {
        overflow: hidden !important;
      }
      #app {
        display: block !important;
      }
      #canvas-container {
        width: 100vw !important;
        height: 100vh !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Listen for messages from the Control Room parent window.
   */
  _listenForMessages() {
    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'audio':
          this._frequencyData = msg.freq;
          this._timeData = msg.time;
          break;

        case 'param':
          if (this._params && msg.id in this._params) {
            this._params[msg.id] = msg.value;
          }
          if (this.config.onParamChange) {
            this.config.onParamChange(msg.id, msg.value);
          }
          break;

        case 'preset':
          if (this.config.onPresetLoad) {
            this.config.onPresetLoad(msg.index);
          }
          break;

        case 'overlay':
          this._handleOverlay(msg.dataUrl);
          break;

        case 'getConfig':
          this._reportConfig();
          break;
      }
    });
  }

  /**
   * Send visualizer configuration to the Control Room parent.
   */
  _reportConfig() {
    if (!window.parent || window.parent === window) return;

    window.parent.postMessage({
      type: 'viz-config',
      name: this.config.name || 'Visualizer',
      accentColor: this.config.accentColor || '#00ff88',
      knobs: this.config.knobs || [],
      faders: this.config.faders || [],
      presets: (this.config.presets || []).map(p => {
        if (!p) return null;
        return { name: p.name || 'Preset' };
      }),
      currentParams: { ...this._params }
    }, '*');
  }

  /**
   * Handle overlay image from Control Room.
   * Sets global variables that the visualizer's drawOverlay() expects.
   */
  _handleOverlay(dataUrl) {
    if (!dataUrl) {
      window.overlayImage = null;
      window.overlayLoaded = false;
      return;
    }
    const img = new Image();
    img.onload = () => {
      window.overlayImage = img;
      window.overlayLoaded = true;
    };
    img.src = dataUrl;
  }
}

// Make available globally
window.EmbedAdapter = EmbedAdapter;
