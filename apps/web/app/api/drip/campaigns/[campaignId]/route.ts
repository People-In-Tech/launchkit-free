// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { dripCampaigns } from '@launchkit/database';
import { eq } from 'drizzle-orm';
import { getDripStats } from '@/lib/drip';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaignId } = await params;

  const [campaign] = await db
    .select()
    .from(dripCampaigns)
    .where(eq(dripCampaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const stats = await getDripStats(campaignId);

  return NextResponse.json({ ...campaign, stats });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaignId } = await params;
  const body = await request.json();
  const { name, trigger, description, enabled } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (trigger !== undefined) updates.trigger = trigger;
  if (description !== undefined) updates.description = description;
  if (enabled !== undefined) updates.enabled = enabled;

  const [updated] = await db
    .update(dripCampaigns)
    .set(updates)
    .where(eq(dripCampaigns.id, campaignId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaignId } = await params;

  await db
    .delete(dripCampaigns)
    .where(eq(dripCampaigns.id, campaignId));

  return NextResponse.json({ success: true });
}
