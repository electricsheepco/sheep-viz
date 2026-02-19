import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { NeonText } from "./NeonText";

interface EndCardProps {
  url: string;
  tagline: string;
}

export const EndCard: React.FC<EndCardProps> = ({ url, tagline }) => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0f",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <Img
          src={staticFile("assets/sheep-logo.svg")}
          style={{ width: 120, height: 120 }}
        />
      </div>

      <NeonText
        text={url}
        color="#6366f1"
        startFrame={20}
        flicker={true}
        style={{ fontSize: 38 }}
      />

      <div
        style={{
          fontFamily: "'Major Mono Display', monospace",
          fontSize: 22,
          color: "#6366f1",
          textTransform: "lowercase",
          opacity: taglineOpacity,
          letterSpacing: "0.05em",
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
