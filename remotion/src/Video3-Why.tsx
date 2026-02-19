import { AbsoluteFill, Sequence } from "remotion";
import { TypeOnText } from "./components/TypeOnText";
import { GlitchTransition } from "./components/GlitchTransition";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

// Video 3: WHY (The Problem) — 20s
// No install, free, works everywhere
export const Video3Why: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>

      {/* 0-5s: No installation */}
      <Sequence from={0} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/browser-url.png"
          fallbackColor="#3498db"
          fallbackText="Browser"
        />
        <TypeOnText
          text="no installation needed"
          startFrame={15}
          durationInFrames={70}
          style={{ fontSize: 40 }}
        />
      </Sequence>

      <GlitchTransition startFrame={148} />

      {/* 5-10s: Free & open source */}
      <Sequence from={150} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/github-repo.png"
          fallbackColor="#27ae60"
          fallbackText="GitHub Repository"
        />
        <TypeOnText
          text="free & open source"
          startFrame={10}
          durationInFrames={60}
          style={{ fontSize: 46 }}
        />
      </Sequence>

      <GlitchTransition startFrame={298} />

      {/* 10-15s: Works everywhere */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/multi-device.png"
          fallbackColor="#e74c3c"
          fallbackText="Multiple Devices"
        />
        <TypeOnText
          text="works on any device"
          startFrame={10}
          durationInFrames={60}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      <GlitchTransition startFrame={448} />

      {/* 15-20s: End card */}
      <Sequence from={450} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="just works" />
      </Sequence>

    </AbsoluteFill>
  );
};
