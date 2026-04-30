import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TerminalContent } from "./TerminalContent";

// Phase frames (relative to composition)
const COMPACT_START = 175; // Terminal shrinks + shifts left
const COMPACT_END = 200;
const EXPAND_START = 590; // Terminal returns to center for success
const EXPAND_END = 610;
const EXIT_START = 655;
const EXIT_DURATION = 16;

export const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: spring-driven slide-up.
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  const entranceTranslateY = interpolate(entrance, [0, 1], [220, 0]);
  const entranceScale = interpolate(entrance, [0, 1], [0.98, 1]);

  // Compact mode: shrink and shift left during feature phase.
  const compactProgress = interpolate(
    frame,
    [COMPACT_START, COMPACT_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const expandProgress = interpolate(
    frame,
    [EXPAND_START, EXPAND_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // 0 = full/center, 1 = compact/left
  const compactState = compactProgress - expandProgress;

  const compactScale = interpolate(compactState, [0, 1], [1.05, 0.78], {
    easing: Easing.inOut(Easing.cubic),
  });
  const compactTranslateX = interpolate(compactState, [0, 1], [0, -260], {
    easing: Easing.inOut(Easing.cubic),
  });

  // Persistent 3D rotation — damped significantly in compact mode so the
  // smaller terminal doesn't look over-tilted beside the feature card.
  const baseRotateY = interpolate(frame, [0, 750], [18, -18], {
    easing: Easing.inOut(Easing.sin),
  });
  const tiltDamp = 1 - compactState * 0.55;
  const rotateY = baseRotateY * tiltDamp;
  const rotateX = interpolate(compactState, [0, 1], [18, 10]);

  // Exit: slide down + fade.
  const exitProgress = interpolate(
    frame,
    [EXIT_START, EXIT_START + EXIT_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, 240], {
    easing: Easing.in(Easing.cubic),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Final composed transforms.
  const translateY = entranceTranslateY + exitTranslateY;
  const scale = entranceScale * compactScale;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1600,
      }}
    >
      <div
        style={{
          transform: `translate(${compactTranslateX}px, ${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          opacity: exitOpacity,
          width: 820,
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 50px 100px -20px rgba(15, 23, 42, 0.18), 0 30px 60px -30px rgba(99, 102, 241, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.5)",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 18px",
            borderBottom: "1px solid #eef2f6",
            background: "linear-gradient(180deg, #fbfcfe 0%, #f4f6fa 100%)",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#ff5f57",
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.08)",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#febc2e",
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.08)",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#28c840",
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.08)",
            }}
          />
          <span
            style={{
              marginLeft: 14,
              fontSize: 12,
              color: "#94a3b8",
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 500,
              letterSpacing: 0.2,
            }}
          >
            ~ · zsh
          </span>
        </div>

        {/* Body */}
        <TerminalContent />
      </div>
    </AbsoluteFill>
  );
};
