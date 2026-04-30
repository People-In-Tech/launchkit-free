// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { referralCodes } from '@launchkit/database';
import { eq } from 'drizzle-orm';
import { generateReferralCode, getUserTier } from '@/lib/referral-tracking';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [code] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  if (!code) {
    return NextResponse.json({ code: null });
  }

  const tier = await getUserTier(userId);

  return NextResponse.json({ ...code, tier });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const code = await generateReferralCode(userId);

  const [refCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  const tier = await getUserTier(userId);

  return NextResponse.json({ ...refCode, tier }, { status: 201 });
}
