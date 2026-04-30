// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { dripEnrollments } from '@launchkit/database';
import { eq, desc, and, count } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaignId } = await params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '50');
  const statusFilter = searchParams.get('status');
  const offset = (page - 1) * limit;

  const conditions = [eq(dripEnrollments.campaignId, campaignId)];
  if (statusFilter) {
    conditions.push(eq(dripEnrollments.status, statusFilter));
  }

  const enrollments = await db
    .select()
    .from(dripEnrollments)
    .where(and(...conditions))
    .orderBy(desc(dripEnrollments.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalCount] = await db
    .select({ count: count() })
    .from(dripEnrollments)
    .where(and(...conditions));

  return NextResponse.json({
    enrollments,
    total: totalCount.count,
    page,
    limit,
  });
}
