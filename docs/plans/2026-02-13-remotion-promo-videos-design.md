# Remotion Promo Videos - Design Document

**Date:** 2026-02-13
**Project:** sheep-viz promotional video series for TikTok/Instagram Reels
**Format:** 5 separate videos, 15-30 seconds each, vertical 9:16

---

## Overview

Create a 5-video series promoting sheep-viz to musicians and DJs on TikTok and Instagram Reels. Videos will use a hybrid approach combining live-action footage (musician using MiniLab 3 MIDI controller) with screen recordings of sheep-viz in action. The series follows a "hook-first" narrative structure, leading with visuals before diving into the story and use cases.

---

## Target Audience

**Primary:** Musicians & DJs (performers)
- People who perform live and want to add another dimension to their shows
- Looking for visuals beyond basic house lights
- Frustrated with expensive, bloated VJ software
- Want instant, browser-based tools

**Key Messages:**
- No installation required (browser-based, zero friction)
- Free to use
- Made by a musician, not a tech company
- MIDI controller support
- "Add another dimension to your performances"

**Call to Action:** Try it now → sheep-xi.vercel.app

---

## Video Series Structure (Hook-First Approach)

### Video 1: WHAT (The Hook) - 20 seconds
**Goal:** Grab attention with visuals, establish "no install" value prop

### Video 2: ORIGIN (The Story) - 25 seconds
**Goal:** Personal connection, relatable musician frustration

### Video 3: WHY (The Problem) - 20 seconds
**Goal:** Contrast expensive/bloated tools with sheep-viz's simplicity

### Video 4: HOW TO USE (The Walkthrough) - 30 seconds
**Goal:** Show how easy it is to get started

### Video 5: WHO (The Audience + CTA) - 25 seconds
**Goal:** Call out the audience, drive traffic

---

## Technical Specifications

### Format
- **Aspect ratio:** 9:16 vertical (mobile-first)
- **Resolution:** 1080x1920px
- **Frame rate:** 30fps
- **Duration:** 15-30 seconds per video
- **File size target:** 5-15 MB per video
- **Bitrate:** ~5 Mbps

### Tech Stack
- Remotion (React-based video framework)
- TypeScript
- Major Mono Display font (matches sheep-viz branding)
- Screen recordings from Control Room
- Live action footage (5 camera angles)

### Project Structure
```
sheep/
├── remotion/
│   ├── src/
│   │   ├── Video1-What.tsx
│   │   ├── Video2-Origin.tsx
│   │   ├── Video3-Why.tsx
│   │   ├── Video4-HowToUse.tsx
│   │   ├── Video5-Who.tsx
│   │   ├── components/
│   │   │   ├── SplitScreen.tsx
│   │   │   ├── TypeOnText.tsx
│   │   │   ├── GlitchTransition.tsx
│   │   │   ├── NeonText.tsx
│   │   │   ├── FullscreenText.tsx
│   │   │   └── EndCard.tsx
│   │   └── Root.tsx
│   ├── public/
│   │   ├── assets/
│   │   │   ├── sheep-logo.png
│   │   │   ├── control-room-recording.mp4
│   │   │   ├── viz-clips/
│   │   │   ├── hands-minilab.mp4
│   │   │   ├── webcam-segments.mp4
│   │   │   └── winamp-screenshot.png
│   │   └── fonts/
│   │       └── MajorMonoDisplay.ttf
│   └── package.json
```

---

## Visual Treatment

### Overall Aesthetic: Raw & DIY
- Screen recordings with visible browser chrome (URL bar, tabs)
- Minimal post-production - no fancy motion graphics
- Glitchy transitions matching visualizer aesthetic
- Handheld/authentic feel - cursor visible, real interactions
- Live-action footage of actual musician using the tool

### Split-Screen Composition (Primary Layout)

```
┌─────────────────────────┐
│                         │
│    VISUALIZER           │  ← Top 60%: Screen capture
│    (sheep-viz output)   │     Shows visualizers reacting
│                         │
├─────────────────────────┤
│                         │
│  HANDS + CONTROLS       │  ← Bottom 40%: Cam 2 (close-up)
│  (MiniLab + keyboard)   │     Shows musician playing
│                         │
└─────────────────────────┘
```

**When to break split-screen:**
- Full-screen visualizer for big moments (drops, transitions)
- Full-screen face (webcam) for direct-to-camera storytelling
- Full-screen detail shots for emphasis

### Camera Setup (5 Angles)

