import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const BackgroundGlow: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 40], [0, 0.7], {
    extrapolateRight: "clamp",
  });

  const drift = interpolate(frame, [0, 240], [0, 40]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: `${-180 + drift}px`,
          left: "50%",
          width: 900,
          height: 900,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.12) 35%, rgba(248,250,252,0) 70%)",
          filter: "blur(40px)",
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -300,
          right: -100,
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0) 70%)",
          filter: "blur(60px)",
          opacity: opacity * 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
