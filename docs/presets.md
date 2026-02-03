# Presets

Save and share visualizer configurations.

## Using Presets

### In the Browser

1. Adjust parameters to your liking
2. Click "Save Preset"
3. Enter a name
4. Preset downloads as JSON

To load:
1. Click "Load Preset"
2. Select the JSON file
3. Parameters are applied instantly

### In Video Rendering

```bash
./tools/render-video.sh track.mp3 video.mp4 --preset visualizers/presets/deep-cyberpunk.json
```

## Included Presets

### deep-cyberpunk.json

Neon pink and blue, heavy distortion, high reactivity.

```json
{
  "name": "Deep Cyberpunk",
  "columnCount": 60,
  "columnWidth": 8,
  "noiseScale": 0.02,
  "blobCount": 5,
  "blobSize": 150,
  "colorShift": 0.3,
  "bassBoost": 2.5,
  "midBoost": 1.5,
  "trebleBoost": 2.0
}
```

Best for: Synthwave, darkwave, industrial.

### ambient-minimal.json

Subtle, slow-moving, muted colors.

```json
{
  "name": "Ambient Minimal",
  "columnCount": 30,
  "columnWidth": 15,
  "noiseScale": 0.005,
  "blobCount": 2,
  "blobSize": 250,
  "colorShift": 0.05,
  "bassBoost": 1.2,
  "midBoost": 1.0,
  "trebleBoost": 0.8
}
```

Best for: Ambient, drone, meditation.

### high-energy.json

Maximum reactivity, fast movement, lots of elements.

```json
{
  "name": "High Energy",
  "columnCount": 80,
  "columnWidth": 5,
  "noiseScale": 0.03,
  "blobCount": 8,
  "blobSize": 100,
  "colorShift": 0.8,
  "bassBoost": 3.0,
  "midBoost": 2.5,
  "trebleBoost": 3.0
}
```

Best for: EDM, drum & bass, hardcore.

### retro-vhs.json

Lo-fi aesthetic, scan lines, glitch effects.

```json
{
  "name": "Retro VHS",
  "columnCount": 40,
  "columnWidth": 12,
  "noiseScale": 0.015,
  "blobCount": 3,
  "blobSize": 180,
  "colorShift": 0.1,
  "bassBoost": 2.0,
  "midBoost": 1.8,
  "trebleBoost": 1.5
}
```

Best for: Vaporwave, lo-fi, retrowave.

## Preset Format

Presets are simple JSON files:

```json
{
  "name": "My Preset",
  "visualizer": "vertical-pulse-pro",
  "version": 1,
  "parameters": {
    "columnCount": 50,
    "columnWidth": 10,
    "noiseScale": 0.02
  },
  "colors": {
    "primary": "#ff00ff",
    "secondary": "#00ffff",
    "background": "#000000"
  },
  "meta": {
    "author": "Your Name",
    "created": "2025-01-15",
    "description": "Description of the preset"
  }
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Display name |
| Parameters | All visualizer-specific parameters |

### Optional Fields

| Field | Description |
|-------|-------------|
| `visualizer` | Which visualizer this preset is for |
| `version` | Preset format version |
| `colors` | Color overrides |
| `meta` | Author info, description |

## Creating Presets

### Method 1: Save from UI

1. Adjust all parameters in the visualizer
2. Click "Save Preset"
3. Edit the JSON to add metadata

### Method 2: Write Manually

```json
{
  "name": "My Custom Preset",
  "columnCount": 45,
  "columnWidth": 8,
  "noiseScale": 0.018,
  "blobCount": 4,
  "blobSize": 140,
  "colorShift": 0.2,
  "bassBoost": 2.0,
  "midBoost": 1.5,
  "trebleBoost": 1.8
}
```

### Method 3: Modify Existing

1. Load an existing preset
2. Adjust values
3. Save with a new name

## Sharing Presets

### Submit to Repository

1. Save your preset to `visualizers/presets/`
2. Name it descriptively: `genre-mood.json`
3. Open a PR with a screenshot/description

### Share Directly

Preset files are portable. Send the JSON file and the recipient can load it directly.

## Preset Tips

### For Different Genres

| Genre | Key Settings |
|-------|--------------|
| Electronic | High reactivity, many columns, fast color shift |
| Rock | Medium reactivity, wider columns, warm colors |
| Classical | Low reactivity, few blobs, slow movement |
| Hip-hop | High bass boost, punchy response, bold colors |
| Ambient | Minimal movement, large blobs, muted colors |

### For Different Venues

| Venue | Adjustments |
|-------|-------------|
| Small club | Lower column count, bigger elements |
| Large venue | More columns, higher contrast |
| Outdoor | Increase brightness, simpler shapes |
| Streaming | Medium settings, avoid rapid flashing |

### Performance Considerations

Presets with high values may lag on slower machines:

| Parameter | Performance Impact |
|-----------|-------------------|
| columnCount > 80 | Medium |
| blobCount > 8 | High |
| Very low noiseScale | Medium |

Test on your target hardware before a show.
