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

        case 'lyrics':
          this._lyricsState = msg.state;
          if (msg.style) this._lyricsStyle = msg.style;
          if (msg.state && !this._lyricsRenderer) this._initLyricsRenderer();
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

  /**
   * Initialize the lyrics overlay canvas + render loop.
   */
  _initLyricsRenderer() {
    if (this._lyricsRenderer) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    this._lyricsCanvas = canvas;
    this._lyricsCtx = canvas.getContext('2d');
    this._lyricsRenderer = true;
    this._lyricsStyle = this._lyricsStyle || { position: 'bottom', currentSize: 0.05 };

    const resizeLyrics = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
    };
    resizeLyrics();
    window.addEventListener('resize', resizeLyrics);

    const drawLyrics = () => {
      requestAnimationFrame(drawLyrics);
      const ctx = this._lyricsCtx;
      const w = this._lyricsCanvas.width;
      const h = this._lyricsCanvas.height;
      ctx.clearRect(0, 0, w, h);

      const state = this._lyricsState;
      if (!state || !state.current) return;

      const style = this._lyricsStyle || {};
      const sizeFactor = style.currentSize || 0.05;
      const position = style.position || 'bottom';

      const mainSize = Math.max(16, Math.round(h * sizeFactor));
      const smallSize = Math.round(mainSize * 0.6);
      const lineGap = mainSize * 1.4;

      // Vertical position
      let baseY;
      if (position === 'top') baseY = h * 0.18;
      else if (position === 'center') baseY = h * 0.5;
      else baseY = h * 0.82;

      const cx = w / 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Previous line (small, fading)
      if (state.prev) {
        ctx.font = `${smallSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(state.prev, cx, baseY - lineGap);
      }

      // Current line — karaoke wipe
      ctx.font = `600 ${mainSize}px "JetBrains Mono", monospace`;
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 8;

      const textWidth = ctx.measureText(state.current).width;
      const textLeft = cx - textWidth / 2;
      const progress = state.progress || 0;

      // Unsung portion (dimmed)
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(state.current, cx, baseY);

      // Sung portion (bright wipe)
      ctx.save();
      ctx.beginPath();
      ctx.rect(textLeft, baseY - mainSize, textWidth * progress, mainSize * 2);
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(state.current, cx, baseY);
      ctx.restore();

      // Next line (small, dimmed)
      if (state.next) {
        ctx.font = `${smallSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.shadowBlur = 4;
        ctx.fillText(state.next, cx, baseY + lineGap);
      }

      ctx.shadowBlur = 0;
    };

    drawLyrics();
  }
}

// Make available globally
window.EmbedAdapter = EmbedAdapter;
