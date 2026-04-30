// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@launchkit/database';
import { referralCodes } from '@launchkit/database';
import { desc } from 'drizzle-orm';

export async function GET() {
  const leaders = await db
    .select({
      id: referralCodes.id,
      userId: referralCodes.userId,
      code: referralCodes.code,
      signups: referralCodes.signups,
      conversions: referralCodes.conversions,
    })
    .from(referralCodes)
    .orderBy(desc(referralCodes.signups))
    .limit(20);

  return NextResponse.json(leaders);
}
