# 2026-02-06 - Control Room Build

## Architecture

**Iframe + embed adapter** instead of module extraction.

Each visualizer stays as a standalone HTML file but supports embed mode:
- `?embed=true` hides UI, accepts audio via postMessage, reports config to parent
- `lib/embed-adapter.js` handles all embed logic (~170 lines)
- ~5-10 lines changed per visualizer

## Progress

### Done
- [x] `lib/embed-adapter.js` created
- [x] Oscilloscope integration (Canvas 2D proof)
- [x] Fluid Flow integration (p5.js proof)

### TODO
- [ ] Add embed adapter to remaining 14 visualizers
- [ ] Build `control-room.html` (DJ booth UI)
- [ ] Popout window for projector
- [ ] PWA (manifest.json, sw.js)

## Integration Pattern

```javascript
// 1. Include in <head>
<script src="../lib/embed-adapter.js"></script>

// 2. Create adapter with config
const embed = new EmbedAdapter({ name, accentColor, fftSize, params, knobs, faders, presets });

// 3. Override audio globals in embed mode
if (embed.active) {
  ({ audioContext, analyser, dataArray, timeDataArray, audioInitialized } = embed.audioGlobals());
}

// 4. Skip HardwareControls in embed mode
if (!embed.active) { hardware = new HardwareControls({ ... }); }
```

## Visualizer Rendering Engines

**Canvas 2D (8):** oscilloscope, llama-bars, spilled-milk, geist, gogh-mode, gilt-trip, cubic-zirconia, pollock-splatter
**p5.js (9):** fluid-flow, radial-burst, vector-grid, matrix-rain, starfield, warp-speed, vertical-pulse-pro, vertical-pulse, vertical-pulse-render

## Plan File
`/Users/zod/.claude/plans/sprightly-mixing-babbage.md`
