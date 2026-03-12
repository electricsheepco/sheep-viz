# Sheep Imager — Design Spec
**Date:** 2026-03-12
**Project:** Electric Sheep Supply Co.
**Format:** AU + VST3
**Status:** Pre-implementation

---

## 1. Product Overview

**Sheep Imager** is a 6-band multiband stereo imager plugin built for mixing and mastering. Its core purpose: keep low frequencies glued to the center and push high frequencies to the sides — automatically, with surgical control over where each frequency range lives in the stereo field.

Primary use case: a mix where kick and bass need to stay mono-compatible while guitars, synths, and hi-hats breathe wide. Load Sheep Imager on the stereo bus or any track. Drag the crossovers. Done.

Ships as:
- **Audio Unit v2/v3 (AU)** — Logic Pro, GarageBand, MainStage
- **VST3** — Ableton Live, Cubase, Reaper, Bitwig

---

## 2. Sheep Ethos

Electric Sheep Supply Co. is an independent studio. The tools it builds reflect that:

- **No bloat.** Every parameter earns its place. No preset libraries padded out with garbage.
- **No UX theatre.** The UI communicates what the plugin does, not how clever it looks. Flat, readable, fast.
- **Opinionated defaults.** Ship with defaults that are immediately useful for the most common use case (bass center, air wide). The user tunes from there.
- **The logo is quiet.** Sheep branding is present but never loud — bottom-right corner, small, correct.
- **Open by nature.** Clean, readable C++. If someone wants to fork it, they can.

The plugin should feel like it was made by someone who mixes — not someone who makes plugins.

---

## 3. DSP Architecture

### 3.1 Core Concept

6-band stereo width processing using Mid/Side (M/S) technique. Each band is independently width-controlled. Bands are isolated via Linkwitz-Riley crossover filters (4th order, LR4), which sum to a mathematically flat frequency response — no coloration when all widths are at 100%.

### 3.2 Signal Flow

```
Stereo Input (L/R)
        │
        ▼
┌───────────────────────────────┐
│   LR4 Crossover Chain         │
│   5 adjustable crossover pts  │
│   → 6 parallel frequency bands│
└───────────────────────────────┘
        │
   ┌────┴──────────────────────────────────────┐
   │  Per Band (×6):                           │
   │  L/R → M/S encode                         │
   │  Scale Side channel by width factor       │
   │  M/S → L/R decode                         │
   └────────────────────────────────────────────┘
        │
        ▼
   Sum all 6 bands
        │
        ▼
Stereo Output (L/R)
```

### 3.3 M/S Encoding

```
Mid  = (L + R) / 2
Side = (L - R) / 2

Width 0%:   Output = Mid only (mono-compatible)
Width 100%: Output = original L/R (unity)
Width >100%: Side channel amplified (hyper-wide, use with care)

L_out = Mid + (Side × width_factor)
R_out = Mid - (Side × width_factor)
```

### 3.4 Default Band Configuration

| # | Band Name | Default Range | Default Width | Stereo Position |
|---|-----------|--------------|---------------|-----------------|
| 1 | Sub/Low | 20 – 150 Hz | 0% | Center |
| 2 | Low-Mid | 150 – 500 Hz | 15% | Center-L/R |
| 3 | Mid | 500 – 2000 Hz | 35% | Center-L/R |
| 4 | Upper-Mid | 2000 – 5000 Hz | 60% | Side-L/R |
| 5 | High | 5000 – 10000 Hz | 80% | Side-L/R |
| 6 | Air | 10000 – 20000 Hz | 100% | Extreme-L/R |

### 3.5 Crossover Filters

- **Type:** Linkwitz-Riley 4th order (LR4)
- **Implementation:** Two cascaded 2nd-order Butterworth filters per crossover
- **Slopes:** -24 dB/oct
- **Phase:** All bands sum flat with zero amplitude error
- **Crossover range:** 20 Hz – 20000 Hz, min spacing 50 Hz between adjacent crossovers

### 3.6 Crossover Default Frequencies

| Crossover | Default | Min | Max |
|-----------|---------|-----|-----|
| XO1 | 150 Hz | 20 Hz | XO2 - 50 Hz |
| XO2 | 500 Hz | XO1 + 50 Hz | XO3 - 50 Hz |
| XO3 | 2000 Hz | XO2 + 50 Hz | XO4 - 50 Hz |
| XO4 | 5000 Hz | XO3 + 50 Hz | XO5 - 50 Hz |
| XO5 | 10000 Hz | XO4 + 50 Hz | 20000 Hz |

---

## 4. Parameters

All parameters are automatable and MIDI-CC mappable.

### 4.1 Global Parameters

