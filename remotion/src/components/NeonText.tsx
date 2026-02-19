import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface NeonTextProps {
  text: string;
  color?: string;
  startFrame?: number;
  flicker?: boolean;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export const NeonText: React.FC<NeonTextProps> = ({
  text,
  color = "#6366f1",
  startFrame = 0,
  flicker = true,
  style,
  containerStyle,
}) => {
  const frame = useCurrentFrame();

  const fadeOpacity = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flickerMult =
    flicker && frame > startFrame + 20
      ? 0.85 + 0.15 * Math.abs(Math.sin(frame * 0.7) * Math.cos(frame * 1.3))
      : 1;

  const glowSize = 15 + 8 * Math.abs(Math.sin(frame * 0.4));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        ...containerStyle,
      }}
    >
      <div
        style={{
          fontFamily: "'Major Mono Display', monospace",
          fontSize: 44,
          color,
          textTransform: "lowercase",
          opacity: fadeOpacity * flickerMult,
          filter: `drop-shadow(0 0 ${glowSize}px ${color}) drop-shadow(0 0 ${glowSize * 1.5}px ${color})`,
          textShadow: `0 0 10px ${color}, 0 0 30px ${color}`,
          textAlign: "center",
          ...style,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
