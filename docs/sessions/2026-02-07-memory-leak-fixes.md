# Session: Memory Leak Fixes

**Date:** 2026-02-07
**Commits:** c30cee8, 907c89e

## Summary

Comprehensive memory leak audit and fix across all 16 visualizers and the shared hardware controls library. Plugged blob URL leaks, audio source disconnects, stream cleanup, animation frame cancellation, per-frame allocation hotspots, and gated debug logging.

## Problem

Browser-based visualizers were leaking memory in several ways:
- Blob URLs created for audio files and overlay images were never revoked (5-50MB per file load)
- Audio sources were not disconnected before creating new ones
- Mic/system audio streams were not stopped before acquiring new ones
- Canvas 2D visualizers never cancelled requestAnimationFrame
- Per-frame allocations in hot paths (ImageData creation, Array.slice()) caused GC pressure
- Console.log calls on every MIDI message and animation frame added overhead

## Changes

| File | Change |
|------|--------|
| lib/hardware-controls.js | Gate logging behind DEBUG flag, store event listener refs, add destroy() method |
| All 16 visualizers | Track + revoke blob URLs, disconnect audio sources, stop streams, cancel rAF |
| visualizers/spilled-milk.html | Pre-allocate ImageData for Plasma Wave preset |
| visualizers/pollock-splatter.html | Cap Drip.points array at 100 entries |
| visualizers/starfield.html | Replace dataArray.slice() with inline for-loops |
| visualizers/warp-speed.html | Replace dataArray.slice() with inline for-loops |
| README.md | Full 16-visualizer table, updated shortcuts, project structure |
| docs/getting-started.md | System audio docs, updated keyboard shortcuts |
| docs/visualizers.md | Overview table, all 16 visualizer entries |
| AGENTS.md | AI agent development context |
| lib/embed-adapter.js | Control Room embed adapter scaffold |

## Fix Categories

### 1. Blob URL Lifecycle (all 16 files)
```javascript
let audioBlobUrl = null;
// Before creating new URL:
if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
audioBlobUrl = URL.createObjectURL(file);
```

### 2. Audio Source Cleanup (all 16 files)
```javascript
if (source) { try { source.disconnect(); } catch(e) {} }
source = audioContext.createMediaElementSource(audio);
```

### 3. Stream Tracking (all 16 files)
```javascript
let currentStream = null;
// Before new stream:
if (currentStream) currentStream.getTracks().forEach(t => t.stop());
currentStream = stream;
```

### 4. Animation Frame Cancellation (8 Canvas 2D files)
```javascript
let animFrameId = null;
animFrameId = requestAnimationFrame(draw);
```

### 5. Debug Logging Gate (hardware-controls.js)
```javascript
static DEBUG = false;
static log(...args) {
    if (HardwareControls.DEBUG) console.log(...args);
}
```

### 6. Per-Frame Allocation Hotspots
- spilled-milk: Pre-allocated `_plasmaImageData` (~498 MB/sec savings at 1080p)
- pollock-splatter: Capped `Drip.points` at 100
- starfield/warp-speed: Inline for-loops instead of `.slice().reduce()`

## Deployment

- Preview: https://sheep-42ok2ts29-essco.vercel.app
- Production: https://sheep-xi.vercel.app

---

# Session: Control Room Build - Phase 2

**Date:** 2026-02-07
**Commits:** db91451 (control room + embed adapters), plus uncommitted layout polish

## Session Summary

Built the complete Control Room interface and integrated embed adapter into all 16 visualizers. Then iterated on the layout based on feedback: enlarged viz grid thumbnails, moved presets from sidebar to bottom bar, replaced all emoji icons with Lucide, added crossfade transitions between visualizers, and added fullscreen support for the popout window.

## What Got Done
- [x] Integrated embed adapter into all 14 remaining visualizers (4 parallel agents)
- [x] Built control-room.html with full DJ booth interface
- [x] Shipped first version to preview (db91451)
- [x] Enlarged viz grid thumbnails (sidebar 240px to 320px)
- [x] Moved presets from sidebar to bottom controls bar (Knobs | Faders | Presets)
- [x] Replaced all emoji icons with Lucide icons (folder-open, mic, monitor, play/pause, image, x, picture-in-picture-2, maximize, circle)
- [x] Added crossfade transition when switching visualizers (0.4s opacity, waits for iframe load)
- [x] Added fullscreen support for popout window (F key, Ctrl+Enter, double-click)
- [x] Audio broadcast sends to all iframes during crossfade
- [x] Cursor hidden in popout window for projector mode

## TODO (Next Session)
- [ ] Test crossfade and fullscreen in browser
- [ ] Ship latest changes and deploy preview
- [ ] Promote to production after testing
- [ ] Popout window polish (Task #9)
- [ ] PWA support - manifest.json, sw.js (Task #10)
- [ ] Consider live preview thumbnails in viz grid

## Key Files
- `control-room.html` - Main control room interface (~1400 lines)
- `lib/embed-adapter.js` - Embed mode detection + audio patching
- All 16 `visualizers/*.html` - Each has embed adapter integration

## Links
- Preview (v1): https://sheep-ag9mx05f2-essco.vercel.app
- Production: https://sheep-xi.vercel.app
- Plan: `/Users/zod/.claude/plans/sprightly-mixing-babbage.md`
