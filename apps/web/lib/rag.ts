// @ts-nocheck
/**
 * RAG (Retrieval-Augmented Generation) utilities for LaunchKit.
 *
 * Provides chunking, embedding, indexing, and semantic search across
 * organization documents stored in Postgres (with pgvector when available).
 *
 * Usage:
 *   import { indexDocument, searchDocuments } from "@/lib/rag";
 *
 *   // Index a document
 *   await indexDocument(orgId, "My Doc", longTextContent, { source: "upload" });
 *
 *   // Semantic search
 *   const results = await searchDocuments(orgId, "user query", 5);
 */

import { db } from "@launchkit/database";
import { documents } from "@launchkit/database";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Lazy OpenAI client (never initialized at module scope)
// ---------------------------------------------------------------------------

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set. Add it to .env.local.");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  chunkIndex: number;
  parentDocumentId: string | null;
  metadata: Record<string, unknown> | null;
  similarity: number; // 0–1, higher is more similar
  createdAt: Date;
}

export interface IndexDocumentOptions {
  chunkSize?: number;
  overlap?: number;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Text chunking
// ---------------------------------------------------------------------------

/**
 * Split text into overlapping chunks for embedding.
 *
 * @param text       - Source text to chunk
 * @param chunkSize  - Target character count per chunk (default: 1000)
 * @param overlap    - Character overlap between consecutive chunks (default: 200)
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  if (!text.trim()) return [];
  if (text.length <= chunkSize) return [text.trim()];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break on a sentence or paragraph boundary
    if (end < text.length) {
      const breakPoints = ["\n\n", "\n", ". ", "! ", "? ", "; "];
      for (const bp of breakPoints) {
        const idx = text.lastIndexOf(bp, end);
        if (idx > start + chunkSize / 2) {
          end = idx + bp.length;
          break;
        }
      }
    }

    const chunk = text.slice(start, Math.min(end, text.length)).trim();
    if (chunk) chunks.push(chunk);

    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

/**
 * Generate a vector embedding for the given text using OpenAI's
 * text-embedding-3-small model (1536 dimensions).
 *
 * @param text - Text to embed (will be truncated to 8191 tokens if needed)
 * @returns Float array of length 1536
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 32_000), // conservative character limit
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

// ---------------------------------------------------------------------------
// Document indexing
// ---------------------------------------------------------------------------

/**
 * Index a document into the vector store.
 * The document is chunked, each chunk is embedded, and all chunks are stored.
 *
 * @param orgId    - Organization ID (scopes all documents)
 * @param title    - Human-readable document title
 * @param content  - Full text content of the document
 * @param options  - Chunking and metadata options
 */
export async function indexDocument(
  orgId: string,
  title: string,
  content: string,
  options: IndexDocumentOptions = {}
): Promise<void> {
  const { chunkSize = 1000, overlap = 200, metadata = {} } = options;

  const chunks = chunkText(content, chunkSize, overlap);
  if (chunks.length === 0) return;

  // Generate a parent document ID so all chunks can be linked
  const parentId = crypto.randomUUID();

  // Embed all chunks in parallel (batched to avoid rate limits)
  const BATCH_SIZE = 10;
  const embeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await Promise.all(batch.map(generateEmbedding));
    embeddings.push(...batchEmbeddings);
  }

  // Insert all chunks
  await db.insert(documents).values(
    chunks.map((chunk, i) => ({
      id: i === 0 ? parentId : crypto.randomUUID(),
      organizationId: orgId,
      title,
      content: chunk,
      // Store embedding as JSON-encoded array; swap for vector() when pgvector is enabled
      embedding: JSON.stringify(embeddings[i]),
      metadata: { ...metadata, totalChunks: chunks.length },
      chunkIndex: i,
      parentDocumentId: i === 0 ? null : parentId,
    }))
  );
}

// ---------------------------------------------------------------------------
// Semantic search
// ---------------------------------------------------------------------------

/**
 * Perform semantic search across organization documents.
 *
 * NOTE: This implementation uses in-application cosine similarity because
 * the embedding column is stored as JSON text. Once pgvector is enabled on
 * your Neon database and the column migrated to vector(1536), replace the
 * in-app calculation with a native pgvector query for better performance:
 *
 *   ORDER BY embedding <=> queryEmbeddingVector LIMIT limit
 *
 * @param orgId  - Organization to search within
 * @param query  - Natural language search query
 * @param limit  - Maximum number of results (default: 5)
 * @returns Ranked array of SearchResult objects
 */
export async function searchDocuments(
  orgId: string,
  query: string,
  limit = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  // Fetch all documents for this org (with embeddings)
  // In production with pgvector enabled, push this computation to Postgres
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.organizationId, orgId));

  if (rows.length === 0) return [];

  // Compute cosine similarity in-process
  const scored = rows
    .filter((row) => row.embedding !== null)
    .map((row) => {
      let embedding: number[] = [];
      try {
        embedding = JSON.parse(row.embedding as string) as number[];
      } catch {
        return null;
      }

      const similarity = cosineSimilarity(queryEmbedding, embedding);

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        chunkIndex: row.chunkIndex ?? 0,
        parentDocumentId: row.parentDocumentId,
        metadata: row.metadata as Record<string, unknown> | null,
        similarity,
        createdAt: row.createdAt,
      } satisfies SearchResult;
    })
    .filter((r): r is SearchResult => r !== null);

  // Sort by similarity descending and return top results
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Document deletion
// ---------------------------------------------------------------------------

/**
 * Delete a document and all its chunks from the vector store.
 *
 * @param documentId - The parent document ID (or chunk ID for single-chunk docs)
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // Delete the parent doc and all chunks that reference it
  await db
    .delete(documents)
    .where(
      and(
        // Matches either the parent doc or any of its chunks
        eq(documents.id, documentId)
      )
    );

  // Also delete chunks that reference this parent
  await db
    .delete(documents)
    .where(eq(documents.parentDocumentId, documentId));
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

/**
 * Compute cosine similarity between two equal-length float vectors.
 * Returns a value in [-1, 1] (1 = identical direction).
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
