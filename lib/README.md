# sheep-viz Shared Components

Reusable components for all sheep-viz visualizers.

## Hardware Controls

Skeuomorphic hardware-style controls (knobs, faders, pads) for live performance.

### Files

- `hardware-controls.css` - Styling for knobs, faders, pads
- `hardware-controls.js` - `HardwareControls` class with full interaction logic

### Quick Start

```html
<!-- In your visualizer HTML -->
<link rel="stylesheet" href="../lib/hardware-controls.css">
<script src="../lib/hardware-controls.js"></script>

<script>
// Your visualizer's parameters
const params = {
    starCount: 800,
    baseSpeed: 15,
    bassBoost: 30,
    starSize: 3,
    trailLength: 0.5,
    centerX: 0.5,
    centerY: 0.5,
    colorMode: 'white'
};

// Preset storage
const presets = new Array(8).fill(null);

// Initialize hardware controls
const hardware = new HardwareControls({
    name: 'Starfield',
    accentColor: '#00ff88',
    params: params,
    knobs: [
        { id: 'starCount', label: 'Stars', min: 100, max: 2000, step: 50 },
        { id: 'baseSpeed', label: 'Speed', min: 1, max: 50, step: 1 },
        { id: 'bassBoost', label: 'Bass', min: 0, max: 100, step: 5 },
        { id: 'starSize', label: 'Size', min: 1, max: 8, step: 0.5 },
        { id: 'trailLength', label: 'Trail', min: 0, max: 1, step: 0.05 },
        { id: 'centerX', label: 'X', min: 0, max: 1, step: 0.05 },
        { id: 'centerY', label: 'Y', min: 0, max: 1, step: 0.05 },
        { id: 'colorMode', label: 'Color', min: 0, max: 3, step: 1 }
    ],
    faders: [
        { id: 'overlaySize', label: 'Size', min: 5, max: 50, step: 1, suffix: '%' },
        { id: 'overlayOpacity', label: 'Alpha', min: 0, max: 100, step: 1, suffix: '%' },
        { id: 'effectIntensity', label: 'FX', min: 0, max: 100, step: 1, suffix: '%' },
        { id: 'masterBrightness', label: 'Master', min: 0, max: 100, step: 1, suffix: '%' }
    ],
    presets: presets,
    onParamChange: (id, value) => {
        // Called when any knob/fader changes
        console.log(`${id} = ${value}`);
        // Update your visualizer here
    },
    onPresetLoad: (index) => {
        // Called when a pad is clicked
        if (presets[index]) {
            Object.assign(params, presets[index]);
            hardware.sync();
        }
    },
    onPresetSave: (index) => {
        // Called to save current params to preset
        presets[index] = { ...params };
        hardware.setPresets(presets);
    }
});
</script>
```

### API

#### Constructor Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Visualizer name (shown in popout title) |
| `accentColor` | string | Hex color for indicators (#00ff88) |
| `params` | object | Reference to your params object |
| `knobs` | array | 8 knob configs (see below) |
| `faders` | array | 4 fader configs (see below) |
| `presets` | array | 8-element array of preset objects or null |
| `onParamChange` | function | Called with (id, value) on change |
| `onPresetLoad` | function | Called with (index) when pad clicked |

#### Knob/Fader Config

```javascript
{
    id: 'paramName',     // Key in params object
    label: 'Display',    // Short label (max ~6 chars)
    min: 0,              // Minimum value
    max: 100,            // Maximum value
    step: 1,             // Increment step
    suffix: '%',         // Optional suffix for display
    decimals: 1          // Optional decimal places
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `toggle()` | Show/hide hardware bar |
| `sync()` | Update visuals from current params |
| `popout()` | Open controls in separate window |
| `fullscreen()` | Enter fullscreen + popout |
| `setPresets(array)` | Update presets array |
| `setSelectedPreset(index)` | Highlight a preset pad |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F | Toggle fullscreen + popout |

### Theming

Override CSS variables for custom colors:

```css
:root {
    --hw-accent: #ff3366;      /* Your accent color */
    --hw-accent-dim: #cc2952;  /* Darker version */
}
```

Or pass `accentColor` to constructor for automatic theming.

### Standard Parameters (ME/CE)

For consistency across visualizers, map to these standard slots:

| Knob | Standard Use |
|------|--------------|
| 1 | Element count (stars, particles, columns) |
| 2 | Base speed |
| 3 | Bass audio response |
| 4 | Element size |
| 5 | Trail/decay length |
| 6 | Center X (0-1) |
| 7 | Center Y (0-1) |
| 8 | Visualizer-specific |

| Fader | Standard Use |
|-------|--------------|
| 1 | Overlay size |
| 2 | Overlay opacity |
| 3 | Effect intensity |
| 4 | Master brightness |
