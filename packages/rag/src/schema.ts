// @ts-nocheck
/**
 * LaunchKit RAG — pgvector schema
 *
 * Prerequisites:
 *   Run in Neon SQL editor: CREATE EXTENSION IF NOT EXISTS vector;
 *   Then: pnpm db:push
 */
import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

// Custom pgvector type (1536 dims = text-embedding-3-small)
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value
      .slice(1, -1)
      .split(",")
      .map(Number);
  },
});

export const documents = pgTable(
  "lk_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalId: text("external_id").notNull(),       // caller-supplied stable ID
    userId: text("user_id"),
    orgId: text("org_id"),
    content: text("content").notNull(),
    embedding: vector("embedding").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    externalIdIdx: index("lk_docs_external_id_idx").on(t.externalId),
    userIdx: index("lk_docs_user_idx").on(t.userId),
    orgIdx: index("lk_docs_org_idx").on(t.orgId),
  })
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
