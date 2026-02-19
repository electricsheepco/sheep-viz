import { AbsoluteFill, Sequence } from "remotion";
import { TypeOnText } from "./components/TypeOnText";
import { GlitchTransition } from "./components/GlitchTransition";
import { EndCard } from "./components/EndCard";
import { Screenshot } from "./components/Screenshot";

// Video 2: ORIGIN (The Story) — 25s
// Personal connection, relatable musician frustration
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
        <TypeOnText
          text="I'm a musician."
          startFrame={30}
          durationInFrames={60}
          style={{ fontSize: 52 }}
        />
      </Sequence>

      <GlitchTransition startFrame={148} />

      {/* 5-10s: Winamp nostalgia */}
      <Sequence from={150} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/winamp-milkdrop.png"
          fallbackColor="#8e44ad"
          fallbackText="Winamp + Milkdrop"
        />
        <TypeOnText
          text="grew up with winamp visualizers"
          startFrame={10}
          durationInFrames={80}
          style={{ fontSize: 30 }}
        />
      </Sequence>

      <GlitchTransition startFrame={298} />

      {/* 10-15s: VJ software too expensive */}
      <Sequence from={300} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/vj-software-pricing.png"
          fallbackColor="#c0392b"
          fallbackText="VJ Software Pricing"
        />
        <TypeOnText
          text="modern VJ software costs $$$"
          startFrame={10}
          durationInFrames={70}
          style={{ fontSize: 32 }}
        />
      </Sequence>

      <GlitchTransition startFrame={448} />

      {/* 15-20s: So I built it */}
      <Sequence from={450} durationInFrames={150}>
        <Screenshot
          src="assets/screenshots/code-editor.png"
          fallbackColor="#16a085"
          fallbackText="Code Editor"
        />
        <TypeOnText
          text="so I built something simple"
          startFrame={10}
          durationInFrames={70}
          style={{ fontSize: 36 }}
        />
      </Sequence>

      <GlitchTransition startFrame={598} />

      {/* 20-25s: End card */}
      <Sequence from={600} durationInFrames={150}>
        <EndCard url="sheep-xi.vercel.app" tagline="made for musicians" />
      </Sequence>

    </AbsoluteFill>
  );
};
