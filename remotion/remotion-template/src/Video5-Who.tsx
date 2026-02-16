import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";

export const Video5Who: React.FC = () => {
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
      {/* 0-5s: DJs */}
      <Sequence from={0} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#e74c3c" label="DJ Set with Viz" />}
          bottomContent={<Placeholder color="#c0392b" label="DJ at Decks" />}
        />
        <FullscreenText
          text="DJs - add visuals to your sets"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 34 }}
        />
      </Sequence>

      {/* 5-10s: Live performers */}
      <Sequence from={150} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#9b59b6" label="Live Band with Viz" />}
          bottomContent={<Placeholder color="#8e44ad" label="Band Performing" />}
        />
        <FullscreenText
          text="Bands - enhance your shows"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 36 }}
        />
      </Sequence>

      {/* 10-15s: Streamers */}
      <Sequence from={300} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#3498db" label="Stream with Viz" />}
          bottomContent={<Placeholder color="#2980b9" label="Streamer Setup" />}
        />
        <FullscreenText
          text="Streamers - background visuals"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 34 }}
        />
      </Sequence>

      {/* 15-20s: Anyone */}
      <Sequence from={450} durationInFrames={150}>
        <Placeholder color="#27ae60" label="Happy User" />
        <FullscreenText
          text="Anyone who loves music + visuals"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      {/* 20-25s: End card */}
      <Sequence from={600} durationInFrames={150}>
        <EndCard
          url="sheep-xi.vercel.app"
          tagline="for everyone"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
