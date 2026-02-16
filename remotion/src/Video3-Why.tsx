import { AbsoluteFill, Sequence } from "remotion";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

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
        <FullscreenText
          text="no installation needed"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 38 }}
        />
      </Sequence>

      {/* 5-10s: Free & open source */}
      <Sequence from={150} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/github-repo.png"
          fallbackColor="#27ae60"
          fallbackText="GitHub Repository"
        />
        <FullscreenText
          text="free & open source"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 44 }}
        />
      </Sequence>

      {/* 10-15s: Works everywhere */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/multi-device.png"
          fallbackColor="#e74c3c"
          fallbackText="Multiple Devices"
        />
        <FullscreenText
          text="works on any device"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 38 }}
        />
      </Sequence>

      {/* 15-20s: End card */}
      <Sequence from={450} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="just works" />
      </Sequence>
    </AbsoluteFill>
  );
};
