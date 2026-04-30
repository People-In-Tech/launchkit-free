import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, index } from "drizzle-orm/pg-core";

export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(), // HMAC signing secret
  description: text("description"),
  events: text("events").array().notNull(), // ["user.created", "subscription.updated", ...]
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("webhook_endpoints_org_idx").on(table.orgId),
]);

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  endpointId: uuid("endpoint_id").notNull(),
  event: text("event").notNull(),
  payload: jsonb("payload").notNull(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(5),
  nextRetryAt: timestamp("next_retry_at"),
  deliveredAt: timestamp("delivered_at"),
  failedAt: timestamp("failed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("webhook_deliveries_endpoint_idx").on(table.endpointId),
  index("webhook_deliveries_event_idx").on(table.event),
]);
