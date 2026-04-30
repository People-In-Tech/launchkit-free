// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { referralTiers } from '@launchkit/database';
import { asc, eq } from 'drizzle-orm';

export async function GET() {
  const tiers = await db
    .select()
    .from(referralTiers)
    .orderBy(asc(referralTiers.minReferrals));

  return NextResponse.json(tiers);
}

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, minReferrals, rewardType, rewardValue, description } = body;

  if (!name || minReferrals === undefined || !rewardType || rewardValue === undefined) {
    return NextResponse.json({ error: 'name, minReferrals, rewardType, and rewardValue are required' }, { status: 400 });
  }

  if (id) {
    // Update existing tier
    const [updated] = await db
      .update(referralTiers)
      .set({ name, minReferrals, rewardType, rewardValue: String(rewardValue), description })
      .where(eq(referralTiers.id, id))
      .returning();

    return NextResponse.json(updated);
  }

  // Create new tier
  const [tier] = await db
    .insert(referralTiers)
    .values({
      name,
      minReferrals,
      rewardType,
      rewardValue: String(rewardValue),
      description,
    })
    .returning();

  return NextResponse.json(tier, { status: 201 });
}
