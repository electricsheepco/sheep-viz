# Session: Control Room Overhaul

**Date:** 2026-02-10
**Commit:** 03b9440

## Summary

Redesigned Control Room with a bottom bar layout. Viz grid, knobs, faders, presets, overlay, and lyrics controls all consolidated into the bottom bar. Added crossfade transitions between visualizers, popout fullscreen with controller mode (enlarged controls when viz is popped out), dynamic fader heights, tooltip system, and canvas sizing fix in embed adapter.

## Changes

| File | Change |
|------|--------|
| control-room.html | Major layout overhaul: sidebar removed, everything in bottom bar. Added crossfade, controller mode, tooltips, section dividers. Bigger knobs/faders/presets. |
| lib/embed-adapter.js | Added canvas sizing rules for p5.js canvases in embed mode |

## Deployment

- Preview: https://sheep-8g46weh5g-essco.vercel.app
- Production: https://sheep-xi.vercel.app

---

# Session: Controls Popout + Vertical Pulse Fix

**Date:** 2026-02-10
**Commit:** 7caab6a

## Summary

Popout now opens two windows: fullscreen viz + separate controls window with the bottom bar. Controls use DOM reparenting so all interactions stay wired. Fixed Vertical Pulse canvas to use responsive container sizing instead of hardcoded 1200x800.

## Changes

| File | Change |
|------|--------|
| control-room.html | Replaced controller-mode with controls popout window. Added $id()/$$ helpers for cross-document element lookup. Fixed drag events with ownerDocument. Accent color sync to popout. Keyboard forwarding. |
| visualizers/vertical-pulse-pro.html | Responsive canvas: container dimensions + windowResized() handler |
| visualizers/vertical-pulse.html | Responsive canvas: container dimensions + windowResized() handler |

## Deployment

- Preview: https://sheep-q2wsv2yh3-essco.vercel.app
- Production: https://sheep-xi.vercel.app
