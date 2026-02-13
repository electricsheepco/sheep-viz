# Remotion Promo Videos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 5 promotional videos (15-30s each) for sheep-viz using Remotion, combining live-action footage with screen recordings for TikTok/Instagram Reels.

**Architecture:** Remotion React components for reusable video elements (split-screen layout, text animations, transitions). Videos composed from pre-recorded assets (screen captures + live footage) with programmatic text overlays and effects.

**Tech Stack:** Remotion 4.0, React 18, TypeScript 5, Major Mono Display font

---

## Prerequisites

**Before starting:**
- [ ] Watermark feature must be implemented first (see separate plan)
- [ ] All screen recordings captured with watermark visible
- [ ] All live action footage filmed (5 camera angles)
- [ ] Graphics assets sourced/created
- [ ] Music tracks selected (5 tracks, ~30s each)

---

## Phase 1: Project Setup

### Task 1: Initialize Remotion Project

**Files:**
- Create: `remotion/` (entire project directory)

**Step 1: Create Remotion project**

```bash
cd /Volumes/zodlightning/sites/sheep
npx create-video@latest remotion
# Select: TypeScript, blank template
```

Expected: New `remotion/` directory created with boilerplate

**Step 2: Install dependencies**

```bash
cd remotion
npm install
```

Expected: Dependencies installed successfully

**Step 3: Test dev server**

```bash
npm run dev
```

Expected: Browser opens to `http://localhost:3000` with Remotion Studio

**Step 4: Commit**

```bash
git add remotion/
git commit -m "feat: initialize Remotion project for promo videos"
```

---

### Task 2: Setup Project Structure

**Files:**
- Create: `remotion/public/assets/` (directory)
- Create: `remotion/public/assets/viz-clips/` (directory)
- Create: `remotion/public/fonts/` (directory)
- Create: `remotion/src/components/` (directory)

**Step 1: Create asset directories**

```bash
cd remotion
mkdir -p public/assets/viz-clips
mkdir -p public/fonts
mkdir -p src/components
```

Expected: Directories created

**Step 2: Download Major Mono Display font**

```bash
# Download from Google Fonts
curl -o public/fonts/MajorMonoDisplay-Regular.ttf \
  "https://github.com/google/fonts/raw/main/ofl/majormonodisplay/MajorMonoDisplay-Regular.ttf"
```

Expected: Font file downloaded to `remotion/public/fonts/`

**Step 3: Copy sheep logo**

```bash
cp ../images/sheep-logo.png public/assets/sheep-logo.png
```

Expected: Logo copied to assets

**Step 4: Create .gitignore entries**

Edit `remotion/.gitignore`, add:
```
# Large video files
public/assets/*.mp4
public/assets/*.mov
public/assets/viz-clips/*.mp4

# Rendered outputs
out/
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: setup asset directories and download fonts"
```

---

### Task 3: Configure Remotion for Vertical Video

**Files:**
- Modify: `remotion/src/Root.tsx`

**Step 1: Update Root composition**

Replace `remotion/src/Root.tsx` with:

```tsx
import { Composition } from "remotion";
import { Video1What } from "./Video1-What";
import { Video2Origin } from "./Video2-Origin";
import { Video3Why } from "./Video3-Why";
import { Video4HowToUse } from "./Video4-HowToUse";
import { Video5Who } from "./Video5-Who";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video1-What"
        component={Video1What}
        durationInFrames={600} // 20s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video2-Origin"
        component={Video2Origin}
        durationInFrames={750} // 25s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video3-Why"
        component={Video3Why}
        durationInFrames={600} // 20s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video4-HowToUse"
        component={Video4HowToUse}
        durationInFrames={900} // 30s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video5-Who"
        component={Video5Who}
        durationInFrames={750} // 25s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
```

**Step 2: Commit**

```bash
git add src/Root.tsx
git commit -m "feat: configure vertical video compositions (1080x1920)"
```

---

## Phase 2: Asset Preparation

