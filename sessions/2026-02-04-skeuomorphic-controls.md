# Session: Skeuomorphic Hardware Controls

**Date:** 2026-02-04
**Focus:** Implementing hardware-style controls for live performance
**Status:** Day 1 Complete

---

## Summary

Built a complete skeuomorphic hardware control system for audio visualizers, plus started a new series of classic/art-inspired visualizers.

**Key Achievements:**
- 8 visualizers with unified hardware controls
- MiniLab 3 MIDI integration (2x4 grid matching physical layout)
- Fullscreen popout for dual-screen live performance
- New "Llama Bars" visualizer (Winamp tribute) with 8 style variants
- System/Tab audio capture (YouTube, Spotify, any app via getDisplayMedia)
- Configurable logo watermark (bottom-right, for band branding)

---

## Goals

1. Create skeuomorphic controls (knobs, faders, pads) for visualizers
2. Pop out controls horizontally when going fullscreen
3. Standardize controls across all visualizers (ME/CE)

---

## Completed

### Starfield - Reference Implementation

**Hardware Bar Design:**
- 8 rotary knobs with realistic shadows and indicators
- 4 vertical faders with slot/fill/handle
- 8 trigger pads for presets
- Dark metal aesthetic with green accent (#00ff88)

**Interactions:**
- Knobs: drag up/down, mouse wheel
- Faders: click anywhere on track, drag handle
- Pads: click to load preset, visual feedback for filled/active

**Fullscreen Popout:**
- Press F → fullscreen + horizontal controls window
- Window: full screen width, 200px tall, bottom of screen
- Two-way sync between main and popout
- All controls fully functional in popout

**Code Location:**
- CSS: Lines 330-647 in starfield.html
- HTML: Lines 932-1100 (hardware-bar div)
- JS: Lines 2172-2400 (hardware bar functions)
- Popout: `popOutControls()` function

---

## Standardized Parameters (ME/CE)

All visualizers will use this layout:

### 8 Knobs
| # | ID | Label | Purpose |
|---|-----|-------|---------|
| 1 | density | Count | Number of elements |
| 2 | speed | Speed | Animation speed |
| 3 | bassResponse | Bass | Bass audio reactivity |
| 4 | size | Size | Element size |
| 5 | trail | Trail | Decay/persistence |
| 6 | centerX | X | Horizontal center |
| 7 | centerY | Y | Vertical center |
| 8 | special | [Viz] | Visualizer-specific |

### 4 Faders
| # | ID | Label | Purpose |
|---|-----|-------|---------|
| 1 | overlaySize | Size | Overlay scale |
| 2 | overlayOpacity | Alpha | Overlay transparency |
| 3 | effectIntensity | FX | Effect strength |
| 4 | masterBrightness | Master | Global brightness |

### 8 Pads
Presets 1-8, stored in localStorage per visualizer.

---

## Shared Component Created

**Location:** `lib/`

```
lib/
├── hardware-controls.css   # Skeuomorphic styling (knobs, faders, pads)
├── hardware-controls.js    # HardwareControls class
└── README.md               # Usage documentation
```

**Usage:**
```html
<link rel="stylesheet" href="../lib/hardware-controls.css">
<script src="../lib/hardware-controls.js"></script>
<script>
const hardware = new HardwareControls({
    name: 'Visualizer Name',
    accentColor: '#00ff88',
    params: params,
    knobs: [...],  // 8 knob configs
    faders: [...], // 4 fader configs
    presets: [...],
    onParamChange: (id, value) => { ... },
    onPresetLoad: (index) => { ... }
});
</script>
```

---

## Applied To

- [x] Starfield (original implementation)
- [x] Fluid Flow (using shared component)
- [x] Vertical Pulse Pro
- [x] Radial Burst
- [x] Vector Grid
- [x] Matrix Rain
- [x] Warp Speed
- [x] Vertical Pulse (Full)

**ALL 8 VISUALIZERS COMPLETE!**

## Layout Update

Updated knobs and pads to display in 2x4 grid matching MiniLab 3 physical layout:

```
KNOBS (matches controller)      PADS (matches controller)
┌───────┬───────┬───────┬───────┐  ┌───┬───┬───┬───┐
│   1   │   2   │   3   │   4   │  │ 1 │ 2 │ 3 │ 4 │
│ CC:74 │ CC:71 │ CC:76 │ CC:77 │  ├───┼───┼───┼───┤
├───────┼───────┼───────┼───────┤  │ 5 │ 6 │ 7 │ 8 │
│   5   │   6   │   7   │   8   │  └───┴───┴───┴───┘
│ CC:93 │ CC:18 │ CC:19 │ CC:16 │
└───────┴───────┴───────┴───────┘
```

## UI Flow Update

Updated hardware bar layout to follow logical workflow:

```
┌─────────┬──────────┬──────────────────────────┬────────────────┬──────────────────┐
│  AUDIO  │   MIDI   │       PARAMETERS         │     FADERS     │     PRESETS      │
│ 📁 🎤 ▶ │ ● Device │  [1][2][3][4]           │ [|] [|] [|] [|] │ [1][2][3][4]    │
│ status  │          │  [5][6][7][8]           │                │ [5][6][7][8]    │
└─────────┴──────────┴──────────────────────────┴────────────────┴──────────────────┘
```

**Flow: Load first → Control second**
1. Audio Section - Load file, Mic, Play/Pause
2. MIDI Section - Shows connected device with status dot
3. Parameters - 8 knobs in 2x4 grid
4. Faders - 4 vertical faders
5. Presets - 8 pads in 2x4 grid

**New Callbacks:**
- `onAudioFile(file)` - Called when audio file loaded
- `onMicToggle(active)` - Called when mic button toggled
- `onPlayPause(playing)` - Called when play/pause toggled

**New Methods:**
- `setAudioStatus(text, active)` - Update audio status display
- `setMidiStatus(name, connected)` - Update MIDI status display
- `setPlaying(playing)` - Set play button state
- `flashMidi()` - Flash MIDI indicator on activity
- `setLogo(url, text)` - Update watermark logo
- `showWatermark(visible)` - Show/hide watermark

## Audio Sources

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 File    │  🎤 Mic    │  🖥 System/Tab  │  ▶ Play/Pause  │
└─────────────────────────────────────────────────────────────────┘
```

| Button | Source | Method |
|--------|--------|--------|
| 📁 | Audio file | File input |
| 🎤 | Microphone | getUserMedia |
| 🖥 | System/Tab | getDisplayMedia (captures YouTube, Spotify, any tab/app) |
| ▶ | Play/Pause | Toggle playback |

**New Callback:**
- `onSystemAudio(stream)` - Called with MediaStream from getDisplayMedia

## Logo Watermark

Fixed position bottom-right, always visible. Can be customized per visualizer:

```javascript
const hardware = new HardwareControls({
    logoUrl: '/path/to/band-logo.png',  // Image logo
    logoText: 'sheep-viz',               // Fallback text
    // ...
});

// Or update later:
hardware.setLogo('/new-logo.png', 'Band Name');
```

Default: "sheep-viz" text watermark

## New Visualizers - Classic & Art Tributes

Building new visualizers inspired by legendary sources:

| Name | Inspiration | Status |
|------|-------------|--------|
| **Llama Bars** | Winamp/WMP spectrum analyzer | ✅ Complete |
| **Spilled Milk** | Milkdrop | Planned |
| **Geist** | Geiss (tunnel effects) | Planned |
| **Gogh Mode** | Van Gogh (swirling brushstrokes) | Planned |
| **Gilt Trip** | Klimt (gold spirals, Art Nouveau) | Planned |
| **Cubic Zirconia** | Picasso (cubist fragmentation) | Planned |

### Llama Bars Features

- Classic spectrum analyzer with 16-128 bars (default 32)
- Green → Yellow → Red gradient
- Gravity-based peak hold with physics fall
- Reflection effect (knob-controlled intensity)
- 8 style variants via pads:
  1. Classic Blocks (OG Winamp)
  2. Smooth Gradient (WMP style)
  3. LED Matrix (hardware analyzer)
  4. Hybrid Glow (blocks + glow)
  5. Neon Outline
  6. Retro CRT
  7. Minimal
  8. Inverted

**Knobs:** Count, Speed, Sens, Alpha, Hold, Grav, Refl, Gap
**Faders:** Overlay Size, Alpha, FX, Master

## Next Steps

1. Build Spilled Milk (Milkdrop tribute)
2. Build Geist (tunnel effects)
3. Build Gogh Mode (flow field brushstrokes)
4. Remove duplicate inline CSS/JS from Starfield
5. Wire up audio callbacks in remaining visualizers

---

## Technical Notes

### Knob Rotation
- Range: 270 degrees (-135 to +135)
- Indicator at top when centered
- Formula: `rotation = -135 + (normalized * 270)`

### Fader Mapping
- Height: 80px track
- Fill from bottom up
- Handle position: `bottom: calc(percentage% - 8px)`

### Popout Window
```javascript
window.open('', 'Controls', `width=${screenWidth},height=200,left=0,top=${screenHeight-200}`)
```

---

## Files Modified

- `visualizers/starfield.html` - Added skeuomorphic controls + popout
- `visualizers/llama-bars.html` - NEW: Classic spectrum analyzer tribute
- `index.html` - Added Llama Bars card with preview animation
- `lib/hardware-controls.js` - Shared control component
- `lib/hardware-controls.css` - Shared control styles
- `CLAUDE.md` - Updated with control specs
- `sessions/2026-02-04-skeuomorphic-controls.md` - This file
