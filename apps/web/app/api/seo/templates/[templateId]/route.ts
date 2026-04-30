// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { seoTemplates } from "@launchkit/database";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await params;

  const [template] = await db
    .select()
    .from(seoTemplates)
    .where(eq(seoTemplates.id, templateId))
    .limit(1);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.slugPattern !== undefined) updates.slugPattern = body.slugPattern;
  if (body.titleTemplate !== undefined) updates.titleTemplate = body.titleTemplate;
  if (body.descriptionTemplate !== undefined) updates.descriptionTemplate = body.descriptionTemplate;
  if (body.bodyTemplate !== undefined) updates.bodyTemplate = body.bodyTemplate;
  if (body.variables !== undefined) updates.variables = body.variables;
  if (body.enabled !== undefined) updates.enabled = body.enabled;

  const [updated] = await db
    .update(seoTemplates)
    .set(updates)
    .where(eq(seoTemplates.id, templateId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await params;

  const [deleted] = await db
    .delete(seoTemplates)
    .where(eq(seoTemplates.id, templateId))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
