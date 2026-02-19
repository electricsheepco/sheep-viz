import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface TypeOnTextProps {
  text: string;
  startFrame?: number;
  durationInFrames: number;
  color?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  cursor?: boolean;
}

export const TypeOnText: React.FC<TypeOnTextProps> = ({
  text,
  startFrame = 0,
  durationInFrames,
  color = "#e8e8ed",
  style,
  containerStyle,
  cursor = true,
}) => {
  const frame = useCurrentFrame();
  const chars = text.split("");
  const framesPerChar = durationInFrames / chars.length;
  const localFrame = frame - startFrame;

  const cursorBlink = Math.floor(localFrame / 8) % 2 === 0;
  const typingDone = localFrame >= durationInFrames;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        pointerEvents: "none",
        ...containerStyle,
      }}
    >
      <div
        style={{
          fontFamily: "'Major Mono Display', monospace",
          fontSize: 36,
          color,
          textTransform: "lowercase",
          textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)",
          lineHeight: 1.3,
          textAlign: "center",
          ...style,
        }}
      >
        {chars.map((char, i) => {
          const charStart = startFrame + i * framesPerChar;
          const opacity = interpolate(frame, [charStart, charStart + 3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span key={i} style={{ opacity }}>
              {char}
            </span>
          );
        })}
        {cursor && !typingDone && (
          <span
            style={{
              opacity: cursorBlink ? 1 : 0,
              color: "#6366f1",
            }}
          >
            _
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};
