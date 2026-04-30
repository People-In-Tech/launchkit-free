// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { featureFlags } from '@launchkit/database';
import { desc } from 'drizzle-orm';

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const flags = await db.select().from(featureFlags).orderBy(desc(featureFlags.createdAt));
  return NextResponse.json(flags);
}

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { key, name, description, enabled, enabledForPlans, enabledForOrgs, rolloutPercentage } = body;

  if (!key || !name) {
    return NextResponse.json({ error: 'key and name are required' }, { status: 400 });
  }

  const [flag] = await db.insert(featureFlags).values({
    key,
    name,
    description: description ?? null,
    enabled: enabled ?? false,
    enabledForPlans: enabledForPlans ?? [],
    enabledForOrgs: enabledForOrgs ?? [],
    rolloutPercentage: rolloutPercentage ?? 100,
  }).returning();

  return NextResponse.json(flag, { status: 201 });
}
