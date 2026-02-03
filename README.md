# sheep-viz

**Audio-reactive visuals for musicians who miss the old days.**

*(Not a cheap visualizer. Well, it's free. But not cheap.)*

![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## Why This Exists

Remember Winamp?

Remember sitting in the dark, watching **Geiss** and **MilkDrop** paint impossible geometries while your favorite album played? Those visualizers weren't just eye candy—they were *companions* to the music. They made you *see* what you were hearing.

I'm a musician. I make electronic music. And when it came time to create visuals for my live shows and music videos, I looked around and found... not much. The old tools are gone or abandoned. The new ones are either $500/year subscriptions, locked into specific DAWs, or require a computer science degree to operate.

So I built this.

**sheep-viz** is what I wanted: simple, hackable, audio-reactive visuals that run in a browser. No installation. No subscription. No bullshit. Load your track, tweak the knobs, record the output. Or plug in a MIDI controller and perform live.

It's named after [Electric Sheep](https://electricsheep.org/)—the distributed computing project that generates fractal flames. And yes, the Philip K. Dick reference. And yes, the counting-sheep-to-sleep thing, because these visuals are hypnotic.

---

## What It Does

Drop in an audio file. The visuals react to bass, mids, and treble in real-time.

**Vertical Pulse** — Light columns that breathe with frequency, distorted by organic blobs drifting across the screen. That neon-rain-through-glass aesthetic.

**Radial Burst** — Particles explode from the center on every beat. Trails decay into nothing. A waveform ring pulses around the chaos.

More visualizers coming. Or fork it and make your own.

---

## Quick Start

```bash
# Just open in a browser. That's it.
open visualizers/vertical-pulse-pro.html
```

1. Click the canvas to enable audio
2. Load a track or use your microphone
3. Press `F` for fullscreen (projection mode)
4. Press `R` to record

For high-quality video export:
```bash
cd tools && npm install
./render-video.sh your-track.mp3 output.mp4 --res tiktok
```

---

## Features

- **Browser-based** — No installation, runs anywhere
- **MIDI support** — Map your controller, perform live
- **Fullscreen projection** — Hide the UI, output to a projector
- **Overlay system** — Add your logo, album art, whatever
- **Color extraction** — Pull palette from your artwork automatically
- **Preset system** — Save and share your configurations
- **Frame-perfect export** — Render videos that sync exactly to your audio
- **Resolution presets** — YouTube, TikTok, Instagram, all covered

---

## For Live Performance

1. Open `vertical-pulse-pro.html`
2. Connect your MIDI controller (auto-detected)
3. Load your set or use line-in from your mixer
4. Press `F` for fullscreen
5. Press `H` to hide controls
6. Output to projector via HDMI

Default MIDI mapping (customize in code):
| CC | Control |
|----|---------|
| 1-6 | Visual parameters |
| Note 36 | Play/Pause |
| Note 37 | Record |
| Note 38 | Fullscreen |

---

## For Music Videos

```bash
# Vertical for TikTok/Reels/Shorts
./tools/render-video.sh track.mp3 video.mp4 --res tiktok --overlay logo.png

# Horizontal for YouTube
./tools/render-video.sh track.mp3 video.mp4 --res youtube

# With a visual preset
./tools/render-video.sh track.mp3 video.mp4 --preset visualizers/presets/deep-cyberpunk.json
```

The render pipeline:
1. Analyzes your audio frame-by-frame (FFT extraction)
2. Renders each frame headlessly via Puppeteer
3. Compiles with FFmpeg, perfectly synced

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `F` | Toggle fullscreen |
| `H` | Hide / show UI |
| `R` | Start / stop recording |

---

## Make Your Own Visualizer

The architecture is simple:

1. **Audio analysis** — Web Audio API gives you frequency data
2. **Visual system** — p5.js draws to canvas
3. **Parameters** — Sliders in the UI, exposed for MIDI

Look at `vertical-pulse-pro.html`. It's one self-contained file. Copy it, change the `draw()` function, add your own parameters. That's it.

Ideas I haven't built yet:
- Flow field particles
- 3D waveform terrain
- Geometric kaleidoscope
- Liquid/fluid simulation
- Spectrum bars (classic, but make it fresh)

If you build something cool, open a PR.

---

## Project Structure

```
sheep/
├── visualizers/
│   ├── vertical-pulse-pro.html   # Main visualizer (MIDI + fullscreen)
│   ├── vertical-pulse.html       # Full-featured with overlays
│   ├── radial-burst.html         # Particle explosion visualizer
│   └── presets/                  # Saved configurations
├── tools/
│   ├── render-video.sh           # Full render pipeline
│   ├── analyze-audio.js          # FFT extraction
│   └── render-frames.js          # Headless frame renderer
├── assets/                       # Your images, logos
└── docs/                         # Notes, documentation
```

---

## Requirements

**For live use:** Any modern browser (Chrome/Firefox recommended)

**For video rendering:**
- Node.js 18+
- FFmpeg

```bash
# macOS
brew install node ffmpeg

# Ubuntu/Debian
sudo apt install nodejs ffmpeg
```

---

## Contributing

This is open source because the old visualizers were communities. MilkDrop had hundreds of preset authors. Geiss was passed around on burned CDs.

**Ways to contribute:**
- Build a new visualizer
- Create and share presets
- Improve the render pipeline
- Add features (better MIDI learn, OSC support, etc.)
- Fix bugs
- Write documentation

Fork it. Break it. Make it yours.

---

## Acknowledgments

Standing on the shoulders of:
- **Geiss** by Ryan Geiss — The one that started it all
- **MilkDrop** by Ryan Geiss — Still unmatched after 20 years
- **Electric Sheep** by Scott Draves — Distributed dreams
- **Winamp** — It really whips the llama's ass
- **p5.js** — Creative coding for everyone
- **gpu-io** by [Amanda Ghassaei](https://apps.amandaghassaei.com/gpu-io/examples/fluid/) — Fluid simulation inspiration

---

## License

MIT — Do whatever you want. Credit appreciated but not required.

---

*Made for musicians, by a musician.*

*Part of [Electric Sheep Supply Co.](https://electric-sheep-supply-co.in)*
