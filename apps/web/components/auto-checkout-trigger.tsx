"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOptionalAuth } from "@/lib/use-optional-auth";

// Auto-submits the Stripe checkout flow when ?auto=pro|team is present and
// the user is signed in. Used by the post-sign-up redirect from home-page CTAs.
export function AutoCheckoutTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useOptionalAuth();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!isLoaded) return;

    const raw = searchParams.get("auto");
    const plan = raw === "pro" || raw === "team" ? raw : null;
    if (!plan) return;

    if (!isSignedIn) {
      router.replace(
        `/auth/sign-up?redirect_url=${encodeURIComponent(`/pricing?auto=${plan}`)}`,
      );
      return;
    }

    firedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = (await res.json().catch(() => null)) as {
          url?: string;
        } | null;
        if (data?.url) {
          window.location.href = data.url;
        }
      } catch {
        // Stay on pricing page — the user can click the plan button manually.
      }
    })();
  }, [isLoaded, isSignedIn, searchParams, router]);

  return null;
}
