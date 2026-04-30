'use client';

import { isTeamsOnly } from '@/lib/teams-only';

export function TeamsOnlyGuard({
  children,
  teamsContent,
}: {
  children: React.ReactNode;
  teamsContent?: React.ReactNode;
}) {
  if (isTeamsOnly()) return teamsContent ?? null;
  return <>{children}</>;
}
