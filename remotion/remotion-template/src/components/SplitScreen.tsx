import { AbsoluteFill } from "remotion";

interface SplitScreenProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  split?: number; // 0-1, default 0.6 (60% top)
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  topContent,
  bottomContent,
  split = 0.6,
}) => {
  return (
    <AbsoluteFill>
      {/* Top section */}
      <AbsoluteFill
        style={{
          height: `${split * 100}%`,
          overflow: "hidden",
        }}
      >
        {topContent}
      </AbsoluteFill>

      {/* Bottom section */}
      <AbsoluteFill
        style={{
          top: `${split * 100}%`,
          height: `${(1 - split) * 100}%`,
          overflow: "hidden",
        }}
      >
        {bottomContent}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
