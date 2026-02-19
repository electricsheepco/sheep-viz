import { AbsoluteFill, Sequence } from "remotion";
import { SplitScreen } from "./components/SplitScreen";
import { TypeOnText } from "./components/TypeOnText";
import { GlitchTransition } from "./components/GlitchTransition";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

// Video 5: WHO (Audience + CTA) — 25s
// Call out the audience, drive traffic
export const Video5Who: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>

      {/* 0-5s: DJs */}
      <Sequence from={0} durationInFrames={150}>
        <SplitScreen
          topContent={
            <Screenshot
              src="assets/screenshots/dj-set-viz.png"
              fallbackColor="#e74c3c"
              fallbackText="DJ with Visualizer"
            />
          }
          bottomContent={
            <Screenshot
              src="assets/screenshots/dj-decks.png"
              fallbackColor="#c0392b"
              fallbackText="DJ at Decks"
            />
          }
        />
        <TypeOnText
          text="DJs — add visuals to your sets"
          startFrame={10}
          durationInFrames={75}
          style={{ fontSize: 30 }}
          containerStyle={{ alignItems: "flex-end", paddingBottom: 420 }}
        />
      </Sequence>

      <GlitchTransition startFrame={148} />

      {/* 5-10s: Live bands */}
      <Sequence from={150} durationInFrames={150}>
        <SplitScreen
          topContent={
            <Screenshot
              src="assets/screenshots/band-viz.png"
              fallbackColor="#9b59b6"
              fallbackText="Band with Visualizer"
            />
          }
          bottomContent={
            <Screenshot
              src="assets/screenshots/band-performing.png"
              fallbackColor="#8e44ad"
              fallbackText="Band on Stage"
            />
          }
        />
        <TypeOnText
          text="bands — enhance your shows"
          startFrame={10}
          durationInFrames={70}
          style={{ fontSize: 32 }}
          containerStyle={{ alignItems: "flex-end", paddingBottom: 420 }}
        />
      </Sequence>

      <GlitchTransition startFrame={298} />

      {/* 10-15s: Streamers */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/stream-viz.png"
          fallbackColor="#3498db"
          fallbackText="Stream with Visualizer"
        />
        <TypeOnText
          text="streamers — background visuals"
          startFrame={10}
          durationInFrames={75}
          style={{ fontSize: 30 }}
        />
      </Sequence>

      <GlitchTransition startFrame={448} />

      {/* 15-20s: Everyone */}
      <Sequence from={450} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/happy-user.png"
          fallbackColor="#27ae60"
          fallbackText="Happy User"
        />
        <TypeOnText
          text="anyone who loves music + visuals"
          startFrame={10}
          durationInFrames={80}
          style={{ fontSize: 27 }}
        />
      </Sequence>

      <GlitchTransition startFrame={598} />

      {/* 20-25s: End card */}
      <Sequence from={600} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="for everyone" />
      </Sequence>

    </AbsoluteFill>
  );
};
