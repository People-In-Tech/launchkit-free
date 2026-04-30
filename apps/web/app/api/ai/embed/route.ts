// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { embedAndStore, searchSimilar, deleteDocument } from "@launchkit/rag";
import { checkRateLimit, AI_RATE_LIMITS } from "@/lib/rate-limit";

const EmbedSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).max(100000),
  metadata: z.record(z.unknown()).optional(),
  chunk: z.boolean().optional().default(true),
});

const SearchSchema = z.object({
  query: z.string().min(1),
  k: z.number().int().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.4),
});

/** POST /api/ai/embed — store a document in the vector DB */
export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = checkRateLimit(userId, AI_RATE_LIMITS.embed.limit, AI_RATE_LIMITS.embed.windowMs);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = EmbedSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { id, content, metadata, chunk } = parsed.data;

    await embedAndStore({ id, content, metadata, userId, orgId: orgId ?? undefined, chunk });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[embed] POST error:", err);
    return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
  }
}

/** GET /api/ai/embed?query=...&k=5 — vector similarity search */
export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = checkRateLimit(userId, AI_RATE_LIMITS.embed.limit, AI_RATE_LIMITS.embed.windowMs);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") ?? "";
    const k = Math.min(Number(searchParams.get("k") ?? "5"), 20);
    const threshold = Number(searchParams.get("threshold") ?? "0.4");

    if (!query) return NextResponse.json({ error: "query param required" }, { status: 400 });

    const results = await searchSimilar(query, { k, userId, orgId: orgId ?? undefined, threshold });
    return NextResponse.json({ data: results });
  } catch (err) {
    console.error("[embed] GET error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

/** DELETE /api/ai/embed?id=... — remove a document */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[embed] DELETE error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
