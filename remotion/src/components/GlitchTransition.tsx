import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface GlitchTransitionProps {
  startFrame: number;
  durationInFrames?: number;
}

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  startFrame,
  durationInFrames = 10,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (frame < startFrame || frame >= startFrame + durationInFrames) return null;

  const flashOpacity = interpolate(
    localFrame,
    [0, 1, durationInFrames],
    [0.9, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const rgbOffset = interpolate(
    localFrame,
    [0, 2, durationInFrames],
    [12, 12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const channelOpacity = interpolate(
    localFrame,
    [0, 2, durationInFrames],
    [0.4, 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* White flash */}
      <AbsoluteFill
        style={{ backgroundColor: "#ffffff", opacity: flashOpacity }}
      />
      {/* Red channel */}
      <AbsoluteFill
        style={{
          backgroundColor: "#ff0000",
          transform: `translateX(${rgbOffset}px)`,
          mixBlendMode: "screen",
          opacity: channelOpacity,
        }}
      />
      {/* Blue channel */}
      <AbsoluteFill
        style={{
          backgroundColor: "#0000ff",
          transform: `translateX(${-rgbOffset}px)`,
          mixBlendMode: "screen",
          opacity: channelOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