### Task 4: Organize Screen Recordings

**Files:**
- Add: `remotion/public/assets/control-room-*.mp4` (multiple files)

**Step 1: Capture screen recordings**

**MANUAL TASK:** Record the following using QuickTime/OBS:
- `control-room-overview.mp4` (5 min, various interactions)
- `fluid-flow-viz.mp4` (20s)
- `spilled-milk-viz.mp4` (20s)
- `geist-viz.mp4` (20s)
- `crossfade-demo.mp4` (10s)
- `browser-url-visible.mp4` (10s)
- `typing-url.mp4` (5s)
- `audio-file-picker.mp4` (5s)
- `audio-mic-click.mp4` (5s)
- `audio-system-click.mp4` (5s)
- `viz-grid-select.mp4` (5s)
- `midi-knobs-moving.mp4` (30s)
- `fullscreen-transition.mp4` (5s)

**Capture settings:**
- Resolution: 1920x1080 or higher (will be cropped/scaled)
- Frame rate: 30fps minimum
- Format: MP4 (H.264)
- Ensure watermark is visible in bottom-right

**Step 2: Place files in assets directory**

Move all captured files to `remotion/public/assets/`

**Step 3: Verify files**

```bash
ls -lh public/assets/*.mp4
```

Expected: All screen recording files listed

**Step 4: Commit (metadata only, files are gitignored)**

```bash
git add .gitignore
git commit -m "docs: add screen recording capture checklist"
```

---

### Task 5: Organize Live Action Footage

**Files:**
- Add: `remotion/public/assets/webcam-*.mp4` (multiple files)
- Add: `remotion/public/assets/hands-*.mp4` (multiple files)

**Step 1: Capture live action footage**

**MANUAL TASK:** Record with your 5-camera setup:

**Webcam (Cam 0):**
- `webcam-intro.mp4` (casual, looking at camera)
- `webcam-frustrated.mp4` (for origin story)
- `webcam-satisfied.mp4` (proud expression)
- `webcam-cta.mp4` (inviting, friendly)

**Cam 2 (Hands close-up):**
- `hands-hitting-pads.mp4` (multiple takes, varied intensity)
- `hands-twisting-knobs.mp4` (smooth, deliberate)
- `hands-sliding-faders.mp4` (multiple takes)
- `hands-performing.mp4` (energetic, live performance vibe)
- `hands-hovering.mp4` (resting, anticipation)
- `hands-done-gesture.mp4` (hands up, satisfied)

**Cam 4 (Keyboard detail):**
- `hands-typing-url.mp4` (typing sheep-xi.vercel.app)
- `hands-typing-general.mp4` (generic typing motion)

**Cam 1 (Wide shot):**
- `wide-sitting-down.mp4` (sit down at desk, start session)
- `wide-full-setup.mp4` (static shot of full rig)

**Capture settings:**
- Resolution: 1920x1080 minimum
- Frame rate: 30fps minimum
- Lighting: Natural/practical only
- Format: MP4

**Step 2: Place files in assets directory**

Move all files to `remotion/public/assets/`

**Step 3: Verify files**

```bash
ls -lh public/assets/webcam-*.mp4
ls -lh public/assets/hands-*.mp4
ls -lh public/assets/wide-*.mp4
```

Expected: All live action files listed

---

### Task 6: Gather Graphics Assets

**Files:**
- Add: `remotion/public/assets/winamp-screenshot.png`
- Add: `remotion/public/assets/resolume-pricing.png`
- Add: `remotion/public/assets/installation-screen.png`
- Add: `remotion/public/assets/sheep-band-logo.png`

**Step 1: Download Winamp screenshot**

Search web archive or Google Images for classic Winamp/Milkdrop screenshot.
Save as `public/assets/winamp-screenshot.png`

**Step 2: Screenshot VJ software pricing**

Visit resolume.com, vdmx.vidvox.net, screenshot pricing pages.
Save as `public/assets/resolume-pricing.png`

**Step 3: Mock software installation screen**

