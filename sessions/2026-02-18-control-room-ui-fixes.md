# Session: Control Room UI Fixes

**Date:** 2026-02-18
**Commit:** cecbcd1

## Summary

Fixed two Control Room issues visible in screenshots. On cold start (no viz selected), the PARAMETERS and FADERS sections were empty — now show 8 placeholder knobs and 4 faders immediately. The "Hardware View" band was bleeding through from older visualizers (like Starfield) because they use `#hardware-bar` (ID) and `.mode-toggle` (class) rather than the newer `.hardware-bar` / `.hardware-toggle` selectors the embed adapter was hiding.

## Changes

| File | Change |
|------|--------|
| `control-room.html` | Call `rebuildControls()` on page load with default 8 knobs + 4 faders |
| `lib/embed-adapter.js` | Add `#hardware-bar` and `.mode-toggle` to hidden selectors |

## Deployment

- Preview: https://sheep-6kgsrzvj9-essco.vercel.app
- Production: https://sheep-xi.vercel.app
