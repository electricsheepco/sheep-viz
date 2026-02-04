# CLAUDE.md - Sheep

Creative coding for **Electric Sheep Supply Co.** music visuals, videos, and generative art.

**Live:** https://sheep-xi.vercel.app
**GitHub:** https://github.com/electricsheepco/sheep-viz
**Instagram:** @sheep.sheep.sheep.sheep.sheep.

## Project Overview

**Sheep** is the creative coding arm of Electric Sheep Supply Co., focused on:
- Music visualizers and reactive graphics
- Generative art for album covers, social media, and merchandise
- Video processing and effects
- Live visual performance tools
- Promotional video content

## Visualizers

| Visualizer | Description | Accent | Status |
|------------|-------------|--------|--------|
| Vertical Pulse Pro | Light columns with metaball distortion | #ff3366 | Complete |
| Fluid Flow | Particle-based fluid simulation | #6366f1 | Complete |
| Radial Burst | Beat-reactive particle explosions | #ff3366 | Complete |
| Vector Grid | Johnny Quest wireframe terrain | #00ff41 | Complete |
| Matrix Rain | Digital rain with katakana | #00ff41 | Complete |
| Starfield | Classic star tunnel | #00ff88 | Complete |
| Warp Speed | Star Wars hyperspace | #00aaff | Complete |
| Vertical Pulse | Extended version with overlays | #d97757 | Complete |
| **Llama Bars** | Classic spectrum analyzer (Winamp tribute) | #ffcc00 | **NEW** |

### Planned Visualizers (Classic & Art Tributes)

| Name | Inspiration | Style |
|------|-------------|-------|
| Spilled Milk | Milkdrop | Shader morphing, reactive zoom |
| Geist | Geiss | Tunnel effects, color cycling |
| Gogh Mode | Van Gogh | Swirling brushstroke flow fields |
| Gilt Trip | Klimt | Gold spirals, Art Nouveau patterns |
| Cubic Zirconia | Picasso | Cubist fragmentation |

## Shared Hardware Controls Library

**Location:** `lib/hardware-controls.js` + `lib/hardware-controls.css`

All visualizers use a shared skeuomorphic control system:

```javascript
const hardware = new HardwareControls({
    name: 'Visualizer Name',
    accentColor: '#00ff88',
    params: params,
    knobs: [...],   // 8 knobs in 2x4 grid
    faders: [...],  // 4 faders
    presets: [...], // 8 pad slots
    logoUrl: null,  // Optional brand logo
    logoText: 'sheep-viz',
    onParamChange: (id, value) => { ... },
    onPresetLoad: (index) => { ... },
    onAudioFile: (file) => { ... },
    onMicToggle: (active) => { ... },
    onSystemAudio: (stream) => { ... },
    onPlayPause: (playing) => { ... }
});
```

### Hardware Bar Layout

```
┌─────────┬──────────┬──────────────────────────┬────────────────┬──────────────────┐
│  AUDIO  │   MIDI   │       PARAMETERS         │     FADERS     │     PRESETS      │
│ 📁 🎤 🖥 ▶│ ● Device │  [1][2][3][4]           │ [|] [|] [|] [|]│ [1][2][3][4]    │
│ status  │          │  [5][6][7][8]           │                │ [5][6][7][8]    │
└─────────┴──────────┴──────────────────────────┴────────────────┴──────────────────┘
```

### Audio Sources

| Button | Source | Method |
|--------|--------|--------|
| 📁 | Audio file | File input |
| 🎤 | Microphone | getUserMedia |
| 🖥 | System/Tab | getDisplayMedia (YouTube, Spotify, any app) |
| ▶ | Play/Pause | Toggle playback |

### MIDI Mapping (Arturia MiniLab 3)

```
KNOBS (2x4 grid matches controller)     PADS (2x4 grid)
┌────┬────┬────┬────┐                   ┌────┬────┬────┬────┐
│ 74 │ 71 │ 76 │ 77 │  CC numbers       │ 36 │ 37 │ 38 │ 39 │
├────┼────┼────┼────┤                   ├────┼────┼────┼────┤
│ 93 │ 18 │ 19 │ 16 │                   │ 40 │ 41 │ 42 │ 43 │
└────┴────┴────┴────┘                   └────┴────┴────┴────┘

FADERS: CC 82, 83, 85, 17
```

