# 2026-02-18 - Remotion Components

## Session Summary
Built the missing Remotion animation components for the sheep-viz promo video series (5 TikTok/Reels vertical videos). The scaffold from 2026-02-13 had placeholder compositions; this session added real animation components and wired them into all 5 videos.

## What Got Done
- [x] Built `TypeOnText` — char-by-char type-on with blinking cursor
- [x] Built `GlitchTransition` — white flash + RGB channel split at scene cuts
- [x] Built `NeonText` — glowing text with breathing flicker (used in EndCard)
- [x] Created `src/lib/fonts.ts` — loads Major Mono Display TTF via FontFace API + delayRender
- [x] Fixed `Screenshot` — fallback was rendering ON TOP of image (bug); switched to native `<img>` with `onError` so missing screenshots show fallback instead of crashing preview
- [x] Fixed `FullscreenText` — renamed `durationFrames` → `durationInFrames`, added fade-out
- [x] Updated `EndCard` — fade-in animation for logo + scale, NeonText for URL
- [x] Updated all 5 compositions to use `TypeOnText` for key lines and `GlitchTransition` at every scene boundary
- [x] Excluded `remotion-template/` from tsconfig (stale copy was causing TS errors)
- [x] TypeScript clean, Remotion studio starts OK

## TODO (Next Session)
- [ ] Capture browser/UI screenshots of sheep-viz (see `SCREENSHOTS-NEEDED.md`)
- [ ] Film live action footage (MiniLab 3 hands, webcam segments)
- [ ] Source assets: Winamp screenshot, VJ software pricing, stock photos
- [ ] Tune timing per composition after seeing real assets
- [ ] Consider `@remotion/transitions` for more polished scene transitions

## Key Files
- `remotion/src/components/TypeOnText.tsx` — core type-on animation
- `remotion/src/components/GlitchTransition.tsx` — scene cut effect
- `remotion/src/components/NeonText.tsx` — glowing CTA text
- `remotion/src/components/Screenshot.tsx` — fallback-first, native img
- `remotion/src/lib/fonts.ts` — FontFace + delayRender font loader
- `remotion/SCREENSHOTS-NEEDED.md` — asset capture checklist

## Links
- Live: https://sheep-xi.vercel.app
- Remotion studio: http://localhost:3001

## Tags
#sheep-viz #remotion #video #animation
