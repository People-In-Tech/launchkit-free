// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { referralCodes, referralEvents } from '@launchkit/database';
import { desc, eq, sql, count } from 'drizzle-orm';

export async function GET(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '50');
  const typeFilter = searchParams.get('type');
  const offset = (page - 1) * limit;

  // Get all referral codes with stats
  const codes = await db
    .select()
    .from(referralCodes)
    .orderBy(desc(referralCodes.signups))
    .limit(limit)
    .offset(offset);

  // Get total counts
  const [totalClicks] = await db
    .select({ total: sql<number>`COALESCE(SUM(${referralCodes.clicks}), 0)` })
    .from(referralCodes);

  const [totalSignups] = await db
    .select({ total: sql<number>`COALESCE(SUM(${referralCodes.signups}), 0)` })
    .from(referralCodes);

  const [totalConversions] = await db
    .select({ total: sql<number>`COALESCE(SUM(${referralCodes.conversions}), 0)` })
    .from(referralCodes);

  const [totalEarnings] = await db
    .select({ total: sql<number>`COALESCE(SUM(${referralCodes.totalEarnings}::numeric), 0)` })
    .from(referralCodes);

  // Get pending rewards
  const pendingRewards = await db
    .select()
    .from(referralEvents)
    .where(eq(referralEvents.rewardStatus, 'pending'))
    .orderBy(desc(referralEvents.createdAt))
    .limit(50);

  const [totalCount] = await db.select({ count: count() }).from(referralCodes);

  return NextResponse.json({
    codes,
    pendingRewards,
    stats: {
      totalClicks: totalClicks.total,
      totalSignups: totalSignups.total,
      totalConversions: totalConversions.total,
      totalEarnings: totalEarnings.total,
    },
    total: totalCount.count,
    page,
    limit,
  });
}

export async function PATCH(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { eventId, status } = body;

  if (!eventId || !status) {
    return NextResponse.json({ error: 'eventId and status are required' }, { status: 400 });
  }

  if (!['approved', 'rejected', 'paid'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const [updated] = await db
    .update(referralEvents)
    .set({ rewardStatus: status })
    .where(eq(referralEvents.id, eventId))
    .returning();

  return NextResponse.json(updated);
}
