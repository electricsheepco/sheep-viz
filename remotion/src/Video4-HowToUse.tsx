import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

export const Video4HowToUse: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      {/* 0-5s: Step 1 - Open browser */}
      <Sequence from={0} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/typing-url.png"
          fallbackColor="#34495e"
          fallbackText="Typing URL"
        />
        <FullscreenText
          text="1. open your browser"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 5-10s: Step 2 - Pick audio */}
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
        <FullscreenText
          text="2. choose audio source"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 38 }}
        />
      </Sequence>

      {/* 10-15s: Step 3 - Pick visualizer */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/viz-grid.png"
          fallbackColor="#e67e22"
          fallbackText="Visualizer Grid"
        />
        <FullscreenText
          text="3. pick a visualizer"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 15-20s: Step 4 - Adjust controls */}
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
        <FullscreenText
          text="4. tweak the parameters"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 36 }}
        />
      </Sequence>

      {/* 20-25s: Step 5 - Fullscreen */}
      <Sequence from={600} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/fullscreen-viz.png"
          fallbackColor="#2c3e50"
          fallbackText="Fullscreen Mode"
        />
        <FullscreenText
          text="5. hit F for fullscreen"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 25-30s: End card */}
      <Sequence from={750} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="easy" />
      </Sequence>
    </AbsoluteFill>
  );
};
