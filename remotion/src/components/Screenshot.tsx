import { AbsoluteFill, staticFile } from "remotion";

interface ScreenshotProps {
  src: string;
  fallbackColor?: string;
  fallbackText?: string;
}

// Uses native <img> (not Remotion <Img>) so missing screenshots show the
// fallback instead of calling cancelRender during preview.
// Switch to <Img> once all assets exist and you want render-blocking behavior.
export const Screenshot: React.FC<ScreenshotProps> = ({
  src,
  fallbackColor = "#1a1a2e",
  fallbackText = "Screenshot placeholder",
}) => {
  return (
    <AbsoluteFill>
      {/* Fallback — visible until image loads */}
      <AbsoluteFill
        style={{
          background: fallbackColor,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Major Mono Display', monospace",
          fontSize: 18,
          color: "rgba(255,255,255,0.3)",
          textTransform: "lowercase",
        }}
      >
        {fallbackText}
      </AbsoluteFill>
      {/* Native img: hides itself on 404, shows fallback through */}
      <img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </AbsoluteFill>
  );
};
