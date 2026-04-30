export function isTeamsOnly(): boolean {
  return process.env.NEXT_PUBLIC_TEAMS_ONLY === 'true';
}
