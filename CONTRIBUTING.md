# Contributing to Sheep

Thanks for wanting to contribute. Here's how to help.

## Building a New Visualizer

The easiest way to contribute is to create a new visualizer.

### Template

Start by copying `visualizers/vertical-pulse-pro.html`. It's a single self-contained file with everything you need:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <!-- Your styles -->
</head>
<body>
    <!-- Your UI -->
    <script>
        // Parameters object
        const P = {
            // Your parameters here
        };

        // Audio analysis (copy from existing visualizer)
        function getAudio() { /* ... */ }

        // p5.js setup
        function setup() {
            createCanvas(1200, 800);
        }

        // Your visualization
        function draw() {
            const audio = getAudio();
            // React to audio.bass, audio.mid, audio.treble, audio.spectrum
        }
    </script>
</body>
</html>
```

### Audio Data Available

```javascript
const audio = getAudio();

audio.bass      // 0-1+ (low frequencies, kicks)
audio.mid       // 0-1+ (mids, vocals, synths)
audio.treble    // 0-1+ (highs, hats, air)
audio.spectrum  // Array of values per frequency bin
audio.waveform  // Time-domain waveform (if using larger FFT)
```

### Guidelines

- **One file** — Keep it self-contained, no external dependencies except p5.js
- **Parameters** — Expose tunables in a `P` object with UI controls
- **MIDI** — Add `data-midi="N"` to sliders for MIDI mapping
- **Performance** — Target 60fps on mid-range hardware
- **Dark background** — Visuals should work on black/dark backgrounds

## Creating Presets

Presets are JSON files in `visualizers/presets/`:

```json
{
  "name": "My Preset",
  "description": "What it looks like",
  "visualizer": "vertical-pulse",
  "version": "1.0",
  "params": {
    "columnCount": 60,
    "colorBass": "#ff3366"
    // ... all parameters
  },
  "tags": ["keyword", "another"]
}
```

## Improving the Render Pipeline

The render system lives in `tools/`:

- `analyze-audio.js` — Extracts FFT data per frame to JSON
- `render-frames.js` — Puppeteer renders each frame as PNG
- `render-video.sh` — Shell wrapper that ties it together

PRs welcome for:
- Better audio analysis (beat detection, onset detection)
- Faster rendering (parallel frame processing)
- More output formats
- GPU-accelerated rendering

## Code Style

- No build step — vanilla JS, runs directly in browser
- Modern JS (ES6+) is fine
- Keep files readable, comment non-obvious parts
- Test in Chrome and Firefox

## Pull Requests

1. Fork the repo
2. Create a branch (`git checkout -b my-visualizer`)
3. Make your changes
4. Test it works
5. Submit PR with a description of what it does

## Ideas We'd Love

- Flow field / particle systems
- 3D visualizers (Three.js)
- Waveform-based designs
- Geometric / kaleidoscope patterns
- Retro aesthetics (CRT, VHS, ASCII)
- Liquid / fluid simulation
- OSC support for live coding integration
- MIDI learn system
- Ableton Link sync

## Questions?

Open an issue. We're friendly.
