import { interpolate } from "remotion";

// ANSI Shadow FIGlet banner — matches apps/web/components/terminal-demo.tsx
// exactly. Rendered as SVG rectangles (not text) to guarantee pixel-flush
// `█` glyphs regardless of which monospace font Chrome Headless falls back to.
export const BANNER_LINES = [
  "  ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗██╗  ██╗██╗████████╗",
  "  ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██║ ██╔╝██║╚══██╔══╝",
  "  ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╔╝ ██║   ██║   ",
  "  ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔═██╗ ██║   ██║   ",
  "  ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║██║  ██╗██║   ██║   ",
  "  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝  ",
];

const COLS = Math.max(...BANNER_LINES.map((l) => l.length));
const ROWS = BANNER_LINES.length;

// Cell dimensions — chosen so the banner fits in the terminal content area
// (~760px wide). 72 cols × ~10px = 720px.
const CELL_W = 10;
const CELL_H = 18;
const LT = 2; // line thickness for thin chars

type Rect = { x: number; y: number; w: number; h: number };

function cellShapes(char: string): Rect[] {
  const cx = CELL_W / 2 - LT / 2;
  const cy = CELL_H / 2 - LT / 2;
  const halfW = CELL_W / 2 + LT / 2;
  const halfH = CELL_H / 2 + LT / 2;

  switch (char) {
    // Solid blocks and shades
    case "█":
      return [{ x: 0, y: 0, w: CELL_W, h: CELL_H }];

    // Straight double lines
    case "║":
      return [{ x: cx, y: 0, w: LT, h: CELL_H }];
    case "═":
      return [{ x: 0, y: cy, w: CELL_W, h: LT }];

    // Double-line corners (═ + ║)
    case "╔":
      return [
        { x: cx, y: cy, w: CELL_W - cx, h: LT }, // right half horizontal
        { x: cx, y: cy, w: LT, h: CELL_H - cy }, // down from center
      ];
    case "╗":
      return [
        { x: 0, y: cy, w: halfW, h: LT }, // left half horizontal
        { x: cx, y: cy, w: LT, h: CELL_H - cy }, // down from center
      ];
    case "╚":
      return [
        { x: cx, y: cy, w: CELL_W - cx, h: LT }, // right half horizontal
        { x: cx, y: 0, w: LT, h: halfH }, // up to center
      ];
    case "╝":
      return [
        { x: 0, y: cy, w: halfW, h: LT }, // left half horizontal
        { x: cx, y: 0, w: LT, h: halfH }, // up to center
      ];

    // T connectors
    case "╠":
      return [
        { x: cx, y: 0, w: LT, h: CELL_H },
        { x: cx, y: cy, w: CELL_W - cx, h: LT },
      ];
    case "╣":
      return [
        { x: cx, y: 0, w: LT, h: CELL_H },
        { x: 0, y: cy, w: halfW, h: LT },
      ];
    case "╦":
      return [
        { x: 0, y: cy, w: CELL_W, h: LT },
        { x: cx, y: cy, w: LT, h: CELL_H - cy },
      ];
    case "╩":
      return [
        { x: 0, y: cy, w: CELL_W, h: LT },
        { x: cx, y: 0, w: LT, h: halfH },
      ];
    case "╬":
      return [
        { x: 0, y: cy, w: CELL_W, h: LT },
        { x: cx, y: 0, w: LT, h: CELL_H },
      ];

    default:
      return []; // space and any char we don't draw
  }
}

// Pre-compute every rect once at module load.
type PositionedRect = Rect & { row: number };
const ALL_RECTS: PositionedRect[] = (() => {
  const out: PositionedRect[] = [];
  BANNER_LINES.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      const shapes = cellShapes(line[col]);
      for (const s of shapes) {
        out.push({
          row,
          x: col * CELL_W + s.x,
          y: row * CELL_H + s.y,
          w: s.w,
          h: s.h,
        });
      }
    }
  });
  return out;
})();

const WIDTH = COLS * CELL_W;
const HEIGHT = ROWS * CELL_H;

// Precompute rects-by-row for fast lookup each frame.
const RECTS_BY_ROW: PositionedRect[][] = Array.from({ length: ROWS }, () => []);
for (const r of ALL_RECTS) RECTS_BY_ROW[r.row].push(r);

export function AsciiBanner({
  frame,
  bannerStart,
  lineStagger,
  shimmerStart,
  shimmerEnd,
}: {
  frame: number;
  bannerStart: number;
  lineStagger: number;
  shimmerStart: number;
  shimmerEnd: number;
}) {
  // Shimmer: a highlight band slides across the banner. We offset a
  // repeating gradient via `gradientTransform` so the bright stripe
  // travels from off-left to off-right.
  const shimmerProgress = interpolate(
    frame,
    [shimmerStart, shimmerEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const shimmerX = interpolate(shimmerProgress, [0, 1], [-WIDTH, WIDTH]);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      <defs>
        {/* Base gradient — indigo → violet → cyan */}
        <linearGradient
          id="banner-base"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={WIDTH}
          y2="0"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Shimmer highlight — a soft white band that sweeps across */}
        <linearGradient
          id="banner-shimmer"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={WIDTH}
          y2="0"
          gradientTransform={`translate(${shimmerX} 0)`}
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Per-row groups — each row fades in on its own delay */}
      {Array.from({ length: ROWS }).map((_, row) => {
        const lineStart = bannerStart + row * lineStagger;
        const delta = frame - lineStart;
        const rowOpacity =
          delta < 0
            ? 0
            : interpolate(delta, [0, 6], [0, 1], {
                extrapolateRight: "clamp",
              });
        const translateY =
          delta < 0
            ? -4
            : interpolate(delta, [0, 6], [-4, 0], {
                extrapolateRight: "clamp",
              });

        return (
          <g
            key={row}
            opacity={rowOpacity}
            transform={`translate(0, ${translateY})`}
          >
            {/* Base-color layer */}
            {RECTS_BY_ROW[row].map((r, i) => (
              <rect
                key={`b${i}`}
                // 0.5px overlap prevents hairline seams between adjacent rects.
                x={r.x}
                y={r.y}
                width={r.w + 0.6}
                height={r.h + 0.6}
                fill="url(#banner-base)"
              />
            ))}
            {/* Shimmer overlay — same shape mask, additively blended */}
            {RECTS_BY_ROW[row].map((r, i) => (
              <rect
                key={`s${i}`}
                x={r.x}
                y={r.y}
                width={r.w + 0.6}
                height={r.h + 0.6}
                fill="url(#banner-shimmer)"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

AsciiBanner.width = WIDTH;
AsciiBanner.height = HEIGHT;