Create or find screenshot of generic software installation progress.
Save as `public/assets/installation-screen.png`

**Step 4: Verify sheep.band logo**

Check if `../images/` has sheep.band logo. If not, create one.
Copy to `public/assets/sheep-band-logo.png`

**Step 5: Commit (images may be small enough to commit)**

```bash
git add public/assets/*.png
git commit -m "feat: add graphics assets for promo videos"
```

---

### Task 7: Prepare Audio Tracks

**Files:**
- Add: `remotion/public/assets/track1-upbeat.mp3` (or .wav)
- Add: `remotion/public/assets/track2-reflective.mp3`
- Add: `remotion/public/assets/track3-driving.mp3`
- Add: `remotion/public/assets/track4-midtempo.mp3`
- Add: `remotion/public/assets/track5-closer.mp3`

**Step 1: Select 5 tracks**

**MANUAL TASK:** Choose 5 tracks from sheep.band releases:
- Track 1: Upbeat, energetic (~30s clip)
- Track 2: Mellower, reflective (~30s clip)
- Track 3: Driving beat (~30s clip)
- Track 4: Mid-tempo (~30s clip)
- Track 5: High energy closer (~30s clip)

**Step 2: Export 30-second clips**

Use Audacity/DAW to export 30s clips at:
- Format: MP3 or WAV
- Bitrate: 320kbps (MP3) or 44.1kHz/16-bit (WAV)
- Ensure clean start/end (no awkward fades)

**Step 3: Place in assets**

Move files to `remotion/public/assets/`

**Step 4: Verify**

```bash
ls -lh public/assets/*.mp3
```

Expected: 5 audio files listed

---

## Phase 3: Core Components

### Task 8: Build SplitScreen Component

**Files:**
- Create: `remotion/src/components/SplitScreen.tsx`

**Step 1: Create component file**

```tsx
import { AbsoluteFill, Video } from "remotion";

interface SplitScreenProps {
  topVideo: string;
  bottomVideo: string;
  split?: number; // 0-1, default 0.6 (60% top)
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  topVideo,
  bottomVideo,
  split = 0.6,
}) => {
  return (
    <AbsoluteFill>
      {/* Top video */}
      <AbsoluteFill
        style={{
          height: `${split * 100}%`,
          overflow: "hidden",
        }}
      >
        <Video
          src={topVideo}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* Bottom video */}
      <AbsoluteFill
        style={{
          top: `${split * 100}%`,
          height: `${(1 - split) * 100}%`,
          overflow: "hidden",
        }}
      >
        <Video
          src={bottomVideo}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

**Step 2: Test in Remotion Studio**

Create test composition in `src/Root.tsx`:

```tsx
<Composition
  id="Test-SplitScreen"
  component={() => (
    <SplitScreen
      topVideo="/assets/fluid-flow-viz.mp4"
      bottomVideo="/assets/hands-twisting-knobs.mp4"
    />
  )}
  durationInFrames={300}
  fps={30}
  width={1080}
  height={1920}
