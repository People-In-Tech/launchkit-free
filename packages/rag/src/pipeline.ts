// @ts-nocheck
/**
 * LaunchKit RAG — Core pipeline
 * embedAndStore, searchSimilar, deleteDocument, ragComplete
 */
import { sql, eq, and } from "drizzle-orm";
import { db } from "@launchkit/database";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { documents } from "./schema";
import { embedText, embedTexts, chunkText } from "./embed";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoreOptions {
  /** Stable caller-supplied ID — used for upsert / delete */
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  orgId?: string;
  /** Split long content into chunks automatically (default: true) */
  chunk?: boolean;
}

export interface SearchOptions {
  /** Number of top results to return (default: 5) */
  k?: number;
  userId?: string;
  orgId?: string;
  /** Minimum cosine similarity threshold 0–1 (default: 0.5) */
  threshold?: number;
}

export interface SearchResult {
  id: string;
  externalId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

// ── embedAndStore ─────────────────────────────────────────────────────────────

/**
 * Embed content and store in pgvector.
 * If chunk=true (default), long content is split into overlapping chunks.
 * Each chunk is stored as a separate row with the same externalId.
 */
export async function embedAndStore(opts: StoreOptions): Promise<void> {
  const { id, content, metadata = {}, userId, orgId, chunk = true } = opts;

  // Delete existing rows with this externalId (upsert pattern)
  await db.delete(documents).where(eq(documents.externalId, id));

  const segments = chunk ? chunkText(content) : [content];
  const embeddings = await embedTexts(segments);

  await db.insert(documents).values(
    segments.map((seg, i) => ({
      externalId: id,
      content: seg,
      embedding: embeddings[i],
      metadata: { ...metadata, chunkIndex: i, totalChunks: segments.length },
      userId: userId ?? null,
      orgId: orgId ?? null,
    }))
  );
}

// ── searchSimilar ─────────────────────────────────────────────────────────────

/**
 * Find the k most similar documents to a query string.
 * Scoped to userId/orgId when provided.
 */
export async function searchSimilar(
  query: string,
  opts: SearchOptions = {}
): Promise<SearchResult[]> {
  const { k = 5, userId, orgId, threshold = 0.4 } = opts;

  const queryEmbedding = await embedText(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // Build WHERE clause dynamically
  const whereClauses: string[] = [`1 - (embedding <=> '${embeddingStr}'::vector) >= ${threshold}`];
  if (orgId) whereClauses.push(`org_id = '${orgId}'`);
  else if (userId) whereClauses.push(`user_id = '${userId}'`);

  const rows = await db.execute<{
    id: string;
    external_id: string;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
  }>(sql`
    SELECT id, external_id, content, metadata,
      1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM lk_documents
    WHERE ${sql.raw(whereClauses.join(" AND "))}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${k}
  `);

  return rows.map((r) => ({
    id: r.id,
    externalId: r.external_id,
    content: r.content,
    metadata: r.metadata ?? {},
    similarity: r.similarity,
  }));
}

// ── deleteDocument ─────────────────────────────────────────────────────────────

export async function deleteDocument(externalId: string): Promise<void> {
  await db.delete(documents).where(eq(documents.externalId, externalId));
}

