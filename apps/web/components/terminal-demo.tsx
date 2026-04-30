"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ASCII_BANNER_LINES } from "@/components/terminal-ascii-art";

// ---------------------------------------------------------------------------
// Animation script — each frame describes what the terminal shows
// ---------------------------------------------------------------------------

interface Line {
  type: "command" | "banner" | "prompt" | "choice" | "step" | "success" | "nextSteps" | "blank" | "dim";
  text: string;
  delay?: number; // ms after previous line before this one appears
  typewriter?: boolean; // animate character by character
  done?: boolean; // show a ✔ checkmark prefix (green)
  indent?: number;
}

const SCRIPT: Line[] = [
  // Prompt + command
  { type: "command", text: "npx create-launchkit@latest my-saas", delay: 600, typewriter: true },
  { type: "blank", text: "", delay: 200 },

  // ASCII Banner (7 lines)
  { type: "banner", text: ASCII_BANNER_LINES[0], delay: 100 },
  { type: "banner", text: ASCII_BANNER_LINES[1], delay: 40 },
  { type: "banner", text: ASCII_BANNER_LINES[2], delay: 40 },
  { type: "banner", text: ASCII_BANNER_LINES[3], delay: 40 },
  { type: "banner", text: ASCII_BANNER_LINES[4], delay: 40 },
  { type: "banner", text: ASCII_BANNER_LINES[5], delay: 40 },
  { type: "blank", text: "", delay: 40 },
  { type: "dim", text: "  The AI-first SaaS starter kit  ·  v1.0.0  ·  https://getlaunchkit.app", delay: 80 },
  { type: "blank", text: "", delay: 200 },

  // Stack prompt
  { type: "prompt", text: "? Choose your setup approach", delay: 300 },
  { type: "choice", text: "❯ Recommended  Neon · Clerk · Stripe · OpenAI · Vercel Blob", delay: 200 },
  { type: "dim",   text: "  Custom stack  choose each piece", delay: 80 },
  { type: "blank", text: "", delay: 600 },

  // Confirmed
  { type: "step", text: "✔ Recommended stack selected", delay: 200, done: true },
  { type: "blank", text: "", delay: 100 },

  // Install steps
  { type: "step", text: "✔ Scaffolding 248 files", delay: 400, done: true },
  { type: "step", text: "✔ Installing 89 packages   (14s)", delay: 900, done: true },
  { type: "step", text: "✔ Configuring Neon Postgres", delay: 400, done: true },
  { type: "step", text: "✔ Configuring AI   OpenAI GPT-5.4 mini", delay: 300, done: true },
  { type: "step", text: "✔ Configuring storage   Vercel Blob", delay: 300, done: true },
  { type: "step", text: "✔ Generating CLAUDE.md + agent rules", delay: 300, done: true },
  { type: "step", text: "✔ Creating GitHub repo   People-In-Tech/my-saas", delay: 400, done: true },
  { type: "blank", text: "", delay: 200 },

  // Success
  { type: "success", text: "  Your project is ready!", delay: 200 },
  { type: "blank", text: "", delay: 100 },

  // Next steps
  { type: "dim", text: "  Next steps:", delay: 150 },
  { type: "nextSteps", text: "  cd my-saas && cp .env.example .env.local", delay: 100 },
  { type: "nextSteps", text: "  pnpm dev  →  http://localhost:3000", delay: 100 },
  { type: "blank", text: "", delay: 100 },
];

const TOTAL_DURATION = SCRIPT.reduce((s, l) => s + (l.delay ?? 100), 0);
const LOOP_PAUSE = 3500;

// ---------------------------------------------------------------------------
// Line renderer
// ---------------------------------------------------------------------------

function renderLine(line: Line, charCount?: number) {
  const text = charCount !== undefined ? line.text.slice(0, charCount) : line.text;
  const cursor = charCount !== undefined && charCount < line.text.length;

  switch (line.type) {
    case "command":
      return (
        <span>
          <span className="text-emerald-400 select-none">$ </span>
          <span className="text-zinc-100">{text}</span>
          {cursor && <span className="inline-block w-2 h-4 bg-zinc-100 animate-pulse ml-0.5 align-[-1px]" />}
        </span>
      );

    case "banner":
      return (
        <span
          className="font-mono bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {text}
        </span>
      );

    case "prompt":
      return <span className="text-emerald-300">{text}</span>;

    case "choice":
      return <span className="text-zinc-100">{text}</span>;

    case "step":
      if (line.done) {
        const [check, ...rest] = text.split(" ");
        return (
          <span>
            <span className="text-emerald-400">{check} </span>
            <span className="text-zinc-300">{rest.join(" ")}</span>
          </span>
        );
      }
      return <span className="text-zinc-300">{text}</span>;

    case "success":
      return (
        <span
          className="font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {text}
        </span>
      );

    case "nextSteps":
      return <span className="text-cyan-400 font-mono">{text}</span>;

    case "dim":
      return <span className="text-zinc-500">{text}</span>;

    case "blank":
    default:
      return <span>&nbsp;</span>;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TerminalState {
  visibleLines: number;    // how many script lines are visible
  typewriterChars: number; // for the current typewriter line
}

export function TerminalDemo({ className }: { className?: string }) {
  const [state, setState] = useState<TerminalState>({ visibleLines: 0, typewriterChars: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAllTimeouts() {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }

  function schedule(cb: () => void, delay: number) {
    const t = setTimeout(cb, delay);
    timeouts.current.push(t);
  }

  function runAnimation() {
    let elapsed = 0;

    SCRIPT.forEach((line, i) => {
      const lineDelay = line.delay ?? 100;
      elapsed += lineDelay;

      if (line.typewriter) {
        // Reveal command character-by-character
        const charsTotal = line.text.length;
        const charDuration = Math.min(lineDelay * 0.8, 1200);
        const msPerChar = charDuration / charsTotal;

        for (let c = 1; c <= charsTotal; c++) {
          const charTime = elapsed - lineDelay + c * msPerChar;
          schedule(() => {
            setState((s) => ({ ...s, typewriterChars: c }));
          }, charTime);
        }

        schedule(() => {
          setState((s) => ({ visibleLines: i + 1, typewriterChars: charsTotal }));
        }, elapsed);
      } else {
        schedule(() => {
          setState((s) => ({ ...s, visibleLines: i + 1 }));
        }, elapsed);
      }
    });

    // Loop
    schedule(() => {
      setState({ visibleLines: 0, typewriterChars: 0 });
      schedule(runAnimation, 400);
    }, elapsed + LOOP_PAUSE);
  }

  useEffect(() => {
    runAnimation();
    return clearAllTimeouts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom as lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.visibleLines]);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-zinc-700/80 bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden font-mono text-xs leading-5",
        className
      )}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-zinc-500 text-[11px] font-sans">Terminal</span>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="h-[260px] sm:h-[340px] md:h-[420px] overflow-hidden p-3 md:p-4 space-y-0.5"
      >
        {SCRIPT.slice(0, state.visibleLines).map((line, i) => {
          const isCurrentTypewriter = line.typewriter && i === state.visibleLines - 1;
          return (
            <div key={i} className="whitespace-pre min-h-[20px]">
              {isCurrentTypewriter
                ? renderLine(line, state.typewriterChars)
                : renderLine(line)}
            </div>
          );
        })}

        {/* Blinking cursor when idle between lines */}
        {state.visibleLines === 0 && (
          <div>
            <span className="text-emerald-400">$ </span>
            <span className="inline-block w-2 h-4 bg-zinc-100 animate-pulse align-[-1px]" />
          </div>
        )}
      </div>
    </div>
  );
}
