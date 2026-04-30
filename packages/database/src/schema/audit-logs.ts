import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id"),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  action: text("action").notNull(), // "user.login", "billing.subscription_created", "team.member_added", etc.
  resource: text("resource").notNull(), // "user", "billing", "team", "settings", "api_key"
  resourceId: text("resource_id"), // ID of the affected resource
  metadata: jsonb("metadata"), // Additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_org_idx").on(table.orgId),
  index("audit_user_idx").on(table.userId),
  index("audit_action_idx").on(table.action),
  index("audit_created_idx").on(table.createdAt),
]);
