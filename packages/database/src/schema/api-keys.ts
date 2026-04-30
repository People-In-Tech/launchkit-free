import { pgTable, text, timestamp, uuid, integer, boolean, index } from "drizzle-orm/pg-core";

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull(),
  userId: text("user_id").notNull(), // who created it
  name: text("name").notNull(), // "Production", "Staging", etc.
  keyPrefix: text("key_prefix").notNull(), // "lk_live_abc..." (first 8 chars for identification)
  keyHash: text("key_hash").notNull(), // SHA-256 hash of the full key
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  rateLimit: integer("rate_limit").default(1000), // requests per hour
  rateLimitWindow: integer("rate_limit_window").default(3600), // window in seconds
  scopes: text("scopes").array(), // ["read", "write", "admin"]
  revoked: boolean("revoked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("api_keys_org_idx").on(table.orgId),
  index("api_keys_hash_idx").on(table.keyHash),
]);
