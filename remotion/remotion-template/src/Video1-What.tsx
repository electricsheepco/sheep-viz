import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { FullscreenText } from "./components/FullscreenText";
import { EndCard } from "./components/EndCard";

export const Video1What: React.FC = () => {
  // Placeholder components (colored divs)
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
      {/* 0-3s: Split - Fluid Flow + hands hitting pads */}
      <Sequence from={0} durationInFrames={90}>
        <SplitScreen
          topContent={<Placeholder color="#4a90e2" label="Fluid Flow Viz" />}
          bottomContent={<Placeholder color="#e27a4a" label="Hands Hitting Pads" />}
        />
      </Sequence>

      {/* 3-6s: Split - Spilled Milk + hands twisting knobs */}
      <Sequence from={90} durationInFrames={90}>
        <SplitScreen
          topContent={<Placeholder color="#9b59b6" label="Spilled Milk Viz" />}
          bottomContent={<Placeholder color="#e2a14a" label="Hands Twisting Knobs" />}
        />
        <FullscreenText
          text="Add another dimension to your live shows"
          startFrame={0}
          durationFrames={90}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      {/* 6-10s: Split - visualizer pulses + hands sliding faders */}
      <Sequence from={180} durationInFrames={120}>
        <SplitScreen
          topContent={<Placeholder color="#e74c3c" label="Visualizer Pulses" />}
          bottomContent={<Placeholder color="#4ae27a" label="Hands Sliding Faders" />}
        />
      </Sequence>

      {/* 10-14s: Full - browser with URL visible */}
      <Sequence from={300} durationInFrames={120}>
        <Placeholder color="#34495e" label="Browser URL" />
        <FullscreenText
          text="Runs in your browser"
          startFrame={30}
          durationFrames={90}
          style={{ fontSize: 40 }}
        />
      </Sequence>

      {/* 14-17s: Split - Geist + hands on MiniLab */}
      <Sequence from={420} durationInFrames={90}>
        <SplitScreen
          topContent={<Placeholder color="#1abc9c" label="Geist Viz" />}
          bottomContent={<Placeholder color="#e2d14a" label="Hands on MiniLab" />}
        />
        <FullscreenText
          text="No download"
          startFrame={0}
          durationFrames={90}
          style={{ fontSize: 40 }}
        />
      </Sequence>

      {/* 17-20s: End card */}
      <Sequence from={510} durationInFrames={90}>
        <EndCard
          url="sheep-xi.vercel.app"
          tagline="no bullshit"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