### Fullscreen Popout

- Press **F** → fullscreen + controls pop out to separate window
- Popout: full screen width, 200px tall, bottom of screen
- Two-way sync between main and popout windows
- Perfect for dual-screen live performance

## Standardized Control Parameters

**8 Knobs** (visualizer-specific mappings):
| # | Common Use | Description |
|---|------------|-------------|
| 1 | Count/Density | Number of elements |
| 2 | Speed | Animation speed |
| 3 | Sensitivity | Audio reactivity |
| 4 | Size/Alpha | Element size or opacity |
| 5 | Special 1 | Visualizer-specific |
| 6 | Special 2 | Visualizer-specific |
| 7 | Special 3 | Visualizer-specific |
| 8 | Special 4 | Visualizer-specific |

**4 Faders** (shared across all):
| # | Parameter | Description |
|---|-----------|-------------|
| 1 | Overlay Size | Image overlay scale |
| 2 | Overlay Alpha | Image overlay opacity |
| 3 | FX Intensity | Effect strength |
| 4 | Master | Global brightness |

**8 Pads**: Presets or style variants

## Logo Watermark

Configurable bottom-right watermark for branding:

```javascript
hardware.setLogo('/path/to/band-logo.png', 'Band Name');
hardware.showWatermark(true);
```

Default: "sheep-viz" text

## Tech Stack

- **Rendering:** Canvas 2D, p5.js
- **Audio:** Web Audio API (FFT analysis)
- **MIDI:** Web MIDI API
- **System Audio:** getDisplayMedia API
- **Recording:** MediaRecorder API
- **Video Pipeline:** Node.js + Puppeteer + FFmpeg
- **Hosting:** Vercel

## Project Structure

```
sheep/
├── index.html                    # Landing page with animated previews
├── lib/
│   ├── hardware-controls.js      # Shared control component
│   ├── hardware-controls.css     # Skeuomorphic styling
│   └── README.md
├── visualizers/
│   ├── llama-bars.html           # NEW: Winamp tribute
│   ├── starfield.html
│   ├── vertical-pulse-pro.html
│   ├── fluid-flow.html
│   ├── radial-burst.html
│   ├── vector-grid.html
│   ├── matrix-rain.html
│   ├── warp-speed.html
│   └── vertical-pulse.html
├── tools/
│   ├── render-video.sh
│   ├── analyze-audio.js
│   └── render-frames.js
├── docs/
├── sessions/                     # Development session notes
└── CLAUDE.md
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| H | Toggle hardware bar |
| F | Fullscreen + popout controls |
| S | Toggle sidebar |
| P | Pop out canvas (dual-screen) |
| Space | Play/Pause |
| R | Start/stop recording |
| 1-8 | Switch style/preset (Llama Bars) |
| Esc | Exit fullscreen |

## Development Status

### Completed (2026-02-04)
- [x] Shared hardware controls library (`lib/`)
- [x] All 9 visualizers with hardware controls
- [x] 2x4 grid layout matching MiniLab 3 physical controller
- [x] Audio section: File, Mic, System/Tab, Play/Pause
- [x] MIDI status indicator with activity flash
- [x] Logo watermark system
- [x] Llama Bars visualizer with 8 style variants
- [x] Landing page with animated preview for all visualizers

### Next Session
- [ ] Spilled Milk (Milkdrop tribute)
- [ ] Geist (tunnel effects)
- [ ] Gogh Mode (Van Gogh flow fields)
- [ ] Gilt Trip (Klimt gold patterns)
- [ ] Cubic Zirconia (Picasso cubism)

## Guidelines

- **Seeded randomness:** Use seeded random for reproducible outputs
- **Parameterized:** Make key values configurable via knobs/faders
- **ME/CE Controls:** All visualizers use same control layout
- **Performance:** Target 60fps for realtime
- **Open source friendly:** Clean, modular, well-documented

## Related

- Parent: [Electric Sheep Supply Co.](https://electric-sheep-supply-co.in)
- Notion: 40-49 Creative (Music/Sheep)
- Instagram: @sheep.sheep.sheep.sheep.sheep.
- Obsidian: `/Volumes/zodlightning/Loop/moebius/Claude Conversations/`