/>
```

Run `npm run dev` and verify split-screen layout works.

**Step 3: Commit**

```bash
git add src/components/SplitScreen.tsx src/Root.tsx
git commit -m "feat: add SplitScreen component for video layout"
```

---

### Task 9: Build TypeOnText Component

**Files:**
- Create: `remotion/src/components/TypeOnText.tsx`

**Step 1: Create component with animation**

```tsx
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface TypeOnTextProps {
  text: string;
  startFrame?: number;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const TypeOnText: React.FC<TypeOnTextProps> = ({
  text,
  startFrame = 0,
  durationFrames,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate how many characters to show
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, text.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const visibleText = text.slice(0, Math.floor(progress));

  return (
    <div
      style={{
        fontFamily: "Major Mono Display, monospace",
        color: "#e8e8ed",
        textShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
        ...style,
      }}
    >
      {visibleText}
      {progress < text.length && (
        <span style={{ opacity: 0.5 }}>|</span> // Cursor blink
      )}
    </div>
  );
};
```

**Step 2: Add font loading to Root**

In `src/Root.tsx`, add to top:

```tsx
import { staticFile } from "remotion";

// Load font
const fontFace = new FontFace(
  "Major Mono Display",
  `url(${staticFile("fonts/MajorMonoDisplay-Regular.ttf")})`
);
fontFace.load().then((font) => {
  document.fonts.add(font);
});
```

**Step 3: Test component**

Add test composition:

```tsx
<Composition
  id="Test-TypeOn"
  component={() => (
    <AbsoluteFill style={{ background: "#0a0a0f", justifyContent: "center", alignItems: "center" }}>
      <TypeOnText
        text="I'm a musician."
        durationFrames={60}
        style={{ fontSize: 40 }}
      />
    </AbsoluteFill>
  )}
  durationInFrames={90}
  fps={30}
  width={1080}
  height={1920}
/>
```

Run `npm run dev` and verify text types on character by character.

**Step 3: Commit**

```bash
git add src/components/TypeOnText.tsx src/Root.tsx
git commit -m "feat: add TypeOnText component with cursor blink"
```

---

### Task 10: Build NeonText Component

**Files:**
- Create: `remotion/src/components/NeonText.tsx`

**Step 1: Create component with glow**

```tsx
import { useCurrentFrame } from "remotion";

interface NeonTextProps {
  text: string;
  color?: string;
  glowIntensity?: number;
  flicker?: boolean;
  style?: React.CSSProperties;
}

export const NeonText: React.FC<NeonTextProps> = ({
  text,
  color = "#6366f1",
  glowIntensity = 20,
  flicker = false,
  style,
}) => {
  const frame = useCurrentFrame();

  // Flicker effect on first few frames
  const opacity = flicker && frame < 6
    ? frame % 2 === 0 ? 1 : 0.3
    : 1;

  return (
    <div
      style={{
        fontFamily: "Major Mono Display, monospace",
        color: color,
        textShadow: `
          0 0 ${glowIntensity}px ${color},
          0 0 ${glowIntensity * 2}px ${color},
          0 0 ${glowIntensity * 3}px ${color}
        `,
        opacity,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
```

**Step 2: Test component**

Add test composition:

```tsx
<Composition
  id="Test-Neon"
  component={() => (
    <AbsoluteFill style={{ background: "#0a0a0f", justifyContent: "center", alignItems: "center" }}>
      <NeonText
        text="sheep-viz"
        color="#ec4899"
        glowIntensity={30}
        flicker={true}
        style={{ fontSize: 60, textTransform: "lowercase" }}
      />
    </AbsoluteFill>
  )}
  durationInFrames={90}
  fps={30}
  width={1080}
  height={1920}
/>
```

Verify neon glow and flicker effect.

**Step 3: Commit**

```bash
git add src/components/NeonText.tsx src/Root.tsx
git commit -m "feat: add NeonText component with glow and flicker"
```

---

### Task 11: Build FullscreenText Component

**Files:**
- Create: `remotion/src/components/FullscreenText.tsx`

**Step 1: Create component with animation options**

```tsx
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

interface FullscreenTextProps {
  text: string;
  startFrame?: number;
  durationFrames: number;
  animation?: "fade" | "scale" | "type";
  style?: React.CSSProperties;
}

export const FullscreenText: React.FC<FullscreenTextProps> = ({
  text,
  startFrame = 0,
  durationFrames,
  animation = "fade",
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = animation === "scale"
    ? interpolate(
        frame,
        [startFrame, startFrame + 15],
        [1.05, 1.0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          fontFamily: "Major Mono Display, monospace",
          fontSize: 36,
          color: "#e8e8ed",
          textAlign: "center",
          textTransform: "lowercase",
          opacity,
          transform: `scale(${scale})`,
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          ...style,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

**Step 2: Test component**

Add test composition with both fade and scale animations.

**Step 3: Commit**

```bash
git add src/components/FullscreenText.tsx
git commit -m "feat: add FullscreenText component with fade/scale animations"
```

---

### Task 12: Build GlitchTransition Component

**Files:**
- Create: `remotion/src/components/GlitchTransition.tsx`

**Step 1: Create RGB split glitch effect**

```tsx
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";

interface GlitchTransitionProps {
  children: React.ReactNode;
  startFrame: number;
  durationFrames?: number;
}

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  children,
  startFrame,
  durationFrames = 10,
}) => {
  const frame = useCurrentFrame();

  const isGlitching =
    frame >= startFrame && frame < startFrame + durationFrames;

  if (!isGlitching) {
    return <>{children}</>;
  }

  const glitchProgress = (frame - startFrame) / durationFrames;

  // RGB channel offsets
  const offsetR = interpolate(glitchProgress, [0, 0.5, 1], [0, 20, 0]);
  const offsetB = interpolate(glitchProgress, [0, 0.5, 1], [0, -20, 0]);

  return (
    <AbsoluteFill>
      {/* Red channel */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          filter: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="red"><feColorMatrix values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter></svg>#red')`,
          transform: `translateX(${offsetR}px)`,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Green channel (no offset) */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          filter: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="green"><feColorMatrix values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter></svg>#green')`,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Blue channel */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          filter: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="blue"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter></svg>#blue')`,
          transform: `translateX(${offsetB}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

**Step 2: Test glitch effect**

Add test composition showing glitch on a video clip.

**Step 3: Commit**

```bash
git add src/components/GlitchTransition.tsx
git commit -m "feat: add GlitchTransition component with RGB split effect"
```

---

### Task 13: Build EndCard Component

**Files:**
- Create: `remotion/src/components/EndCard.tsx`

**Step 1: Create end card with logo + URL**

```tsx
import { AbsoluteFill, Img, useCurrentFrame, interpolate, staticFile } from "remotion";

interface EndCardProps {
  logoSrc: string;
  url: string;
  tagline?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  logoSrc,
  url,
  tagline,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0f",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <Img
        src={staticFile(logoSrc)}
        style={{
          width: 200,
          height: 200,
          marginBottom: 40,
        }}
      />
      <div
        style={{
          fontFamily: "Major Mono Display, monospace",
          fontSize: 24,
          color: "#e8e8ed",
          textAlign: "center",
          textTransform: "lowercase",
          marginBottom: 20,
        }}
      >
        {url}
      </div>
      {tagline && (
        <div
          style={{
            fontFamily: "Major Mono Display, monospace",
            fontSize: 12,
            color: "#8888a0",
            textAlign: "center",
            textTransform: "lowercase",
          }}
        >
          {tagline}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

**Step 2: Test end card**

Add test composition.

**Step 3: Commit**

```bash
git add src/components/EndCard.tsx
git commit -m "feat: add EndCard component for video outros"
```

---

## Phase 4: Video Assembly

### Task 14: Build Video 1 - WHAT (The Hook)

**Files:**
- Create: `remotion/src/Video1-What.tsx`

**Step 1: Create composition file**

```tsx
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";

export const Video1What: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("assets/track1-upbeat.mp3")} />

      {/* 0-3s: Split - Fluid Flow + hands hitting pads */}
      <Sequence from={0} durationInFrames={90}>
        <SplitScreen
          topVideo={staticFile("assets/fluid-flow-viz.mp4")}
          bottomVideo={staticFile("assets/hands-hitting-pads.mp4")}
        />
      </Sequence>

      {/* 3-6s: Split - Spilled Milk + hands twisting knobs */}
      <Sequence from={90} durationInFrames={90}>
        <SplitScreen
          topVideo={staticFile("assets/spilled-milk-viz.mp4")}
          bottomVideo={staticFile("assets/hands-twisting-knobs.mp4")}
        />
        <FullscreenText
          text="Add another dimension to your live shows"
          startFrame={0}
          durationFrames={90}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      {/* 6-10s: Split - visualizer pulses + hands sliding faders */}
      <Sequence from={180} durationInFrames={120}>
        <SplitScreen
          topVideo={staticFile("assets/spilled-milk-viz.mp4")}
          bottomVideo={staticFile("assets/hands-sliding-faders.mp4")}
        />
      </Sequence>

      {/* 10-14s: Full - browser with URL visible */}
      <Sequence from={300} durationInFrames={120}>
        <AbsoluteFill>
          <video
            src={staticFile("assets/browser-url-visible.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
        <FullscreenText
          text="Runs in your browser"
          startFrame={30}
          durationInFrames={90}
          style={{ fontSize: 40, top: "30%" }}
        />
      </Sequence>

      {/* 14-17s: Split - Geist + hands on MiniLab */}
      <Sequence from={420} durationInFrames={90}>
        <SplitScreen
          topVideo={staticFile("assets/geist-viz.mp4")}
          bottomVideo={staticFile("assets/hands-twisting-knobs.mp4")}
        />
        <FullscreenText
          text="No download"
          startFrame={0}
          durationInFrames={90}
          style={{ fontSize: 40, top: "30%" }}
        />
      </Sequence>

      {/* 17-20s: End card */}
      <Sequence from={510} durationInFrames={90}>
        <EndCard
          logoSrc="assets/sheep-logo.png"
          url="sheep-xi.vercel.app"
          tagline="no bullshit"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Step 2: Test in Remotion Studio**

Run `npm run dev`, select "Video1-What", verify timing and transitions.

**Step 3: Adjust timing if needed**

Fine-tune sequence start frames and durations based on preview.

**Step 4: Commit**

```bash
git add src/Video1-What.tsx
git commit -m "feat: assemble Video 1 (What/Hook) with split-screen and text overlays"
```

---

### Task 15: Build Video 2 - ORIGIN (The Story)

**Files:**
- Create: `remotion/src/Video2-Origin.tsx`

**Step 1: Create composition**

```tsx
import { AbsoluteFill, Audio, Sequence, Video, staticFile } from "remotion";
import { TypeOnText } from "./components/TypeOnText";
import { FullscreenText } from "./components/FullscreenText";
import { SplitScreen } from "./components/SplitScreen";
import { EndCard } from "./components/EndCard";

export const Video2Origin: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("assets/track2-reflective.mp3")} />

      {/* 0-5s: Webcam - "I'm a musician" */}
      <Sequence from={0} durationInFrames={150}>
        <Video
          src={staticFile("assets/webcam-intro.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <TypeOnText
            text="I'm a musician."
            startFrame={30}
            durationInFrames={60}
            style={{ fontSize: 40 }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* 5-10s: Winamp screenshot */}
      <Sequence from={150} durationInFrames={150}>
        <AbsoluteFill style={{ background: "#0a0a0f", justifyContent: "center", alignItems: "center" }}>
          <img
            src={staticFile("assets/winamp-screenshot.png")}
            style={{ maxWidth: "90%", maxHeight: "60%" }}
          />
        </AbsoluteFill>
        <FullscreenText
          text="I missed this."
          startFrame={30}
          durationInFrames={120}
          style={{ top: "80%", fontSize: 36 }}
        />
      </Sequence>

      {/* 10-15s: VJ software pricing */}
      <Sequence from={300} durationInFrames={150}>
        <AbsoluteFill style={{ background: "#0a0a0f", justifyContent: "center", alignItems: "center" }}>
          <img
            src={staticFile("assets/resolume-pricing.png")}
            style={{ maxWidth: "90%", maxHeight: "60%" }}
          />
        </AbsoluteFill>
        <FullscreenText
          text="VJ software costs $$$"
          startFrame={30}
          durationInFrames={120}
          style={{ top: "80%", fontSize: 32 }}
        />
      </Sequence>

      {/* 15-20s: Split - sheep-viz loading + hands typing */}
      <Sequence from={450} durationInFrames={150}>
        <SplitScreen
          topVideo={staticFile("assets/browser-url-visible.mp4")}
          bottomVideo={staticFile("assets/hands-typing-url.mp4")}
        />
        <FullscreenText
          text="So I built this"
          startFrame={60}
          durationInFrames={90}
          style={{ fontSize: 40, top: "30%" }}
        />
      </Sequence>

      {/* 20-25s: End card with sheep.band branding */}
      <Sequence from={600} durationInFrames={150}>
        <EndCard
          logoSrc="assets/sheep-band-logo.png"
          url="sheep.band"
          tagline="made by musicians, for musicians"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Step 2: Test and adjust timing**

**Step 3: Commit**

```bash
git add src/Video2-Origin.tsx
git commit -m "feat: assemble Video 2 (Origin) with personal story narrative"
```

---

### Task 16: Build Video 3 - WHY (The Problem)

**Files:**
- Create: `remotion/src/Video3-Why.tsx`

**Step 1: Create composition** (Following similar pattern to Video 1 & 2)

**Step 2: Test and adjust**

**Step 3: Commit**

```bash
git add src/Video3-Why.tsx
git commit -m "feat: assemble Video 3 (Why) contrasting bloated software with sheep-viz"
```

---

### Task 17: Build Video 4 - HOW TO USE (Walkthrough)

**Files:**
- Create: `remotion/src/Video4-HowToUse.tsx`

**Step 1: Create composition with 5 steps**

**Step 2: Test and adjust**

**Step 3: Commit**

```bash
git add src/Video4-HowToUse.tsx
git commit -m "feat: assemble Video 4 (How To Use) with step-by-step walkthrough"
```

---

### Task 18: Build Video 5 - WHO (Audience + CTA)

**Files:**
- Create: `remotion/src/Video5-Who.tsx`

**Step 1: Create composition with audience call-out**

**Step 2: Test and adjust**

**Step 3: Commit**

```bash
git add src/Video5-Who.tsx
git commit -m "feat: assemble Video 5 (Who) with CTA and URL"
```

---

## Phase 5: Render & Export

### Task 19: Test Renders

**Files:**
- Create: `remotion/out/` (directory for renders)

**Step 1: Render Video 1 as test**

```bash
npx remotion render Video1-What out/video1-test.mp4
```

Expected: Renders successfully, ~5-15 MB file

**Step 2: Verify output**

```bash
open out/video1-test.mp4
```

Check:
- Aspect ratio correct (9:16 vertical)
- Audio synced
- Text readable
- Transitions smooth
- File size reasonable (<20 MB)

**Step 3: Adjust render settings if needed**

If file too large, add to render command:
```bash
npx remotion render Video1-What out/video1-test.mp4 --codec h264 --crf 23
```

**Step 4: Document render settings**

Create `remotion/README.md`:
```markdown
# Rendering

Render all videos:
```bash
npm run render:all
```

Render individual video:
```bash
npx remotion render Video1-What out/video1.mp4 --codec h264 --crf 23
```
```

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add render instructions"
```

---

### Task 20: Create Render Script

**Files:**
- Modify: `remotion/package.json`

**Step 1: Add render scripts**

In `package.json`, add to `scripts`:
```json
{
  "scripts": {
    "dev": "remotion studio",
    "render:1": "remotion render Video1-What out/video1-what.mp4 --codec h264 --crf 23",
    "render:2": "remotion render Video2-Origin out/video2-origin.mp4 --codec h264 --crf 23",
    "render:3": "remotion render Video3-Why out/video3-why.mp4 --codec h264 --crf 23",
    "render:4": "remotion render Video4-HowToUse out/video4-howtouse.mp4 --codec h264 --crf 23",
    "render:5": "remotion render Video5-Who out/video5-who.mp4 --codec h264 --crf 23",
    "render:all": "npm run render:1 && npm run render:2 && npm run render:3 && npm run render:4 && npm run render:5"
  }
}
```

**Step 2: Test render:all**

```bash
npm run render:all
```

Expected: All 5 videos render successfully

**Step 3: Verify outputs**

```bash
ls -lh out/*.mp4
```

Expected: 5 MP4 files, each 5-15 MB

**Step 4: Commit**

```bash
git add package.json
git commit -m "feat: add render scripts for all 5 videos"
```

---

### Task 21: Final Review & Optimization

**Step 1: Watch all 5 videos on mobile device**

Transfer files to phone, verify:
- Readable text on small screen
- Audio levels consistent
- Aspect ratio fills screen (9:16)
- No awkward cuts or glitches

**Step 2: Make final timing adjustments**

Edit composition files if needed for better pacing.

**Step 3: Re-render if changes made**

```bash
npm run render:all
```

**Step 4: Final commit**

```bash
git add src/
git commit -m "fix: final timing and visual adjustments after mobile review"
```

---

## Post-Render: Upload Preparation

### Task 22: Prepare Upload Package

**Step 1: Create upload directory**

```bash
mkdir -p out/instagram-ready
```

**Step 2: Copy and rename for clarity**

```bash
cp out/video1-what.mp4 out/instagram-ready/01-what-hook.mp4
cp out/video2-origin.mp4 out/instagram-ready/02-origin-story.mp4
cp out/video3-why.mp4 out/instagram-ready/03-why-problem.mp4
cp out/video4-howtouse.mp4 out/instagram-ready/04-howtouse-walkthrough.mp4
cp out/video5-who.mp4 out/instagram-ready/05-who-cta.mp4
```

**Step 3: Create captions/hashtags document**

Create `out/instagram-ready/captions.md`:
```markdown
# Video 1: What (Hook)
Add another dimension to your live shows. 16 audio visualizers, MIDI control, runs in your browser. No download, no install, no bullshit. Link in bio.

#musicproduction #liveperformance #visualizer #djtools #midicontroller #sheepviz

---

# Video 2: Origin (Story)
I'm a musician. I missed the Winamp/Milkdrop days. VJ software got too expensive and bloated. So I built sheep-viz - free, open, browser-based. Link in bio.

#musicians #visualart #winamp #milkdrop #diymusic #sheepviz

---

# Video 3: Why (Problem)
Your live shows deserve more than house lights. But VJ software is expensive, bloated, and complicated. sheep-viz is free, instant, and yours. Link in bio.

#vjsoftware #livevisuals #musictech #performanceart #sheepviz

---

# Video 4: How To Use (Walkthrough)
How to use sheep-viz: 1) Open URL 2) Load audio 3) Pick visualizer 4) MIDI control 5) Fullscreen. That's it. You're live. Link in bio.

#tutorial #howtouse #musicproduction #djsetup #sheepviz

---

# Video 5: Who (CTA)
This is for you if you want to add another dimension to your performances, transform your space, and skip expensive software. Try it now - link in bio.

#musiciansoftiktok #dj #livemusic #visualizers #sheepviz
```

**Step 4: Verify file sizes**

```bash
ls -lh out/instagram-ready/*.mp4
```

Expected: All files under 100 MB (Instagram/TikTok limit)

---

## Summary & Next Steps

**Completed:**
- ✅ Remotion project setup
- ✅ Asset capture (screen recordings + live footage)
- ✅ Core reusable components (SplitScreen, TypeOnText, etc.)
- ✅ 5 video compositions assembled
- ✅ Final renders (1080x1920, 30fps, H.264)
- ✅ Upload package prepared with captions

**Next Steps (Manual):**
1. Upload videos to Instagram Reels / TikTok
2. Use provided captions and hashtags
3. Link to sheep-xi.vercel.app in bio
4. Monitor engagement and comments
5. Iterate based on feedback

**Dependencies:**
- Watermark feature must be implemented before capturing screen recordings
- Music tracks from sheep.band selected and trimmed to ~30s
- All live footage filmed with proper lighting/setup

---

**Implementation complete!** Videos ready for social media upload.
