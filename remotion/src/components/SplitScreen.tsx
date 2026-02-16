import { AbsoluteFill } from "remotion";

interface SplitScreenProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  split?: number;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  topContent,
  bottomContent,
  split = 0.6,
}) => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ height: `${split * 100}%`, overflow: "hidden" }}>
        {topContent}
      </AbsoluteFill>
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
