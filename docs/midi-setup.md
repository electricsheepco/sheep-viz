# MIDI Setup

Control sheep-viz with any MIDI controller.

## Quick Start

1. Connect your MIDI controller via USB
2. Open any visualizer in Chrome
3. Select your device from the **MIDI Controller** dropdown
4. Move knobs/faders to control parameters
5. Hit drum pads to load presets (1-8)

That's it. The Web MIDI API handles detection automatically.

---

## Arturia MiniLab 3 (Recommended)

The MiniLab 3 is fully supported with dedicated mappings for all 20 controls.

```
                    ARTURIA MINILAB 3 - SHEEP-VIZ
 ─────────────────────────────────────────────────────────────────
   KNOBS (CC - Relative)                 FADERS (CC - Absolute)
   ┌────┬────┬────┬────┐                ┌────┬────┬────┬────┐
   │ 74 │ 71 │ 76 │ 77 │                │ 82 │ 83 │ 85 │ 17 │
   │ P1 │ P2 │ P3 │ P4 │                │ P9 │P10 │P11 │MST │
   ├────┼────┼────┼────┤                └────┴────┴────┴────┘
   │ 93 │ 18 │ 19 │ 16 │
   │ P5 │ P6 │ P7 │ P8 │
   └────┴────┴────┴────┘

   PADS (Notes on Channel 10)
   ┌────┬────┬────┬────┐
   │ 36 │ 37 │ 38 │ 39 │  = Presets 1-4
   ├────┼────┼────┼────┤
   │ 40 │ 41 │ 42 │ 43 │  = Presets 5-8
   └────┴────┴────┴────┘
```

### MiniLab 3 CC Reference

#### Knobs (Relative Encoders)

| Knob | CC  | Row 1 Position | Default Function |
|------|-----|----------------|------------------|
| 1    | 74  | Top-Left       | Primary parameter |
| 2    | 71  | Top-Left+1     | Secondary parameter |
| 3    | 76  | Top-Left+2     | Parameter 3 |
| 4    | 77  | Top-Left+3     | Parameter 4 |
| 5    | 93  | Bottom-Left    | Parameter 5 |
| 6    | 18  | Bottom-Left+1  | Parameter 6 |
| 7    | 19  | Bottom-Left+2  | Parameter 7 |
| 8    | 16  | Bottom-Left+3  | Parameter 8 |

#### Faders (Absolute)

| Fader | CC  | Position    | Default Function |
|-------|-----|-------------|------------------|
| 1     | 82  | Left        | Overlay Size |
| 2     | 83  | Center-Left | Overlay Opacity |
| 3     | 85  | Center-Right| Effect Intensity |
| 4     | 17  | Right       | Master/Overlay |

#### Drum Pads (Notes on Channel 10)

| Pad | Note | Position    | Function |
|-----|------|-------------|----------|
| 1   | 36   | Top-Left    | Load Preset 1 |
| 2   | 37   | Top-Left+1  | Load Preset 2 |
| 3   | 38   | Top-Left+2  | Load Preset 3 |
| 4   | 39   | Top-Left+3  | Load Preset 4 |
| 5   | 40   | Bottom-Left | Load Preset 5 |
| 6   | 41   | Bottom-Left+1| Load Preset 6 |
| 7   | 42   | Bottom-Left+2| Load Preset 7 |
| 8   | 43   | Bottom-Left+3| Load Preset 8 |

---

## Visualizer-Specific Mappings

### Starfield

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Star Count     |
| Knob 2     | 71  | Base Speed     |
| Knob 3     | 76  | Bass Boost     |
| Knob 4     | 77  | Star Size      |
| Knob 5     | 93  | Trail Length   |
| Knob 6     | 18  | Center X       |
| Knob 7     | 19  | Center Y       |
| Knob 8     | 16  | Image Size     |
| Fader 1    | 82  | Overlay Size   |
| Fader 2    | 83  | Overlay Opacity|
| Fader 3    | 85  | Effect Intensity|
| Fader 4    | 17  | Master Opacity |

### Warp Speed

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Warp Speed     |
| Knob 2     | 71  | Star Count     |
| Knob 3     | 76  | Core Size      |
| Knob 4     | 77  | Star Size      |
| Knob 5     | 93  | Trail Stretch  |
| Knob 6     | 18  | Color Temp     |
| Knob 7     | 19  | Audio Boost    |
| Knob 8     | 16  | Image Size     |

### Vertical Pulse / Pro

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Column Count   |
| Knob 2     | 71  | Column Width   |
| Knob 3     | 76  | Base Brightness|
| Knob 4     | 77  | Blob Count     |
| Knob 5     | 93  | Blob Size      |
| Knob 6     | 18  | Sensitivity    |

### Matrix Rain

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Columns        |
| Knob 2     | 71  | Fall Speed     |
| Knob 3     | 76  | Character Size |
| Knob 4     | 77  | Trail Length   |
| Knob 5     | 93  | Density        |
| Knob 6     | 18  | Audio Boost    |

### Vector Grid

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Grid Size      |
| Knob 2     | 71  | Perspective    |
| Knob 3     | 76  | Wave Height    |
| Knob 4     | 77  | Wave Speed     |
| Knob 5     | 93  | Line Width     |
| Knob 6     | 18  | Audio Influence|

