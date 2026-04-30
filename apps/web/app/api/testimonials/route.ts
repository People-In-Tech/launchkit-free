// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { testimonials } from "@launchkit/database";
import { eq, desc } from "drizzle-orm";

// ---------------------------------------------------------------------------
// GET — list testimonials (public, no auth required)
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const featuredOnly = searchParams.get("featured") === "true";

  try {
    const rows = featuredOnly
      ? await db
          .select()
          .from(testimonials)
          .where(eq(testimonials.featured, true))
          .orderBy(desc(testimonials.createdAt))
      : await db
          .select()
          .from(testimonials)
          .orderBy(desc(testimonials.createdAt));

    return NextResponse.json({ testimonials: rows });
  } catch (error) {
    console.error("[api/testimonials/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — create a new testimonial (auth required)
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, role, company, content, avatarUrl, rating, featured } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(testimonials)
      .values({
        name,
        role: role ?? null,
        company: company ?? null,
        content,
        avatarUrl: avatarUrl ?? null,
        rating: rating ?? 5,
        featured: featured ?? false,
      })
      .returning();

    return NextResponse.json({ testimonial: created }, { status: 201 });
  } catch (error) {
    console.error("[api/testimonials/POST]", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT — update an existing testimonial (auth required)
// ---------------------------------------------------------------------------

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Testimonial ID is required (?id=...)" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { name, role, company, content, avatarUrl, rating, featured } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(testimonials)
      .set({
        name,
        role: role ?? null,
        company: company ?? null,
        content,
        avatarUrl: avatarUrl ?? null,
        rating: rating ?? 5,
        featured: featured ?? false,
      })
      .where(eq(testimonials.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    console.error("[api/testimonials/PUT]", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove a testimonial (auth required)
// ---------------------------------------------------------------------------

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Testimonial ID is required (?id=...)" },
      { status: 400 }
    );
  }

  try {
    const [deleted] = await db
      .delete(testimonials)
      .where(eq(testimonials.id, Number(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted",
    });
  } catch (error) {
    console.error("[api/testimonials/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
