import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";

export const Video3Why: React.FC = () => {
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
      {/* 0-5s: No installation */}
      <Sequence from={0} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#3498db" label="Browser Loading" />}
          bottomContent={<Placeholder color="#2980b9" label="Typing URL" />}
        />
        <FullscreenText
          text="No installation needed"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 40 }}
        />
      </Sequence>

      {/* 5-10s: Free & open source */}
      <Sequence from={150} durationInFrames={150}>
        <Placeholder color="#27ae60" label="GitHub Repo" />
        <FullscreenText
          text="Free & open source"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 44 }}
        />
      </Sequence>

      {/* 10-15s: Works everywhere */}
      <Sequence from={300} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#e74c3c" label="Visualizer on Phone" />}
          bottomContent={<Placeholder color="#c0392b" label="Visualizer on Laptop" />}
        />
        <FullscreenText
          text="Works on any device"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 38 }}
        />
      </Sequence>

      {/* 15-20s: End card */}
      <Sequence from={450} durationInFrames={150}>
        <EndCard
          url="sheep-xi.vercel.app"
          tagline="just works"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
