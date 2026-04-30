/**
 * API route: /api/ai/search
 *
 * Perform semantic search across org documents in the RAG vector store.
 *
 * POST — Search for relevant document chunks by natural language query
 */

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { searchDocuments } from "@/lib/rag";
import { deductCredits, getCredits } from "@/lib/credits";

const SEARCH_CREDIT_COST = 1;

const SearchSchema = z.object({
  query: z.string().min(1, "Query is required").max(1000),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { query, limit } = parsed.data;
  const scopeId = orgId ?? userId;

  // Check credits
  const balance = await getCredits(userId);
  if (balance < SEARCH_CREDIT_COST) {
    return Response.json(
      { error: "Insufficient credits. Please upgrade your plan." },
      { status: 402 }
    );
  }

  try {
    const results = await searchDocuments(scopeId, query, limit);

    // Deduct credit after successful search
    await deductCredits(userId, SEARCH_CREDIT_COST, `Semantic search: "${query.slice(0, 50)}"`);

    return Response.json({
      query,
      results,
      count: results.length,
      creditsUsed: SEARCH_CREDIT_COST,
    });
  } catch (error) {
    console.error("[api/ai/search/POST]", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
