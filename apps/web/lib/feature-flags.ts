// @ts-nocheck
import { db } from '@launchkit/database';
import { featureFlags } from '@launchkit/database';
import { eq } from 'drizzle-orm';

/**
 * Deterministically hash a string to a number 0-99.
 * Used for percentage-based rollouts.
 */
function hashToPercentage(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

export async function isFeatureEnabled(
  key: string,
  context: { orgId?: string; plan?: string; userId?: string }
): Promise<boolean> {
  const flag = await db.query.featureFlags.findFirst({
    where: eq(featureFlags.key, key),
  });

  if (!flag) return false;

  // Check global toggle
  if (!flag.enabled) return false;

  // Check org override — if the org is explicitly listed, grant access
  if (context.orgId && flag.enabledForOrgs?.includes(context.orgId)) {
    return true;
  }

  // Check plan restriction — if plans are specified, user must be on one
  if (flag.enabledForPlans && flag.enabledForPlans.length > 0) {
    if (!context.plan || !flag.enabledForPlans.includes(context.plan)) {
      return false;
    }
  }

  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    const identifier = context.userId || context.orgId || 'anonymous';
    const bucket = hashToPercentage(`${key}:${identifier}`);
    if (bucket >= flag.rolloutPercentage) {
      return false;
    }
  }

  return true;
}
