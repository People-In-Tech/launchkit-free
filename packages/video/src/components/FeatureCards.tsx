import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Mounted inside <Sequence from={200} durationInFrames={395}>, so local
// frame 0 = composition frame 200. Each card aligns with its CLI step by
// starting at local frame (5 + i * FEATURE_STEP).
const FEATURE_STEP = 48;
const OFFSET_TO_TERMINAL = 5;
const CARD_IN_FRAMES = 8;
const CARD_OUT_FRAMES = 8;

// -----------------------------------------------------------------------------
// Feature data
// -----------------------------------------------------------------------------

type SingleLogo = { kind: "logo"; src: string };
type LogoStrip = { kind: "strip"; logos: { src: string; label: string }[] };
type CustomIcon = { kind: "custom"; node: React.ReactNode };
type Visual = SingleLogo | LogoStrip | CustomIcon;

type Feature = {
  accent: string;
  accentSoft: string;
  title: string;
  description: string;
  visual: Visual;
};

const iconStyle: React.CSSProperties = { width: 40, height: 40 };

const FEATURES: Feature[] = [
  {
    accent: "#6c47ff",
    accentSoft: "rgba(108, 71, 255, 0.08)",
    title: "Clerk Authentication",
    description: "OAuth, organizations, magic links, and MFA — all wired up.",
    visual: { kind: "logo", src: "logos/clerk.svg" },
  },
  {
    accent: "#00c389",
    accentSoft: "rgba(0, 195, 137, 0.1)",
    title: "Neon Postgres",
    description:
      "Serverless Postgres with pgvector for RAG & embeddings.",
    // Neon isn't in the open logo library; keep the DB glyph.
    visual: {
      kind: "custom",
      node: (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <ellipse cx="12" cy="5" rx="8" ry="3" stroke="#00c389" strokeWidth="2" />
          <path d="M4 5v7c0 1.657 3.582 3 8 3s8-1.343 8-3V5" stroke="#00c389" strokeWidth="2" />
          <path d="M4 12v7c0 1.657 3.582 3 8 3s8-1.343 8-3v-7" stroke="#00c389" strokeWidth="2" />
        </svg>
      ),
    },
  },
  {
    accent: "#635bff",
    accentSoft: "rgba(99, 91, 255, 0.1)",
    title: "Stripe Billing",
    description:
      "Subscriptions, webhooks, and a customer portal out of the box.",
    visual: { kind: "logo", src: "logos/stripe.svg" },
  },
  {
    accent: "#0ea5e9",
    accentSoft: "rgba(14, 165, 233, 0.1)",
    title: "11 AI Providers",
    description:
      "OpenAI, Claude, Gemini, Groq, Mistral — one factory API.",
    visual: {
      kind: "strip",
      logos: [
        { src: "logos/anthropic.svg", label: "Anthropic" },
        { src: "logos/googlegemini.svg", label: "Gemini" },
        { src: "logos/mistralai.svg", label: "Mistral" },
        { src: "logos/perplexity.svg", label: "Perplexity" },
      ],
    },
  },
  {
    accent: "#000000",
    accentSoft: "rgba(0, 0, 0, 0.06)",
    title: "Resend Email",
    description: "Transactional email powered by React Email templates.",
    visual: { kind: "logo", src: "logos/resend.svg" },
  },
  {
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.1)",
    title: "Teams & Permissions",
    description:
      "Multi-tenant orgs, roles, and an admin dashboard baked in.",
    visual: {
      kind: "custom",
      node: (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <circle cx="9" cy="9" r="3" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="17" cy="10" r="2.5" stroke="#f59e0b" strokeWidth="2" />
          <path d="M3 20c0-3 2.686-5 6-5s6 2 6 5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 20c0-2.5 2-4 4-4s2 .5 2 1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  },
  {
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.1)",
    title: "Multi-Cloud Storage",
    description:
      "Vercel Blob, S3, GCS, Azure, Supabase — switch providers with one env var.",
    visual: {
      kind: "strip",
      logos: [
        { src: "logos/vercel.svg", label: "Vercel" },
        { src: "logos/cloudflare.svg", label: "Cloudflare" },
        { src: "logos/googlecloud.svg", label: "GCP" },
        { src: "logos/supabase.svg", label: "Supabase" },
      ],
    },
  },
  {
    accent: "#8b5cf6",
    accentSoft: "rgba(139, 92, 246, 0.1)",
    title: "8 Drop-in Plugins",
    description:
      "Feedback, testimonials, roadmap, waitlist — and more, ready to ship.",
    visual: {
      kind: "custom",
      node: (
        <svg viewBox="0 0 24 24" style={iconStyle} fill="none">
          <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="#8b5cf6" strokeWidth="2" />
        </svg>
      ),
    },
  },
];

// -----------------------------------------------------------------------------
// Visual renderers
// -----------------------------------------------------------------------------

function VisualBlock({
  feature,
  cardProgress,
}: {
  feature: Feature;
  cardProgress: number;
}) {
  const v = feature.visual;

  if (v.kind === "strip") {
    // Four logos in a row with a shared tinted card background.
    return (
      <div
        style={{
          background: feature.accentSoft,
          borderRadius: 14,
          padding: "16px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {v.logos.map((logo, i) => {
          // Stagger the logos' entrance within the card.
          const logoProgress = interpolate(
            cardProgress,
            [0.15 + i * 0.08, 0.6 + i * 0.08],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div
              key={i}
              style={{
                opacity: logoProgress,
                transform: `translateY(${interpolate(logoProgress, [0, 1], [4, 0])}px)`,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Img
                src={staticFile(logo.src)}
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (v.kind === "logo") {
    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: feature.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile(v.src)}
          style={{ width: 36, height: 36, objectFit: "contain" }}
        />
      </div>
    );
  }

  // custom
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        background: feature.accentSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {v.node}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Card
// -----------------------------------------------------------------------------

function FeatureCard({
  feature,
  cardProgress,
}: {
  feature: Feature;
  cardProgress: number;
}) {
  const translateX = interpolate(cardProgress, [0, 1], [60, 0], {
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(cardProgress, [0, 1], [8, 0]);
  const scale = interpolate(cardProgress, [0, 1], [0.96, 1]);

  return (
    <div
      style={{
        opacity: cardProgress,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        width: 400,
        background: "#ffffff",
        borderRadius: 20,
        padding: "28px 28px 30px",
        boxShadow: `0 30px 60px -20px ${feature.accent}2e, 0 10px 30px -10px rgba(15,23,42,0.12), 0 0 0 1px rgba(226,232,240,0.8)`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent gradient rail */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${feature.accent} 0%, transparent 100%)`,
        }}
      />

      <VisualBlock feature={feature} cardProgress={cardProgress} />

      <div
        style={{
          fontFamily: interFamily,
          fontWeight: 700,
          fontSize: 24,
          color: "#0f172a",
          letterSpacing: -0.4,
          lineHeight: 1.2,
        }}
      >
        {feature.title}
      </div>

      <div
        style={{
          fontFamily: interFamily,
          fontSize: 16,
          fontWeight: 400,
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        {feature.description}
      </div>

      <div
        style={{
          marginTop: 4,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          padding: "6px 12px",
          borderRadius: 999,
          background: feature.accentSoft,
          color: feature.accent,
          fontFamily: interFamily,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12l6 6 10-14"
            stroke={feature.accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Installed
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Showcase
// -----------------------------------------------------------------------------

export const FeatureCards: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {FEATURES.map((feature, i) => {
        const cardStart = OFFSET_TO_TERMINAL + i * FEATURE_STEP;
        const cardHoldEnd = cardStart + FEATURE_STEP - CARD_OUT_FRAMES;
        const cardEnd = cardHoldEnd + CARD_OUT_FRAMES;

        const inProgress = interpolate(
          frame,
          [cardStart, cardStart + CARD_IN_FRAMES],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const outProgress = interpolate(
          frame,
          [cardHoldEnd, cardEnd],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const progress = Math.max(0, inProgress - outProgress);

        if (progress <= 0.001) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              right: 70,
              transform: "translateY(-50%)",
            }}
          >
            <FeatureCard feature={feature} cardProgress={progress} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
