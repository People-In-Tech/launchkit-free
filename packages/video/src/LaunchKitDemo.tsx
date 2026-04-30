import { AbsoluteFill, Sequence } from "remotion";
import { Terminal } from "./components/Terminal";
import { BrandReveal } from "./components/BrandReveal";
import { BackgroundGlow } from "./components/BackgroundGlow";
import { FeatureCards } from "./components/FeatureCards";

// Scene map (30 fps, 750 frames = 25s)
//  0 –  90   Command entry (terminal enters + typewriter)
// 90 – 180   ASCII banner reveal + tagline
// 180 – 200  Terminal transitions to compact position (left)
// 200 – 620  Feature showcase (8 features × ~52 frames)
// 620 – 660  Terminal transitions back to center + success message
// 660 – 750  Brand reveal (headline → logo)

export const LaunchKitDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "#f8fafc",
        perspective: 1600,
        overflow: "hidden",
      }}
    >
      <BackgroundGlow />

      <Sequence from={0} durationInFrames={680} layout="none">
        <Terminal />
      </Sequence>

      <Sequence from={200} durationInFrames={395} layout="none">
        <FeatureCards />
      </Sequence>

      <Sequence from={665} durationInFrames={85} layout="none">
        <BrandReveal />
      </Sequence>
    </AbsoluteFill>
  );
};