| ID | Name | Range | Default | Unit |
|----|------|--------|---------|------|
| `input_gain` | Input Gain | -24 to +24 | 0.0 | dB |
| `output_gain` | Output Gain | -24 to +24 | 0.0 | dB |
| `bypass` | Bypass | 0/1 | 0 | — |

### 4.2 Per-Band Parameters (×6, prefixed `band_N_`)

| ID Suffix | Name | Range | Default | Unit |
|-----------|------|--------|---------|------|
| `width` | Width | 0 – 150 | varies | % |
| `bypass` | Band Bypass | 0/1 | 0 | — |
| `solo` | Band Solo | 0/1 | 0 | — |

### 4.3 Crossover Parameters (×5, prefixed `xo_N_`)

| ID Suffix | Name | Range | Default | Unit |
|-----------|------|--------|---------|------|
| `freq` | Frequency | 20 – 20000 | varies | Hz |

Total parameter count: 3 + (6 × 3) + (5 × 1) = **26 parameters**

---

## 5. UI/UX Design

### 5.1 Philosophy

Flat, dark, immediate. The user should understand what the plugin does within two seconds of opening it. No 3D knobs. No fake rack hardware. No skeuomorphism. One screen, no pages or tabs.

### 5.2 Plugin Window Size

**600 × 380 px** (fixed, non-resizable in v1)

### 5.3 Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  sheep imager                    [IN: -0.0 dB]  [OUT: -0.0 dB]  [BYP] │  ← Header bar (40px)
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────── FREQUENCY DISPLAY (180px tall) ──────────────┐ │
│  │  Stereo field map: 6 colored bands, draggable crossover handles   │ │
│  │  X axis = frequency (log scale, 20Hz – 20kHz)                     │ │
│  │  Y axis = stereo width (center at bottom, extreme sides at top)   │ │
│  │  Bands filled with color, crossover handles on X axis             │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌── BAND STRIPS (6 columns, equal width) ───────────────────────────┐ │
│  │  [  Band 1  ] [  Band 2  ] [  Band 3  ] [  Band 4  ] [  Band 5  ] [  Band 6  ] │
│  │  Sub/Low      Low-Mid       Mid           Upper-Mid    High          Air         │
│  │  20-150Hz     150-500Hz     500-2kHz      2k-5kHz      5k-10kHz     10k-20kHz   │
│  │                                                                     │
│  │  Each strip:                                                        │
│  │  ┌──────────┐                                                       │
│  │  │ [◼ BYP ] │  ← bypass toggle                                     │
│  │  │ [◎ SOLO] │  ← solo button                                       │
│  │  │          │                                                       │
│  │  │  ══════  │  ← width slider (vertical)                           │
│  │  │          │                                                       │
│  │  │  000%    │  ← width value label                                 │
│  │  └──────────┘                                                       │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ─────────────────────────────────────────────     [sheep logo 24px] │  ← Footer (28px)
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Frequency Display

The main visual: a 2D map where X = frequency (log scale) and Y = stereo width.

- Each of the 6 bands is a colored rectangle filling its frequency range
- Height of each rectangle = current width value
- Crossover points are vertical handles on the X axis, draggable left/right
- Hovering a crossover shows its Hz value
- Band colors are distinct but muted (not neon) — desaturated versions of sheep-viz accent palette
- A horizontal dashed line at "0% width" = center reference
- A horizontal dashed line at "100% width" = full stereo reference

### 5.5 Band Strips

6 equal columns below the frequency display. Each contains:

- **Band label** (e.g., "Sub/Low") and frequency range (updates live as crossovers move)
- **Width slider** — vertical, full height of the strip. Drag up = wider. Click to type exact value.
- **Width readout** — numeric, e.g., `0%`, `35%`, `100%`
- **BYP button** — small toggle, grays out the band when active
- **SOLO button** — silences all other bands for monitoring

### 5.6 Color Palette

```
Background:       #111114
Surface:          #1a1a20
Border/divider:   #2a2a32
Text primary:     #e8e8f0
Text secondary:   #666678
Accent (sheep):   #6366f1   ← matches sheep-viz icon indigo
Positive/active:  #6366f1
Bypass:           #444455
Solo:             #f4b400
Band colors (6):  #6366f1  #8b5cf6  #ec4899  #f97316  #eab308  #22d3ee
```

### 5.7 Typography

- **Font:** System monospace stack (`ui-monospace, 'SF Mono', monospace`)
- **Labels:** 10px, uppercase, letter-spacing 0.08em
- **Values:** 13px, tabular nums
- **Plugin name:** 14px, bold, lowercase (`sheep imager`)

### 5.8 Sheep Logo

