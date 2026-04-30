// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { dripCampaigns, dripSteps, dripEnrollments } from '@launchkit/database';
import { desc, eq, count, asc } from 'drizzle-orm';

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaigns = await db
    .select()
    .from(dripCampaigns)
    .orderBy(desc(dripCampaigns.createdAt));

  // Get step counts and enrollment counts for each campaign
  const enriched = await Promise.all(
    campaigns.map(async (campaign) => {
      const [stepCount] = await db
        .select({ count: count() })
        .from(dripSteps)
        .where(eq(dripSteps.campaignId, campaign.id));

      const [enrollmentCount] = await db
        .select({ count: count() })
        .from(dripEnrollments)
        .where(eq(dripEnrollments.campaignId, campaign.id));

      const [activeCount] = await db
        .select({ count: count() })
        .from(dripEnrollments)
        .where(
          eq(dripEnrollments.campaignId, campaign.id)
        );

      return {
        ...campaign,
        stepsCount: stepCount.count,
        enrollmentsCount: enrollmentCount.count,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, trigger, description, enabled } = body;

  if (!name || !trigger) {
    return NextResponse.json({ error: 'name and trigger are required' }, { status: 400 });
  }

  const [campaign] = await db
    .insert(dripCampaigns)
    .values({
      name,
      trigger,
      description: description ?? null,
      enabled: enabled ?? true,
    })
    .returning();

  return NextResponse.json(campaign, { status: 201 });
}
