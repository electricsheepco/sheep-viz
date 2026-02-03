# CLAUDE.md - Sheep

Creative coding for **Electric Sheep Supply Co.** music visuals, videos, and generative art.

## Project Overview

**Sheep** is the creative coding arm of Electric Sheep Supply Co., focused on:
- Music visualizers and reactive graphics
- Generative art for album covers, social media, and merchandise
- Video processing and effects
- Live visual performance tools
- Promotional video content

## Tech Stack

### Core
- **Canvas/WebGL:** p5.js, Three.js, or raw Canvas API
- **Video:** FFmpeg for processing, rendering
- **Animation:** GSAP, Framer Motion
- **Audio Analysis:** Web Audio API, Meyda.js

### Optional (as needed)
- **Shaders:** GLSL for GPU-accelerated visuals
- **Realtime:** TouchDesigner exports, OSC for live performance
- **AI/ML:** RunwayML, Stable Diffusion for generative assets

## Project Structure

```
sheep/
├── CLAUDE.md
├── visualizers/        # Music visualizers (p5.js, Three.js)
│   ├── vertical-pulse.html         # Audio-reactive light columns
│   └── vertical-pulse-philosophy.md
├── generators/         # Generative art scripts
├── videos/             # Video projects and FFmpeg scripts
├── shaders/            # GLSL shader files
├── assets/             # Source images, audio, fonts
├── output/             # Rendered outputs (gitignored)
└── tools/              # Utility scripts
```

## Existing Visualizers

### Vertical Pulse
Audio-reactive light columns with organic metaball distortion.
- **File:** `visualizers/vertical-pulse.html`
- **Usage:** Open in browser, load audio file or use microphone
- **Parameters:** Column count, blob count, colors mapped to frequency bands
- **Best for:** Live shows, music videos, atmospheric visuals

## Video Render Pipeline

For frame-perfect music videos (not real-time):

### Setup (one time)
```bash
cd tools && npm install
```

### Full Render
```bash
./tools/render-video.sh input.mp3 output.mp4
```

### Options
| Flag | Default | Description |
|------|---------|-------------|
| `--fps` | 60 | Frame rate |
| `--width` | 1920 | Video width |
| `--height` | 1080 | Video height |
| `--seed` | 42 | Random seed for reproducibility |
| `--crf` | 18 | Quality (lower = better, 15-23 range) |

### Pipeline Components
1. **analyze-audio.js** - Extracts FFT data per frame to JSON
2. **render-frames.js** - Headless Puppeteer renders each frame as PNG
3. **FFmpeg** - Compiles frames + audio into final video

## Common Commands

```bash
# Live preview
open visualizers/vertical-pulse.html   # Or use live-server

# Full video render pipeline
cd tools && npm install                 # One-time setup
./render-video.sh song.mp3 output.mp4   # Full pipeline
./render-video.sh song.mp3 out.mp4 --fps 30 --width 1080 --height 1080

# Manual steps (if you need more control)
node tools/analyze-audio.js song.mp3 audio-data.json 60
node tools/render-frames.js audio-data.json ./frames --width 1920 --height 1080
ffmpeg -framerate 60 -i frames/frame_%06d.png -i song.mp3 \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac output.mp4
```

## Output Specs

### Social Media
| Platform | Size | Duration | Format |
|----------|------|----------|--------|
| Instagram Post | 1080x1080 | - | MP4/PNG |
| Instagram Story/Reel | 1080x1920 | 15-90s | MP4 |
| YouTube | 1920x1080 | - | MP4 |
| Twitter/X | 1280x720 | <2:20 | MP4 |

### Album Art
- 3000x3000 px minimum (for streaming platforms)
- PNG or TIFF for print

## Guidelines

- **Seeded randomness:** Always use seeded random for reproducible outputs
- **Parameterized:** Make key values configurable (colors, speeds, densities)
- **Export-ready:** Design with final output specs in mind
- **No watermarks:** Clean outputs for professional use
- **Performance:** Target 60fps for realtime, 30fps minimum for video

## Color Palette

Define project-specific palettes in each sketch. Default fallback:
```javascript
const PALETTE = {
  bg: '#0a0a0a',
  primary: '#ffffff',
  accent: '#ff3366',
  secondary: '#00ffcc'
};
```

## Related

- Parent: [Electric Sheep Supply Co.](https://electric-sheep-supply-co.in)
- Notion: 40-49 Creative (Music/Sheep)
- Local drafts: `/Volumes/zodlightning/Loop/moebius/veritatis/insights/drafts/`
