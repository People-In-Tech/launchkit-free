import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";

export const customDomains = pgTable("custom_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull(),
  domain: text("domain").notNull().unique(), // "app.acme.com"
  status: text("status").notNull().default("pending"), // "pending" | "verifying" | "active" | "failed"
  verificationToken: text("verification_token"), // TXT record value
  sslStatus: text("ssl_status").default("pending"), // "pending" | "active" | "failed"
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("custom_domains_org_idx").on(table.orgId),
  index("custom_domains_domain_idx").on(table.domain),
]);
