"use client";

/**
 * PricingTracker — fires analytics conversion events on the pricing page.
 *
 * Uses the @launchkit/analytics adapter (auto-detects PostHog / Plausible / noop)
 * so it works regardless of which analytics provider is configured.
 *
 * Events tracked:
 *   pricing_page_viewed  — fires on page load (awareness/consideration)
 *   checkout_intent      — fires on CTA click (conversion)
 *
 * Pricing page CVR = checkout_intent count / pricing_page_viewed count
 */

import { useEffect } from "react";
import { getAnalytics } from "@launchkit/analytics";

interface CheckoutIntentProps {
  plan: string;
  label: string;
  onTrack?: () => void;
}

export function PricingPageTracker() {
  useEffect(() => {
    const analytics = getAnalytics();
    const params = new URLSearchParams(window.location.search);

    analytics.track("pricing_page_viewed", {
      source: document.referrer || "direct",
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
    });
  }, []);

  return null;
}

export function CheckoutIntentTracker({ plan, label, onTrack }: CheckoutIntentProps) {
  useEffect(() => {
    const analytics = getAnalytics();

    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest(`[data-checkout-plan="${plan}"]`)) {
        analytics.track("checkout_intent", {
          plan,
          label,
          page: "pricing",
        });
        onTrack?.();
      }
    }

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [plan, label, onTrack]);

  return null;
}
