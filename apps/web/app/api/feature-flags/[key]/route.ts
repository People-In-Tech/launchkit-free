// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { featureFlags } from '@launchkit/database';
import { eq } from 'drizzle-orm';
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const { userId, orgId, sessionClaims } = await auth();

  // Determine plan from session or default
  const plan = (sessionClaims?.metadata as Record<string, unknown>)?.plan as string | undefined;

  const enabled = await isFeatureEnabled(key, {
    orgId: orgId ?? undefined,
    plan: plan ?? undefined,
    userId: userId ?? undefined,
  });

  return NextResponse.json({ key, enabled });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.enabled !== undefined) updates.enabled = body.enabled;
  if (body.enabledForPlans !== undefined) updates.enabledForPlans = body.enabledForPlans;
  if (body.enabledForOrgs !== undefined) updates.enabledForOrgs = body.enabledForOrgs;
  if (body.rolloutPercentage !== undefined) updates.rolloutPercentage = body.rolloutPercentage;

  const [flag] = await db.update(featureFlags)
    .set(updates)
    .where(eq(featureFlags.key, key))
    .returning();

  if (!flag) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  return NextResponse.json(flag);
}