- Positioned bottom-right corner of footer bar
- 24px height, SVG inline (the existing waveform-bars icon)
- Opacity 0.4 at rest, 0.7 on hover
- No link, no tooltip — decorative only

---

## 6. Technical Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | JUCE 8 | Industry standard, AU + VST3 from one codebase |
| Language | C++17 | JUCE minimum; modern enough |
| Build system | CMake 3.22+ | Preferred over Projucer, CI-friendly |
| DSP | JUCE DSP module | LR filters, M/S, gain — no external deps |
| UI | JUCE Graphics | Flat rendering, full control |
| Targets | macOS 12+ | AU (Logic), VST3 (Ableton et al) |
| Code signing | Apple Developer ID | Required for AU distribution |

---

## 7. Project Structure

```
sheep-imager/
├── CMakeLists.txt
├── CLAUDE.md
├── Source/
│   ├── PluginProcessor.h
│   ├── PluginProcessor.cpp        # Parameter registration, audio callback
│   ├── PluginEditor.h
│   ├── PluginEditor.cpp           # Root UI component, layout
│   ├── dsp/
│   │   ├── CrossoverFilter.h/.cpp # LR4 crossover implementation
│   │   ├── MultibandSplitter.h/.cpp # 6-band split/recombine
│   │   └── StereoImager.h/.cpp    # M/S width processing per band
│   └── ui/
│       ├── FrequencyDisplay.h/.cpp # 2D stereo field map + draggable XOs
│       ├── BandStrip.h/.cpp       # Per-band column (slider, bypass, solo)
│       ├── HeaderBar.h/.cpp       # Plugin name, I/O gain, bypass
│       ├── FooterBar.h/.cpp       # Sheep logo
│       └── LookAndFeel.h/.cpp     # Flat theme (colors, fonts, sliders)
├── Resources/
│   └── sheep-logo.svg
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-03-12-sheep-imager-design.md
```

---

## 8. Build & Distribution

### 8.1 CMake Targets

```cmake
juce_add_plugin(SheepImager
    FORMATS AU VST3
    PLUGIN_NAME "Sheep Imager"
    PLUGIN_MANUFACTURER_CODE Essc
    PLUGIN_CODE Shim
    PLUGIN_MANUFACTURER "Electric Sheep Supply Co."
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    VST3_CATEGORIES "Fx Spatial"
    AU_MAIN_TYPE "kAudioUnitType_Effect"
)
```

### 8.2 macOS Requirements

- Xcode 15+
- macOS 12 Monterey minimum deployment target
- Apple Developer ID certificate for signing
- Notarization required for distribution outside App Store

### 8.3 Output Locations

- AU: `~/Library/Audio/Plug-Ins/Components/SheepImager.component`
- VST3: `~/Library/Audio/Plug-Ins/VST3/SheepImager.vst3`

---

## 9. Error Handling & Edge Cases

- **Crossover collision:** Enforce minimum 50 Hz spacing between adjacent crossovers in parameter system, not just UI
- **Solo conflict:** Multiple solos active simultaneously = all active-solo bands audible (additive, not exclusive)
- **Hyper-wide artifacts:** Width > 100% documented as intentional; no hard clamp, but default max in UI is 150%
- **Denormals:** Flush to zero enabled in audio callback
- **Bypass:** True bypass (copy input to output), not soft bypass — avoids latency tail issues
- **DAW automation:** All 26 parameters smoothed with 20ms ramp to prevent zipper noise

---

## 10. Testing Plan

| Test | Method |
|------|--------|
| LR4 crossovers sum flat | Generate pink noise, apply all bands at 100%, compare input/output spectrum — must be <0.1dB deviation |
| M/S at 0% = mono | Verify L == R when width = 0% |
| M/S at 100% = unity | Verify input == output when all widths = 100% |
| No CPU spikes | Profile in Logic Pro with 256 sample buffer |
| AU validation | `auval -v aufx Shim Essc` must pass |
| VST3 validation | JUCE pluginval tool |
| Crossover drag | Smoke test: all 5 crossovers draggable to limits without crash |
| Preset state save/load | Save plugin state in DAW, reload session — verify all params restore |

---

## 11. Out of Scope (v1)

- Windows / Linux builds
- AAX (Pro Tools) format
- Resizable UI
- Preset library / preset manager
- Spectrum analyzer overlay
- Mid-only or Side-only monitoring toggle
- Correlation meter
- CLAP format
- M1/Intel universal binary (builds will be universal by default via JUCE CMake)

---

## 12. Open Questions

- [ ] Will this be open-source (MIT) or closed?
- [ ] Distribution channel: direct download, Gumroad, or plugin store?
- [ ] Plugin version: start at 1.0.0 or 0.1.0 (beta)?
