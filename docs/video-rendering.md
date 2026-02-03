# Video Rendering

Render frame-perfect music videos with sheep-viz.

## Requirements

```bash
# macOS
brew install node ffmpeg

# Ubuntu/Debian
sudo apt install nodejs ffmpeg

# Then install dependencies
cd tools && npm install
```

## Quick Render

```bash
./tools/render-video.sh your-track.mp3 output.mp4
```

This will:
1. Analyze audio frame-by-frame
2. Render each frame headlessly
3. Compile video with FFmpeg
4. Output a perfectly synced video

## Resolution Presets

| Preset | Resolution | Aspect | Use Case |
|--------|------------|--------|----------|
| `youtube` | 1920x1080 | 16:9 | YouTube, Vimeo |
| `tiktok` | 1080x1920 | 9:16 | TikTok, Reels, Shorts |
| `instagram` | 1080x1080 | 1:1 | Instagram feed |
| `twitter` | 1280x720 | 16:9 | Twitter/X |

```bash
# TikTok vertical video
./tools/render-video.sh track.mp3 video.mp4 --res tiktok

# YouTube horizontal
./tools/render-video.sh track.mp3 video.mp4 --res youtube

# Instagram square
./tools/render-video.sh track.mp3 video.mp4 --res instagram
```

## Using Presets

Apply a saved visual preset:

```bash
./tools/render-video.sh track.mp3 video.mp4 --preset visualizers/presets/deep-cyberpunk.json
```

## Adding Overlays

Include your logo or album art:

```bash
./tools/render-video.sh track.mp3 video.mp4 --overlay assets/logo.png
```

Overlay is centered and reacts to audio.

## Full Options

```bash
./tools/render-video.sh <audio> <output> [options]

Options:
  --res <preset>     Resolution preset (youtube|tiktok|instagram|twitter)
  --width <px>       Custom width
  --height <px>      Custom height
  --fps <num>        Frames per second (default: 30)
  --preset <file>    Visual preset JSON file
  --overlay <file>   Overlay image (PNG with transparency)
  --visualizer <file> Visualizer HTML file (default: vertical-pulse)
```

## Pipeline Details

### Step 1: Audio Analysis

```bash
node tools/analyze-audio.js input.mp3 audio-data.json
```

Extracts FFT data for every frame using Meyda. Output is a JSON array of frequency data.

### Step 2: Frame Rendering

```bash
node tools/render-frames.js audio-data.json frames/ --width 1080 --height 1920
```

Uses Puppeteer to render each frame headlessly. The visualizer runs in a browser but without display.

### Step 3: Video Compilation

```bash
ffmpeg -framerate 30 -i frames/frame-%05d.png -i input.mp3 \
  -c:v libx264 -pix_fmt yuv420p -c:a aac output.mp4
```

Combines frames and audio into final video.

## Batch Rendering

Render multiple tracks:

```bash
for track in *.mp3; do
  ./tools/render-video.sh "$track" "${track%.mp3}.mp4" --res tiktok
done
```

## Performance Tips

### Speed
- Rendering is CPU-intensive; expect ~1 frame/second
- A 3-minute track at 30fps = 5,400 frames
- Use `--fps 24` for faster renders with minimal quality loss

### Quality
- PNG frames are lossless; final video uses H.264
- Increase resolution for higher quality (affects render time)
- Use `--fps 60` for smooth slow-motion

### Storage
- Frame files are large (~500KB each)
- A 3-minute video generates ~2.5GB of frames
- Frames are deleted after compilation (configurable)

## Troubleshooting

### "ffmpeg not found"
Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg
```

### "Puppeteer launch failed"
Install Chromium dependencies:
```bash
# Ubuntu
sudo apt install chromium-browser

# Or let Puppeteer install it
npx puppeteer browsers install chrome
```

### Render freezes
- Check available disk space
- Reduce resolution or fps
- Run with `DEBUG=1` for verbose output

### Audio out of sync
- Ensure audio file is not VBR (variable bitrate)
- Convert to CBR first: `ffmpeg -i input.mp3 -ab 320k output.mp3`
