# Creating Visualizers

Build your own audio-reactive visualizers for sheep-viz.

## Architecture

Every visualizer follows this pattern:

```
Audio File/Mic ──► Web Audio API ──► FFT Analysis ──► Parameters
                                          │
                                          ▼
                      Canvas ◄── p5.js ◄── draw() function
```

1. **Audio input** - File or microphone via Web Audio API
2. **Analysis** - FFT gives frequency data (bass, mids, treble)
3. **Parameters** - User-adjustable values via sliders
4. **Rendering** - p5.js draws to canvas based on audio + params

## Starting Template

Copy this and modify:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Visualizer</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.js"></script>
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
// Audio setup
let audioContext, analyser, dataArray;
let bass = 0, mids = 0, treble = 0;

// Parameters (customize these)
let params = {
  intensity: 1.0,
  speed: 1.0,
  colorHue: 200
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);

  // Initialize audio on first click
  canvas.addEventListener('click', initAudio);
}

function initAudio() {
  if (audioContext) return;

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Connect to microphone (or replace with file input)
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
    });
}

function analyzeAudio() {
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  // Split into frequency bands
  const third = Math.floor(dataArray.length / 3);

  bass = average(dataArray.slice(0, third)) / 255;
  mids = average(dataArray.slice(third, third * 2)) / 255;
  treble = average(dataArray.slice(third * 2)) / 255;
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function draw() {
  analyzeAudio();

  background(0, 0, 5);

  // YOUR VISUALIZATION CODE HERE
  // Use bass, mids, treble (0-1) to drive visuals
  // Use params.* for user-adjustable values

  // Example: circle that pulses with bass
  fill(params.colorHue, 80, 80);
  const size = 100 + bass * 200 * params.intensity;
  ellipse(width/2, height/2, size);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
</script>
</body>
</html>
```

## Audio Analysis

### Frequency Bands

The FFT gives you frequency data. Split it into bands:

```javascript
// Bass: 20-250 Hz (first ~10% of bins)
// Mids: 250-2000 Hz (next ~40% of bins)
// Treble: 2000+ Hz (remaining bins)

const bassEnd = Math.floor(dataArray.length * 0.1);
const midsEnd = Math.floor(dataArray.length * 0.5);

bass = average(dataArray.slice(0, bassEnd)) / 255;
mids = average(dataArray.slice(bassEnd, midsEnd)) / 255;
treble = average(dataArray.slice(midsEnd)) / 255;
```

### Beat Detection

Detect beats by tracking bass spikes:

```javascript
let lastBass = 0;
let beatThreshold = 0.3;

function detectBeat() {
  const isBeat = bass > beatThreshold && bass > lastBass * 1.2;
  lastBass = bass;
  return isBeat;
}
```

### Smoothing

Raw FFT data is jittery. Smooth it:

```javascript
let smoothBass = 0;
const smoothing = 0.8;

function analyzeAudio() {
  // ... get raw bass value
  smoothBass = smoothBass * smoothing + bass * (1 - smoothing);
}
```

## Visual Techniques

### Particles

```javascript
let particles = [];

function draw() {
  // Spawn particles on beat
  if (detectBeat()) {
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: width/2,
        y: height/2,
        vx: random(-5, 5),
        vy: random(-5, 5),
        life: 1
      });
    }
  }

  // Update and draw
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;

    fill(255, p.life);
    ellipse(p.x, p.y, 10);
  }

  // Remove dead particles
  particles = particles.filter(p => p.life > 0);
}
```

### Flow Fields

```javascript
function draw() {
  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      // Angle from Perlin noise
      const angle = noise(x * 0.01, y * 0.01, frameCount * 0.01) * TWO_PI * 2;

      // Affect by audio
      const length = 10 + bass * 20;

      stroke(255);
      push();
      translate(x, y);
      rotate(angle);
      line(0, 0, length, 0);
      pop();
    }
  }
}
```

### Waveform

```javascript
function draw() {
  analyser.getByteTimeDomainData(dataArray);

  stroke(255);
  noFill();
  beginShape();
  for (let i = 0; i < dataArray.length; i++) {
    const x = map(i, 0, dataArray.length, 0, width);
    const y = map(dataArray[i], 0, 255, height * 0.3, height * 0.7);
    vertex(x, y);
  }
  endShape();
}
```

## Adding Parameters

### Define Parameters

```javascript
let params = {
  particleCount: 50,
  speed: 1.0,
  colorHue: 200,
  reactivity: 1.0
};
```

### Create UI

```javascript
function setup() {
  // ... canvas setup

  const controls = createDiv().id('controls');

  createSlider('Particles', 'particleCount', 10, 200, 1);
  createSlider('Speed', 'speed', 0.1, 3, 0.1);
  createSlider('Color', 'colorHue', 0, 360, 1);
}

function createSlider(label, param, min, max, step) {
  const div = createDiv();
  div.parent('#controls');

  createSpan(label).parent(div);
  const slider = createSlider(min, max, params[param], step);
  slider.parent(div);
  slider.input(() => params[param] = slider.value());
}
```

## Adding MIDI

```javascript
function setupMIDI() {
  navigator.requestMIDIAccess().then(access => {
    for (let input of access.inputs.values()) {
      input.onmidimessage = handleMIDI;
    }
  });
}

function handleMIDI(e) {
  const [status, cc, value] = e.data;

  // CC message (0xB0 = channel 1)
  if ((status & 0xF0) === 0xB0) {
    const normalized = value / 127;

    switch(cc) {
      case 1: params.particleCount = Math.floor(normalized * 190 + 10); break;
      case 2: params.speed = normalized * 2.9 + 0.1; break;
      case 3: params.colorHue = normalized * 360; break;
    }
  }
}
```

## Performance Tips

1. **Limit particle count** - 1000+ particles will lag
2. **Use noStroke() when possible** - Strokes are expensive
3. **Pre-calculate** - Don't compute the same value every frame
4. **Use WebGL mode** - `createCanvas(w, h, WEBGL)` for 3D or heavy 2D
5. **Profile** - Use Chrome DevTools Performance tab

## File Structure

For a complete visualizer with all features:

```
my-visualizer.html      # Self-contained visualizer
my-visualizer-render.html   # Headless version for video export
presets/
  my-preset-1.json
  my-preset-2.json
```

## Contributing

Built something cool? Open a PR:

1. Add your visualizer to `visualizers/`
2. Create at least one preset
3. Update the README
4. Submit PR with a screenshot/GIF

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
