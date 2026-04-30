"use client";

/**
 * ExitIntentPopup — fires on desktop when cursor moves toward the top of the
 * viewport (classic exit-intent signal). Also fires on mobile after 45s idle.
 *
 * Captures email → POST /api/leads → Resend welcome sequence
 * Optionally shows a discount code to overcome price hesitation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Zap, Gift } from "lucide-react";
import { getAnalytics } from "@launchkit/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "lk_exit_dismissed";
const COOLDOWN_DAYS = 7;

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;
  const ts = Number(raw);
  const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24);
  return daysSince >= COOLDOWN_DAYS;
}

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const firedRef = useRef(false);

  const trigger = useCallback(() => {
    if (firedRef.current) return;
    if (!shouldShow()) return;
    firedRef.current = true;
    setOpen(true);
    getAnalytics().track("exit_intent_shown", { page: window.location.pathname });
  }, []);

  // Desktop: cursor exits top of viewport
  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 5 && e.relatedTarget === null) trigger();
    };
    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [trigger]);

  // Mobile/long-session fallback: 60s idle on pricing page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isPricing = window.location.pathname.includes("/pricing") || window.location.pathname === "/";
    if (!isPricing) return;
    const t = setTimeout(trigger, 60_000);
    return () => clearTimeout(t);
  }, [trigger]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setOpen(false);
    getAnalytics().track("exit_intent_dismissed");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "exit_intent",
          page: window.location.pathname,
          utm_source: new URLSearchParams(window.location.search).get("utm_source"),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setState("success");
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      getAnalytics().track("exit_intent_converted", { email });
    } catch {
      setState("error");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-background border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {state === "success" ? (
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're in.</h3>
            <p className="text-muted-foreground text-sm">
              Check your inbox — we'll send you the discount code and a breakdown of exactly what's included.
            </p>
            <Button className="mt-5 w-full" onClick={dismiss}>
              Continue browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Wait — before you go</p>
                <h3 className="text-lg font-bold leading-tight">Get 10% off + a free breakdown</h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              Not sure if LaunchKit is right for you? Drop your email and we'll send you:
            </p>

            <ul className="space-y-2 mb-6 text-sm">
              {[
                "A 10% discount code (yours forever)",
                "Full list of what's included vs. competitors",
                "Real examples of apps built with LaunchKit",
                "A direct line if you have questions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                disabled={state === "loading"}
              />
              <Button type="submit" disabled={state === "loading"}>
                {state === "loading" ? "..." : "Send it"}
              </Button>
            </form>

            {state === "error" && (
              <p className="text-xs text-destructive mt-2">Something went wrong — try again.</p>
            )}

            <p className="text-xs text-muted-foreground mt-3 text-center">
              No spam. Unsubscribe anytime. Just one email.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
