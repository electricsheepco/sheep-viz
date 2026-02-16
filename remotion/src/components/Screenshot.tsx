import { AbsoluteFill, Img, staticFile } from "remotion";

interface ScreenshotProps {
  src: string;
  fallbackColor?: string;
  fallbackText?: string;
}

export const Screenshot: React.FC<ScreenshotProps> = ({
  src,
  fallbackColor = "#1a1a2e",
  fallbackText = "Screenshot placeholder",
}) => {
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Fallback when screenshot doesn't exist yet */}
      <AbsoluteFill
        style={{
          background: fallbackColor,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "monospace",
          fontSize: 18,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        {fallbackText}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
