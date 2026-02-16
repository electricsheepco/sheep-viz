import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

export const Video1What: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      {/* 0-3s: Opening hook - Visualizer in action */}
      <Sequence from={0} durationInFrames={90}>
        <SplitScreen
          topContent={
            <Screenshot
              src="assets/screenshots/visualizer-starfield.png"
              fallbackColor="#1a1a4e"
              fallbackText="Starfield Visualizer"
            />
          }
          bottomContent={
            <Screenshot
              src="assets/screenshots/hands-controller.png"
              fallbackColor="#4e1a1a"
              fallbackText="Hands on Controller"
            />
          }
        />
        <FullscreenText
          text="music visuals in your browser"
          startFrame={0}
          durationInFrames={90}
          style={{ fontSize: 34, top: "35%" }}
        />
      </Sequence>

      {/* 3-7s: No download needed */}
      <Sequence from={90} durationInFrames={120}>
        <Screenshot
          src="assets/screenshots/browser-url.png"
          fallbackColor="#2c3e50"
          fallbackText="Browser URL Bar"
        />
        <FullscreenText
          text="no download, no install"
          startFrame={0}
          durationInFrames={120}
          style={{ fontSize: 40 }}
        />
      </Sequence>

      {/* 7-11s: MIDI control */}
      <Sequence from={210} durationInFrames={120}>
        <SplitScreen
          topContent={
            <Screenshot
              src="assets/screenshots/visualizer-fluid-flow.png"
              fallbackColor="#4a1a4e"
              fallbackText="Fluid Flow Visualizer"
            />
          }
          bottomContent={
            <Screenshot
              src="assets/screenshots/midi-controller.png"
              fallbackColor="#1a4e4a"
              fallbackText="MIDI Controller"
            />
          }
        />
        <FullscreenText
          text="real-time control with MIDI"
          startFrame={0}
          durationInFrames={120}
          style={{ fontSize: 34 }}
        />
      </Sequence>

      {/* 11-15s: Upload watermark */}
      <Sequence from={330} durationInFrames={120}>
        <Screenshot
          src="assets/screenshots/watermark-controls.png"
          fallbackColor="#4e4a1a"
          fallbackText="Watermark Controls"
        />
        <FullscreenText
          text="add your band logo"
          startFrame={0}
          durationInFrames={120}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 15-20s: End card */}
      <Sequence from={450} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="no bullshit" />
      </Sequence>
    </AbsoluteFill>
  );
};
