import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

// Mounted inside <Sequence from={665} durationInFrames={85}> — local frame 0
// maps to composition frame 665 (22.17s mark).
// Headline fully exits BEFORE the logo starts — no messy crossfade overlap.
const HEADLINE_IN_END = 12;
const HEADLINE_HOLD_END = 36;
const HEADLINE_OUT_END = 44; // headline fully gone by this local frame
const LOGO_IN_START = 44;
const LOGO_IN_END = 60;

export const BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline: scale 0.9 → 1.0, opacity 0 → 1, then fade out.
  const headlineIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: HEADLINE_IN_END,
  });
  const headlineScale = interpolate(headlineIn, [0, 1], [0.9, 1.0]);
  const headlineFadeIn = interpolate(headlineIn, [0, 1], [0, 1]);
  // Headline fully exits before logo enters — no overlap.
  const headlineFadeOut = interpolate(
    frame,
    [HEADLINE_HOLD_END, HEADLINE_OUT_END],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const headlineOpacity = Math.min(headlineFadeIn, headlineFadeOut);

  // Logo: scale 0.9 → 1.0, opacity 0 → 1.
  const logoProgress = interpolate(
    frame,
    [LOGO_IN_START, LOGO_IN_END],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const logoScale = interpolate(logoProgress, [0, 1], [0.9, 1]);
  const logoOpacity = logoProgress;

  // Soft floating motion on the logo post-entrance.
  const logoFloat = interpolate(
    frame,
    [LOGO_IN_END, LOGO_IN_END + 25],
    [0, -4],
    { extrapolateLeft: "clamp" },
  );

  // Pulsing glow behind the logo.
  const glowPulse = interpolate(
    Math.sin((frame - LOGO_IN_START) / 7),
    [-1, 1],
    [0.55, 0.9],
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: interFamily,
      }}
    >
      {/* Headline */}
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          opacity: headlineOpacity,
          transform: `scale(${headlineScale})`,
          color: "#0f172a",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: -1.2,
          lineHeight: 1.05,
        }}
      >
        Ship your SaaS this weekend.
      </div>

      {/* Logo + glow */}
      <div
        style={{
          position: "absolute",
          opacity: logoOpacity,
          transform: `translateY(${logoFloat}px) scale(${logoScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Gradient glow */}
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.2) 35%, rgba(6,182,212,0.05) 55%, rgba(255,255,255,0) 75%)",
            filter: "blur(24px)",
            opacity: glowPulse,
          }}
        />

        <Img
          src={staticFile("hero-logo-light.png")}
          style={{
            position: "relative",
            width: 280,
            height: 280,
            filter:
              "drop-shadow(0 24px 48px rgba(99, 102, 241, 0.28)) drop-shadow(0 0 32px rgba(139, 92, 246, 0.2))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
