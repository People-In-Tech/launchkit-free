// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { seoPages } from "@launchkit/database";
import { desc } from "drizzle-orm";

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await db
    .select()
    .from(seoPages)
    .orderBy(desc(seoPages.createdAt));
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { templateId, slug, title, description, body: pageBody, variables, published, seoMetadata } = body;

  if (!templateId || !slug || !title || !description || !pageBody || !variables) {
    return NextResponse.json(
      { error: "All page fields are required" },
      { status: 400 }
    );
  }

  const [page] = await db
    .insert(seoPages)
    .values({
      templateId,
      slug,
      title,
      description,
      body: pageBody,
      variables,
      published: published ?? false,
      seoMetadata: seoMetadata ?? null,
    })
    .returning();

  return NextResponse.json(page, { status: 201 });
}
