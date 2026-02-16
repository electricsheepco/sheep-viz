import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";

export const Video2Origin: React.FC = () => {
  const Placeholder = ({ color, label }: { color: string; label: string }) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        fontSize: 20,
        color: "white",
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill>
      {/* 0-5s: Hook - "I'm a musician" */}
      <Sequence from={0} durationInFrames={150}>
        <Placeholder color="#2c3e50" label="Webcam: 'I'm a musician'" />
        <FullscreenText
          text="I'm a musician"
          startFrame={30}
          durationFrames={120}
          style={{ fontSize: 48 }}
        />
      </Sequence>

      {/* 5-10s: Problem - Winamp/Milkdrop screenshot */}
      <Sequence from={150} durationInFrames={150}>
        <Placeholder color="#8e44ad" label="Winamp/Milkdrop Screenshot" />
        <FullscreenText
          text="Grew up with Winamp visualizers"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      {/* 10-15s: Pain point - VJ software pricing */}
      <Sequence from={300} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#c0392b" label="Resolume Pricing" />}
          bottomContent={<Placeholder color="#d35400" label="Hands Frustrated" />}
        />
        <FullscreenText
          text="But modern VJ software costs $$$$"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      {/* 15-20s: Solution - Building it */}
      <Sequence from={450} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#16a085" label="Code Editor" />}
          bottomContent={<Placeholder color="#27ae60" label="Hands Typing" />}
        />
        <FullscreenText
          text="So I built something simple"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 36 }}
        />
      </Sequence>

      {/* 20-25s: End card */}
      <Sequence from={600} durationInFrames={150}>
        <EndCard
          url="sheep-xi.vercel.app"
          tagline="made for musicians"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
