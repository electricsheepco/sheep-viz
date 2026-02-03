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

## Hardware Setup

### Audio Input
1. Run a line-out from your mixer to your computer's audio interface
2. In sheep-viz, click "Use Mic" and select your audio interface
3. Adjust input gain so the visualizer responds without clipping

### Video Output
1. Connect HDMI/DisplayPort to projector or LED screen
2. Set display to "Extended" mode (not mirrored)
3. Drag browser window to the external display
4. Press `F` for fullscreen

### MIDI Controller (Optional)
See [MIDI Setup](midi-setup.md) for controller configuration.

## Performance Workflow

### Before the Show

1. **Test audio levels** - Play your loudest track, ensure no clipping
2. **Set your parameters** - Dial in visuals that match your set
3. **Save a preset** - Click "Save Preset" to backup your settings
4. **Check projection** - Verify colors and brightness on the actual screen

### During the Show

| Action | Method |
|--------|--------|
| Go fullscreen | Press `F` |
| Hide UI | Press `H` |
| Adjust parameters | MIDI controller or press `H` to show UI |
| Switch presets | Load from preset dropdown |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `H` | Hide/show UI |
| `Space` | Play/pause (if using file) |
| `R` | Start/stop recording |

## Tips for Live Performance

### Visual Impact
- **Keep it simple** - Subtle visuals enhance music, busy visuals distract
- **Match the energy** - High blob count for drops, low for breakdowns
- **Use color shift sparingly** - Constant rainbow can be nauseating

### Technical
- **Disable screen saver** - Keep display awake
- **Close other apps** - Browser gets full resources
- **Use Chrome** - Best performance and MIDI support
- **Pre-warm the browser** - Open visualizer before your set

### Audio
- **Don't clip** - Distorted input = jerky visuals
- **Consistent levels** - Compress your master or normalize input
- **Test the room** - Bass buildup affects the visualizer

## Resolution Settings

For projection, match your output device:

| Device | Resolution |
|--------|------------|
| Standard projector | 1920x1080 |
| Widescreen | 2560x1080 |
| Portrait LED | 1080x1920 |

The visualizer automatically scales to fill the window.

## Troubleshooting

### No audio response
1. Check that "Use Mic" is active
2. Verify correct input device in browser
3. Check input levels in your OS audio settings

### Choppy visuals
1. Close other browser tabs
2. Reduce column count or blob count
3. Use Chrome instead of Firefox

### Fullscreen issues
1. Some projectors need a delay - wait for connection
2. Try clicking canvas before pressing `F`
3. Use browser's fullscreen (View > Enter Fullscreen)

## Example Setups

### DJ with CDJs
```
CDJ 1 ──┐
        ├──► Mixer ──► Main Out ──► PA
CDJ 2 ──┘      │
               └──► Record Out ──► Audio Interface ──► Computer
```

### Band with Mixer
```
Instruments ──► Mixer ──► Main Out ──► PA
                  │
                  └──► Aux Send ──► Audio Interface ──► Computer
```

### Laptop Producer
```
DAW ──► Audio Interface ──► Loopback ──► sheep-viz
              │
              └──► Speakers/PA
```
