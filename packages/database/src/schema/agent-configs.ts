// @ts-nocheck
/**
 * Saved Agent Configurations — teams can build, save, and share agents
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

export const agentConfigs = pgTable(
  "lk_agent_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    orgId: text("org_id"),
    name: text("name").notNull(),
    description: text("description"),
    systemPrompt: text("system_prompt").notNull(),
    modelId: text("model_id").default("gpt-5.4-mini"),
    tools: jsonb("tools").$type<string[]>().default([]),   // enabled tool names
    isPublic: boolean("is_public").default(false),         // shared with team
    enableMemory: boolean("enable_memory").default(false), // pgvector memory
    maxSteps: text("max_steps").default("10"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("lk_agent_configs_user_idx").on(t.userId),
    orgIdx: index("lk_agent_configs_org_idx").on(t.orgId),
  })
);

export type AgentConfig = typeof agentConfigs.$inferSelect;
export type NewAgentConfig = typeof agentConfigs.$inferInsert;
