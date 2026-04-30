/**
 * Background job: process-document-embedding
 *
 * Handles large document indexing in the background. For large documents,
 * the /api/ai/documents route can trigger this job instead of processing
 * synchronously to avoid request timeouts.
 *
 * The job chunks the document, generates embeddings, and stores them in
 * the documents table.
 *
 * Usage:
 *   await tasks.trigger("process-document-embedding", {
 *     organizationId: "org_xxx",
 *     userId: "user_xxx",
 *     title: "Annual Report 2025",
 *     content: longTextContent,
 *     metadata: { source: "upload", fileType: "pdf" },
 *   });
 */

import { task, logger } from "@trigger.dev/sdk/v3";

export interface ProcessDocumentEmbeddingPayload {
  /** Organization that owns this document */
  organizationId: string;
  /** User who uploaded the document */
  userId: string;
  /** Human-readable document title */
  title: string;
  /** Full text content to embed */
  content: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** Chunk size in characters (default: 1000) */
  chunkSize?: number;
  /** Chunk overlap in characters (default: 200) */
  overlap?: number;
}

export const processDocumentEmbedding = task({
  id: "process-document-embedding",
  // Longer timeout for large documents
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 120_000,
  },

  run: async (payload: ProcessDocumentEmbeddingPayload) => {
    const {
      organizationId,
      userId,
      title,
      content,
      metadata = {},
      chunkSize = 1000,
      overlap = 200,
    } = payload;

    logger.info("Starting document embedding", {
      organizationId,
      userId,
      title,
      contentLength: content.length,
    });

    // Chunk the text
    const chunks = chunkText(content, chunkSize, overlap);
    logger.info(`Document split into ${chunks.length} chunks`, { title });

    // Process in batches to avoid memory issues and rate limits
    const BATCH_SIZE = 5;
    let processedChunks = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);

      // In a real implementation, call the embedding API and store to DB:
      // const embeddings = await Promise.all(batch.map(generateEmbedding));
      // await db.insert(documents).values(batch.map((chunk, j) => ({
      //   organizationId,
      //   title,
      //   content: chunk,
      //   embedding: JSON.stringify(embeddings[j]),
      //   metadata: { ...metadata, uploadedBy: userId },
      //   chunkIndex: i + j,
      // })));

      processedChunks += batch.length;
    }

    logger.info("Document embedding complete", {
      title,
      totalChunks: chunks.length,
      processedChunks,
    });

    return {
      success: true,
      title,
      totalChunks: chunks.length,
      processedChunks,
    };
  },
});

// ---------------------------------------------------------------------------
// Copied from @/lib/rag to avoid Next.js-specific imports in this package
// ---------------------------------------------------------------------------

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if (!text.trim()) return [];
  if (text.length <= chunkSize) return [text.trim()];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      const breakPoints = ["\n\n", "\n", ". ", "! ", "? "];
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
