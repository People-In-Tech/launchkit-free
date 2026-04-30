// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@launchkit/database";
import { prompts } from "@launchkit/database/schema";
import { eq, and, or, desc, ilike } from "drizzle-orm";

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  category: z.enum(["general", "coding", "writing", "analysis"]).optional().default("general"),
  model: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const scope = searchParams.get("scope") ?? "all"; // all | mine | team

  let dbQuery = db.select().from(prompts);

  if (scope === "mine") {
    dbQuery = dbQuery.where(eq(prompts.userId, userId));
  } else if (scope === "team" && orgId) {
    dbQuery = dbQuery.where(eq(prompts.orgId, orgId));
  } else {
    // All: mine + team public
    const conditions = [eq(prompts.userId, userId)];
    if (orgId) conditions.push(and(eq(prompts.orgId, orgId), eq(prompts.isPublic, true)));
    dbQuery = dbQuery.where(or(...conditions));
  }

  if (category) {
    dbQuery = dbQuery.where(eq(prompts.category, category));
  }

  if (query) {
    dbQuery = dbQuery.where(
      or(ilike(prompts.title, `%${query}%`), ilike(prompts.content, `%${query}%`))
    );
  }

  const rows = await dbQuery.orderBy(desc(prompts.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [row] = await db.insert(prompts).values({
    ...parsed.data,
    userId,
    orgId: parsed.data.isPublic && orgId ? orgId : null,
  }).returning();

  return NextResponse.json({ data: row }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [row] = await db
    .update(prompts)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(prompts.id, id), eq(prompts.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(prompts).where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
  return NextResponse.json({ success: true });
}
