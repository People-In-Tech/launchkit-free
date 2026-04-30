// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { dripSteps, dripSends } from '@launchkit/database';
import { eq, asc, count, and, sql } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaignId } = await params;

  const steps = await db
    .select()
    .from(dripSteps)
    .where(eq(dripSteps.campaignId, campaignId))
    .orderBy(asc(dripSteps.stepOrder));

  // Enrich with send stats
  const enriched = await Promise.all(
    steps.map(async (step) => {
      const [sentCount] = await db
        .select({ count: count() })
        .from(dripSends)
        .where(and(eq(dripSends.stepId, step.id), eq(dripSends.status, 'sent')));

      const [openedCount] = await db
        .select({ count: count() })
        .from(dripSends)
        .where(and(eq(dripSends.stepId, step.id), sql`${dripSends.openedAt} IS NOT NULL`));

      const [clickedCount] = await db
        .select({ count: count() })
        .from(dripSends)
        .where(and(eq(dripSends.stepId, step.id), sql`${dripSends.clickedAt} IS NOT NULL`));

      return {
        ...step,
        sent: sentCount.count,
        opened: openedCount.count,
        clicked: clickedCount.count,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaignId } = await params;
  const body = await request.json();
  const { stepOrder, delayMinutes, subject, templateName, enabled } = body;

  if (stepOrder === undefined || delayMinutes === undefined || !subject || !templateName) {
    return NextResponse.json(
      { error: 'stepOrder, delayMinutes, subject, and templateName are required' },
      { status: 400 }
    );
  }

  const [step] = await db
    .insert(dripSteps)
    .values({
      campaignId,
      stepOrder,
      delayMinutes,
      subject,
      templateName,
      enabled: enabled ?? true,
    })
    .returning();

  return NextResponse.json(step, { status: 201 });
}
