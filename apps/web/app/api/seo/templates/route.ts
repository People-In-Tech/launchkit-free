// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { seoTemplates } from "@launchkit/database";
import { desc } from "drizzle-orm";

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await db
    .select()
    .from(seoTemplates)
    .orderBy(desc(seoTemplates.createdAt));
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slugPattern, titleTemplate, descriptionTemplate, bodyTemplate, variables } = body;

  if (!name || !slugPattern || !titleTemplate || !descriptionTemplate || !bodyTemplate) {
    return NextResponse.json(
      { error: "All template fields are required" },
      { status: 400 }
    );
  }

  const [template] = await db
    .insert(seoTemplates)
    .values({
      name,
      slugPattern,
      titleTemplate,
      descriptionTemplate,
      bodyTemplate,
      variables: variables ?? [],
    })
    .returning();

  return NextResponse.json(template, { status: 201 });
}
