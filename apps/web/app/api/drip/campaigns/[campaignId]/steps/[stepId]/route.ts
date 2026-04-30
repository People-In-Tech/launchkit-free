// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@launchkit/database';
import { dripSteps } from '@launchkit/database';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campaignId: string; stepId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stepId } = await params;
  const body = await request.json();
  const { stepOrder, delayMinutes, subject, templateName, enabled } = body;

  const updates: Record<string, unknown> = {};
  if (stepOrder !== undefined) updates.stepOrder = stepOrder;
  if (delayMinutes !== undefined) updates.delayMinutes = delayMinutes;
  if (subject !== undefined) updates.subject = subject;
  if (templateName !== undefined) updates.templateName = templateName;
  if (enabled !== undefined) updates.enabled = enabled;

  const [updated] = await db
    .update(dripSteps)
    .set(updates)
    .where(eq(dripSteps.id, stepId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ campaignId: string; stepId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stepId } = await params;

  await db
    .delete(dripSteps)
    .where(eq(dripSteps.id, stepId));

  return NextResponse.json({ success: true });
}
