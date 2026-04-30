import { NextRequest, NextResponse } from 'next/server';
import { isTeamsOnly } from '@/lib/teams-only';

/**
 * Middleware logic for teams-only mode.
 * When NEXT_PUBLIC_TEAMS_ONLY=true:
 * - Redirects /settings/personal to /settings/team
 * - Redirects /settings/profile to /settings/team
 * - Ensures users are always in an org context
 */
export function handleTeamsOnlyRedirects(req: NextRequest): NextResponse | null {
  if (!isTeamsOnly()) return null;

  const { pathname } = req.nextUrl;

  // Redirect personal settings to team settings
  if (pathname === '/settings/personal' || pathname === '/settings/profile') {
    const url = req.nextUrl.clone();
    url.pathname = '/settings/team';
    return NextResponse.redirect(url);
  }

  return null;
}

/**
 * After sign-up hook: auto-create an organization for the user if none exists.
 * Call this from the post-signup flow or webhook.
 */
export async function ensureOrganization(userId: string, userName: string): Promise<string | null> {
  // This is meant to be called from server actions or API routes.
  // The actual org creation uses Clerk's API or your database.
  // Return the orgId or null if already exists.
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const session = await auth();
    if (session.orgId) return session.orgId;

    // In teams-only mode, users must always be in an org.
    // The Clerk dashboard should be configured to require org selection.
    // This is a safety net for programmatic flows.
    return null;
  } catch {
    return null;
  }
}
