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
