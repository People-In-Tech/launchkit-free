// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { customDomains } from "@launchkit/database";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ domainId: string }> }
) {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domainId } = await params;

  const [deleted] = await db
    .delete(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.orgId, orgId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ domainId: string }> }
) {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domainId } = await params;
  const { isPrimary } = (await req.json()) as { isPrimary?: boolean };

  if (isPrimary) {
    // Unset all other primary domains for this org
    await db
      .update(customDomains)
      .set({ isPrimary: false })
      .where(eq(customDomains.orgId, orgId));
  }

  const [updated] = await db
    .update(customDomains)
    .set({
      isPrimary: isPrimary ?? false,
      updatedAt: new Date(),
    })
    .where(and(eq(customDomains.id, domainId), eq(customDomains.orgId, orgId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json({ domain: updated });
}
