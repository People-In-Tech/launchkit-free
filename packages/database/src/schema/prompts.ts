// @ts-nocheck
/**
 * Team Prompt Library — shared prompts across organization/team
 */
import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const prompts = pgTable(
  "lk_prompts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    orgId: text("org_id"),                          // null = personal, set = team prompt
    title: text("title").notNull(),
    content: text("content").notNull(),             // the actual prompt text
    description: text("description"),
    tags: jsonb("tags").$type<string[]>().default([]),
    isPublic: boolean("is_public").default(false),  // visible to whole team
    category: text("category").default("general"),  // general | coding | writing | analysis
    model: text("model"),                            // suggested model (optional)
    usageCount: text("usage_count").default("0"),   // how many times this has been used
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("lk_prompts_user_idx").on(t.userId),
    orgIdx: index("lk_prompts_org_idx").on(t.orgId),
    categoryIdx: index("lk_prompts_category_idx").on(t.category),
  })
);

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
