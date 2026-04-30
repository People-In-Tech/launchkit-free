/**
 * Documents table for RAG (Retrieval-Augmented Generation) pipeline.
 *
 * Stores chunked text documents along with their vector embeddings for
 * semantic search across organization knowledge bases.
 *
 * Prerequisites:
 *   Enable pgvector on your Neon database before using embedding search:
 *   CREATE EXTENSION IF NOT EXISTS vector;
 *
 * The `embedding` column is defined as `text` here for schema compatibility.
 * Once pgvector is enabled, run a migration to change it to the vector type:
 *   ALTER TABLE documents ALTER COLUMN embedding TYPE vector(1536)
 *   USING embedding::vector(1536);
 *
 * To use the native vector type with drizzle-orm, install drizzle-orm >=0.34
 * which exports `vector` from "drizzle-orm/pg-core", then replace the text
 * column below with:
 *   embedding: vector("embedding", { dimensions: 1536 }),
 * and add an HNSW index for performance:
 *   embeddingIdx: index("documents_embedding_idx")
 *     .using("hnsw", table.embedding.op("vector_cosine_ops")),
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    /** Organization that owns this document chunk */
    organizationId: text("organization_id").notNull(),

    /** Human-readable title of the source document */
    title: text("title").notNull(),

    /** The text content of this chunk */
    content: text("content").notNull(),

    /**
     * Vector embedding of the content — stored as a JSON-encoded float array.
     * Replace with the native vector type once pgvector is enabled on Neon:
     *   embedding: vector("embedding", { dimensions: 1536 })
     *
     * The application layer (lib/rag.ts) handles serialization/deserialization.
     */
    embedding: text("embedding"), // JSON-encoded number[] — e.g. "[0.1, 0.2, ...]"

    /** Additional metadata: { source, type, tags, url, author, etc. } */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    /** Position of this chunk within the parent document (0-indexed) */
    chunkIndex: integer("chunk_index").default(0),

    /** ID of the parent document (null for top-level or single-chunk docs) */
    parentDocumentId: text("parent_document_id"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    /** Index on organizationId for fast per-org queries */
    orgIdx: index("documents_org_idx").on(table.organizationId),

    /** Index on parentDocumentId for fetching all chunks of a document */
    parentIdx: index("documents_parent_idx").on(table.parentDocumentId),

    /**
     * Once pgvector is enabled, add an HNSW index for fast similarity search:
     *
     * embeddingIdx: index("documents_embedding_idx")
     *   .using("hnsw", table.embedding.op("vector_cosine_ops")),
     */
  })
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
