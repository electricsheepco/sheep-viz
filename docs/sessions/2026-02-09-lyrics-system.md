# Session: Lyrics System + Control Room Discoverability

**Date:** 2026-02-09
**Commit:** aef17f7

## Summary

Added karaoke-style lyrics overlay system with LRC parsing, tap-sync, and real-time broadcast to visualizer iframes. Added Control Room discoverability via top-bar nav link, full-width featured card, and footer link on the landing page.

## Changes

| File | Change |
|------|--------|
| lib/lyrics-engine.js | New: LyricsEngine class with LRC parsing, plain text, tap-sync, getState(), exportLRC() |
| lib/embed-adapter.js | Added LyricsRenderer overlay canvas, 'lyrics' message handler, karaoke wipe rendering |
| control-room.html | Lyrics panel (View/Edit/Tap Sync tabs), top bar section, broadcast integration, L key shortcut |
| index.html | Top bar "control room" nav link, full-width featured card with fader SVG, footer link |
| sw.js | Bumped cache to v3, added lyrics-engine.js to precache |

## Deployment

- Preview: https://sheep-hoh2tlfky-essco.vercel.app
- Production: https://sheep-xi.vercel.app
