# MIDI Setup

Control sheep-viz with any MIDI controller.

## Quick Start

1. Connect your MIDI controller via USB
2. Open `vertical-pulse-pro.html` in Chrome
3. Your controller is auto-detected

That's it. The Web MIDI API handles detection automatically.

## Default Mapping

### CC (Control Change) Messages

| CC# | Parameter |
|-----|-----------|
| 1 | Column Count |
| 2 | Column Width |
| 3 | Noise Scale |
| 4 | Blob Count |
| 5 | Blob Size |
| 6 | Color Shift |

### Note Messages

| Note | Action |
|------|--------|
| 36 (C1) | Play/Pause |
| 37 (C#1) | Toggle Recording |
| 38 (D1) | Toggle Fullscreen |

## MIDI Learn

To create custom mappings:

1. Open the browser console (F12)
2. Move a control on your MIDI device
3. Note the CC number logged
4. Edit the mapping in the HTML file

In `vertical-pulse-pro.html`, find the MIDI section:

```javascript
const midiMapping = {
  cc: {
    1: 'columnCount',
    2: 'columnWidth',
    3: 'noiseScale',
    4: 'blobCount',
    5: 'blobSize',
    6: 'colorShift'
  },
  notes: {
    36: 'playPause',
    37: 'record',
    38: 'fullscreen'
  }
};
```

Modify the numbers to match your controller.

## Common Controllers

### Akai APC Mini

| Control | CC/Note | Suggested Mapping |
|---------|---------|-------------------|
| Faders 1-8 | CC 48-55 | Visual parameters |
| Clip buttons | Notes 0-63 | Preset triggers |
| Scene buttons | Notes 82-89 | Actions |

### Novation Launchpad

| Control | Note Range | Suggested Mapping |
|---------|------------|-------------------|
| Grid | Notes 0-63 | Preset triggers |
| Side buttons | Notes 104-111 | Actions |

### Korg nanoKONTROL2

| Control | CC | Suggested Mapping |
|---------|-----|-------------------|
| Faders | CC 0-7 | Visual parameters |
| Knobs | CC 16-23 | Color/effect params |
| S/M/R buttons | CC 32-47 | Actions/presets |

## Troubleshooting

### Controller not detected

1. **Check browser** - Chrome has best MIDI support
2. **Check connection** - Try a different USB port
3. **Check drivers** - Some controllers need drivers installed
4. **Refresh page** - After connecting, reload the visualizer

### Permission denied

Chrome requires explicit permission for MIDI:

1. Click the lock icon in the address bar
2. Find "MIDI devices" permission
3. Set to "Allow"
4. Reload the page

### Values jumping/glitching

Your CC might have a different range:

```javascript
// In the MIDI handler, scale 0-127 to parameter range
const value = (midiValue / 127) * (max - min) + min;
```

### Multiple devices connected

The visualizer uses the first detected device. To select a specific one, modify the MIDI initialization:

```javascript
navigator.requestMIDIAccess().then(access => {
  // Get all inputs
  const inputs = Array.from(access.inputs.values());

  // Find your device by name
  const myDevice = inputs.find(i => i.name.includes('nanoKONTROL'));

  if (myDevice) {
    myDevice.onmidimessage = handleMIDI;
  }
});
```

## Advanced: OSC Support

For Open Sound Control (OSC) support, you'll need a bridge:

1. Use [MIDIBridge](https://github.com/pablotron/midibridge) or similar
2. Route OSC messages to MIDI
3. sheep-viz receives standard MIDI

Native OSC support is on the roadmap.

## Testing MIDI

Use the browser console to verify MIDI is working:

```javascript
// List all MIDI devices
navigator.requestMIDIAccess().then(access => {
  for (let input of access.inputs.values()) {
    console.log('Input:', input.name, input.manufacturer);
    input.onmidimessage = e => console.log('MIDI:', e.data);
  }
});
```

Move controls on your device - you should see messages logged.
