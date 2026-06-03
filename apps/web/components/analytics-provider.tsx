'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAnalytics } from '@launchkit/analytics';
import { useOptionalAuth } from '@/lib/use-optional-auth';

/**
 * AnalyticsProvider
 *
 * - Tracks page views on every route change
 * - Identifies authenticated Clerk users with the analytics provider
 *   so events are attributed to a named user in PostHog (or Plausible, etc.)
 * - Resets the analytics session on sign-out
 *
 * Uses useOptionalAuth() so it is safe even when Clerk isn't configured
 * (keyless local/demo mode). Must be wrapped in <Suspense> because it calls
 * useSearchParams().
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isSignedIn, isLoaded } = useOptionalAuth();
  const analytics = getAnalytics();

  // ── Identify user once Clerk has loaded ────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      analytics.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? user.username ?? undefined,
        created_at: user.createdAt?.toISOString(),
      });
    } else {
      // Signed out — reset the PostHog session so the next user starts clean
      analytics.reset();
    }
  }, [isLoaded, isSignedIn, user, analytics]);

  // ── Page view on every navigation ──────────────────────────────────────
  useEffect(() => {
    analytics.page(pathname);
  }, [pathname, searchParams, analytics]);

  return <>{children}</>;
}
