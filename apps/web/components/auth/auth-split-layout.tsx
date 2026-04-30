import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { TerminalAsciiArt } from "@/components/terminal-ascii-art";

interface AuthSplitLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  children: React.ReactNode;
}

export function AuthSplitLayout({
  eyebrow,
  title,
  subtitle,
  bullets,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* ── Left: marketing + terminal ─────────────────────────────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-zinc-100">
        {/* Gradient glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(39 39 42) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top: logo */}
        <div className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Logo size={40} forceDark />
            <span className="font-bold text-2xl tracking-tight">
              Launch<span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Kit</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>

        {/* Middle: heading + terminal */}
        <div className="relative space-y-8 my-auto py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              {eyebrow}
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-zinc-400 text-base max-w-md leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Static terminal — clean, no animation artifacts */}
          <div className="max-w-2xl rounded-xl border border-zinc-700/80 bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden font-mono text-[11px] leading-5">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-zinc-500 text-[11px] font-sans">Terminal</span>
            </div>
            <div className="p-4 space-y-[3px]">
              <div>
                <span className="text-emerald-400">$ </span>
                <span className="text-zinc-100">npx create-launchkit@latest my-saas</span>
              </div>
              
              {/* Reusable ASCII Banner */}
              <TerminalAsciiArt className="my-3 text-[10px]" />
              
              <div className="!mt-2 text-zinc-500">&nbsp; Setting up your AI-first SaaS stack...</div>
              <div className="!mt-3">
                <span className="text-emerald-400">✔ </span>
                <span className="text-zinc-300">Scaffolding 248 files</span>
              </div>
              <div>
                <span className="text-emerald-400">✔ </span>
                <span className="text-zinc-300">Installing 89 packages (14s)</span>
              </div>
              <div>
                <span className="text-emerald-400">✔ </span>
                <span className="text-zinc-300">Configuring Neon · Clerk · Stripe</span>
              </div>
              <div>
                <span className="text-emerald-400">✔ </span>
                <span className="text-zinc-300">Configuring AI — OpenAI GPT-5.4 mini</span>
              </div>
              <div>
                <span className="text-emerald-400">✔ </span>
                <span className="text-zinc-300">Generating CLAUDE.md + agent rules</span>
              </div>
              <div>
                <span className="text-emerald-400">✔ </span>
                <span className="text-zinc-300">Creating GitHub repo</span>
              </div>
              <div className="!mt-3">
                <span
                  className="font-semibold"
                  style={{
                    background: "linear-gradient(to right, #818cf8, #67e8f9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  &nbsp; Your project is ready!
                </span>
              </div>
              <div className="text-cyan-400">&nbsp; pnpm dev → http://localhost:3000</div>
            </div>
          </div>
        </div>

        {/* Bottom: trust bullets */}
        <div className="relative">
          <ul className="space-y-2 text-sm text-zinc-400">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Right: Clerk form ─────────────────────────────────────────── */}
      <main className="relative flex flex-col items-center justify-center bg-background px-6 pt-16 pb-10 sm:p-10 lg:p-12">
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group text-sm">
            <Logo size={36} />
            <span className="font-bold text-xl tracking-tight">
              Launch<span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Kit</span>
            </span>
          </Link>
        </div>

        {/* Card container */}
        <div className="w-full px-2 sm:px-0 sm:max-w-[440px]">
          {children}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

/**
 * Clerk appearance shared across sign-in/sign-up so the form feels native
 * inside the split layout and matches the indigo → cyan brand gradient.
 */
export const clerkAppearance = {
  elements: {
    rootBox: "w-full min-w-0",
    cardBox: "shadow-2xl shadow-indigo-500/5 sm:border sm:border-border/60 sm:rounded-2xl w-full min-w-0 bg-card",
    card: "bg-transparent w-full min-w-0 rounded-2xl",
    headerTitle: "text-2xl font-bold tracking-tight text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",
    socialButtonsBlockButton:
      "border border-border bg-background hover:bg-accent transition-colors h-11 text-sm font-medium rounded-lg",
    socialButtonsBlockButtonText: "font-medium",
    dividerRow: "my-5",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs uppercase tracking-wider",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-11 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors",
    formButtonPrimary:
      "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold h-11 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 normal-case",
    footerActionLink:
      "text-indigo-500 hover:text-indigo-600 font-medium",
    footerActionText: "text-muted-foreground text-sm",
    formFieldAction: "text-indigo-500 hover:text-indigo-600 text-xs font-medium",
    identityPreviewEditButton: "text-indigo-500 hover:text-indigo-600",
    otpCodeFieldInput: "border-input focus:border-indigo-500 focus:ring-indigo-500/30",
  },
  variables: {
    colorPrimary: "hsl(239 84% 67%)",
    colorText: "hsl(var(--foreground))",
    colorTextSecondary: "hsl(var(--muted-foreground))",
    colorBackground: "hsl(var(--background))",
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
  },
} as const;
