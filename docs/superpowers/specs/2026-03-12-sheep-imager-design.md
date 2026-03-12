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

6-band stereo width processing using Mid/Side (M/S) technique. Each band is independently width-controlled. Bands are isolated via Linkwitz-Riley crossover filters (4th order, LR4), which sum to a flat amplitude response when all bands are at unity width (100%). Note: LR4 filters introduce phase rotation near crossover frequencies — phase-linear crossovers are out of scope for v1. The plugin introduces zero samples of latency (`setLatencySamples(0)`).

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
// Encode
Mid  = (L + R) / 2      // [-1.0, 1.0]
Side = (L - R) / 2      // [-1.0, 1.0]

// Width: 0% → 0.0, 100% → 1.0, 150% → 1.5
width_factor = width_percent / 100.0

// Decode
L_out = Mid + (Side × width_factor)
R_out = Mid - (Side × width_factor)
```

**Gain behavior:**
- Width 100% (unity): `L_out = L`, `R_out = R` — exact passthrough ✓
- Width 0% (mono): `L_out = R_out = (L+R)/2` — fully mono-compatible. Side energy is discarded. For a mono source (L=R), output level is unchanged. For a stereo source with significant side content, some energy is lost — this is expected and correct behavior for a width reduction.
- Width >100% (hyper-wide): Side channel amplified. Can exceed 0dBFS on material with strong stereo content; document as intentional, no hard clamp.

**No gain compensation is applied.** Mid is not boosted when Side is reduced. This matches the behavior of standard M/S processor design and is transparent on mono-compatible material (kick, bass). Users should compensate with the output gain control if needed after collapsing to mono.

### 3.4 Default Band Configuration

| # | Band Name | Default Range | Default Width | Stereo Position |
|---|-----------|--------------|---------------|-----------------|
| 1 | Sub/Low | **20 Hz** – 150 Hz | 0% | Center |
| 2 | Low-Mid | 150 – 500 Hz | 15% | Center-L/R |
| 3 | Mid | 500 – 2000 Hz | 35% | Center-L/R |
| 4 | Upper-Mid | 2000 – 5000 Hz | 60% | Side-L/R |
| 5 | High | 5000 – 10000 Hz | 80% | Side-L/R |
| 6 | Air | 10000 – **20000 Hz** | 100% | Extreme-L/R |

Band 1's lower bound (20 Hz) and Band 6's upper bound (20 kHz) are fixed — they are the hard spectrum floor/ceiling, not user-adjustable crossover positions. XO1 can be dragged as low as 40 Hz (per Section 3.6), making Band 1 potentially as narrow as 20–40 Hz.

### 3.5 Crossover Filters

- **Type:** Linkwitz-Riley 4th order (LR4)
- **Implementation:** Two cascaded 2nd-order Butterworth filters per crossover
- **Slopes:** -24 dB/oct
- **Amplitude:** All bands sum flat (within <0.1dB)
- **Phase:** Phase rotation occurs near crossover frequencies (inherent to IIR). Phase-linear crossovers are out of scope for v1.
- **Crossover range:** 40 Hz – 18000 Hz (practical bounds; prevents zero-bandwidth bands at the frequency floor/ceiling). Min 50 Hz spacing between adjacent crossovers.
- **Sample rate handling:** Biquad coefficients recalculated in `prepareToPlay` on every sample rate change. Supported sample rates: 44100, 48000, 88200, 96000, 176400, 192000 Hz.

### 3.6 Crossover Default Frequencies

| Crossover | Default | Hard Min | Hard Max |
|-----------|---------|----------|----------|
| XO1 | 150 Hz | 40 Hz | 18000 Hz |
| XO2 | 500 Hz | 40 Hz | 18000 Hz |
| XO3 | 2000 Hz | 40 Hz | 18000 Hz |
| XO4 | 5000 Hz | 40 Hz | 18000 Hz |
| XO5 | 10000 Hz | 40 Hz | 18000 Hz |

Crossover ordering constraint: `XO(N) ≤ XO(N+1) - 50Hz` always. Enforced in `parameterChanged` using a **clamp-the-mover** strategy: the moved crossover is clamped to the nearest valid position (`XO(N-1) + 50Hz` or `XO(N+1) - 50Hz`) and neighboring crossovers are never pushed. This means a user cannot force adjacent crossovers apart by dragging one through another — the dragged handle stops at its limit. No cascade propagation. This is simpler to implement and avoids unexpected movement of crossovers the user did not touch.

JUCE `AudioParameterFloat` static ranges cover the full shared range (40–18000 Hz); dynamic ordering is enforced in the processor layer, not the parameter range itself.

---

## 4. Parameters

### 4.1 Automatable Parameters

These are registered as `AudioParameterFloat` / `AudioParameterBool` in JUCE and are available for DAW automation and MIDI-CC mapping. All automatable parameters use `SmoothedValue<float>` with a 20ms linear ramp applied per-sample in `processBlock` to prevent zipper noise.

**Global (3):**

| ID | Name | Type | Range | Default | Unit |
|----|------|------|--------|---------|------|
| `input_gain` | Input Gain | Float | -24 to +24 | 0.0 | dB |
| `output_gain` | Output Gain | Float | -24 to +24 | 0.0 | dB |
| `bypass` | Bypass | Bool | 0/1 | 0 | — |

**Per-Band (×6, prefixed `band_N_`, N = 1–6) — 12 parameters:**

| ID Suffix | Name | Type | Range | Default | Unit |
|-----------|------|------|--------|---------|------|
| `width` | Width | Float | 0 – 150 | varies | % |
| `bypass` | Band Bypass | Bool | 0/1 | 0 | — |

**Crossover (×5, prefixed `xo_N_`, N = 1–5) — 5 parameters:**

| ID Suffix | Name | Type | Range | Default | Unit |
|-----------|------|------|--------|---------|------|
| `freq` | Frequency | Float | 40 – 18000 | varies | Hz |

**Total automatable parameter count:** 3 + (6 × 2) + (5 × 1) = **20 parameters** (13 float, 7 bool)

**Smoothing:** All **float** automatable parameters (13 total: `input_gain`, `output_gain`, 6× `band_N_width`, 5× `xo_N_freq`) use `SmoothedValue<float>` with a 20ms linear ramp per-sample in `processBlock`.

**Bypass transition:** Bool parameters (`bypass`, `band_N_bypass`) use hard switching — no ramp. To suppress click artifacts on global bypass, a 5ms linear mute-in/mute-out applied in the audio callback before the hard copy. Per-band bypass uses instant switching (bands are part of a summed signal; single-band pops are inaudible at normal levels).

### 4.2 Non-Automatable State

**Band Solo** is not a DAW-automatable parameter. It is runtime state stored in `PluginProcessor` as a bitmask (`soloState: uint8_t`). Solo is intentionally excluded from automation because it behaves as a monitoring mode toggle with side effects on all bands simultaneously — DAW automation of solo across multiple bands simultaneously produces undefined playback behavior.

Solo state persists across session save/load via `getStateInformation` / `setStateInformation` alongside all automatable parameters. Solo state is saved as a raw int in the XML state tree under key `soloState`.

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
- Height of each rectangle = current width value for that band (driven by band strip sliders)
- **The frequency display is a live read-only visualization.** It reflects parameter state but is not a second input surface — band widths can only be set via the band strip sliders. This avoids dual-input state sync complexity in v1.
- Crossover points are vertical handles on the X axis, draggable left/right — these ARE the primary input for crossover parameters
- Hovering a crossover handle shows its Hz value as a floating label
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
    PLUGIN_MANUFACTURER_CODE Essc   # Must be unique; verify via Apple AU registry
    PLUGIN_CODE Shim                # Must be unique; verify no collision before shipping
    PLUGIN_MANUFACTURER "Electric Sheep Supply Co."
    PLUGIN_VERSION "1.0.0"          # Required for Info.plist generation
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    VST3_CATEGORIES "Fx Spatial"
    AU_MAIN_TYPE "kAudioUnitType_Effect"
    COPY_PLUGIN_AFTER_BUILD TRUE     # Auto-install to ~/Library during dev
)
```

