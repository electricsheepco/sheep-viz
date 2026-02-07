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

**16 Visualizers included:**

| Visualizer | Style | Inspiration |
|------------|-------|-------------|
| **Llama Bars** | Spectrum analyzer | Winamp classic bars |
| **Spilled Milk** | Morphing presets | MilkDrop |
| **Geist** | Chrome tunnels | Geiss |
| **Starfield** | Star tunnel | Screensaver nostalgia |
| **Warp Speed** | Hyperspace | Star Wars |
| **Matrix Rain** | Digital rain | The Matrix |
| **Vertical Pulse** | Light columns | Audio reactive columns |
| **Vertical Pulse Pro** | Metaball columns | Organic distortion |
| **Vector Grid** | Wireframe terrain | Johnny Quest / Tron |
| **Radial Burst** | Beat explosions | Particle systems |
| **Fluid Flow** | Flow fields | Fluid dynamics |
| **Gogh Mode** | Swirling brushstrokes | Van Gogh |
| **Gilt Trip** | Art Nouveau gold | Gustav Klimt |
| **Cubic Zirconia** | Cubist fragmentation | Pablo Picasso |
| **Oscilloscope** | Waveforms & Lissajous | Analog test equipment |
| **Pollock Splatter** | Action painting | Jackson Pollock |

Fork it and make your own.

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
- **MIDI support** — 8 knobs, 4 faders, 8 pads mapped to Arturia MiniLab 3
- **System audio capture** — React to YouTube, Spotify, any app (not just files)
- **Fullscreen popout** — Controls pop out to separate window for dual-screen live setups
- **Overlay system** — Add your logo, album art, whatever
- **Band watermark** — Configurable logo in corner for branding
- **Color extraction** — Pull palette from your artwork automatically
- **Preset system** — Save and share your configurations
- **Frame-perfect export** — Render videos that sync exactly to your audio
- **Resolution presets** — YouTube, TikTok, Instagram, all covered
- **Open source** — Clean, modular code. Easy to hack.

---

## For Live Performance

1. Open any visualizer (recommended: `starfield.html` or `vertical-pulse.html`)
2. Connect your MIDI controller (auto-detected)
3. Select your device from the MIDI dropdown
4. Press `F` for fullscreen (controls pop out to separate window)
5. Output to projector via HDMI

### MiniLab 3 MIDI Mapping (Recommended Controller)

```
   KNOBS (CC)                    FADERS (CC)          PADS (Ch.10)
   ┌────┬────┬────┬────┐        ┌────┬────┬────┬────┐ ┌────┬────┬────┬────┐
   │ 74 │ 71 │ 76 │ 77 │        │ 82 │ 83 │ 85 │ 17 │ │ 36 │ 37 │ 38 │ 39 │
   │ P1 │ P2 │ P3 │ P4 │        │ P9 │P10 │P11 │MST │ │ 1  │ 2  │ 3  │ 4  │
   ├────┼────┼────┼────┤        └────┴────┴────┴────┘ ├────┼────┼────┼────┤
   │ 93 │ 18 │ 19 │ 16 │          Overlay controls    │ 40 │ 41 │ 42 │ 43 │
   │ P5 │ P6 │ P7 │ P8 │                              │ 5  │ 6  │ 7  │ 8  │
   └────┴────┴────┴────┘                              └────┴────┴────┴────┘
     Parameters 1-8                                     Presets 1-8
```

See [docs/midi-setup.md](docs/midi-setup.md) for full mapping details and other controllers.

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
| `F` | Fullscreen + popout controls |
| `H` | Toggle hardware bar |
| `S` | Toggle sidebar |
| `P` | Pop out canvas (dual-screen) |
| `R` | Start / stop recording |
| `1-8` | Switch preset/style |
| `Esc` | Exit fullscreen |

---

## Make Your Own Visualizer

The architecture is simple:

1. **Audio analysis** — Web Audio API gives you frequency data
2. **Visual system** — p5.js draws to canvas
3. **Parameters** — Sliders in the UI, exposed for MIDI

Look at `vertical-pulse-pro.html`. It's one self-contained file. Copy it, change the `draw()` function, add your own parameters. That's it.

If you build something cool, open a PR.

---

## Project Structure

```
sheep/
├── lib/
│   ├── hardware-controls.js      # Shared skeuomorphic controls
│   └── hardware-controls.css     # Dark metal aesthetic styling
├── visualizers/
│   ├── llama-bars.html           # Spectrum analyzer (Winamp tribute)
│   ├── spilled-milk.html         # MilkDrop morphing presets
│   ├── geist.html                # Chrome tunnel effects
│   ├── starfield.html            # Classic star tunnel
│   ├── warp-speed.html           # Star Wars hyperspace
│   ├── matrix-rain.html          # Matrix digital rain
│   ├── vertical-pulse.html       # Light columns (full)
│   ├── vertical-pulse-pro.html   # Light columns (metaball)
│   ├── vector-grid.html          # 3D wireframe grid
│   ├── radial-burst.html         # Beat-reactive particles
│   ├── fluid-flow.html           # Flow field particles
│   ├── gogh-mode.html            # Van Gogh brushstrokes
│   ├── gilt-trip.html            # Klimt Art Nouveau gold
│   ├── cubic-zirconia.html       # Picasso cubist
│   ├── oscilloscope.html         # Waveforms & Lissajous
│   ├── pollock-splatter.html     # Jackson Pollock action painting
│   └── presets/                  # Saved configurations
├── tools/
│   ├── render-video.sh           # Full render pipeline
│   ├── analyze-audio.js          # FFT extraction
│   └── render-frames.js          # Headless frame renderer
├── assets/                       # Your images, logos
└── docs/                         # Documentation
    ├── midi-setup.md             # MIDI controller guide
    ├── creating-visualizers.md   # Build your own
    └── video-rendering.md        # Export videos
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
