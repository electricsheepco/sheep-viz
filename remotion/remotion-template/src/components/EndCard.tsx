import { AbsoluteFill } from "remotion";

interface EndCardProps {
  logoSrc?: string;
  url: string;
  tagline: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  logoSrc,
  url,
  tagline,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0f",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      {logoSrc && (
        <img
          src={logoSrc}
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
          }}
          alt="Logo"
        />
      )}

      <div
        style={{
          fontFamily: "Major Mono Display, monospace",
          fontSize: 40,
          color: "#e8e8ed",
          textTransform: "lowercase",
          textShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
        }}
      >
        {url}
      </div>

      <div
        style={{
          fontFamily: "Major Mono Display, monospace",
          fontSize: 24,
          color: "#6366f1",
          textTransform: "lowercase",
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
