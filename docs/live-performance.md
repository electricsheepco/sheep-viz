# Live Performance Guide

Use sheep-viz to project visuals during live shows.

## Setup Overview

```
Audio Source (Mixer/DAW)
         │
         ▼
    Line Input ──────► Computer ──────► Projector/Screen
         │                │
         │                ▼
         │         sheep-viz (browser)
         │                │
         └────────────────┘
              Audio React
```

## Dual-Screen Setup (Recommended)

The best setup for live performance: **controls on your laptop, visuals on the projector**.

### Pop-Out Canvas

1. Open any visualizer
2. Load audio and start playback
3. Press **P** to pop out the canvas
4. Drag the popup window to your projector/second display
5. Click in the popup and press **F** for fullscreen
6. Adjust parameters from your laptop - changes appear on projector instantly

This gives you full control without the audience seeing your UI.

### Projection Mode Features

When in fullscreen projection mode:
- UI auto-hides
- Cursor disappears after 2 seconds
- Canvas fills entire screen
- Press **H** to temporarily show controls

## Hardware Setup

### Audio Input
1. Run a line-out from your mixer to your computer's audio interface
2. In sheep-viz, click "Use Mic" and select your audio interface
3. Adjust input gain so the visualizer responds without clipping

### Video Output
1. Connect HDMI/DisplayPort to projector or LED screen
2. Set display to "Extended" mode (not mirrored)
3. Use the pop-out feature to send canvas to second display

### MIDI Controller (Optional)
See [MIDI Setup](midi-setup.md) for controller configuration.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `P` | Pop out canvas to new window |
| `F` | Toggle fullscreen |
| `H` | Hide/show UI |
| `Space` | Play/pause |
| `R` | Start/stop recording |

## Switching Visualizers

Use the dropdown at the top of the sidebar to switch between visualizers without leaving the page. Your audio continues playing.

## Performance Workflow

### Before the Show

1. **Test audio levels** - Play your loudest track, ensure no clipping
2. **Set your parameters** - Dial in visuals that match your set
3. **Test pop-out** - Verify it works with your projector
4. **Save a preset** - Backup your settings

### During the Show

1. Pop out canvas to projector (P)
2. Fullscreen the popup (F)
3. Adjust parameters from your laptop as needed
4. Use dropdown to switch visualizers between songs

## Tips for Live Performance

### Visual Impact
- **Keep it simple** - Subtle visuals enhance music, busy visuals distract
- **Match the energy** - High particle count for drops, low for breakdowns
- **Use color shift sparingly** - Constant rainbow can be nauseating

### Technical
- **Disable screen saver** - Keep display awake
- **Close other apps** - Browser gets full resources
- **Use Chrome** - Best performance and MIDI support
- **Pre-warm the browser** - Open visualizer before your set

### Audio
- **Don't clip** - Distorted input = jerky visuals
- **Consistent levels** - Compress your master or normalize input

## Troubleshooting

### Pop-out window won't open
- Allow popups for the site in browser settings
- Try clicking the button instead of using keyboard shortcut

### No audio response
1. Check that "Use Mic" is active
2. Verify correct input device in browser
3. Check input levels in your OS audio settings

### Choppy visuals
1. Close other browser tabs
2. Reduce particle count or complexity
3. Use Chrome instead of Firefox

## Example Setups

### DJ with CDJs
```
CDJ 1 ──┐
        ├──► Mixer ──► Main Out ──► PA
CDJ 2 ──┘      │
               └──► Record Out ──► Audio Interface ──► Computer
                                        │
                                   Pop-out to projector
```

### Band with Mixer
```
Instruments ──► Mixer ──► Main Out ──► PA
                  │
                  └──► Aux Send ──► Audio Interface ──► Computer
                                          │
                                     Pop-out to projector
```
