import { interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { AsciiBanner } from "./AsciiBanner";

const { fontFamily: monoFamily } = loadMono("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

// ============================================================================
// Timing (composition frames, 30 fps, 750 total)
// ============================================================================
const TYPE_START = 20;
const TYPE_END = 85; // ~29 chars over 65 frames ≈ 13 cps

const BANNER_START = 100; // First banner line appears
const BANNER_LINE_STAGGER = 3; // Frames between each line fading in
const BANNER_LINES_REVEALED_BY = BANNER_START + 6 * BANNER_LINE_STAGGER; // 118
const SHIMMER_START = BANNER_LINES_REVEALED_BY;
const SHIMMER_END = SHIMMER_START + 50;

const TAGLINE_FRAME = 160;

const FEATURE_START = 205; // First feature step frame
const FEATURE_STEP = 48; // Each feature ~48 frames

const POST_FEATURES_FRAME = FEATURE_START + 8 * FEATURE_STEP; // = 589
const INSTALLING_FRAME = POST_FEATURES_FRAME + 15; // = 604
const CREATING_FRAME = INSTALLING_FRAME + 8; // = 612
const SUCCESS_FRAME = CREATING_FRAME + 12; // = 624

// ============================================================================
// Content
// ============================================================================
const COMMAND = "npx launchkit init my-saas";

const TAGLINE = "  The AI-first SaaS starter kit  ·  v1.2.0  ·  https://getlaunchkit.app";

const FEATURE_STEPS = [
  "✔ Configuring auth (Clerk + OAuth + orgs)",
  "✔ Setting up database (Neon + pgvector)",
  "✔ Configuring billing (Stripe + webhooks)",
  "✔ Adding AI (OpenAI, Claude, Gemini + 8 more)",
  "✔ Setting up email (Resend + React Email)",
  "✔ Teams + permissions + admin dashboard",
  "✔ Configuring storage (Vercel Blob / S3 / GCS)",
  "✔ Installing plugins (8 drop-in modules)",
];

// ============================================================================
// Line-row component
// ============================================================================
const LINE_FADE_FRAMES = 4;

function FadeInLine({
  frame,
  showAt,
  children,
  height = 26,
}: {
  frame: number;
  showAt: number;
  children: React.ReactNode;
  height?: number;
}) {
  const delta = frame - showAt;
  if (delta < 0) return <div style={{ height }} />;
  const opacity = interpolate(delta, [0, LINE_FADE_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(delta, [0, LINE_FADE_FRAMES], [6, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        height,
      }}
    >
      {children}
    </div>
  );
}


// ============================================================================
// Main content
// ============================================================================
export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();

  // Typewriter
  const typedChars = Math.floor(
    interpolate(frame, [TYPE_START, TYPE_END], [0, COMMAND.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typedText = COMMAND.slice(0, typedChars);

  // Cursor visibility + blink
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;
  const showTypingCursor =
    frame >= TYPE_START && frame <= TYPE_END;
  const showIdleCursor =
    (frame < TYPE_START || (frame > TYPE_END && frame < BANNER_START)) &&
    cursorBlink;

  // Auto-scroll: as more content piles up, translate the inner content up
  // so the most recent lines stay visible. Three scroll keyframes:
  //   full banner visible at frame ~180
  //   mid features at frame ~420 — scroll up ~120px
  //   late features at frame ~600 — scroll up ~240px
  //   success at frame ~655 — scroll up ~260px (banner off-screen)
  const scrollY = interpolate(
    frame,
    [180, 260, 420, 580, 640],
    [0, -40, -150, -250, -275],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        fontFamily: monoFamily,
        padding: "22px 28px 28px",
        minHeight: 540,
        maxHeight: 540,
        color: "#0f172a",
        fontSize: 16,
        lineHeight: 1.45,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          transform: `translateY(${scrollY}px)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Command prompt */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 28,
            marginBottom: 6,
          }}
        >
          <span style={{ color: "#10b981", fontWeight: 600 }}>~ $</span>
          <span style={{ color: "#0f172a", fontWeight: 500 }}>{typedText}</span>
          {showTypingCursor && cursorBlink && (
            <span
              style={{
                display: "inline-block",
                width: 9,
                height: 18,
                background: "#0f172a",
                marginLeft: -4,
              }}
            />
          )}
          {showIdleCursor && (
            <span
              style={{
                display: "inline-block",
                width: 9,
                height: 18,
                background: "#0f172a",
                marginLeft: typedText.length === 0 ? 0 : -4,
              }}
            />
          )}
        </div>

        {/* ASCII banner — SVG-rendered for pixel-flush blocks */}
        <div style={{ marginTop: 6 }}>
          <AsciiBanner
            frame={frame}
            bannerStart={BANNER_START}
            lineStagger={BANNER_LINE_STAGGER}
            shimmerStart={SHIMMER_START}
            shimmerEnd={SHIMMER_END}
          />
        </div>

        {/* Blank */}
        <div style={{ height: 10 }} />

        {/* Tagline */}
        <FadeInLine frame={frame} showAt={TAGLINE_FRAME} height={22}>
          <span
            style={{
              fontSize: 13,
              color: "#94a3b8",
              whiteSpace: "pre",
            }}
          >
            {TAGLINE}
          </span>
        </FadeInLine>

        {/* Blank */}
        <div style={{ height: 12 }} />

        {/* 8 feature steps */}
        {FEATURE_STEPS.map((step, i) => {
          const stepFrame = FEATURE_START + i * FEATURE_STEP;
          const [check, ...rest] = step.split(" ");
          return (
            <FadeInLine
              key={i}
              frame={frame}
              showAt={stepFrame}
              height={30}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 16,
                  color: "#475569",
                }}
              >
                <span style={{ color: "#10b981", fontWeight: 600 }}>
                  {check}
                </span>
                <span>{rest.join(" ")}</span>
              </div>
            </FadeInLine>
          );
        })}

        {/* Blank */}
        <div style={{ height: 10 }} />

        {/* Installing / Creating */}
        <FadeInLine frame={frame} showAt={INSTALLING_FRAME} height={30}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 16,
              color: "#475569",
            }}
          >
            <span style={{ color: "#10b981", fontWeight: 600 }}>✔</span>
            <span>Installing dependencies...</span>
          </div>
        </FadeInLine>

        <FadeInLine frame={frame} showAt={CREATING_FRAME} height={30}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 16,
              color: "#475569",
            }}
          >
            <span style={{ color: "#10b981", fontWeight: 600 }}>✔</span>
            <span>Creating project structure...</span>
          </div>
        </FadeInLine>

        {/* Blank */}
        <div style={{ height: 10 }} />

        {/* Success */}
        <FadeInLine frame={frame} showAt={SUCCESS_FRAME} height={36}>
          {(() => {
            const delta = Math.max(0, frame - SUCCESS_FRAME);
            const glow = interpolate(
              Math.sin(delta / 6),
              [-1, 1],
              [0.4, 0.9],
            );
            return (
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                    textShadow: `0 0 24px rgba(139, 92, 246, ${glow})`,
                    filter: `drop-shadow(0 0 12px rgba(99, 102, 241, ${glow * 0.6}))`,
                  }}
                >
                  🚀 Your SaaS is ready.
                </span>
              </div>
            );
          })()}
        </FadeInLine>
      </div>
    </div>
  );
};