### Radial Burst

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Burst Size     |
| Knob 2     | 71  | Particle Count |
| Knob 3     | 76  | Trail Decay    |
| Knob 4     | 77  | Gravity        |
| Knob 5     | 93  | Spawn Rate     |
| Knob 6     | 18  | Audio Threshold|

### Fluid Flow

| Knob/Fader | CC  | Parameter      |
|------------|-----|----------------|
| Knob 1     | 74  | Particle Count |
| Knob 2     | 71  | Force Scale    |
| Knob 3     | 76  | Flow Speed     |
| Knob 4     | 77  | Particle Size  |
| Knob 5     | 93  | Trail Fade     |
| Knob 6     | 18  | Audio Influence|

---

## Using Other MIDI Controllers

Any MIDI controller can be used. The visualizers listen for:

1. **CC Messages (0xB0)**: Control parameters 1-12
2. **Note On Messages (0x90)**: Channel 10 notes 36-43 trigger presets

### Generic CC Mapping

If your controller uses different CC numbers, modify the `MINILAB3_MAP` constant in each visualizer's JavaScript:

```javascript
const MINILAB3_MAP = {
    knobs: {
        // CC number: parameter index (0-7)
        74: 0, 71: 1, 76: 2, 77: 3,
        93: 4, 18: 5, 19: 6, 16: 7
    },
    faders: {
        // CC number: parameter index (8-11)
        82: 8, 83: 9, 85: 10, 17: 11
    },
    pads: {
        // Note number: preset index (0-7)
        36: 0, 37: 1, 38: 2, 39: 3,
        40: 4, 41: 5, 42: 6, 43: 7
    }
};
```

---

## Common Controllers

### Akai APC Mini

| Control | CC/Note | Suggested Mapping |
|---------|---------|-------------------|
| Faders 1-8 | CC 48-55 | Visual parameters |
| Clip buttons | Notes 0-63 | Preset triggers |
| Scene buttons | Notes 82-89 | Actions |

### Novation Launchpad

| Control | Note Range | Suggested Mapping |
|---------|------------|-------------------|
| Grid | Notes 0-63 | Preset triggers |
| Side buttons | Notes 104-111 | Actions |

### Korg nanoKONTROL2

| Control | CC | Suggested Mapping |
|---------|-----|-------------------|
| Faders | CC 0-7 | Visual parameters |
| Knobs | CC 16-23 | Color/effect params |
| S/M/R buttons | CC 32-47 | Actions/presets |

---

## Preset System

Presets store all current parameter values and can be recalled instantly via drum pads:

### Saving Presets

1. Adjust parameters until you like what you see
2. Click a preset slot number (1-8) to select it
3. Click "Save" to store current settings

### Loading Presets

- **Mouse**: Click any preset slot button
- **MIDI**: Hit corresponding drum pad on MiniLab 3

### Preset Persistence

Presets are stored in localStorage, so they persist across browser sessions. Each visualizer maintains its own preset bank.

To export presets for sharing:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Find keys starting with `sheep-viz-presets-`
4. Copy the JSON data

---

## Live Performance Workflow

1. **Before the show**:
   - Create 8 presets for different song moods
   - Test MIDI connectivity
   - Set resolution for your projector

2. **During the show**:
   - Press `F` for fullscreen (controls pop out to separate window)
   - Use drum pads to switch between presets
   - Tweak knobs for real-time adjustments
   - Faders control overlay effects

3. **Dual-screen setup**:
   - Laptop screen: Control window
   - Projector: Fullscreen visualizer

---

## Troubleshooting

### Controller not detected

1. **Check browser** — Chrome has best MIDI support (Safari doesn't support Web MIDI)
2. **Check connection** — Try a different USB port
3. **Check drivers** — Some controllers need drivers installed
4. **Refresh page** — After connecting, reload the visualizer

### Permission denied

Chrome requires explicit permission for MIDI:

1. Click the lock icon in the address bar
2. Find "MIDI devices" permission
3. Set to "Allow"
4. Reload the page

### Values jumping/glitching

Your CC might have a different range:

```javascript
// In the MIDI handler, scale 0-127 to parameter range
const value = (midiValue / 127) * (max - min) + min;
```

### MIDI Activity indicator not responding

1. Check the correct device is selected in the dropdown
2. Ensure your controller is sending on the expected channels/CCs
3. Some controllers need to be in a specific "DAW mode"

### Testing MIDI

Use the browser console to verify MIDI is working:

```javascript
// List all MIDI devices
navigator.requestMIDIAccess().then(access => {
  for (let input of access.inputs.values()) {
    console.log('Input:', input.name, input.manufacturer);
    input.onmidimessage = e => console.log('MIDI:', e.data);
  }
});
```

Move controls on your device — you should see messages logged.

---

## Advanced: OSC Support

For Open Sound Control (OSC) support, you'll need a bridge:

1. Use [MIDIBridge](https://github.com/pablotron/midibridge) or similar
2. Route OSC messages to MIDI
3. sheep-viz receives standard MIDI

Native OSC support is on the roadmap.
