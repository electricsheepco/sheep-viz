# Sheep

Audio-reactive visual generation for music videos and live performances.

![Vertical Pulse](https://img.shields.io/badge/visualizer-vertical--pulse-ff1a4b)
![License](https://img.shields.io/badge/license-MIT-blue)

## What is this?

**Sheep** is a toolkit for creating audio-reactive visuals that sync perfectly with music. Use it for:
- Live VJ performances
- Music video backgrounds
- Social media content (TikTok, Reels, YouTube Shorts)
- Album art animations

## Quick Start

### Live Preview (Browser)

```bash
# Just open in browser
open visualizers/vertical-pulse.html
```

1. Click canvas to enable audio
2. Load an audio file or use microphone
3. Tweak parameters in the sidebar
4. Record directly or save frames

### Render Video (CLI)

```bash
# Install dependencies (one time)
cd tools && npm install && cd ..

# Render a music video
./tools/render-video.sh song.mp3 output.mp4

# With options
./tools/render-video.sh song.mp3 output.mp4 \
  --res tiktok \
  --preset visualizers/presets/deep-cyberpunk.json \
  --overlay logo.png
```

## Visualizers

### Vertical Pulse

Audio-reactive light columns with organic metaball distortion.

| Feature | Description |
|---------|-------------|
| Columns | Vertical bars mapped to frequency spectrum |
| Metaballs | Organic blobs that distort the columns |
| Colors | Bass → Mid → Treble gradient |
| Overlay | Logo/image with reactive effects (split, pulse, glitch, cycle) |

## Resolution Presets

| Preset | Size | Use Case |
|--------|------|----------|
| `youtube` / `hd` | 1920×1080 | YouTube, general HD |
| `youtube2k` / `2k` | 2560×1440 | YouTube 2K |
| `youtube4k` / `4k` | 3840×2160 | YouTube 4K |
| `tiktok` / `reels` / `shorts` | 1080×1920 | Vertical mobile video |
| `instagram` / `square` | 1080×1080 | Instagram feed |
| `portrait` | 1080×1350 | Instagram portrait |

## Visual Presets

```
visualizers/presets/
├── vertical-pulse-default.json   # Neon red/magenta/blue
├── deep-cyberpunk.json           # Dense, intense
├── minimal-white.json            # Clean monochrome
└── warm-sunset.json              # Orange/yellow gradient
```

Save your own: adjust parameters → click "Save Current as Preset"

## Overlay Effects

| Effect | Description |
|--------|-------------|
| None | Static overlay |
| Split & Shift | Vertical slices move with frequencies |
| Pulse | Scale and glow with bass |
| Glitch | RGB split + displacement |
| Cycle | Rotate through multiple images |

## Project Structure

```
sheep/
├── visualizers/
│   ├── vertical-pulse.html       # Live interactive visualizer
│   ├── vertical-pulse-render.html # Headless render version
│   └── presets/                  # Saved configurations
├── tools/
│   ├── render-video.sh           # Full pipeline script
│   ├── analyze-audio.js          # Extract FFT per frame
│   └── render-frames.js          # Puppeteer frame renderer
├── assets/                       # Your images, logos
├── output/                       # Rendered videos (gitignored)
└── README.md
```

## Requirements

- **Browser**: Chrome/Firefox (for live preview)
- **Node.js**: v18+ (for CLI rendering)
- **FFmpeg**: (for video compilation)

```bash
# macOS
brew install node ffmpeg

# Ubuntu/Debian
sudo apt install nodejs ffmpeg
```

## CLI Reference

```bash
./tools/render-video.sh <input-audio> <output-video> [options]

Options:
  --res <preset>        Resolution preset
  --fps <number>        Frame rate (default: 60)
  --seed <number>       Random seed for reproducibility
  --preset <file>       Load visual preset JSON
  --overlay <image>     Overlay image (logo, album art)
  --overlay-size <n>    Overlay size as % (default: 20)
  --overlay-pos <pos>   Position: center, bottom-right, etc.
  --crf <number>        Video quality, lower=better (default: 18)
```

## Examples

```bash
# TikTok vertical video with logo
./tools/render-video.sh track.mp3 tiktok.mp4 --res tiktok --overlay logo.png

# YouTube video with preset
./tools/render-video.sh track.mp3 youtube.mp4 --res youtube --preset visualizers/presets/deep-cyberpunk.json

# 4K render
./tools/render-video.sh track.mp3 4k.mp4 --res 4k --fps 30
```

## License

MIT

---

Part of [Electric Sheep Supply Co.](https://electric-sheep-supply-co.in)
