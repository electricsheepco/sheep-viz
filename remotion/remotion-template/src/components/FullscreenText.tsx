import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

interface FullscreenTextProps {
  text: string;
  startFrame?: number;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const FullscreenText: React.FC<FullscreenTextProps> = ({
  text,
  startFrame = 0,
  durationFrames,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          fontFamily: "Major Mono Display, monospace",
          fontSize: 36,
          color: "#e8e8ed",
          textAlign: "center",
          textTransform: "lowercase",
          opacity,
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          ...style,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
