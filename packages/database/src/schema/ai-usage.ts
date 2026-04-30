// @ts-nocheck
/**
 * AI Usage Tracking — per-user, per-model cost and token tracking for teams
 */
import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  real,
  index,
} from "drizzle-orm/pg-core";

export const aiUsage = pgTable(
  "lk_ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    orgId: text("org_id"),
    model: text("model").notNull(),
    provider: text("provider"),                       // openai | anthropic | google | etc.
    feature: text("feature").default("chat"),         // chat | image | embed | agent | rag
    promptTokens: integer("prompt_tokens").default(0),
    completionTokens: integer("completion_tokens").default(0),
    totalTokens: integer("total_tokens").default(0),
    costUsd: real("cost_usd").default(0),             // estimated USD cost
    durationMs: integer("duration_ms"),               // response time in ms
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("lk_ai_usage_user_idx").on(t.userId),
    orgIdx: index("lk_ai_usage_org_idx").on(t.orgId),
    dateIdx: index("lk_ai_usage_date_idx").on(t.createdAt),
    modelIdx: index("lk_ai_usage_model_idx").on(t.model),
  })
);

export type AiUsage = typeof aiUsage.$inferSelect;
export type NewAiUsage = typeof aiUsage.$inferInsert;

// ── Cost calculation helper ───────────────────────────────────────────────────

const COST_PER_1K: Record<string, { input: number; output: number }> = {
  "gpt-5.4-mini":       { input: 0.00015, output: 0.0006 },
  "gpt-5.4":            { input: 0.005,   output: 0.015 },
  "claude-sonnet-4-6":  { input: 0.003,   output: 0.015 },
  "claude-opus-4-6":    { input: 0.015,   output: 0.075 },
  "gemini-3.1-flash":   { input: 0.000075,output: 0.0003 },
  "gemini-3.1-pro":     { input: 0.00125, output: 0.005 },
  "sonar-pro":          { input: 0.003,   output: 0.015 },
  "deepseek-chat":      { input: 0.00014, output: 0.00028 },
  "llama-3.3-70b-versatile": { input: 0.00059, output: 0.00079 },
};

export function calculateCostUsd(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const rates = COST_PER_1K[modelId] ?? { input: 0.001, output: 0.002 };
  return (
    (promptTokens / 1000) * rates.input +
    (completionTokens / 1000) * rates.output
  );
}
