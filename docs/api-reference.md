# API Reference

Technical reference for sheep-viz internals.

## Audio Analysis

### AudioContext Setup

```javascript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;  // 128 frequency bins
analyser.smoothingTimeConstant = 0.8;

const dataArray = new Uint8Array(analyser.frequencyBinCount);
```

### Frequency Data

```javascript
analyser.getByteFrequencyData(dataArray);
// dataArray[0-127] = frequency magnitudes (0-255)
// Lower indices = lower frequencies
```

### Time Domain Data

```javascript
const waveform = new Uint8Array(analyser.fftSize);
analyser.getByteTimeDomainData(waveform);
// waveform[0-255] = amplitude samples (128 = center)
```

## Parameters Object

### Vertical Pulse Pro

```javascript
const params = {
  columnCount: 50,     // Number of vertical bars (20-100)
  columnWidth: 10,     // Width of each bar in pixels (1-20)
  noiseScale: 0.02,    // Perlin noise frequency (0.001-0.05)
  blobCount: 5,        // Number of metaball shapes (1-10)
  blobSize: 150,       // Radius of each blob (50-300)
  colorShift: 0.3,     // Hue rotation speed (0-1)
  bassBoost: 2.0,      // Bass frequency multiplier (1-5)
  midBoost: 1.5,       // Mid frequency multiplier (1-5)
  trebleBoost: 2.0     // Treble frequency multiplier (1-5)
};
```

### Radial Burst

```javascript
const params = {
  particleCount: 50,   // Particles per burst (10-100)
  particleSpeed: 8,    // Initial velocity (1-20)
  trailLength: 0.5,    // Fade duration (0-1)
  ringSize: 200,       // Waveform ring radius (100-400)
  beatThreshold: 0.4,  // Beat detection sensitivity (0.1-0.9)
  gravity: 0.2,        // Particle fall rate (0-1)
  colorMode: 'reactive' // 'static', 'rainbow', 'reactive'
};
```

## Metaball Algorithm

The organic distortion effect uses a metaball field:

```javascript
function metaballField(x, y, blobs) {
  let sum = 0;
  for (let blob of blobs) {
    const dx = x - blob.x;
    const dy = y - blob.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    sum += (blob.radius * blob.radius) / (d * d + 1);
  }
  return sum;
}

// Displacement based on field strength
const fieldValue = metaballField(x, y, blobs);
const displacement = map(fieldValue, 0, 1, 0, maxDisplacement);
```

## MIDI Integration

### Initialization

```javascript
async function initMIDI() {
  const access = await navigator.requestMIDIAccess();

  for (let input of access.inputs.values()) {
    input.onmidimessage = handleMIDI;
  }

  access.onstatechange = (e) => {
    if (e.port.type === 'input' && e.port.state === 'connected') {
      e.port.onmidimessage = handleMIDI;
    }
  };
}
```

### Message Handling

```javascript
function handleMIDI(event) {
  const [status, data1, data2] = event.data;
  const messageType = status & 0xF0;
  const channel = status & 0x0F;

  switch (messageType) {
    case 0x90: // Note On
      handleNoteOn(data1, data2);
      break;
    case 0x80: // Note Off
      handleNoteOff(data1);
      break;
    case 0xB0: // Control Change
      handleCC(data1, data2);
      break;
  }
}

function handleCC(cc, value) {
  const normalized = value / 127;  // 0-1

  // Map CC to parameter
  if (midiMapping.cc[cc]) {
    const param = midiMapping.cc[cc];
    params[param] = mapToRange(normalized, paramRanges[param]);
    updateUI(param);
  }
}
```

## Recording

### MediaRecorder Setup

```javascript
function startRecording() {
  const stream = canvas.captureStream(30);  // 30 fps
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000  // 5 Mbps
  });

  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    downloadBlob(blob, 'recording.webm');
  };

  recorder.start();
  return recorder;
}
```

## Preset System

### Save Preset

```javascript
function savePreset(name) {
  const preset = {
    name: name,
    version: 1,
    timestamp: Date.now(),
    parameters: { ...params }
  };

  const blob = new Blob(
    [JSON.stringify(preset, null, 2)],
    { type: 'application/json' }
  );

  downloadBlob(blob, `${name}.json`);
}
```

### Load Preset

```javascript
async function loadPreset(file) {
  const text = await file.text();
  const preset = JSON.parse(text);

  // Apply parameters
  Object.assign(params, preset.parameters);

  // Update all UI elements
  updateAllSliders();
}
```

## Render Pipeline

### analyze-audio.js

```javascript
const Meyda = require('meyda');
const { AudioContext } = require('web-audio-api');

async function analyzeAudio(inputPath, outputPath, fps = 30) {
  const audioBuffer = await loadAudio(inputPath);
  const framesPerSecond = fps;
  const samplesPerFrame = audioBuffer.sampleRate / framesPerSecond;

  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    const startSample = i * samplesPerFrame;
    const segment = extractSegment(audioBuffer, startSample, fftSize);

    const features = Meyda.extract(['amplitudeSpectrum', 'rms'], segment);
    frames.push(features);
  }

  fs.writeFileSync(outputPath, JSON.stringify(frames));
}
```

### render-frames.js

```javascript
const puppeteer = require('puppeteer');

async function renderFrames(audioData, outputDir, options) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({
    width: options.width,
    height: options.height
  });

  await page.goto(`file://${visualizerPath}`);

  for (let i = 0; i < audioData.length; i++) {
    // Inject audio data for this frame
    await page.evaluate((data) => {
      window.injectAudioData(data);
    }, audioData[i]);

    // Wait for render
    await page.waitForFunction('window.frameReady');

    // Capture frame
    await page.screenshot({
      path: `${outputDir}/frame-${String(i).padStart(5, '0')}.png`
    });
  }

  await browser.close();
}
```

## Keyboard Shortcuts

```javascript
document.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case ' ':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'f':
      toggleFullscreen();
      break;
    case 'h':
      toggleUI();
      break;
    case 'r':
      toggleRecording();
      break;
  }
});

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}
```

## Color Extraction

```javascript
function extractColors(imageData, numColors = 5) {
  const pixels = [];

  // Sample pixels
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] > 128) {  // Ignore transparent
      pixels.push([
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2]
      ]);
    }
  }

  // K-means clustering
  return kMeansClustering(pixels, numColors);
}
```

## File Formats

### Preset JSON

```json
{
  "name": "string",
  "version": 1,
  "visualizer": "vertical-pulse-pro",
  "timestamp": 1705000000000,
  "parameters": {
    "columnCount": 50,
    "columnWidth": 10
  },
  "colors": {
    "primary": "#ff00ff",
    "secondary": "#00ffff"
  },
  "meta": {
    "author": "string",
    "description": "string"
  }
}
```

### Audio Analysis JSON

```json
[
  {
    "frame": 0,
    "rms": 0.234,
    "amplitudeSpectrum": [0.1, 0.2, 0.3, ...],
    "bass": 0.5,
    "mids": 0.3,
    "treble": 0.2
  },
  ...
]
```
