"use client";

import { useUser } from "@clerk/nextjs";

/**
 * Whether Clerk is configured for this build. Clerk's <ClerkProvider> is only
 * mounted when a publishable key is present (see AuthProvider in app/layout.tsx),
 * so calling Clerk hooks without a key throws "can only be used within the
 * <ClerkProvider /> component."
 *
 * This is a build-time constant, so the conditional hook call below is stable
 * for the lifetime of the process and does not violate the rules of hooks.
 */
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type OptionalAuth = Pick<ReturnType<typeof useUser>, "isLoaded" | "isSignedIn" | "user">;

/**
 * Drop-in replacement for Clerk's useUser() that is safe to call even when
 * Clerk isn't configured (keyless local/demo mode). When no key is present it
 * reports a loaded, signed-out state instead of throwing.
 */
export function useOptionalAuth(): OptionalAuth {
  if (!clerkEnabled) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- clerkEnabled is a build-time constant; the branch is stable.
  const { isLoaded, isSignedIn, user } = useUser();
  return { isLoaded, isSignedIn, user };
}
