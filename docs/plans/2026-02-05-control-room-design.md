# Control Room Design

**Date:** 2026-02-05
**Status:** Approved
**Model:** Open Core (free core, paid pro features)

## Overview

A unified "DJ booth" interface for live VJ performance with sheep-viz. Operator sees controls on one screen, audience sees clean fullscreen visuals on projector.

## V1 Scope (Open Source Core)

### Features
- Control Room interface (`control-room.html`)
- 16 visualizer switching via keyboard (1-9, 0, A-F)
- Shared audio input (file, mic, system audio)
- Shared overlay controls
- Popout window for projector (fullscreen capable)
- 8 presets per visualizer (Shift+1-8)
- Parameter knobs/faders for current visualizer
- PWA support for iPad/macOS install

### Out of Scope (Pro/v2)
- Setlist/song sequences
- Lyrics editor with tap-to-sync
- OSC/TouchOSC support
- Export to video
- Modular block interface

## Architecture

```
sheep/
├── index.html                    # Landing page (unchanged)
├── control-room.html             # Operator interface (NEW)
├── manifest.json                 # PWA manifest (NEW)
├── sw.js                         # Service worker (NEW)
├── visualizers/
│   ├── *.html                    # Standalone pages (keep working)
├── lib/
│   ├── hardware-controls.js      # Existing
│   ├── hardware-controls.css     # Existing
│   ├── visualizers/              # NEW: extracted render modules
│   │   ├── index.js              # Registry of all visualizers
│   │   ├── base.js               # Shared visualizer base class
│   │   ├── oscilloscope.js
│   │   ├── pollock-splatter.js
│   │   ├── spilled-milk.js
│   │   ├── geist.js
│   │   ├── gogh-mode.js
│   │   ├── gilt-trip.js
│   │   ├── cubic-zirconia.js
│   │   ├── llama-bars.js
│   │   ├── vertical-pulse-pro.js
│   │   ├── vertical-pulse.js
│   │   ├── fluid-flow.js
│   │   ├── radial-burst.js
│   │   ├── vector-grid.js
│   │   ├── matrix-rain.js
│   │   ├── starfield.js
│   │   └── warp-speed.js
│   └── control-room/             # NEW: control room modules
│       ├── audio-manager.js      # Shared audio context + FFT
│       ├── overlay-manager.js    # Image overlay + effects
│       └── output-manager.js     # Popout window handling
```

## Visualizer Module Interface

Each visualizer module exports:

```javascript
export default {
  name: 'Oscilloscope',
  slug: 'oscilloscope',
  accentColor: '#00ff88',

  // Parameter definitions
  params: {
    lines: { default: 3, min: 1, max: 8, step: 1 },
    speed: { default: 50, min: 10, max: 100 },
    // ...
  },

  // 8 presets
  presets: [
    { name: 'Waveform', lines: 3, speed: 50, ... },
    { name: 'Lissajous', lines: 1, speed: 60, ... },
    // ...
  ],

  // Initialize state
  init(canvas, ctx) { ... },

  // Render frame - called every animation frame
  render(ctx, audio, params, time) { ... },

  // Cleanup
  destroy() { ... }
}
```

## Control Room Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ AUDIO [📁][🎤][🖥][▶⏸]  OVERLAY [📁][FX▼]  LOGO [📁]    [↗Pop][⛶Full][●Rec] │
├────────────┬────────────────────────────────────────────────────────────────┤
│ VISUALIZERS│                                                                │
│ ┌──┬──┬──┬──┐                                                               │
│ │ 1│ 2│ 3│ 4│         ┌────────────────────────────────────────┐           │
│ ├──┼──┼──┼──┤         │                                        │           │
│ │ 5│ 6│ 7│ 8│         │              PREVIEW                   │           │
│ ├──┼──┼──┼──┤         │         (mirror of output)             │           │
│ │ 9│10│11│12│         │                                        │           │
│ ├──┼──┼──┼──┤         │                                        │           │
│ │13│14│15│16│         └────────────────────────────────────────┘           │
│ └──┴──┴──┴──┘                                                               │
│              ───────────────────────────────────────────────────────────────│
│ PRESETS                                                                     │
│ ┌──┬──┬──┬──┬──┬──┬──┬──┐                                                   │
│ │ 1│ 2│ 3│ 4│ 5│ 6│ 7│ 8│   Current: Oscilloscope > Lissajous              │
│ └──┴──┴──┴──┴──┴──┴──┴──┘                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ PARAMS [○][○][○][○][○][○][○][○]      FADERS [|][|][|][|]                   │
│ Lines Speed Sens Thick Decay Glow XFreq YFreq   Size Alpha FX  Master      │
└────────────────────────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1-9, 0 | Switch to visualizer 1-10 |
| A-F | Switch to visualizer 11-16 |
| Shift+1-8 | Load preset 1-8 for current visualizer |
| P | Pop out canvas to new window |
| F | Fullscreen (preview or popout) |
| H | Hide/show controls |
| Space | Play/pause audio |
| M | Toggle microphone |
| R | Start/stop recording |
| Esc | Exit fullscreen |

## Popout Window

- Opens via `window.open()` with canvas only
- Communicates with Control Room via `postMessage` / `BroadcastChannel`
- Can go fullscreen independently (for projector)
- Receives: current visualizer, params, audio data
- Renders in sync with Control Room preview

## Audio Flow

```
Audio Source (file/mic/system)
        │
        ▼
  AudioContext (shared)
        │
        ▼
  AnalyserNode (FFT)
        │
        ├──▶ Control Room Preview
        │
        └──▶ Popout Window (via postMessage)
```

## PWA Support

`manifest.json`:
- Name: sheep-viz Control Room
- Display: standalone
- Icons: 192x192, 512x512

`sw.js`:
- Cache visualizer modules
- Offline support for core functionality

## Implementation Plan

### Phase 1: Module Extraction
1. Create `lib/visualizers/base.js` with shared code
2. Extract each visualizer's render logic to module
3. Keep standalone HTML pages working (import from modules)

### Phase 2: Control Room Core
4. Create `control-room.html` with layout
5. Implement visualizer switching
6. Wire up audio controls
7. Wire up overlay controls

### Phase 3: Popout & Polish
8. Implement popout window with sync
9. Add keyboard shortcuts
10. Style with skeuomorphic buttons
11. Add PWA manifest + service worker

### Phase 4: Testing & Ship
12. Test all 16 visualizers in Control Room
13. Test popout + fullscreen flow
14. Test on iPad Safari
15. Deploy

## Future (Pro Features)

- **Setlist Manager:** Save/load song configurations with sections
- **Lyrics Editor:** Tap-to-sync timing, manual/auto modes
- **OSC Bridge:** TouchOSC support via WebSocket bridge
- **Video Export:** Record output to MP4
- **Modular Interface:** Jack/Audio Hijack style block patching
