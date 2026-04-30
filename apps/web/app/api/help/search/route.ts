// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { helpArticles } from "@launchkit/database";
import { and, or, eq, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json({ articles: [] });
  }

  const results = await db
    .select({
      id: helpArticles.id,
      title: helpArticles.title,
      slug: helpArticles.slug,
    })
    .from(helpArticles)
    .where(
      and(
        eq(helpArticles.published, true),
        or(
          ilike(helpArticles.title, `%${q}%`),
          ilike(helpArticles.content, `%${q}%`)
        )
      )
    )
    .limit(10);

  return NextResponse.json({ articles: results });
}
