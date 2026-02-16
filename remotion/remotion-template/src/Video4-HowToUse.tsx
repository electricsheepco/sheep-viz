import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";

export const Video4HowToUse: React.FC = () => {
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
      {/* 0-5s: Open browser */}
      <Sequence from={0} durationInFrames={150}>
        <Placeholder color="#34495e" label="Typing URL" />
        <FullscreenText
          text="1. Open your browser"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 5-10s: Pick audio source */}
      <Sequence from={150} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#9b59b6" label="Audio Buttons" />}
          bottomContent={<Placeholder color="#8e44ad" label="Clicking Mic Button" />}
        />
        <FullscreenText
          text="2. Choose audio source"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 40 }}
        />
      </Sequence>

      {/* 10-15s: Pick visualizer */}
      <Sequence from={300} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#e67e22" label="Viz Grid" />}
          bottomContent={<Placeholder color="#d35400" label="Selecting Viz" />}
        />
        <FullscreenText
          text="3. Pick a visualizer"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 15-20s: Adjust knobs */}
      <Sequence from={450} durationInFrames={150}>
        <SplitScreen
          topContent={<Placeholder color="#16a085" label="Visualizer Changing" />}
          bottomContent={<Placeholder color="#1abc9c" label="Twisting Knobs" />}
        />
        <FullscreenText
          text="4. Tweak the parameters"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 38 }}
        />
      </Sequence>

      {/* 20-25s: Go fullscreen */}
      <Sequence from={600} durationInFrames={150}>
        <Placeholder color="#2c3e50" label="Fullscreen Viz" />
        <FullscreenText
          text="5. Hit F for fullscreen"
          startFrame={0}
          durationInFrames={150}
          style={{ fontSize: 42 }}
        />
      </Sequence>

      {/* 25-30s: End card */}
      <Sequence from={750} durationInFrames={150}>
        <EndCard
          url="sheep-xi.vercel.app"
          tagline="easy"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
