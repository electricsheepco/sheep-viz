import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { TypeOnText } from "./components/TypeOnText";
import { GlitchTransition } from "./components/GlitchTransition";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

// Video 4: HOW TO USE (Walkthrough) — 30s
// Step-by-step guide
export const Video4HowToUse: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>

      {/* 0-5s: Step 1 — open browser */}
      <Sequence from={0} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/typing-url.png"
          fallbackColor="#34495e"
          fallbackText="Typing URL"
        />
        <TypeOnText
          text="1. open your browser"
          startFrame={10}
          durationInFrames={60}
          style={{ fontSize: 44 }}
        />
      </Sequence>

      <GlitchTransition startFrame={148} />

      {/* 5-10s: Step 2 — pick audio */}
      <Sequence from={150} durationInFrames={150}>
        <SplitScreen
          topContent={
            <Screenshot
              src="assets/screenshots/audio-buttons.png"
              fallbackColor="#9b59b6"
              fallbackText="Audio Source Buttons"
            />
          }
          bottomContent={
            <Screenshot
              src="assets/screenshots/click-mic.png"
              fallbackColor="#8e44ad"
              fallbackText="Clicking Microphone"
            />
          }
        />
        <TypeOnText
          text="2. choose audio source"
          startFrame={10}
          durationInFrames={60}
          style={{ fontSize: 38 }}
          containerStyle={{ alignItems: "flex-end", paddingBottom: 420 }}
        />
      </Sequence>

      <GlitchTransition startFrame={298} />

      {/* 10-15s: Step 3 — pick visualizer */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/viz-grid.png"
          fallbackColor="#e67e22"
          fallbackText="Visualizer Grid"
        />
        <TypeOnText
          text="3. pick a visualizer"
          startFrame={10}
          durationInFrames={60}
          style={{ fontSize: 44 }}
        />
      </Sequence>

      <GlitchTransition startFrame={448} />

      {/* 15-20s: Step 4 — adjust controls */}
      <Sequence from={450} durationInFrames={150}>
        <SplitScreen
          topContent={
            <Screenshot
              src="assets/screenshots/visualizer-adjusting.png"
              fallbackColor="#16a085"
              fallbackText="Visualizer Changing"
            />
          }
          bottomContent={
            <Screenshot
              src="assets/screenshots/hands-knobs.png"
              fallbackColor="#1abc9c"
              fallbackText="Adjusting Knobs"
            />
          }
        />
        <TypeOnText
          text="4. tweak the parameters"
          startFrame={10}
          durationInFrames={65}
          style={{ fontSize: 36 }}
          containerStyle={{ alignItems: "flex-end", paddingBottom: 420 }}
        />
      </Sequence>

      <GlitchTransition startFrame={598} />

      {/* 20-25s: Step 5 — fullscreen */}
      <Sequence from={600} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/fullscreen-viz.png"
          fallbackColor="#2c3e50"
          fallbackText="Fullscreen Mode"
        />
        <TypeOnText
          text="5. hit F for fullscreen"
          startFrame={10}
          durationInFrames={60}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      <GlitchTransition startFrame={748} />

      {/* 25-30s: End card */}
      <Sequence from={750} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="easy" />
      </Sequence>

    </AbsoluteFill>
  );
};
