// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { feedback } from "@launchkit/database";
import { eq, sql } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const feedbackId = parseInt(id, 10);
  if (isNaN(feedbackId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const [updated] = await db
    .update(feedback)
    .set({ upvotes: sql`${feedback.upvotes} + 1` })
    .where(eq(feedback.id, feedbackId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