**Channel layout:** The plugin declares a single stereo bus layout (2-in, 2-out) via `isBusesLayoutSupported`. Mono input is not supported in v1. This must be declared explicitly so hosts can reject invalid configurations gracefully.

**Plugin code uniqueness:** `Shim` / `Essc` must be verified as unused before distribution. Collision causes AU validation failure. Search the community registry and run `auval -a` locally after install to confirm no conflict.

**Universal binary:** JUCE CMake produces a universal binary (arm64 + x86_64) by default on macOS when building with Xcode. No additional configuration required.

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

- **Crossover collision:** See Section 3.6 — cascade clamp enforced in `parameterChanged`
- **Solo conflict:** Multiple solos active = all active-solo bands audible (additive, not exclusive). Solo is runtime state, not automatable (see Section 4.2).
- **Solo + bypass:** A band that is both bypassed and soloed outputs silence for that band (bypass wins). Solo of a bypassed band is a no-op from an audio perspective.
- **Solo only active band:** If the sole non-bypassed band is the only soloed band, output is that band only. No implicit fallback.
- **Hyper-wide artifacts:** Width > 100% documented as intentional; no hard clamp, but UI slider max is 150%
- **Denormals:** `FloatVectorOperations::disableDenormalisedNumberSupport()` called in `prepareToPlay`
- **Bypass:** True bypass (copy input to output via `juce::AudioBuffer::copyFrom`), not soft bypass — avoids latency tail artifacts
- **Parameter smoothing:** All 20 automatable parameters use `SmoothedValue<float>` (linear, 20ms ramp). Applied per-sample in `processBlock`.
- **State persistence:** `getStateInformation` serializes all 20 automatable parameters by string ID + `soloState` bitmask into a JUCE `ValueTree` → XML. `setStateInformation` restores by ID (not by index) for forward compatibility.
- **Zero latency:** `setLatencySamples(0)` called in constructor. Declared to host via standard JUCE mechanism.

