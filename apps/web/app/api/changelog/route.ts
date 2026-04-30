// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { changelogEntries } from "@launchkit/database";
import { desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(changelogEntries)
      .orderBy(
        sql`COALESCE(${changelogEntries.publishedAt}, ${changelogEntries.createdAt}) DESC`
      );

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch changelog entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, content, version, publishedAt } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const [entry] = await db
      .insert(changelogEntries)
      .values({
        title,
        slug,
        content,
        version: version ?? null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      })
      .returning();

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create changelog entry:", error);
    return NextResponse.json(
      { error: "Failed to create changelog entry" },
      { status: 500 }
    );
  }
}
