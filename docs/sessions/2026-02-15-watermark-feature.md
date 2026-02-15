# Session: YouTube-Style Watermark Feature

**Date:** 2026-02-15
**Feature:** Customizable band logo watermark

## Implementation

Added watermark upload UI to Control Room bottom bar with:
- Upload button (file picker)
- Visibility toggle (eye icon)
- Size slider (20-100px)
- Opacity slider (20-100%)
- Reset button (back to sheep logo)

Settings persist via localStorage and sync to visualizers via postMessage.
embed-adapter.js listens for watermark messages and updates hardware-controls dynamically.

## Files Modified

- `control-room.html` - Added UI, state management, event handlers
- `lib/embed-adapter.js` - Added watermark message listener
- `lib/hardware-controls.css` - Added smooth transitions

## Architecture

- **Control Room owns state** - watermarkState object (logo, size, opacity, visible)
- **localStorage persistence** - 4 keys (watermark_logo, watermark_size, watermark_opacity, watermark_visible)
- **postMessage sync** - sendWatermarkToViz() broadcasts to iframe
- **embed-adapter receives** - applyWatermarkSettings() updates DOM
- **hardware-controls displays** - setLogo() API + .sheep-watermark element

## Default Values

- Logo: icon.svg (sheep round logo) as base64
- Size: 40px (range 20-100)
- Opacity: 50% (range 20-100)
- Visible: true

## Testing

All features tested in Chrome. Works in fullscreen, popout, and controls popout modes.

## Commits

1. df4bdaa - Add watermark UI section to Control Room bottom bar
2. 6e936d1 - Add watermark state management and initialization
3. b4018af - Add watermark logo upload handler with size validation
4. e314cad - Add watermark size and opacity slider handlers
5. 46e3251 - Add watermark visibility toggle and reset handlers
6. 4df31d2 - Send watermark config when switching visualizers
7. b663541 - Add watermark message listener to embed adapter
8. 53122b1 - Add smooth transitions for watermark size and opacity