---

## 10. Testing Plan

| Test | Method |
|------|--------|
| LR4 crossovers sum flat | Pink noise in, all bands at 100%, compare I/O spectrum — must be <0.1dB deviation across 20Hz–20kHz |
| M/S at 0% = mono | Verify `L_out == R_out` for all input when band width = 0% |
| M/S at 100% = unity | Verify `L_out == L_in` and `R_out == R_in` when all band widths = 100% |
| Mono source at 0% = no level change | Feed identical L/R signal, verify output level unchanged at width=0% |
| Crossover constraint | Set XO2 below XO1 programmatically, verify cascade clamp fires, no crossover inversion |
| Sample rate change | Switch host sample rate mid-session, verify no silence/crash and filter recalculates |
| Solo + bypass interaction | Bypass a band, solo it, verify silence |
| No CPU spikes | Profile in Logic Pro with 256-sample buffer, verify <5% CPU on M-series chip |
| AU validation | `auval -v aufx Shim Essc` — note: codes are case-sensitive, must match compiled binary exactly |
| VST3 validation | JUCE pluginval — run against VST3 binary |
| Crossover drag UI | All 5 crossovers draggable to hard limits without crash or visual artifact |
| State save/load | Save in Logic, reload session — all 20 automatable params + soloState restore correctly |
| Latency declaration | Verify host reports 0 samples PDC for this plugin |

---

## 11. Out of Scope (v1)

- Windows / Linux builds
- AAX (Pro Tools) format
- Resizable UI
- Preset library / preset manager
- Spectrum analyzer overlay on frequency display
- Mid-only or Side-only monitoring toggle
- Correlation meter
- CLAP format
- Gain compensation on width reduction (intentional design decision — see Section 3.3)
- Dragging band rectangles in frequency display as a second width input (display is read-only in v1)

---

## 12. Open Questions

- [ ] Will this be open-source (MIT) or closed?
- [ ] Distribution channel: direct download, Gumroad, or plugin store?
- [ ] Plugin version: start at 1.0.0 or 0.1.0 (beta)?
