# Visualizers

sheep-viz includes 16 visualizer styles. Each reacts to audio in its own way.

## Overview

| Visualizer | Style | Presets | Accent Color |
|------------|-------|---------|--------------|
| [Vertical Pulse Pro](#vertical-pulse-pro) | Metaball columns | - | #ff3366 |
| [Vertical Pulse](#vertical-pulse) | Light columns + overlays | - | #d97757 |
| [Fluid Flow](#fluid-flow) | Flow field particles | - | #6366f1 |
| [Radial Burst](#radial-burst) | Beat explosions | - | #ff3366 |
| [Vector Grid](#vector-grid) | Wireframe terrain | - | #00ff41 |
| [Matrix Rain](#matrix-rain) | Digital rain | - | #00ff41 |
| [Starfield](#starfield) | Star tunnel | - | #00ff88 |
| [Warp Speed](#warp-speed) | Hyperspace | - | #00aaff |
| [Llama Bars](#llama-bars) | Spectrum analyzer | 8 | #ffcc00 |
| [Spilled Milk](#spilled-milk) | MilkDrop morphing | 8 | #ff00ff |
| [Geist](#geist) | Chrome tunnels | 8 | #00ffff |
| [Gogh Mode](#gogh-mode) | Van Gogh brushstrokes | 8 | #f4b400 |
| [Gilt Trip](#gilt-trip) | Klimt Art Nouveau | 8 | #d4af37 |
| [Cubic Zirconia](#cubic-zirconia) | Picasso cubism | 8 | #e63946 |
| [Oscilloscope](#oscilloscope) | Waveforms & Lissajous | 8 | #00ff88 |
| [Pollock Splatter](#pollock-splatter) | Action painting | 8 | #ff6b35 |

---

## Vertical Pulse Pro

**File:** `visualizers/vertical-pulse-pro.html`

The flagship visualizer. Vertical light columns that breathe with frequency, distorted by organic metaball shapes.

### Parameters

| Parameter | Description | Range |
|-----------|-------------|-------|
| Column Count | Number of vertical bars | 20-100 |
| Column Width | Width of each bar | 1-20 |
| Noise Scale | Organic distortion amount | 0.001-0.05 |
| Blob Count | Number of metaball shapes | 1-10 |
| Blob Size | Size of distortion blobs | 50-300 |
| Color Shift | Hue rotation speed | 0-1 |
| Bass Boost | Low frequency emphasis | 1-5 |
| Mid Boost | Mid frequency emphasis | 1-5 |
| Treble Boost | High frequency emphasis | 1-5 |

### Audio Response
- **Bass** (20-250 Hz) - Affects left columns, overall intensity
- **Mids** (250-2000 Hz) - Affects center columns
- **Treble** (2000+ Hz) - Affects right columns, sparkle effects

---

## Vertical Pulse

**File:** `visualizers/vertical-pulse.html`

Extended version with overlay system and more features.

### Additional Features
- Overlay image support
- Overlay effects (split, pulse, glitch, cycle)
- Color extraction from images
- Resolution presets

### Overlay Effects

| Effect | Description |
|--------|-------------|
| Split | Image splits apart on beat |
| Pulse | Image scales with bass |
| Glitch | RGB shift and distortion |
| Cycle | Rotate through multiple images |

---

## Fluid Flow

**File:** `visualizers/fluid-flow.html`

Particles following noise-based flow fields, influenced by audio.

### Parameters
- Particle count and size
- Flow field scale and speed
- Audio reactivity sensitivity
- Trail length and decay

---

## Radial Burst

**File:** `visualizers/radial-burst.html`

Particles explode from the center on every beat. Trails decay into nothing. A waveform ring pulses around the chaos.

### Parameters

| Parameter | Description | Range |
|-----------|-------------|-------|
| Particle Count | Particles per burst | 10-100 |
| Particle Speed | Initial velocity | 1-20 |
| Trail Length | Fade duration | 0-1 |
| Ring Size | Waveform ring radius | 100-400 |
| Beat Threshold | Sensitivity for triggers | 0.1-0.9 |
| Gravity | Particle fall rate | 0-1 |
| Color Mode | Static, rainbow, or reactive | - |

### Audio Response
- **Beat Detection** - Triggers particle bursts
- **Waveform** - Draws as oscillating ring
- **Bass** - Controls burst intensity
- **Treble** - Affects particle color

---

## Vector Grid

**File:** `visualizers/vector-grid.html`

80s wireframe landscape in the style of Johnny Quest and Tron. Bass waves ripple through the terrain.

### Features
- Perspective grid with horizon
- Audio-reactive wave displacement
- Neon green CRT aesthetic

---

## Matrix Rain

**File:** `visualizers/matrix-rain.html`

Falling katakana characters with audio-reactive speed and density.

### Features
- Variable fall speed based on audio
- Column density reacts to bass
- Classic green phosphor glow

---

## Starfield

**File:** `visualizers/starfield.html`

Classic star tunnel with warp trails. Replace stars with custom images.

### Features
- Adjustable star density and speed
- Trail length control
- Image replacement for stars

---

## Warp Speed

**File:** `visualizers/warp-speed.html`

Star Wars hyperspace effect with directional control.

### Controls
- WASD or mouse for direction
- Audio affects star stretch and color

---

## Llama Bars

**File:** `visualizers/llama-bars.html`

Classic spectrum analyzer in the Winamp tradition. 8 style variants.

### Presets (Pads 1-8)

| Pad | Style | Description |
|-----|-------|-------------|
| 1 | Classic | Original Winamp gradient bars |
| 2 | Fire | Red/orange flame gradient |
| 3 | Ice | Blue/cyan frozen gradient |
| 4 | Neon | Hot pink/purple synthwave |
| 5 | Matrix | Green phosphor CRT |
| 6 | Sunset | Orange/red/purple gradient |
| 7 | Ocean | Deep blue/teal aquatic |
| 8 | Monochrome | Pure white minimal |

---

## Spilled Milk

**File:** `visualizers/spilled-milk.html`

MilkDrop tribute with morphing algorithmic presets.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | Plasma Dream | Swirling plasma fields |
| 2 | Tunnel Vision | Infinite tunnel zoom |
| 3 | Kaleidoscope | Symmetrical reflections |
| 4 | Warp Field | Space distortion |
| 5 | Fractal Bloom | Growing fractal patterns |
| 6 | Liquid Metal | Chrome fluid simulation |
| 7 | Star Spiral | Rotating star field |
| 8 | Void Pulse | Pulsing darkness |

---

## Geist

**File:** `visualizers/geist.html`

Tunnel effects with chrome sheen, inspired by Geiss.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | Chrome Tunnel | Metallic infinite corridor |
| 2 | Neon Rings | Glowing ring tunnel |
| 3 | Spiral Descent | Rotating spiral |
| 4 | Wormhole | Space distortion |
| 5 | Crystal Cave | Geometric reflections |
| 6 | Plasma Tube | Energy conduit |
| 7 | Hexagon Void | Hexagonal patterns |
| 8 | Time Vortex | Warped time tunnel |

---

## Gogh Mode

**File:** `visualizers/gogh-mode.html`

Van Gogh-style swirling brushstrokes that react to audio.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | Starry Night | Classic night sky swirls |
| 2 | Sunflowers | Warm yellow/orange palette |
| 3 | Cafe Terrace | Night blues and yellows |
| 4 | Irises | Purple and green garden |
| 5 | Wheat Field | Golden agricultural waves |
| 6 | Almond Blossoms | Delicate pink and blue |
| 7 | Self Portrait | Intense blues and greens |
| 8 | Bedroom | Warm interior palette |

---

## Gilt Trip

**File:** `visualizers/gilt-trip.html`

Klimt-inspired Art Nouveau patterns with gold leaf aesthetic.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | The Kiss | Gold spirals and embrace |
| 2 | Tree of Life | Branching golden tree |
| 3 | Portrait | Geometric face patterns |
| 4 | Beethoven Frieze | Flowing musical forms |
| 5 | Water Serpents | Undulating wave patterns |
| 6 | Danae | Flowing golden rain |
| 7 | Expectation | Spiral anticipation |
| 8 | Fulfillment | Complete golden embrace |

---

## Cubic Zirconia

**File:** `visualizers/cubic-zirconia.html`

Picasso-inspired cubist fragmentation of the audio visualization.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | Guernica | Monochrome chaos |
| 2 | Les Demoiselles | Angular figures |
| 3 | Three Musicians | Bold primary colors |
| 4 | Weeping Woman | Distorted emotion |
| 5 | Girl Before Mirror | Reflective fragments |
| 6 | The Old Guitarist | Blue period melancholy |
| 7 | Dora Maar | Portrait fragmentation |
| 8 | Bull | Abstract simplification |

---

## Oscilloscope

**File:** `visualizers/oscilloscope.html`

Classic oscilloscope waveform display with Lissajous curves and vector modes.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | Waveform | Classic time-domain display |
| 2 | Lissajous | X-Y stereo phase patterns |
| 3 | Vectorscope | Circular stereo display |
| 4 | Spectrum | Frequency domain bars |
| 5 | Phosphor | Long-decay CRT persistence |
| 6 | Multi-trace | Multiple waveform overlay |
| 7 | XY Mode | Stereo correlation |
| 8 | Heartbeat | Medical monitor style |

---

## Pollock Splatter

**File:** `visualizers/pollock-splatter.html`

Jackson Pollock-style action painting generated from audio.

### Presets (Pads 1-8)

| Pad | Preset | Description |
|-----|--------|-------------|
| 1 | Number 1 | Classic drip painting |
| 2 | Autumn Rhythm | Earth tones and motion |
| 3 | Convergence | Explosive color |
| 4 | Blue Poles | Vertical blue accents |
| 5 | Lavender Mist | Subtle pastel layers |
| 6 | Full Fathom | Deep ocean colors |
| 7 | Black & White | Monochrome intensity |
| 8 | Mural | Large-scale composition |

---

## Choosing a Visualizer

| Use Case | Recommended |
|----------|-------------|
| Live performance | Vertical Pulse Pro, Llama Bars |
| Music video with branding | Vertical Pulse (Full) |
| High-energy electronic | Radial Burst, Spilled Milk |
| Ambient/chill music | Gogh Mode, Fluid Flow |
| Retro/nostalgic | Starfield, Matrix Rain, Vector Grid |
| Artistic/gallery | Gilt Trip, Cubic Zirconia, Pollock Splatter |
| Technical/scientific | Oscilloscope |

---

## Creating Your Own

See [Creating Visualizers](creating-visualizers.md) to build custom visualizers from scratch.
