import { AbsoluteFill, Sequence } from "remotion";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

export const Video2Origin: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      {/* 0-5s: "I'm a musician" */}
      <Sequence from={0} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/musician-intro.png"
          fallbackColor="#1a1a2e"
          fallbackText="Musician Introduction"
        />
        <FullscreenText
          text="I'm a musician"
          startFrame={30}
          durationInFrames={120}
          style={{ fontSize: 48 }}
        />
      </Sequence>

      {/* 5-10s: Winamp nostalgia */}
      <Sequence from={150} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/winamp-milkdrop.png"
          fallbackColor="#8e44ad"
          fallbackText="Winamp + Milkdrop"
        />
        <FullscreenText
          text="grew up with winamp visualizers"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 30 }}
        />
      </Sequence>

      {/* 10-15s: VJ software too expensive */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/vj-software-pricing.png"
          fallbackColor="#c0392b"
          fallbackText="VJ Software Pricing"
        />
        <FullscreenText
          text="modern VJ software costs $$$"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      {/* 15-20s: So I built it */}
      <Sequence from={450} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/code-editor.png"
          fallbackColor="#16a085"
          fallbackText="Code Editor"
        />
        <FullscreenText
          text="so I built something simple"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 36 }}
        />
      </Sequence>

      {/* 20-25s: End card */}
      <Sequence from={600} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="made for musicians" />
      </Sequence>
    </AbsoluteFill>
  );
};