1. **Webcam (Cam 0):** Face/reaction shots, direct to camera
2. **Cam 1 - Wide:** Full desk setup (monitors, MiniLab 3, keyboard, musician)
3. **Cam 2 - Close-up:** Hands on MiniLab (knobs twisting, pads hitting) - PRIMARY for split-screen
4. **Cam 3 - Over-shoulder:** Screen + hands in frame
5. **Cam 4 - Detail/Side:** Keyboard typing, mouse clicks, side profile

**Lighting:** Natural/practical (desk lamp, monitor glow) - authentic, not studio-lit

### Typography
- **Font:** Major Mono Display (matches sheep-viz branding)
- **Style:** lowercase, monospace, tech-y but not corporate
- **Color:** White text (#e8e8ed) with subtle glow/shadow for readability
- **Animation:** Type-on effect (characters appear sequentially)

### Color Palette
- Background: #0a0a0f (sheep-viz dark)
- Accent: #6366f1 (indigo)
- Text: #e8e8ed (off-white)
- Highlights: Neon colors from visualizers (#ec4899 pink, #06b6d4 cyan)

### Transitions
- **Glitch cuts:** Horizontal RGB split, brief static
- **Hard cuts:** No smooth fades - keeps energy high
- **Visualizer crossfades:** When showing Control Room feature

### Text Animation Patterns
- **Type-on:** Characters appear sequentially
- **Fade + scale:** Key CTAs pop in with slight scale (1.0 → 1.05)
- **Flicker:** Neon-style flicker on first appearance (1-2 frames)

---

## Audio Strategy

### Music Selection
**Recommendation:** Use actual tracks from sheep.band
- Authentic, on-brand, cross-promotional
- Shows visualizers with real music from creator
- Builds Sheep brand alongside sheep-viz

**Fallback:** Royalty-free electronic/beats if Sheep tracks unavailable

### Sound Design
- **Typing sounds:** Subtle mechanical keyboard clicks when text types
- **Glitch SFX:** Brief digital noise/static during transitions
- **UI sounds:** Soft clicks/beeps for Control Room interactions (very subtle)
- **Bass drops:** Sync visualizer reactions to music drops

**No voiceover** - text-only keeps it raw/DIY

### Audio Mix
- Music: 70% volume (primary)
- Sound design: 30% volume (accents)
- Music starts at 0s (no silent intro)
- Clean cut at end (no trails)

### Music Per Video
1. **Video 1 (What):** Upbeat, energetic - hook immediately
2. **Video 2 (Origin):** Mellower, reflective - storytelling mood
3. **Video 3 (Why):** Driving beat - tension (problem) → release (solution)
4. **Video 4 (How To Use):** Mid-tempo, tutorial-friendly
5. **Video 5 (Who/CTA):** High energy closer - motivate action

---

## Detailed Storyboards

### Video 1: WHAT (The Hook) - 20 seconds

| Time | Layout | Top Half | Bottom Half | Text/Audio |
|------|--------|----------|-------------|------------|
| 0-3s | Split | Fluid Flow visualizer reacting | Hands hit pads on MiniLab | Music starts |
| 3-6s | Split | Crossfade to Spilled Milk | Hands twist knobs | "Add another dimension to your live shows" |
| 6-10s | Split | Visualizer pulses to bass | Hands slide faders | - |
| 10-14s | Full | Browser URL bar visible, visualizer running | - | "Runs in your browser" |
| 14-17s | Split | Geist visualizer | Hands back on MiniLab | "No download" |
| 17-20s | Full | sheep-viz logo on black | - | "No bullshit" |

**Key shots to capture:**
- Fluid Flow reacting to bass
- Spilled Milk morphing patterns
- Geist tunnel effects
- Hands hitting MiniLab pads (multiple takes)
- Hands twisting knobs smoothly
- Browser with sheep-xi.vercel.app URL visible

---

### Video 2: ORIGIN (The Story) - 25 seconds

| Time | Layout | Top Half | Bottom Half | Text/Audio |
|------|--------|----------|-------------|------------|
| 0-5s | Full | Webcam - talking to camera | - | "I'm a musician." (types on) |
| 5-10s | Full | Winamp/Milkdrop screenshot | - | "I missed this." |
| 10-15s | Full | Expensive VJ software screenshots | - | "VJ software costs $$$" |
| 15-20s | Split | sheep-viz loading in browser | Hands typing on keyboard | "So I built this" |
| 20-25s | Full | sheep.band logo | - | "Made by musicians, for musicians" |

**Key shots to capture:**
- Webcam: Casual, authentic, eye contact
- Hands typing (keyboard close-up)
- sheep-viz Control Room loading

**Assets needed:**
- Winamp screenshot (find archival image)
- Resolume/VDMX pricing pages (screenshot)
- sheep.band logo

---

### Video 3: WHY (The Problem) - 20 seconds

| Time | Layout | Top Half | Bottom Half | Text/Audio |
|------|--------|----------|-------------|------------|
| 0-5s | Full | Webcam - setting up problem | - | "Your live shows deserve more than house lights." |
| 5-10s | Full | Installation screens, bloatware | - | "But VJ software is expensive, bloated, complicated." |
| 10-13s | Split | Browser address bar, typing URL | Hands typing | - |
| 13-16s | Split | sheep-viz loads instantly | Hands hover over mouse | "sheep-viz:" |
| 16-20s | Split | Visualizer starts | Hand hits play | "Free. Instant." |

**Key shots to capture:**
- Webcam: Frustrated expression, relatable
- Typing sheep-xi.vercel.app URL
- Instant page load (no spinner, just appears)
- Hand clicking play button

**Assets needed:**
- Software installation progress bars (mock or screenshot)
- License activation screens

---

### Video 4: HOW TO USE (Walkthrough) - 30 seconds

| Time | Layout | Top Half | Bottom Half | Text/Audio |
|------|--------|----------|-------------|------------|
| 0-5s | Full | Webcam - casual intro | - | "How to use sheep-viz:" |
| 5-10s | Split | Browser → URL typed → enter | Hands typing | "Step 1: Open URL" |
| 10-15s | Split | Control Room interface, audio sources | Hands on mouse | "Step 2: Load audio" |
| 15-20s | Split | Click visualizer from grid | Hands point/click | "Step 3: Pick visualizer" |
| 20-25s | Split | Knobs adjust in real-time | Hands twist MiniLab knobs | "Step 4: MIDI control" |
| 25-28s | Full | Visualizer goes fullscreen | - | "Step 5: Fullscreen" |
| 28-30s | Split | Visualizer running | Hands up, "done" gesture | "You're live." |

**Key shots to capture:**
- Clean screen recording of each step
- File picker opening
- Mic icon click
- System audio icon click
- Visualizer grid hover/click
- Knobs turning with visible parameter change
- F key press → fullscreen transition
- "Done" gesture (hands up, satisfied)

---

### Video 5: WHO (Audience + CTA) - 25 seconds

| Time | Layout | Top Half | Bottom Half | Text/Audio |
|------|--------|----------|-------------|------------|
| 0-5s | Full | Webcam - direct to camera | - | "This is for you if you want to:" |
| 5-10s | Split | Visualizer reacting to music | Hands performing on MiniLab | "Add another dimension to your performances" |
| 10-15s | Split | Crossfade between visualizers | Hands switching, mixing | "Transform your space, not just light it" |
| 15-20s | Full | Simple browser UI | - | "Do it without expensive software" |
| 20-25s | Split | URL visible on screen | Hand pointing at screen | "Try it now → sheep-xi.vercel.app" |

**Key shots to capture:**
- Webcam: Inviting, friendly, direct address
- Hands "performing" (energetic knob twisting, pad hitting)
- Visualizer crossfade in Control Room
- Hand pointing at screen (show URL clearly)

---

## Asset Capture Checklist

### Screen Recordings (Control Room)
- [ ] Full interface overview (5 min, various interactions)
- [ ] Fluid Flow visualizer (20s)
- [ ] Spilled Milk visualizer (20s)
- [ ] Geist visualizer (20s)
- [ ] Crossfade between visualizers (10s)
- [ ] Browser URL bar visible while running (10s)
- [ ] Typing sheep-xi.vercel.app in address bar (5s)
- [ ] Clicking audio file picker (5s)
- [ ] Clicking microphone icon (5s)
- [ ] Clicking system audio icon (5s)
- [ ] Selecting visualizer from grid (5s)
- [ ] Knobs/faders moving in UI as MIDI controls (30s)
- [ ] Fullscreen transition (F key press) (5s)

### Live Action Footage
- [ ] Webcam: Direct-to-camera segments (~5 min total, edit down)
  - Casual intro vibe
  - Frustrated expression (for origin story)
  - Satisfied/proud expression
  - Inviting/friendly CTA
- [ ] Cam 2 (Close-up): Hands on MiniLab 3 (~3 min total)
  - Hitting pads (multiple takes)
  - Twisting knobs smoothly
  - Sliding faders
  - "Performing" energetically
  - Resting/hovering
  - "Done" gesture (hands up)
- [ ] Cam 4 (Detail): Keyboard typing (~1 min)
  - Typing URL
  - General typing motion
- [ ] Cam 1 (Wide): Full setup shot (30s)
  - Sitting down at desk
  - Full rig visible (monitors, MiniLab, keyboard)
- [ ] Cam 3 (Over-shoulder): Optional angles (1 min)

### Graphics Assets
- [ ] sheep-viz logo (`/images/sheep-logo.png` - already exists)
- [ ] sheep.band logo (check if exists, or create)
- [ ] Winamp screenshot (source from web archive)
- [ ] Milkdrop reference image
- [ ] VJ software pricing screenshots (Resolume, VDMX, etc.)
- [ ] Software installation progress bar (mock or screenshot)
- [ ] License activation screen (mock)

### Audio Assets
- [ ] 5 music tracks from sheep.band (or royalty-free alternatives)
  - Track 1: Upbeat, energetic (Video 1)
  - Track 2: Mellower, reflective (Video 2)
  - Track 3: Driving beat (Video 3)
  - Track 4: Mid-tempo (Video 4)
  - Track 5: High energy (Video 5)
- [ ] Optional: Sound effects (typing, glitch, UI clicks)

---

## Remotion Components to Build

### Core Components

**`<SplitScreen>`**
- Props: `topVideo`, `bottomVideo`, `split` (0-1, where 0.6 = 60% top)
- Stacks two video sources vertically
- Configurable split ratio

**`<TypeOnText>`**
- Props: `text`, `startFrame`, `durationFrames`, `style`
- Reveals text character-by-character
- Configurable timing per character

**`<GlitchTransition>`**
- Props: `fromFrame`, `toFrame`, `durationFrames`
- RGB channel split effect
- Brief static/noise overlay

**`<NeonText>`**
- Props: `text`, `color`, `glowIntensity`, `flicker`
- Text with glow effect
- Optional flicker animation on appear

**`<FullscreenText>`**
- Props: `text`, `style`, `animation` ('fade' | 'scale' | 'type')
- Centered text overlays
- Multiple animation options

**`<EndCard>`**
- Props: `logoSrc`, `url`, `tagline`
- Standard end card with logo + URL
- Fade in animation

---

## Implementation Plan

### Phase 1: Setup & Asset Capture
1. Create Remotion project
2. Capture all screen recordings
3. Film all live action footage
4. Source/create graphics assets
5. Prepare music tracks

### Phase 2: Component Development
1. Build `<SplitScreen>` component
2. Build `<TypeOnText>` component
3. Build `<GlitchTransition>` component
4. Build `<NeonText>` and `<FullscreenText>` components
5. Build `<EndCard>` component

### Phase 3: Video Assembly
1. Video 1: WHAT
2. Video 2: ORIGIN
3. Video 3: WHY
4. Video 4: HOW TO USE
5. Video 5: WHO

### Phase 4: Review & Iteration
1. Preview all 5 videos
2. Adjust timing, transitions
3. Fine-tune audio mix
4. Color grade if needed

### Phase 5: Render & Export
1. Render all 5 videos at 1080x1920, 30fps
2. Test on mobile devices
3. Optimize file sizes if needed
4. Prepare for upload (captions, hashtags)

---

## Post-Implementation: Watermark Feature

**NOTE:** Before releasing these videos, implement YouTube-style channel watermark feature in sheep-viz Control Room:
- Bottom-right logo overlay
- Upload UI in Control Room
- Size/opacity/position controls
- Persists across visualizers
- Shows in fullscreen/popout
- Can be toggled on/off

This feature should be implemented and showcased in the videos.

---

## Success Metrics

**Goals:**
- Drive traffic to sheep-xi.vercel.app
- Build brand awareness for Sheep and sheep-viz
- Demonstrate value prop (no install, free, made by musicians)
- Show off Control Room features and MIDI control

**Target Engagement:**
- High watch-through rate (80%+, videos are short)
- Saves/shares (indicates value/utility)
- Click-through to link in bio
- Comments from musicians/DJs asking questions or sharing experiences

---

## Next Steps

1. Approve this design document
2. Create detailed implementation plan (writing-plans skill)
3. Implement watermark feature
4. Capture assets (screen recordings + live footage)
5. Build Remotion components
6. Assemble videos
7. Review and iterate
8. Render and publish

---

**Design approved:** [Pending]
**Implementation plan:** [Next phase]
