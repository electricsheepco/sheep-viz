# Getting Started

Get sheep-viz running in under a minute.

## Quick Start (No Installation)

1. Open `visualizers/vertical-pulse-pro.html` in your browser
2. Click the canvas to enable audio
3. Load a track using the file picker
4. Enjoy the visuals

That's it. No npm, no build step, no configuration.

![Vertical Pulse Pro Interface](images/vertical-pulse-pro-ui.png)

## Browser Requirements

- **Chrome** (recommended) - Best Web Audio and MIDI support
- **Firefox** - Full support
- **Safari** - Works, but MIDI may be limited
- **Edge** - Full support

## Audio Sources

The hardware bar has four audio controls:

| Button | Source | Use Case |
|--------|--------|----------|
| File | Local audio file | Music videos, testing |
| Mic | Microphone/line-in | Live performance with mixer |
| System | Screen/tab audio | React to YouTube, Spotify, any app |
| Play/Pause | Toggle playback | Control loaded audio |

### Local Audio File
Click the file button and select any audio file (MP3, WAV, FLAC, OGG).

### Microphone/Line-In
1. Click the mic button
2. Grant microphone permission when prompted
3. Select your audio interface as the input device

### System Audio (Screen Share)
1. Click the system audio button
2. Choose which tab or window to capture
3. The visualizer reacts to whatever audio is playing

This works with YouTube, Spotify, or any application.

## Basic Controls

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| F | Fullscreen + popout controls |
| H | Toggle hardware bar |
| S | Toggle sidebar |
| P | Pop out canvas (dual-screen) |
| R | Start / stop recording |
| 1-8 | Switch preset/style |
| Esc | Exit fullscreen |

## Switching Visualizers

Use the dropdown at the top of the sidebar to switch between different visualizers without reloading the page.

## Interface Overview

The interface is divided into:

1. **Canvas** - The visualization area (click to enable audio)
2. **Audio Controls** - File picker, mic input, play/pause
3. **Parameters** - Sliders to adjust the visual style
4. **Actions** - Fullscreen, record, preset management

## Next Steps

- [Live Performance Guide](live-performance.md) - Setting up for a show
- [Video Rendering](video-rendering.md) - Creating music videos
- [MIDI Setup](midi-setup.md) - Using a controller
- [Creating Visualizers](creating-visualizers.md) - Build your own
