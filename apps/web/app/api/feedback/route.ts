// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { feedback } from "@launchkit/database";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { userId, orgId } = await auth();
  const submitterId = userId ?? "anonymous";

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    category?: string;
  };

  const { title, description, category } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const validCategories = ["feature", "bug", "improvement"];
  const safeCategory = validCategories.includes(category ?? "")
    ? category!
    : "feature";

  const [created] = await db
    .insert(feedback)
    .values({
      userId: submitterId,
      orgId: orgId ?? null,
      title,
      description,
      category: safeCategory,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");

  const orderBy =
    sort === "newest"
      ? [desc(feedback.createdAt)]
      : [desc(feedback.upvotes), desc(feedback.createdAt)];

  const items = await db.select().from(feedback).orderBy(...orderBy);

  return NextResponse.json(items);
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: number;
    status?: string;
  };

  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status are required" },
      { status: 400 }
    );
  }

  const validStatuses = [
    "open",
    "under_review",
    "planned",
    "in_progress",
    "completed",
    "closed",
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(feedback)
    .set({ status })
    .where(eq(feedback.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Feedback not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}
